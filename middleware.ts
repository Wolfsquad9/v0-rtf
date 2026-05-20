import { NextResponse, type NextRequest } from "next/server"
import { resolveSupabaseUserIdFromCookies } from "@/lib/supabase-auth-server"

const isProtectedRoute = (pathname: string): boolean => {
  return pathname === "/app" || pathname.startsWith("/app/")
}

const isPublicAuthRoute = (pathname: string): boolean => {
  return pathname === "/login" || pathname === "/signup"
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  const userId = await resolveSupabaseUserIdFromCookies(request, response)
  const isAuthenticated = Boolean(userId)

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isPublicAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
