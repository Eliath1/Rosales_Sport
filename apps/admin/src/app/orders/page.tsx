import Link from "next/link";
import { revalidatePath } from "next/cache";
import { listOrders, updateOrderStatus } from "@rs/shared/services/orderService";
import { requestBalancePayment } from "@rs/shared/services/paymentService";
import { requireStaffSession } from "@/lib/auth";
import { formatMXN } from "@rs/shared/format";
import type { OrderStatus } from "@rs/db";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_payment",
  "payment_received",
  "in_progress",
  "preparing_shipment",
  "shipped",
  "delivered",
  "cancelled",
];

async function changeOrderStatus(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;
  await updateOrderStatus(orderId, status);
  revalidatePath("/orders");
}

async function requestBalance(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const orderId = formData.get("orderId") as string;
  await requestBalancePayment(orderId);
  revalidatePath("/orders");
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Pedidos</h1>
          <div className="flex gap-3 text-xs font-bold uppercase tracking-wide">
            <Link href="/payments" className="text-white/70 hover:text-white">Comisiones</Link>
            <Link href="/" className="text-white/70 hover:text-white">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Piezas</th>
                <th className="p-3">Total</th>
                <th className="p-3">Pago</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const pieces = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
                const balancePayment = order.payments.find((p) => p.kind === "balance");
                const depositPayment = order.payments.find((p) => p.kind === "deposit");
                const canRequestBalance =
                  order.paymentPlan === "deposit_50" &&
                  depositPayment?.status === "succeeded" &&
                  !balancePayment;

                return (
                  <tr key={order.id} className="border-t align-top">
                    <td className="p-3">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-zinc-500">{order.customer.email}</p>
                    </td>
                    <td className="p-3">{pieces}</td>
                    <td className="p-3">{formatMXN(order.totalCents)}</td>
                    <td className="p-3 space-y-1">
                      <p className="text-xs uppercase text-zinc-500">
                        {order.paymentPlan === "deposit_50" ? "Anticipo 50%" : "Pago completo"}
                      </p>
                      {order.paymentPlan === "deposit_50" ? (
                        <p className="text-zinc-600">
                          Anticipo: {formatMXN(order.depositCents)} ({depositPayment?.status ?? "sin pago"})<br />
                          Saldo: {formatMXN(order.balanceCents)} ({balancePayment?.status ?? "no solicitado"})
                        </p>
                      ) : (
                        <p className="text-zinc-600">
                          {order.payments[0]?.status ?? "sin pago"}
                        </p>
                      )}
                      {canRequestBalance ? (
                        <form action={requestBalance}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" className="text-xs underline">Solicitar liquidacion</button>
                        </form>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <form action={changeOrderStatus} className="flex items-center gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <select
                          name="status"
                          defaultValue={order.status}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs underline">Guardar</button>
                      </form>
                    </td>
                    <td className="p-3 text-zinc-500">
                      {order.createdAt.toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-zinc-500" colSpan={6}>
                    Aun no hay pedidos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
