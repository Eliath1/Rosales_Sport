import { jsonCreated, jsonError, jsonOk } from "@rs/shared/api/response";
import { requireStaffSession } from "@/lib/auth";
import { createQuote, listQuotes } from "@rs/shared/services/quoteService";
import { createQuoteSchema } from "@rs/shared/validators/schemas";

export async function GET(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "draft"
    | "sent"
    | "accepted"
    | "expired"
    | "rejected"
    | null;

  const quotes = await listQuotes(status ? { status } : undefined);
  return jsonOk(quotes);
}

export async function POST(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const body = await request.json();
  const parsed = createQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Datos invalidos", 400, parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })));
  }

  const quote = await createQuote({
    ...parsed.data,
    createdById: session.user.id,
  });
  return jsonCreated(quote);
}
