import { jsonError, jsonOk } from "@rs/shared/api/response";
import { requireStaffSession } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@rs/shared/services/orderService";
import { updateOrderStatusSchema } from "@rs/shared/validators/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return jsonError("NOT_FOUND", "Pedido no encontrado", 404);
  return jsonOk(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Datos invalidos",
      400,
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    );
  }

  const order = await updateOrderStatus(id, parsed.data.status);
  return jsonOk(order);
}
