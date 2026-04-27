import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware usa config leve (sem pg/prisma) — seguro para Edge Runtime
const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: { user?: unknown } | null }) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/precos") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/p/")

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/inicio", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
