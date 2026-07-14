import { jsonOk } from "@rs/shared/api/response";
import { listProducts } from "@rs/shared/services/productService";

// Public catalog read only - product creation/edit is staff-only and lives
// in apps/admin's own /api/products (POST). Both apps read the same Neon
// database via @rs/db, so this is a duplicated thin route, not a
// cross-app HTTP call (ADR-014).
export async function GET() {
  const products = await listProducts();
  return jsonOk(products);
}
