import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCustomerSession } from "@/lib/customerAuth";
import { logoutCustomerAction } from "@/lib/actions/customerAuthActions";
import { SiteHeader } from "@/components/site-header";

export default async function MiCuentaPage() {
  const session = await requireCustomerSession();
  if (!session) redirect("/mi-cuenta/login?callbackUrl=/mi-cuenta");

  const { user } = session;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={user} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Mi cuenta</h1>

        <section className="border border-border p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nombre</p>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mt-4">Correo</p>
          <p className="font-medium">{user.email}</p>
          {user.phone ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mt-4">Telefono</p>
              <p className="font-medium">{user.phone}</p>
            </>
          ) : null}
        </section>

        <Link
          href="/mi-cuenta/pedidos"
          className="inline-block text-sm font-bold uppercase tracking-wide text-primary hover:underline"
        >
          Ver mis pedidos
        </Link>

        {user.isDistributor ? (
          <section className="border border-border bg-muted p-6 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Metodos de pago guardados</h2>
            <p className="text-sm text-muted-foreground">
              Aun no tienes metodos de pago guardados. Esta funcion estara disponible pronto para clientes
              distribuidores.
            </p>
          </section>
        ) : null}

        <form action={logoutCustomerAction}>
          <button type="submit" className="text-sm font-bold uppercase tracking-wide text-primary hover:underline">
            Cerrar sesion
          </button>
        </form>
      </main>
    </div>
  );
}
