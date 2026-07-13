import { jsonCreated, jsonError, jsonOk } from "@/lib/api/response";
import { requireStaffSession } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/services/productService";
import { createProductSchema } from "@/lib/validators/schemas";

export async function GET() {
  const products = await listProducts();
  return jsonOk(products);
}

export async function POST(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Datos invalidos", 400, parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })));
  }

  const product = await createProduct(parsed.data);
  return jsonCreated(product);
}
