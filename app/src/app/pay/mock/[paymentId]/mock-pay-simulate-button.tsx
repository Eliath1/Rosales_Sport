"use client";

import { useState } from "react";

export function MockPaySimulateButton({ paymentId }: { paymentId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function simulate() {
    setStatus("loading");
    const response = await fetch(`/api/payments/mock/${paymentId}/simulate`, { method: "POST" });
    setStatus(response.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <p className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Pago simulado exitosamente. Puedes cerrar esta ventana.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={simulate}
        disabled={status === "loading"}
        className="w-full bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {status === "loading" ? "Procesando..." : "Simular pago exitoso"}
      </button>
      {status === "error" ? <p className="text-sm text-destructive">No se pudo procesar el pago simulado.</p> : null}
    </div>
  );
}
