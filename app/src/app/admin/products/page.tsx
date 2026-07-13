import Link from "next/link";
import { listProducts } from "@/lib/services/productService";
import { formatMXN } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await listProducts({ activeOnly: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Catalogo</h1>
          <Link href="/admin" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-zinc-600">{product.team} - {product.sku}</p>
            <p className="mt-2">{formatMXN(product.basePriceCents)}</p>
            <p className="text-xs text-zinc-500 mt-2">{product.variants.length} variantes</p>
          </article>
        ))}
      </main>
    </div>
  );
}
