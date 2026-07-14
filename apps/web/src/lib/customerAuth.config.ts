import type { NextAuthConfig } from "next-auth";

// Public session shape for the customer auth instance. Deliberately NOT
// wired up via `declare module "next-auth"` module augmentation, because
// auth.config.ts already augments `Session.user`/`User` globally for staff
// (id/email/role) - a second augmentation with a different `user` shape
// would conflict (TS requires repeated interface member declarations to
// match). Callers cast through this type instead (see customerAuth.ts).
export interface CustomerSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isDistributor: boolean;
}

// Edge-safe config only: no Credentials provider here, because its
// `authorize()` pulls in bcryptjs + the Prisma client, and both use Node
// built-ins the Edge runtime cannot load. middleware.ts uses only this
// config for the /mi-cuenta/* matcher; customerAuth.ts adds the real
// provider for use in Route Handlers, Server Actions, and Server Components
// (Node runtime). Mirrors auth.config.ts's staff/customer split (ADR-012).
export const customerAuthConfig = {
  pages: { signIn: "/mi-cuenta/login" },
  providers: [],
  session: { strategy: "jwt" },
  // Explicit, distinct cookie name so the customer session can never
  // collide with or be confused with the staff session cookie (ADR-012:
  // "different session cookie, different scope").
  cookies: {
    sessionToken: {
      name: "customer-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customerUser = user as unknown as CustomerSessionUser;
        token.id = customerUser.id;
        token.name = customerUser.name;
        token.email = customerUser.email;
        token.phone = customerUser.phone;
        token.isDistributor = customerUser.isDistributor;
      }
      return token;
    },
    async session({ session, token }) {
      const user = session.user as unknown as CustomerSessionUser | undefined;
      if (user) {
        user.id = token.id as string;
        user.name = (token.name as string | null) ?? "";
        user.email = (token.email as string | null) ?? "";
        user.phone = (token.phone as string | null) ?? null;
        user.isDistributor = Boolean(token.isDistributor);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
