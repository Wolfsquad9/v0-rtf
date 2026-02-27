import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const ACCESS_COOKIE = "sb-access-token"
const REFRESH_COOKIE = "sb-refresh-token"

const isProtectedRoute = (pathname: string): boolean => {
  return pathname === "/app" || pathname.startsWith("/app/")
}

const isPublicAuthRoute = (pathname: string): boolean => {
  return pathname === "/login" || pathname === "/signup"
}

export async function middleware(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

  let isAuthenticated = false

  if (accessToken && refreshToken) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (!error && data.session?.user) {
      isAuthenticated = true

      if (data.session.access_token !== accessToken) {
        response.cookies.set(ACCESS_COOKIE, data.session.access_token, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
        })
      }

      if (data.session.refresh_token !== refreshToken) {
        response.cookies.set(REFRESH_COOKIE, data.session.refresh_token, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
        })
      }
    }
  }

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
