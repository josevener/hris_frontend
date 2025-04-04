// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const requestedPath = request.nextUrl.pathname;
  const isLoginPage = requestedPath.startsWith("/login");
  const isProtectedRoute = [
    "/dashboard",
    "/users",
    "/employees",
    "/salary",
    "/payroll",
    "/attendance",
    "/settings",
    "/profile",
  ].some((route) => requestedPath.startsWith(route));

  console.log(`Middleware check: ${requestedPath} - Token: ${token || "none"}`);

  // If no token and trying to access a protected route, redirect to login
  if (!token && isProtectedRoute) {
    console.log(`Redirecting to /login from ${requestedPath}`);
    return NextResponse.redirect(
      new URL(`/login?redirect=${requestedPath}`, request.url)
    );
  }

  if (token && isLoginPage) {
    const previousPath = request.headers.get("referer"); // Get previous page
    const redirectPath =
      previousPath && !previousPath.includes("/login")
        ? previousPath
        : "/dashboard";

    console.log(`Redirecting from /login to ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  console.log(`Allowing access to ${requestedPath}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/employees/:path*",
    "/salary/:path*",
    "/payroll/:path*",
    "/attendance/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login/:path*",
  ],
};
