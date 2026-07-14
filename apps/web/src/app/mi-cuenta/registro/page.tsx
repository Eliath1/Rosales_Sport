"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { registerCustomerAction } from "@/lib/actions/customerAuthActions";

export default function CustomerRegisterPage() {
  const [state, formAction, pending] = useActionState(registerCustomerAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <form
        action={formAction}
        className="w-full max-w-md border-t-4 border-primary bg-white p-8 shadow-sm space-y-4"
      >
        <div className="flex flex-col items-center text-center">
          <Image src="/rs-logo.png" alt="Rosales Sport" width={72} height={48} />
          <h1 className="mt-2 text-xl font-bold uppercase tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registrate para ver el historial y estado de tus pedidos
          </p>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Nombre</span>
          <input name="name" required minLength={2} className="w-full border border-border px-3 py-2" />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-border px-3 py-2"
            placeholder="tucorreo@ejemplo.mx"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Telefono (opcional)</span>
          <input name="phone" className="w-full border border-border px-3 py-2" />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Contrasena</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-border px-3 py-2"
          />
          <span className="text-xs text-muted-foreground">Minimo 8 caracteres.</span>
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input name="marketingConsent" type="checkbox" className="mt-0.5" />
          <span>
            Acepto recibir promociones por correo (opcional). Tus datos se usan unicamente para crear tu
            cuenta y darle seguimiento a tus pedidos, conforme a la LFPDPPP.
          </span>
        </label>

        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary py-2.5 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Ya tienes cuenta?{" "}
          <Link href="/mi-cuenta/login" className="font-bold text-primary hover:underline">
            Inicia sesion
          </Link>
        </p>
      </form>
    </div>
  );
}
