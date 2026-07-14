import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";
import { customerAuthConfig } from "@/lib/customerAuth.config";

// apps/web only ever had customer auth in scope (ADR-014) - staff auth and
// its middleware now live entirely in apps/admin on its own subdomain.
const { auth: customerAuthEdge } = NextAuth(customerAuthConfig);

const middleware = customerAuthEdge((req: NextAuthRequest) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicCustomerPage = pathname === "/mi-cuenta/login" || pathname === "/mi-cuenta/registro";

  if (pathname.startsWith("/mi-cuenta")) {
    if (!isPublicCustomerPage && !isLoggedIn) {
      const loginUrl = new URL("/mi-cuenta/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isPublicCustomerPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/mi-cuenta", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
  matcher: ["/mi-cuenta/:path*"],
};
