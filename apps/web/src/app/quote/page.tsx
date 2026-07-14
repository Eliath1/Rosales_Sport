"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leads/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
        productSlug: form.get("productSlug") || undefined,
        size: form.get("size") || undefined,
        quantity: Number(form.get("quantity") || 1),
        message: form.get("message") || undefined,
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });

    setStatus(response.ok ? "success" : "error");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
      <label className="block space-y-1">
        <span className="text-sm">Nombre</span>
        <input name="name" required className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Email</span>
        <input name="email" type="email" required className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Telefono</span>
        <input name="phone" className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Producto (slug)</span>
        <input
          name="productSlug"
          defaultValue={productSlug}
          className="w-full rounded-md border px-3 py-2"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Talla</span>
        <input name="size" className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Cantidad</span>
        <input name="quantity" type="number" min={1} defaultValue={1} className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Mensaje</span>
        <textarea name="message" rows={3} className="w-full rounded-md border px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="marketingConsent" type="checkbox" />
        Acepto recibir promociones
      </label>
      <button type="submit" className="rounded-md bg-black text-white px-4 py-2 text-sm">
        Enviar solicitud
      </button>
      {status === "success" ? (
        <p className="text-sm text-green-700">Solicitud enviada. Te contactaremos pronto.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-600">No se pudo enviar. Intenta de nuevo.</p>
      ) : null}
    </form>
  );
}

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-xl px-4 py-10 space-y-4">
        <Link href="/" className="text-sm underline">Inicio</Link>
        <h1 className="text-2xl font-semibold">Solicitar cotizacion</h1>
        <Suspense fallback={<p className="text-sm">Cargando formulario...</p>}>
          <QuoteForm />
        </Suspense>
      </main>
    </div>
  );
}
