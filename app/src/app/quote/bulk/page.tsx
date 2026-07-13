"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function BulkQuotePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leads/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
        teamName: form.get("teamName"),
        quantity: Number(form.get("quantity")),
        sizes: form.get("sizes") || undefined,
        message: form.get("message") || undefined,
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });

    setStatus(response.ok ? "success" : "error");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-xl px-4 py-10 space-y-4">
        <Link href="/" className="text-sm underline">Inicio</Link>
        <h1 className="text-2xl font-semibold">Cotizacion por equipo / mayoreo</h1>
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
          <label className="block space-y-1">
            <span className="text-sm">Nombre contacto</span>
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
            <span className="text-sm">Nombre del equipo</span>
            <input name="teamName" required className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">Cantidad total</span>
            <input name="quantity" type="number" min={1} required className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">Desglose de tallas</span>
            <textarea name="sizes" rows={2} className="w-full rounded-md border px-3 py-2" placeholder="10 M, 8 L, 5 XL" />
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
      </main>
    </div>
  );
}
