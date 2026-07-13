import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCustomerSession } from "@/lib/customerAuth";
import { listOrdersByCustomer } from "@/lib/services/orderService";
import { formatMXN } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Pago pendiente",
  payment_received: "Pago recibido",
  in_progress: "En proceso",
  preparing_shipment: "Preparando envio",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

// Login-gated only (ADR-012): guests get status updates by email instead of
// a tracking link in this phase.
export default async function MisPedidosPage() {
  const session = await requireCustomerSession();
  if (!session) redirect("/mi-cuenta/login?callbackUrl=/mi-cuenta/pedidos");

  const orders = await listOrdersByCustomer(session.user.id);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session.user} />
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <Link href="/mi-cuenta" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
          Mi cuenta
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Mis pedidos</h1>

        <div className="border border-border divide-y divide-border">
          {orders.map((order) => {
            const pieces = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/mi-cuenta/pedidos/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">
                    {order.createdAt.toLocaleDateString("es-MX")} - {pieces} piezas
                  </p>
                  <p className="text-sm text-muted-foreground">{STATUS_LABEL[order.status]}</p>
                </div>
                <p className="font-semibold">{formatMXN(order.totalCents)}</p>
              </Link>
            );
          })}
          {orders.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Aun no tienes pedidos.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
