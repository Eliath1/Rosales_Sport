import type { NextAuthConfig } from "next-auth";

// Edge-safe config only: no Credentials provider here, because its
// `authorize()` pulls in bcryptjs + the Prisma client, and both use Node
// built-ins (node:path, node:util/types) that the Edge middleware runtime
// cannot load. middleware.ts uses only this config; auth.ts adds the real
// provider for use in Route Handlers and Server Components (Node runtime).
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  session: { strategy: "jwt" },
  // Explicit, distinct cookie name (mirrors customerAuth.config.ts) so the
  // staff session never relies on the Auth.js default name - defense in
  // depth alongside the domain separation from ADR-014, in case a future
  // feature ever sets a shared cookie Domain across subdomains.
  cookies: {
    sessionToken: {
      name: "staff-session-token",
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
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
