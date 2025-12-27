import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const auth = req.cookies.get("admin-auth");

    if (!auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

// 👇 REQUIRED for Vercel + App Router
export const config = {
  matcher: ["/admin/:path*"],
};
