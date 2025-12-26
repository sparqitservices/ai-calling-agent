import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const auth = req.cookies.get("admin-auth");
    if (!auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
}
