import { prisma } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";
import { createCustomer, findCustomerByEmail } from "@/lib/services/customerService";
import { computePaymentPlan, computeSplit, createInitialPayment } from "@/lib/services/paymentService";

const MIN_ORDER_QUANTITY = 6;

function calcTotals(lineItems: Array<{ quantity: number; unitPriceCents: number }>) {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
  return { subtotalCents, totalCents: subtotalCents };
}

export async function listOrders(params?: { status?: OrderStatus; limit?: number }) {
  return prisma.order.findMany({
    where: params?.status ? { status: params.status } : undefined,
    include: {
      customer: true,
      lineItems: { include: { productVariant: { include: { product: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: params?.limit ?? 50,
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      lineItems: {
        include: {
          productVariant: { include: { product: true } },
          customization: true,
        },
      },
    },
  });
}

// Guest checkout (ADR-012): matches or creates a Customer by email so a
// first-time buyer never has to register. passwordHash stays null until
// Priority 3 adds customer accounts on top of this same Customer row.
// Prices are always read from the ProductVariant/Product record here, never
// from the request body, so a guest cannot submit an arbitrary price.
export async function createGuestOrder(input: {
  customer: {
    name: string;
    email: string;
    phone?: string;
    marketingConsent?: boolean;
  };
  notes?: string;
  lineItems: Array<{
    productVariantId: string;
    quantity: number;
  }>;
}) {
  const totalQuantity = input.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity < MIN_ORDER_QUANTITY) {
    throw new Error("MIN_ORDER_QUANTITY_NOT_MET");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.lineItems.map((item) => item.productVariantId) } },
    include: { product: true },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const pricedLineItems = input.lineItems.map((item) => {
    const variant = variantById.get(item.productVariantId);
    if (!variant) throw new Error("PRODUCT_VARIANT_NOT_FOUND");
    const unitPriceCents = variant.product.basePriceCents;
    return {
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPriceCents,
      lineTotalCents: item.quantity * unitPriceCents,
    };
  });

  const existing = await findCustomerByEmail(input.customer.email);
  const customer =
    existing ??
    (await createCustomer({
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      marketingConsent: input.customer.marketingConsent,
      customerType: "retail",
    }));

  const { subtotalCents, totalCents } = calcTotals(pricedLineItems);
  const paymentPlan = computePaymentPlan(totalQuantity);
  const { depositCents, balanceCents } = computeSplit(totalCents, paymentPlan);

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      notes: input.notes,
      subtotalCents,
      totalCents,
      paymentPlan,
      depositCents,
      balanceCents,
      lineItems: { create: pricedLineItems },
    },
    include: {
      customer: true,
      lineItems: { include: { productVariant: { include: { product: true } } } },
    },
  });

  const payment = await createInitialPayment(order.id);
  return { ...order, checkoutUrl: payment.checkoutUrl };
}

// Priority 3 (ADR-012): order history for a logged-in customer, scoped to
// their own customerId only.
export async function listOrdersByCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      lineItems: { include: { productVariant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// IDOR check: an order id alone is never enough - the caller must also
// supply the session's customerId, and a mismatch returns null (not the
// order), so /mi-cuenta/pedidos/[id] can 404 instead of leaking another
// customer's order.
export async function getOrderForCustomer(id: string, customerId: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      lineItems: {
        include: {
          productVariant: { include: { product: true } },
          customization: true,
        },
      },
      payments: true,
    },
  });
  if (!order || order.customerId !== customerId) return null;
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
    include: { customer: true, lineItems: true },
  });
}

export async function getOrderPipelineStats() {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { totalCents: true },
  });

  return grouped.map((row) => ({
    status: row.status,
    count: row._count._all,
    totalCents: row._sum.totalCents ?? 0,
  }));
}

export { MIN_ORDER_QUANTITY };
