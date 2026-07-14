import { jsonCreated, jsonError, jsonOk } from "@rs/shared/api/response";
import { requireStaffSession } from "@/lib/auth";
import { createCustomer, listCustomers } from "@rs/shared/services/customerService";
import { createCustomerSchema } from "@rs/shared/validators/schemas";

export async function GET() {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const customers = await listCustomers();
  return jsonOk(customers);
}

export async function POST(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const body = await request.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Datos invalidos", 400, parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })));
  }

  try {
    const customer = await createCustomer(parsed.data);
    return jsonCreated(customer);
  } catch {
    return jsonError("CONFLICT", "El email ya existe", 409);
  }
}
