import { createHmac } from "crypto";
import type {
  CheckoutInput,
  CheckoutSession,
  PaymentProvider,
  PaymentResult,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from "@/lib/payments/types";
import { WebhookVerificationError } from "@/lib/payments/types";

const MP_API_BASE = "https://api.mercadopago.com";

// Scaffolded per docs/architecture/payment-provider-abstraction.md and
// ADR-013 ahead of having real sandbox credentials. Every call is guarded by
// requireAccessToken() so a misconfigured deploy fails loudly at the call
// site instead of silently no-oping. Verify signature/response shapes
// against the live Mercado Pago docs before the security-reviewer sign-off
// required in AGENTS.md prior to go-live.
function requireAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN is not set - MercadoPagoAdapter cannot be used until sandbox/live credentials are configured.",
    );
  }
  return token;
}

interface MpPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_of_expiration?: string;
}

interface MpPaymentResource {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  fee_details?: Array<{ type: string; amount: number }>;
  date_approved?: string;
}

function mapMpStatus(status: string): PaymentResult["status"] {
  if (status === "approved") return "succeeded";
  if (status === "rejected" || status === "cancelled") return "failed";
  return "pending";
}

export class MercadoPagoAdapter implements PaymentProvider {
  readonly name = "mercadopago" as const;

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
    const token = requireAccessToken();
    const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").startsWith("TEST-");

    const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: input.description,
            quantity: 1,
            currency_id: "MXN",
            unit_price: input.amountCents / 100,
          },
        ],
        payer: { name: input.customer.name, email: input.customer.email },
        external_reference: input.paymentId,
        metadata: input.metadata,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payments/mercadopago`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago preference creation failed: ${response.status} ${await response.text()}`);
    }

    const preference = (await response.json()) as MpPreferenceResponse;
    return {
      sessionId: preference.id,
      redirectUrl: isSandbox ? preference.sandbox_init_point : preference.init_point,
      expiresAt: preference.date_of_expiration ? new Date(preference.date_of_expiration) : null,
    };
  }

  async capturePayment(providerPaymentId: string): Promise<PaymentResult> {
    const token = requireAccessToken();
    const response = await fetch(`${MP_API_BASE}/v1/payments/${providerPaymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago payment lookup failed: ${response.status} ${await response.text()}`);
    }

    const payment = (await response.json()) as MpPaymentResource;
    const feeCents = payment.fee_details?.length
      ? Math.round(payment.fee_details.reduce((sum, fee) => sum + fee.amount, 0) * 100)
      : null;

    return {
      providerPaymentId: String(payment.id),
      status: mapMpStatus(payment.status),
      feeCents,
      capturedAt: payment.date_approved ? new Date(payment.date_approved) : null,
    };
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    const token = requireAccessToken();
    const response = await fetch(`${MP_API_BASE}/v1/payments/${input.providerPaymentId}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: input.amountCents / 100 }),
    });

    if (!response.ok) {
      return { refunded: false, providerRefundId: null };
    }

    const refund = (await response.json()) as { id: number };
    return { refunded: true, providerRefundId: String(refund.id) };
  }

  // Per Mercado Pago's webhook signature scheme: x-signature header carries
  // `ts=<unix>,v1=<hmac>`; the HMAC is SHA256 over
  // `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` keyed by the webhook
  // secret. Confirm this against MP's current docs during sandbox testing -
  // header/field names have changed across their API versions before.
  async verifyWebhook(headers: Headers, rawBody: string): Promise<WebhookEvent> {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const signatureHeader = headers.get("x-signature");
    const requestId = headers.get("x-request-id");

    if (!secret || !signatureHeader) {
      throw new WebhookVerificationError("Missing webhook secret or x-signature header");
    }

    const parts = Object.fromEntries(
      signatureHeader.split(",").map((part) => {
        const [key, value] = part.split("=");
        return [key.trim(), value?.trim()];
      }),
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    const body = JSON.parse(rawBody) as { data?: { id?: string } };
    const dataId = body.data?.id;

    if (!ts || !v1 || !dataId) {
      throw new WebhookVerificationError("Malformed x-signature header or payload");
    }

    const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};`;
    const expected = createHmac("sha256", secret).update(manifest).digest("hex");
    if (expected !== v1) {
      throw new WebhookVerificationError("Signature mismatch");
    }

    const paymentResult = await this.capturePayment(dataId);
    return {
      providerPaymentId: paymentResult.providerPaymentId,
      eventType: "mercadopago.payment.updated",
      status: paymentResult.status,
      feeCents: paymentResult.feeCents,
      rawPayload: body,
    };
  }
}
