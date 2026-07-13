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
          <Link href="/admin/login" className="text-white/70 hover:text-white">
            Acceso staff
          </Link>
        </div>
      </div>
    </header>
  );
}
