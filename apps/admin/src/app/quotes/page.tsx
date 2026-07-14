import Link from "next/link";
import { listQuotes } from "@rs/shared/services/quoteService";
import { formatMXN } from "@rs/shared/format";

export default async function AdminQuotesPage() {
  const quotes = await listQuotes();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Cotizaciones</h1>
          <Link href="/" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Total</th>
                <th className="p-3">Vigencia</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t">
                  <td className="p-3">{quote.customer.name}</td>
                  <td className="p-3">{quote.status}</td>
                  <td className="p-3">{formatMXN(quote.totalCents)}</td>
                  <td className="p-3">{quote.validUntil.toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
