import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { requireCustomerSession } from "@/lib/customerAuth";
import { CheckoutForm } from "./checkout-form";

// Server wrapper only: reads the customer session (if any) so it can be
// passed down for pre-fill (ADR-012). Guest checkout keeps working exactly
// as before when there's no session - see checkout-form.tsx.
export default async function CheckoutPage() {
  const session = await requireCustomerSession();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session?.user ?? null} />
      <main className="mx-auto max-w-xl px-4 py-10 space-y-4">
        <Link href="/" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
          Inicio
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Confirmar pedido</h1>
        <Suspense fallback={<p className="text-sm">Cargando formulario...</p>}>
          <CheckoutForm
            customer={
              session
                ? { name: session.user.name, email: session.user.email, phone: session.user.phone }
                : null
            }
          />
        </Suspense>
      </main>
    </div>
  );
}
