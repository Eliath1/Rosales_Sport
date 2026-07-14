import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@rs/db";
import { customerAuthConfig, type CustomerSessionUser } from "@/lib/customerAuth.config";

// Second, fully separate NextAuth instance (ADR-012): no shared role table
// with staff UserRole, own session cookie (customerAuthConfig), own
// Credentials provider checking Customer.passwordHash instead of User.
export const {
  handlers,
  auth: customerAuth,
  signIn: customerSignIn,
  signOut: customerSignOut,
} = NextAuth({
  ...customerAuthConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const customer = await prisma.customer.findFirst({ where: { email: email.toLowerCase() } });
        if (!customer?.passwordHash) return null;

        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) return null;

        const sessionUser: CustomerSessionUser = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          isDistributor: customer.isDistributor,
        };
        // Cast through unknown: the global `User` type is augmented by
        // auth.ts for staff (requires `role: UserRole`), which this
        // customer session intentionally does not have. See
        // customerAuth.config.ts for why we don't augment a second shape.
        return sessionUser as unknown as User;
      },
    }),
  ],
});

export async function requireCustomerSession() {
  const session = await customerAuth();
  if (!session?.user) return null;
  return { ...session, user: session.user as unknown as CustomerSessionUser };
}
