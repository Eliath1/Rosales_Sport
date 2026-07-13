import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCustomerSession } from "@/lib/customerAuth";
import { getOrderForCustomer } from "@/lib/services/orderService";
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

// Happy-path progression used for the timeline; `cancelled` is a terminal
// alternate state rendered separately instead of inserted into this list.
const TIMELINE_STEPS: OrderStatus[] = [
  "pending_payment",
  "payment_received",
  "in_progress",
  "preparing_shipment",
  "shipped",
  "delivered",
];

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCustomerSession();
  if (!session) redirect(`/mi-cuenta/login?callbackUrl=/mi-cuenta/pedidos/${id}`);

  // IDOR check happens inside getOrderForCustomer: a mismatched customerId
  // returns null here, which we treat identically to "order does not exist".
  const order = await getOrderForCustomer(id, session.user.id);
  if (!order) notFound();

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader customer={session.user} />
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <Link href="/mi-cuenta/pedidos" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
          Mis pedidos
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Pedido {order.id.slice(0, 8)}</h1>
        <p className="text-sm text-muted-foreground">{order.createdAt.toLocaleDateString("es-MX")}</p>

        {order.status === "cancelled" ? (
          <p className="border border-destructive bg-destructive/10 p-4 text-sm font-bold uppercase tracking-wide text-destructive">
            Pedido cancelado
          </p>
        ) : (
          <ol className="border border-border divide-y divide-border">
            {TIMELINE_STEPS.map((step, index) => {
              const reached = index <= currentStepIndex;
              return (
                <li key={step} className="flex items-center gap-3 p-3">
                  <span
                    className={`h-3 w-3 rounded-full ${reached ? "bg-primary" : "bg-muted"}`}
                    aria-hidden
                  />
                  <span className={`text-sm ${reached ? "font-bold" : "text-muted-foreground"}`}>
                    {STATUS_LABEL[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <section className="border border-border divide-y divide-border">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{item.productVariant.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.productVariant.size} x{item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatMXN(item.lineTotalCents)}</p>
            </div>
          ))}
        </section>

        <div className="border border-border bg-muted p-4 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold">{formatMXN(order.totalCents)}</span>
        </div>
      </main>
    </div>
  );
}
