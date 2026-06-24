import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Route guard. Unauthenticated users hitting a protected page are redirected
 * to /login; authenticated users hitting /login are sent to the dashboard.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnLogin = nextUrl.pathname.startsWith("/login");
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and the auth API.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
