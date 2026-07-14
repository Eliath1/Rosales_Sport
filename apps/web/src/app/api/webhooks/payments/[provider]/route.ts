import { jsonError, jsonOk } from "@rs/shared/api/response";
import { getPaymentProviderByName } from "@rs/shared/payments/router";
import { WebhookVerificationError } from "@rs/shared/payments/types";
import { processWebhookEvent } from "@rs/shared/services/paymentService";

// One route for every provider (payment-provider-abstraction.md "Webhook
// Handling"): POST /api/webhooks/payments/:provider. Verifies the
// provider-specific signature, then delegates to paymentService, which is
// idempotent by providerPaymentId.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerName } = await params;
  const rawBody = await request.text();

  let provider;
  try {
    provider = getPaymentProviderByName(providerName);
  } catch {
    return jsonError("UNKNOWN_PROVIDER", "Proveedor de pago no reconocido", 404);
  }

  try {
    const event = await provider.verifyWebhook(request.headers, rawBody);
    const payment = await processWebhookEvent(providerName, event);
    return jsonOk({ id: payment.id, status: payment.status });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return jsonError("WEBHOOK_VERIFICATION_FAILED", error.message, 401);
    }
    if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND_FOR_WEBHOOK") {
      // Return 200 anyway: this is expected for provider health-check pings
      // or events for payments outside this system - retries would not help.
      return jsonOk({ ignored: true });
    }
    throw error;
  }
}
