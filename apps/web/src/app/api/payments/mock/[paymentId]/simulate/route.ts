import { jsonOk } from "@rs/shared/api/response";
import { simulateMockPaymentSuccess } from "@rs/shared/services/paymentService";

// Local dev/demo only: stands in for the provider's real webhook call so
// the mock checkout page (src/app/pay/mock/[paymentId]) can complete the
// full checkout -> pay -> order-updated loop without a real provider.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await params;
  const payment = await simulateMockPaymentSuccess(paymentId);
  return jsonOk(payment);
}
