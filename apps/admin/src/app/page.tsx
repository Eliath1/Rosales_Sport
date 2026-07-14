import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getPipelineStats, listQuotes } from "@rs/shared/services/quoteService";
import { getOrderPipelineStats, listOrders } from "@rs/shared/services/orderService";
import { formatMXN } from "@rs/shared/format";
import { listLeads } from "@rs/shared/services/leadService";

export default async function AdminDashboardPage() {
  const session = await auth();
  const [pipeline, recentQuotes, leads, orderPipeline, recentOrders] = await Promise.all([
    getPipelineStats(),
    listQuotes(),
    listLeads(5),
    getOrderPipelineStats(),
    listOrders({ limit: 5 }),
  ]);

  const totalQuotes = pipeline.reduce((sum, row) => sum + row.count, 0);
  const totalOrders = orderPipeline.reduce((sum, row) => sum + row.count, 0);
  const totalOrdersMxn = orderPipeline.reduce((sum, row) => sum + row.totalCents, 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">Dashboard CRM</h1>
            <p className="text-sm text-white/60">{session?.user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wide">
            <Link href="/orders" className="text-white/70 hover:text-white">Pedidos</Link>
            <Link href="/payments" className="text-white/70 hover:text-white">Comisiones</Link>
            <Link href="/quotes" className="text-white/70 hover:text-white">Cotizaciones</Link>
            <Link href="/products" className="text-white/70 hover:text-white">Catalogo</Link>
            <Link href="/customers" className="text-white/70 hover:text-white">Clientes</Link>
            <Link href="/testimonials" className="text-white/70 hover:text-white">Testimonios</Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="text-primary hover:text-primary/80">Salir</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-4">
          <div className="border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">Pedidos</p>
            <p className="text-3xl font-semibold mt-1">{totalOrders}</p>
          </div>
          <div className="border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">Valor pedidos</p>
            <p className="text-3xl font-semibold mt-1 text-primary">{formatMXN(totalOrdersMxn)}</p>
          </div>
          <div className="border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">Cotizaciones</p>
            <p className="text-3xl font-semibold mt-1">{totalQuotes}</p>
          </div>
          <div className="border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">Leads recientes</p>
            <p className="text-3xl font-semibold mt-1">{leads.length}</p>
          </div>
        </section>

        <section className="border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Pedidos por estado</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {orderPipeline.map((row) => (
              <div key={row.status} className="bg-muted p-3">
                <p className="text-xs uppercase text-muted-foreground">{row.status}</p>
                <p className="text-lg font-medium">{row.count}</p>
                <p className="text-sm text-muted-foreground">{formatMXN(row.totalCents)}</p>
              </div>
            ))}
            {orderPipeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aun no hay pedidos.</p>
            ) : null}
          </div>
        </section>

        <section className="border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Pedidos recientes</h2>
          <ul className="space-y-2">
            {recentOrders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex justify-between border-b border-border py-2 text-sm">
                <span>{order.customer.name}</span>
                <span className="text-muted-foreground">{order.status} - {formatMXN(order.totalCents)}</span>
              </li>
            ))}
            {recentOrders.length === 0 ? (
              <li className="text-sm text-muted-foreground">Aun no hay pedidos.</li>
            ) : null}
          </ul>
        </section>

        <section className="border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Pipeline de cotizaciones</h2>
          <div className="grid gap-2 sm:grid-cols-5">
            {pipeline.map((row) => (
              <div key={row.status} className="bg-muted p-3">
                <p className="text-xs uppercase text-muted-foreground">{row.status}</p>
                <p className="text-lg font-medium">{row.count}</p>
                <p className="text-sm text-muted-foreground">{formatMXN(row.totalCents)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Cotizaciones recientes</h2>
          <ul className="space-y-2">
            {recentQuotes.slice(0, 5).map((quote) => (
              <li key={quote.id} className="flex justify-between border-b border-border py-2 text-sm">
                <span>{quote.customer.name}</span>
                <span className="text-muted-foreground">{quote.status} - {formatMXN(quote.totalCents)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
