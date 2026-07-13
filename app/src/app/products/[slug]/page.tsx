import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/services/productService";
import { formatMXN } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { requireCustomerSession } from "@/lib/customerAuth";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), requireCustomerSession()]);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session?.user ?? null} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Link href="/" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
          Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold uppercase tracking-tight">{product.name}</h1>
        <p className="text-muted-foreground">{product.team} - {product.league}</p>
        <p className="text-2xl font-semibold">{formatMXN(product.basePriceCents)}</p>
        {product.description ? <p>{product.description}</p> : null}
        <div>
          <p className="text-sm font-medium mb-2">Tallas disponibles</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <span key={variant.id} className="border border-border px-3 py-1 text-sm">
                {variant.size}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.variants[0] ? (
            <Link
              href={`/checkout?variant=${product.variants[0].id}`}
              className="inline-flex bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              Comprar (minimo 6 piezas)
            </Link>
          ) : null}
          <Link
            href={`/quote?product=${product.slug}`}
            className="inline-flex border-2 border-black px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black hover:bg-black hover:text-white"
          >
            Solicitar cotizacion
          </Link>
        </div>
      </main>
    </div>
  );
}
