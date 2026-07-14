"use client";

import { Suspense, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginCustomerAction } from "@/lib/actions/customerAuthActions";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/mi-cuenta";
  const [state, formAction, pending] = useActionState(loginCustomerAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        action={formAction}
        className="w-full max-w-md border-t-4 border-primary bg-white p-8 shadow-sm space-y-4"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="flex flex-col items-center text-center">
          <Image src="/rs-logo.png" alt="Rosales Sport" width={72} height={48} />
          <h1 className="mt-2 text-xl font-bold uppercase tracking-tight">Mi cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Inicia sesion para ver tus pedidos</p>
        </div>

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
          <span className="text-sm font-bold uppercase tracking-wide">Contrasena</span>
          <input name="password" type="password" required className="w-full border border-border px-3 py-2" />
        </label>

        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary py-2.5 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Iniciar sesion"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link href="/mi-cuenta/registro" className="font-bold text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
