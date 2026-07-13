import { jsonCreated, jsonError, jsonOk } from "@/lib/api/response";
import { requireStaffSession } from "@/lib/auth";
import { createTestimonial, listTestimonials } from "@/lib/services/testimonialService";
import { createTestimonialSchema } from "@/lib/validators/schemas";

// Public GET returns only approved testimonials (homepage carousel).
// A staff session widens the result to every status (admin list).
export async function GET() {
  const session = await requireStaffSession();
  const testimonials = await listTestimonials(session ? undefined : { status: "approved" });
  return jsonOk(testimonials);
}

export async function POST(request: Request) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const body = await request.json();
  const parsed = createTestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Datos invalidos",
      400,
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    );
  }

  const testimonial = await createTestimonial(parsed.data);
  return jsonCreated(testimonial);
}
