import Link from "next/link";
import { listProducts } from "@/lib/services/productService";
import { formatMXN } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { requireCustomerSession } from "@/lib/customerAuth";

export default async function HomePage() {
  const [products, session] = await Promise.all([listProducts(), requireCustomerSession()]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session?.user ?? null} />
      <div className="bg-primary py-2 text-center text-xs font-bold uppercase tracking-wide text-primary-foreground">
        Cotiza mayoreo y equipos - respuesta en 24 horas habiles
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Jerseys y equipo de beisbol</h1>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mt-6 mb-4">Jerseys destacados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="border border-border p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.team}</p>
                <p className="mt-2 font-semibold">{formatMXN(product.basePriceCents)}</p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-3 inline-block text-sm font-bold uppercase tracking-wide text-primary hover:underline"
                >
                  Ver producto
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-border bg-muted p-6">
          <h2 className="text-lg font-semibold">Solicita cotizacion</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Compra por mayoreo o equipo? Envianos tu solicitud y te respondemos rapido.
          </p>
          <div className="flex gap-4 mt-4 text-sm font-bold uppercase tracking-wide">
            <Link href="/quote" className="text-primary hover:underline">Cotizacion retail</Link>
            <Link href="/quote/bulk" className="text-primary hover:underline">Pedido por equipo</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
