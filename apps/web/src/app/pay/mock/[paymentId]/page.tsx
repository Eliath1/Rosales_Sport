import { notFound } from "next/navigation";
import { getPaymentById } from "@rs/shared/services/paymentService";
import { formatMXN } from "@rs/shared/format";
import { SiteHeader } from "@/components/site-header";
import { requireCustomerSession } from "@/lib/customerAuth";
import { MockPaySimulateButton } from "./mock-pay-simulate-button";

// Stand-in for a real hosted checkout page (Mercado Pago's init_point) so
// the full checkout -> pay -> webhook -> order-updated loop is testable
// locally with zero payment credentials. Only reachable for `mock`
// provider payments - see MockPaymentProvider.createCheckoutSession.
export default async function MockPayPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const [payment, session] = await Promise.all([getPaymentById(paymentId), requireCustomerSession()]);
  if (!payment) notFound();

  const alreadyDone = payment.status !== "pending";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session?.user ?? null} />
      <main className="mx-auto max-w-md px-4 py-16 space-y-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Pasarela simulada (demo)</p>
        <h1 className="text-2xl font-bold uppercase tracking-tight">
          {payment.kind === "deposit" ? "Anticipo (50%)" : payment.kind === "balance" ? "Liquidacion" : "Pago"}
        </h1>
        <p className="text-3xl font-semibold">{formatMXN(payment.amountCents)}</p>
        <p className="text-sm text-muted-foreground">
          Pedido de {payment.order.customer.name} - {payment.order.customer.email}
        </p>

        {alreadyDone ? (
          <p className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Este pago ya fue procesado ({payment.status}).
          </p>
        ) : (
          <MockPaySimulateButton paymentId={payment.id} />
        )}
      </main>
    </div>
  );
}
