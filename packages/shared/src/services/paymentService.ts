import { prisma } from "@rs/db";
import { getPaymentProvider, getPaymentProviderByName } from "../payments/router";
import type { PaymentPlan } from "@rs/db";
import type { WebhookEvent } from "../payments/types";

// ADR-013: full for orders under the 6-piece minimum (currently unreachable
// given the store-wide 6-piece minimum - kept so the branch exists if that
// policy changes), deposit_50 for 6+. Tied to the same threshold as
// orderService.MIN_ORDER_QUANTITY, not a second definition of "big order".
const DEPOSIT_THRESHOLD_QUANTITY = 6;

export function computePaymentPlan(totalQuantity: number): PaymentPlan {
  return totalQuantity >= DEPOSIT_THRESHOLD_QUANTITY ? "deposit_50" : "full";
}

export function computeSplit(totalCents: number, plan: PaymentPlan) {
  if (plan === "full") {
    return { depositCents: 0, balanceCents: 0 };
  }
  const depositCents = Math.round(totalCents / 2);
  return { depositCents, balanceCents: totalCents - depositCents };
}

// Creates the first Payment leg for a freshly created order (the `full`
// amount, or the `deposit` for a deposit_50 plan) and returns a redirect URL
// for the customer. Payment row is created before the checkout session so
// the provider can embed our Payment.id in its own session/redirect.
export async function createInitialPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true },
  });

  const kind = order.paymentPlan === "deposit_50" ? "deposit" : "full";
  const amountCents = order.paymentPlan === "deposit_50" ? order.depositCents : order.totalCents;

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      kind,
      provider: getPaymentProvider().name,
      amountCents,
      status: "pending",
    },
  });

  const provider = getPaymentProvider();
  const session = await provider.createCheckoutSession({
    paymentId: payment.id,
    orderId: order.id,
    amountCents,
    description: `Pedido Rosales Sport - ${kind === "deposit" ? "anticipo 50%" : "pago completo"}`,
    customer: { id: order.customer.id, name: order.customer.name, email: order.customer.email },
  });

  return prisma.payment.update({
    where: { id: payment.id },
    data: { providerPaymentId: session.sessionId, checkoutUrl: session.redirectUrl },
  });
}

// Triggered when staff flips an order to "ready to ship" on a deposit_50
// order: creates the `balance` Payment leg so a checkout link can be sent.
export async function requestBalancePayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true },
  });

  if (order.paymentPlan !== "deposit_50") {
    throw new Error("ORDER_HAS_NO_BALANCE_DUE");
  }

  const existingBalance = await prisma.payment.findFirst({
    where: { orderId: order.id, kind: "balance" },
  });
  if (existingBalance) return existingBalance;

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      kind: "balance",
      provider: getPaymentProvider().name,
      amountCents: order.balanceCents,
      status: "pending",
    },
  });

  const provider = getPaymentProvider();
  const session = await provider.createCheckoutSession({
    paymentId: payment.id,
    orderId: order.id,
    amountCents: order.balanceCents,
    description: "Pedido Rosales Sport - liquidacion (50% restante)",
    customer: { id: order.customer.id, name: order.customer.name, email: order.customer.email },
  });

  return prisma.payment.update({
    where: { id: payment.id },
    data: { providerPaymentId: session.sessionId, checkoutUrl: session.redirectUrl },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { order: { include: { customer: true } } } });
}

// Idempotent by providerPaymentId (payment-provider-abstraction.md "Webhook
// duplicate -> idempotent skip"): a payment already in a terminal state
// (succeeded/failed/refunded) is not re-processed even if the provider
// retries the same webhook.
export async function processWebhookEvent(providerName: string, event: WebhookEvent) {
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: event.providerPaymentId },
    include: { order: true },
  });
  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND_FOR_WEBHOOK");
  }

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      eventType: event.eventType,
      payload: event.rawPayload as never,
    },
  });

  if (payment.status === "succeeded" || payment.status === "failed" || payment.status === "refunded") {
    return payment;
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: event.status,
      feeCents: event.feeCents ?? payment.feeCents,
      capturedAt: event.status === "succeeded" ? new Date() : payment.capturedAt,
    },
  });

  if (event.status === "succeeded" && payment.order.status === "pending_payment") {
    await prisma.order.update({
      where: { id: payment.order.id },
      data: { status: "payment_received" },
    });
  }

  return updated;
}

// Local dev/demo helper only: simulates the provider calling back with a
// success event, so the mock checkout page has something to POST to without
// a real provider webhook ever existing for MockPaymentProvider.
export async function simulateMockPaymentSuccess(paymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  const provider = getPaymentProviderByName("mock");
  const event = await provider.verifyWebhook(
    new Headers(),
    JSON.stringify({
      providerPaymentId: payment.providerPaymentId,
      status: "succeeded",
      amountCents: payment.amountCents,
    }),
  );
  return processWebhookEvent("mock", event);
}

export async function getCommissionReport(sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const payments = await prisma.payment.findMany({
    where: { status: "succeeded", capturedAt: { gte: since } },
  });

  const byProvider = new Map<string, { amountCents: number; feeCents: number; count: number }>();
  for (const payment of payments) {
    const row = byProvider.get(payment.provider) ?? { amountCents: 0, feeCents: 0, count: 0 };
    row.amountCents += payment.amountCents;
    row.feeCents += payment.feeCents ?? 0;
    row.count += 1;
    byProvider.set(payment.provider, row);
  }

  return Array.from(byProvider.entries()).map(([provider, row]) => ({
    provider,
    ...row,
    effectivePercent: row.amountCents > 0 ? (row.feeCents / row.amountCents) * 100 : 0,
  }));
}
