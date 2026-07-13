"use client";

import { Suspense } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales invalidas");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border-t-4 border-primary bg-white p-8 shadow-sm space-y-4"
      >
        <div className="flex flex-col items-center text-center">
          <Image src="/rs-logo.png" alt="Rosales Sport" width={72} height={48} />
          <h1 className="mt-2 text-xl font-bold uppercase tracking-tight">Rosales Sport CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso para personal de ventas</p>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-border px-3 py-2"
            placeholder="admin@rosalessport.mx"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-bold uppercase tracking-wide">Contrasena</span>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-border px-3 py-2"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary py-2.5 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Iniciar sesion"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
