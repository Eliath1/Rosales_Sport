import Link from "next/link";
import { getCommissionReport } from "@rs/shared/services/paymentService";
import { formatMXN } from "@rs/shared/format";

// ADR-013 "Admin commission report": effective % = sum(feeCents) /
// sum(amountCents) over a trailing period, broken out by provider. Answers
// "what % am I actually paying" - not a bookkeeping/reconciliation system.
export default async function AdminPaymentsPage() {
  const report = await getCommissionReport(30);
  const totalAmount = report.reduce((sum, row) => sum + row.amountCents, 0);
  const totalFee = report.reduce((sum, row) => sum + row.feeCents, 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Comisiones de pago</h1>
          <Link href="/orders" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">Pedidos</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <p className="text-sm text-zinc-600">
          Comision efectiva pagada a cada procesador en los ultimos 30 dias, calculada sobre pagos exitosos.
        </p>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-zinc-600">Cobrado (30 dias)</p>
            <p className="text-3xl font-semibold mt-1">{formatMXN(totalAmount)}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-zinc-600">Comision total</p>
            <p className="text-3xl font-semibold mt-1">{formatMXN(totalFee)}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-zinc-600">% efectivo global</p>
            <p className="text-3xl font-semibold mt-1">
              {totalAmount > 0 ? ((totalFee / totalAmount) * 100).toFixed(2) : "0.00"}%
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="p-3">Proveedor</th>
                <th className="p-3">Pagos</th>
                <th className="p-3">Cobrado</th>
                <th className="p-3">Comision</th>
                <th className="p-3">% efectivo</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row) => (
                <tr key={row.provider} className="border-t">
                  <td className="p-3 font-medium">{row.provider}</td>
                  <td className="p-3">{row.count}</td>
                  <td className="p-3">{formatMXN(row.amountCents)}</td>
                  <td className="p-3">{formatMXN(row.feeCents)}</td>
                  <td className="p-3">{row.effectivePercent.toFixed(2)}%</td>
                </tr>
              ))}
              {report.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-zinc-500" colSpan={5}>
                    Aun no hay pagos exitosos en los ultimos 30 dias.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
