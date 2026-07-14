import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";
import { authConfig } from "@/lib/auth.config";

// apps/admin now owns the whole domain (admin.rosalessport.com) - no more
// dispatching between staff/customer matchers (ADR-014), since customer
// auth lives entirely in apps/web. Every route here is staff-only except
// the login page itself.
const { auth: staffAuth } = NextAuth(authConfig);

const middleware = staffAuth((req: NextAuthRequest) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
  // Matches the original app's design: API routes are never covered here,
  // they call requireStaffSession() themselves and return 401 JSON instead
  // of a redirect. This middleware only gates page navigation. Old
  // /admin/* bookmarks/links from the pre-split app redirect at the
  // Netlify layer instead (see netlify.toml).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
