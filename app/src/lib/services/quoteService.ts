import { prisma } from "@/lib/db";
import type { QuoteStatus } from "@/generated/prisma/client";

function calcTotals(lineItems: Array<{ quantity: number; unitPriceCents: number }>, discountCents: number) {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
  const totalCents = Math.max(subtotalCents - discountCents, 0);
  return { subtotalCents, totalCents };
}

export async function listQuotes(params?: { status?: QuoteStatus }) {
  return prisma.quote.findMany({
    where: params?.status ? { status: params.status } : undefined,
    include: {
      customer: true,
      lineItems: { include: { productVariant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      lineItems: {
        include: {
          productVariant: { include: { product: true } },
          customization: true,
        },
      },
    },
  });
}

export async function createQuote(input: {
  customerId: string;
  validUntil: string;
  discountCents?: number;
  notes?: string;
  createdById?: string;
  lineItems: Array<{
    productVariantId: string;
    quantity: number;
    unitPriceCents: number;
  }>;
}) {
  const discountCents = input.discountCents ?? 0;
  const lineItemsWithTotals = input.lineItems.map((item) => ({
    ...item,
    lineTotalCents: item.quantity * item.unitPriceCents,
  }));
  const { subtotalCents, totalCents } = calcTotals(input.lineItems, discountCents);

  return prisma.quote.create({
    data: {
      customerId: input.customerId,
      validUntil: new Date(input.validUntil),
      discountCents,
      subtotalCents,
      totalCents,
      notes: input.notes,
      createdById: input.createdById,
      lineItems: {
        create: lineItemsWithTotals,
      },
    },
    include: {
      customer: true,
      lineItems: { include: { productVariant: { include: { product: true } } } },
    },
  });
}

export async function getPipelineStats() {
  const grouped = await prisma.quote.groupBy({
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

export async function markQuoteSent(id: string) {
  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) return null;
  if (quote.status !== "draft") {
    throw new Error("QUOTE_NOT_EDITABLE");
  }

  return prisma.quote.update({
    where: { id },
    data: { status: "sent", sentAt: new Date() },
    include: { customer: true, lineItems: true },
  });
}
