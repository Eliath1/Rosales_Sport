import Image from "next/image";
import Link from "next/link";

/**
 * Shared public-facing header for the real Next.js app (not the demo/ static
 * prototype). Keeps the same red/black RS brand as demo/css/styles.css so
 * both surfaces feel like one product while Wave 1 backend work lands.
 *
 * `customer` is passed in by the page (a Server Component that already
 * called `requireCustomerSession()`) rather than fetched here, so this stays
 * a plain presentational component usable from any Server Component tree.
 */
// apps/admin now lives on its own subdomain (ADR-014), so the staff link is
// a plain cross-origin <a>, not a Next <Link> - there is no client-side
// route for it inside apps/web. Falls back to localhost:3001 for local dev
// against the admin app's default port when the env var isn't set.
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

export function SiteHeader({
  customer,
}: {
  customer?: { name: string } | null;
}) {
  const firstName = customer?.name.split(" ")[0];

  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/rs-logo.png" alt="Rosales Sport" width={40} height={27} />
          <span className="text-sm font-bold uppercase tracking-wide">Rosales Sport</span>
        </Link>
        <div className="flex items-center gap-4 text-xs uppercase tracking-wide">
          <Link href={customer ? "/mi-cuenta" : "/mi-cuenta/login"} className="text-white/70 hover:text-white">
            {customer ? firstName : "Iniciar sesion"}
          </Link>
          <a href={`${ADMIN_URL}/login`} className="text-white/70 hover:text-white">
            Acceso staff
          </a>
        </div>
      </div>
    </header>
  );
}
