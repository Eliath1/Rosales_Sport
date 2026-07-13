import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { customerAuthConfig } from "@/lib/customerAuth.config";

// Both configs are edge-safe (no Credentials provider, no bcryptjs/Prisma) -
// see auth.config.ts and customerAuth.config.ts. Each NextAuth instance
// decodes only its own session cookie, so composing them here cannot mix up
// staff and customer sessions.
const { auth: staffAuth } = NextAuth(authConfig);
const { auth: customerAuthEdge } = NextAuth(customerAuthConfig);

// `auth(callback)` is typed to also accept an App Router route-handler
// shape (`Parameters<NextAuthMiddleware | AppRouteHandlerFn>` on the
// returned function), which makes TS demand a `params` property on the
// second arg. We only ever call these as plain middleware, so re-assert
// the concrete NextMiddleware shape here instead of fighting the overload.
const staffMiddleware = staffAuth((req: NextAuthRequest) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

const customerMiddleware = customerAuthEdge((req: NextAuthRequest) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicCustomerPage = pathname === "/mi-cuenta/login" || pathname === "/mi-cuenta/registro";

  if (!isPublicCustomerPage && !isLoggedIn) {
    const loginUrl = new URL("/mi-cuenta/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicCustomerPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/mi-cuenta", req.nextUrl.origin));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

// Dispatches to whichever auth instance owns the requested path. Staff
// (/admin/*) and customer (/mi-cuenta/*) auth stay fully independent per
// ADR-012 - neither matcher overlaps the other.
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return staffMiddleware(req, event);
  }
  if (req.nextUrl.pathname.startsWith("/mi-cuenta")) {
    return customerMiddleware(req, event);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta/:path*"],
};
