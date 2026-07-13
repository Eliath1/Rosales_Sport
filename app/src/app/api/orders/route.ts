import { jsonCreated, jsonError, jsonOk } from "@/lib/api/response";
import { requireStaffSession } from "@/lib/auth";
import { createGuestOrder, listOrders, MIN_ORDER_QUANTITY } from "@/lib/services/orderService";
import { checkoutOrderSchema } from "@/lib/validators/schemas";
import { sendNewOrderNotification } from "@/lib/email/orderNotification";

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

// Public: guest checkout, no staff session required (Priority 1 - getting
// new customers means no login wall on a first purchase).
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Datos invalidos",
      400,
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    );
  }

  try {
    const order = await createGuestOrder(parsed.data);
    await sendNewOrderNotification(order);
    return jsonCreated(order);
  } catch (error) {
    if (error instanceof Error && error.message === "MIN_ORDER_QUANTITY_NOT_MET") {
      return jsonError(
        "MIN_ORDER_QUANTITY_NOT_MET",
        `El pedido minimo es de ${MIN_ORDER_QUANTITY} piezas`,
        400,
      );
    }
    if (error instanceof Error && error.message === "PRODUCT_VARIANT_NOT_FOUND") {
      return jsonError("PRODUCT_VARIANT_NOT_FOUND", "Variante de producto no encontrada", 400);
    }
    throw error;
  }
}
