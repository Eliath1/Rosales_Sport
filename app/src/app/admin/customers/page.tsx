import Link from "next/link";
import { revalidatePath } from "next/cache";
import { listCustomers, setCustomerDistributorFlag } from "@/lib/services/customerService";
import { requireStaffSession } from "@/lib/auth";
import { updateCustomerDistributorSchema } from "@/lib/validators/schemas";

// Staff-only mutation (security-baseline.mdc): role comes from the server
// session, never trusted from the form body, before flipping isDistributor.
async function toggleDistributor(formData: FormData) {
  "use server";
  const session = await requireStaffSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const customerId = formData.get("customerId") as string;
  const parsed = updateCustomerDistributorSchema.safeParse({
    isDistributor: formData.get("isDistributor") === "true",
  });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  await setCustomerDistributorFlag(customerId, parsed.data.isDistributor);
  revalidatePath("/admin/customers");
}

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Clientes</h1>
          <Link href="/admin" className="text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Telefono</th>
                <th className="p-3">Distribuidor</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="p-3">{customer.name}</td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">{customer.customerType}</td>
                  <td className="p-3">{customer.phone ?? "-"}</td>
                  <td className="p-3">
                    <form action={toggleDistributor}>
                      <input type="hidden" name="customerId" value={customer.id} />
                      <input type="hidden" name="isDistributor" value={(!customer.isDistributor).toString()} />
                      <button
                        type="submit"
                        className={`text-xs font-bold uppercase tracking-wide underline ${
                          customer.isDistributor ? "text-primary" : "text-zinc-500"
                        }`}
                      >
                        {customer.isDistributor ? "Si (quitar)" : "No (marcar)"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
