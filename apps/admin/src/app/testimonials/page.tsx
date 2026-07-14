import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  createTestimonial,
  deleteTestimonial,
  listTestimonials,
  updateTestimonialStatus,
} from "@rs/shared/services/testimonialService";
import { requireStaffSession } from "@/lib/auth";
import type { TestimonialStatus } from "@rs/db";

async function addTestimonial(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  await createTestimonial({
    authorName: String(formData.get("authorName") ?? ""),
    teamName: (formData.get("teamName") as string) || undefined,
    quote: String(formData.get("quote") ?? ""),
    photoUrl: (formData.get("photoUrl") as string) || undefined,
  });
  revalidatePath("/testimonials");
}

async function changeStatus(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = formData.get("id") as string;
  const status = formData.get("status") as TestimonialStatus;
  await updateTestimonialStatus(id, status);
  revalidatePath("/testimonials");
}

async function removeTestimonial(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = formData.get("id") as string;
  await deleteTestimonial(id);
  revalidatePath("/testimonials");
}

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonials();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Testimonios</h1>
          <Link href="/" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-4">Agregar testimonio</h2>
          <form action={addTestimonial} className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm">Nombre</span>
              <input name="authorName" required className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm">Equipo (opcional)</span>
              <input name="teamName" className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm">Testimonio</span>
              <textarea name="quote" required rows={3} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm">URL de foto (opcional)</span>
              <input name="photoUrl" type="url" className="w-full rounded-md border px-3 py-2" />
            </label>
            <button type="submit" className="rounded-md bg-black text-white px-4 py-2 text-sm sm:col-span-2 sm:w-fit">
              Guardar
            </button>
          </form>
        </section>

        <section className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="p-3">Autor</th>
                <th className="p-3">Testimonio</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="border-t align-top">
                  <td className="p-3">
                    <p className="font-medium">{testimonial.authorName}</p>
                    <p className="text-zinc-500">{testimonial.teamName ?? "-"}</p>
                  </td>
                  <td className="p-3 max-w-md">{testimonial.quote}</td>
                  <td className="p-3">
                    <form action={changeStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={testimonial.id} />
                      <select
                        name="status"
                        defaultValue={testimonial.status}
                        className="rounded-md border px-2 py-1 text-xs"
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="hidden">hidden</option>
                      </select>
                      <button type="submit" className="text-xs underline">Guardar</button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form action={removeTestimonial}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button type="submit" className="text-xs text-red-600 underline">Eliminar</button>
                    </form>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-zinc-500" colSpan={4}>
                    Aun no hay testimonios.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
