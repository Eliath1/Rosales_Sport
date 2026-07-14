// Conceptual interface from docs/architecture/payment-provider-abstraction.md,
// adapted to this codebase's cents-based Money representation (MXN only for
// now - see ADR-006). Swapping providers means writing a new class here, not
// touching checkout/webhook call sites.
export interface PaymentCustomerRef {
  id: string;
  name: string;
  email: string;
}

export interface CheckoutInput {
  paymentId: string;
  orderId: string;
  amountCents: number;
  description: string;
  customer: PaymentCustomerRef;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  sessionId: string;
  redirectUrl: string;
  expiresAt: Date | null;
}

export interface PaymentResult {
  providerPaymentId: string;
  status: "pending" | "succeeded" | "failed";
  feeCents: number | null;
  capturedAt: Date | null;
}

export interface RefundInput {
  providerPaymentId: string;
  amountCents: number;
}

export interface RefundResult {
  refunded: boolean;
  providerRefundId: string | null;
}

export interface WebhookEvent {
  providerPaymentId: string;
  eventType: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  feeCents: number | null;
  rawPayload: unknown;
}

export interface PaymentProvider {
  readonly name: "mock" | "mercadopago" | "stripe";
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession>;
  // `context.amountCents` is only read by MockPaymentProvider, which has no
  // real backend to look the amount up from. A real adapter (Mercado Pago,
  // Stripe) fetches the payment resource by providerPaymentId and ignores it.
  capturePayment(providerPaymentId: string, context?: { amountCents: number }): Promise<PaymentResult>;
  refundPayment(input: RefundInput): Promise<RefundResult>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<WebhookEvent>;
}

export class WebhookVerificationError extends Error {
  constructor(message = "Invalid webhook signature") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}
