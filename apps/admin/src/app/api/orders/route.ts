import { jsonError, jsonOk } from "@rs/shared/api/response";
import { requireStaffSession } from "@/lib/auth";
import { listOrders } from "@rs/shared/services/orderService";

export async function GET(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "pending_payment"
    | "payment_received"
    | "in_progress"
    | "preparing_shipment"
    | "shipped"
    | "delivered"
    | "cancelled"
    | null;

  const orders = await listOrders(status ? { status } : undefined);
  return jsonOk(orders);
}
