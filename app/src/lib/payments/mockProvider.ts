import type {
  CheckoutInput,
  CheckoutSession,
  PaymentProvider,
  PaymentResult,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from "@/lib/payments/types";

// Simulated fee only - matches the shape Mercado Pago's per-payment fee
// looks like (~3.5% + a small fixed component) so the commission report has
// realistic-looking numbers in local dev/demo, not a stand-in for real rates.
const MOCK_FEE_PERCENT = 0.035;
const MOCK_FEE_FIXED_CENTS = 400;

function estimateFeeCents(amountCents: number): number {
  return Math.round(amountCents * MOCK_FEE_PERCENT) + MOCK_FEE_FIXED_CENTS;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// No real network calls, no signature verification - this exists so
// checkout/webhook code paths are fully exercisable in local dev and the
// demo without any provider credentials (payment-provider-abstraction.md
// "Test without network using a mock adapter").
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
    return {
      sessionId: `mock_${input.paymentId}`,
      redirectUrl: `${siteUrl()}/pay/mock/${input.paymentId}`,
      expiresAt: null,
    };
  }

  async capturePayment(
    providerPaymentId: string,
    context?: { amountCents: number },
  ): Promise<PaymentResult> {
    const amountCents = context?.amountCents ?? 0;
    return {
      providerPaymentId,
      status: "succeeded",
      feeCents: estimateFeeCents(amountCents),
      capturedAt: new Date(),
    };
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    return {
      refunded: true,
      providerRefundId: `mock_refund_${input.providerPaymentId}`,
    };
  }

  async verifyWebhook(_headers: Headers, rawBody: string): Promise<WebhookEvent> {
    const payload = JSON.parse(rawBody) as {
      providerPaymentId: string;
      status: WebhookEvent["status"];
      amountCents?: number;
    };
    return {
      providerPaymentId: payload.providerPaymentId,
      eventType: `mock.payment.${payload.status}`,
      status: payload.status,
      feeCents: payload.status === "succeeded" ? estimateFeeCents(payload.amountCents ?? 0) : null,
      rawPayload: payload,
    };
  }
}
