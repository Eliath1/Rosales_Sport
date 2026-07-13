import { jsonCreated, jsonError } from "@/lib/api/response";
import { createLead } from "@/lib/services/leadService";
import { quoteFormLeadSchema } from "@/lib/validators/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = quoteFormLeadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Datos invalidos", 400, parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })));
  }

  const lead = await createLead({
    source: "quote_form",
    payload: parsed.data,
    customer: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      marketingConsent: parsed.data.marketingConsent,
    },
  });

  return jsonCreated(lead);
}
