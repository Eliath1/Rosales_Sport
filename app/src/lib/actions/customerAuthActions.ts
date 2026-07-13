"use server";

import { redirect } from "next/navigation";
import { customerSignIn, customerSignOut } from "@/lib/customerAuth";
import { registerOrClaimCustomer } from "@/lib/services/customerService";
import { customerLoginSchema, customerRegisterSchema } from "@/lib/validators/schemas";

export type CustomerAuthActionState = { error?: string } | undefined;

// customerSignIn (the server-side signIn exported by NextAuth(customerAuthConfig),
// not next-auth/react's client version) runs the Credentials authorize()
// flow directly and sets the session cookie via next/headers - no
// /api/auth/customer route needs to be mounted for this to work. With
// redirect:false it returns the would-be redirect URL as a string instead
// of throwing; Auth.js appends `error=CredentialsSignin` to that URL when
// authorize() returned null.
async function performCustomerSignIn(email: string, password: string, callbackUrl: string) {
  const result = await customerSignIn("credentials", {
    email,
    password,
    redirect: false,
    redirectTo: callbackUrl,
  });
  return typeof result === "string" && !result.includes("error=");
}

export async function loginCustomerAction(
  _prevState: CustomerAuthActionState,
  formData: FormData,
): Promise<CustomerAuthActionState> {
  const parsed = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Correo o contrasena invalidos." };
  }

  const callbackUrl = (formData.get("callbackUrl") as string | null) || "/mi-cuenta";
  const ok = await performCustomerSignIn(parsed.data.email, parsed.data.password, callbackUrl);
  if (!ok) {
    return { error: "Correo o contrasena incorrectos." };
  }
  redirect(callbackUrl);
}

export async function registerCustomerAction(
  _prevState: CustomerAuthActionState,
  formData: FormData,
): Promise<CustomerAuthActionState> {
  const parsed = customerRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: (formData.get("phone") as string | null) || undefined,
    marketingConsent: formData.get("marketingConsent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  try {
    await registerOrClaimCustomer(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return { error: "Ya existe una cuenta con este correo. Inicia sesion." };
    }
    throw error;
  }

  const ok = await performCustomerSignIn(parsed.data.email, parsed.data.password, "/mi-cuenta");
  if (!ok) {
    // Extremely unlikely (we just set this exact password), but don't block
    // account creation on the immediate sign-in step.
    redirect("/mi-cuenta/login");
  }
  redirect("/mi-cuenta");
}

export async function logoutCustomerAction() {
  await customerSignOut({ redirectTo: "/" });
}
