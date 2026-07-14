import { jsonCreated, jsonError } from "@rs/shared/api/response";
import { createGuestOrder, MIN_ORDER_QUANTITY } from "@rs/shared/services/orderService";
import { checkoutOrderSchema } from "@rs/shared/validators/schemas";
import { sendNewOrderNotification } from "@rs/shared/email/orderNotification";

// Public: guest checkout, no staff session required (Priority 1 - getting
// new customers means no login wall on a first purchase). Staff listing of
// all orders lives in apps/admin's own /api/orders (GET, staff-session
// gated) - the two apps never call each other, both write to the same
// Neon database via @rs/db (ADR-014).
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
