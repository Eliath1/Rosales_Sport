"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const MIN_ORDER_QUANTITY = 6;

// ADR-012 consequence: when a customer session exists, contact fields are
// pre-filled from the session and hidden instead of re-asked (still sent as
// hidden inputs so the request body shape stays identical). Guest checkout
// (customer === null) renders exactly as before - no login is required here.
export function CheckoutForm({
  customer,
}: {
  customer: { name: string; email: string; phone: string | null } | null;
}) {
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variant") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity") || MIN_ORDER_QUANTITY);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: customer?.name ?? form.get("name"),
          email: customer?.email ?? form.get("email"),
          phone: (customer?.phone ?? (form.get("phone") as string | null)) || undefined,
          marketingConsent: form.get("marketingConsent") === "on",
        },
        notes: form.get("notes") || undefined,
        lineItems: [
          {
            productVariantId: form.get("variantId"),
            quantity,
          },
        ],
      }),
    });

    if (response.ok) {
      const body = await response.json();
      const checkoutUrl = body?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      setStatus("success");
      return;
    }

    setStatus("error");
    const body = await response.json().catch(() => null);
    setErrorMessage(body?.error?.message ?? "No se pudo completar el pedido.");
  }

  if (status === "success") {
    return (
      <div className="border border-border bg-white p-6 text-center space-y-2">
        <p className="text-lg font-semibold">Pedido recibido</p>
        <p className="text-sm text-muted-foreground">
          Te contactaremos para confirmar detalles y pago. Gracias por tu compra.
        </p>
        <Link href="/" className="inline-block mt-2 text-sm font-bold uppercase tracking-wide text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-border bg-white p-6">
      <input type="hidden" name="variantId" value={variantId} />
      <p className="border-l-4 border-primary bg-muted p-3 text-sm text-muted-foreground">
        Pedido minimo: {MIN_ORDER_QUANTITY} piezas. Pedidos de 6+ piezas: 50% de anticipo y 50% al estar listo el pedido.
      </p>

      {customer ? (
        <div className="border border-border bg-muted p-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Comprando como</p>
          <p className="font-medium">{customer.name}</p>
          <p className="text-muted-foreground">
            {customer.email}
            {customer.phone ? ` - ${customer.phone}` : ""}
          </p>
        </div>
      ) : (
        <>
          <label className="block space-y-1">
            <span className="text-sm font-bold uppercase tracking-wide">Nombre</span>
            <input name="name" required className="w-full border border-border px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold uppercase tracking-wide">Email</span>
            <input name="email" type="email" required className="w-full border border-border px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold uppercase tracking-wide">Telefono</span>
            <input name="phone" className="w-full border border-border px-3 py-2" />
          </label>
        </>
      )}

      <label className="block space-y-1">
        <span className="text-sm font-bold uppercase tracking-wide">Cantidad (minimo {MIN_ORDER_QUANTITY})</span>
        <input
          name="quantity"
          type="number"
          min={MIN_ORDER_QUANTITY}
          defaultValue={MIN_ORDER_QUANTITY}
          required
          className="w-full border border-border px-3 py-2"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-bold uppercase tracking-wide">Notas (talla, color, personalizacion)</span>
        <textarea name="notes" rows={3} className="w-full border border-border px-3 py-2" />
      </label>
      {customer ? null : (
        <label className="flex items-center gap-2 text-sm">
          <input name="marketingConsent" type="checkbox" />
          Acepto recibir promociones
        </label>
      )}
      <button
        type="submit"
        disabled={status === "loading" || !variantId}
        className="w-full bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "Confirmar pedido"}
      </button>
      {!variantId ? (
        <p className="text-sm text-destructive">
          Falta seleccionar un producto. Vuelve al catalogo e intenta de nuevo.
        </p>
      ) : null}
      {status === "error" ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </form>
  );
}
