import { jsonError, jsonOk } from "@rs/shared/api/response";
import { requireStaffSession } from "@/lib/auth";
import { deleteTestimonial, updateTestimonialStatus } from "@rs/shared/services/testimonialService";
import { updateTestimonialStatusSchema } from "@rs/shared/validators/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { id } = await params;
  const body = await request.json();
  const parsed = updateTestimonialStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Datos invalidos",
      400,
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    );
  }

  const testimonial = await updateTestimonialStatus(id, parsed.data.status);
  return jsonOk(testimonial);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaffSession();
  if (!session) return jsonError("UNAUTHORIZED", "Sesion requerida", 401);

  const { id } = await params;
  await deleteTestimonial(id);
  return jsonOk({ id });
}
