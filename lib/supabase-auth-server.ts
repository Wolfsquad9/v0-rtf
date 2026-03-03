import { NextRequest, NextResponse } from "next/server"

const ACCESS_COOKIE = "sb-access-token"
const REFRESH_COOKIE = "sb-refresh-token"

interface SupabaseAuthConfig {
  url: string
  anonKey: string
}

interface SupabaseUserResponse {
  id: string
}

interface SupabaseRefreshResponse {
  access_token: string
  refresh_token: string
  user?: {
    id: string
  }
}

const getAuthConfig = (): SupabaseAuthConfig => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing required Supabase environment variables for middleware auth")
  }

  return { url, anonKey }
}

const buildAuthHeaders = (anonKey: string, accessToken?: string): HeadersInit => ({
  apikey: anonKey,
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
})

const fetchSupabaseUser = async (
  config: SupabaseAuthConfig,
  accessToken: string,
): Promise<SupabaseUserResponse | null> => {
  const response = await fetch(`${config.url}/auth/v1/user`, {
    method: "GET",
    headers: buildAuthHeaders(config.anonKey, accessToken),
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as SupabaseUserResponse
  return data?.id ? data : null
}

const refreshSupabaseSession = async (
  config: SupabaseAuthConfig,
  refreshToken: string,
): Promise<SupabaseRefreshResponse | null> => {
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(config.anonKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as SupabaseRefreshResponse
  if (!data.access_token || !data.refresh_token) {
    return null
  }

  return data
}

const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  const secure = process.env.NODE_ENV === "production"

  response.cookies.set(ACCESS_COOKIE, accessToken, {
    path: "/",
    sameSite: "lax",
    secure,
    httpOnly: true,
  })

  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    path: "/",
    sameSite: "lax",
    secure,
    httpOnly: true,
  })
}

const clearAuthCookies = (response: NextResponse): void => {
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)
}

export const resolveSupabaseUserIdFromCookies = async (
  request: NextRequest,
  response: NextResponse,
): Promise<string | null> => {
  const config = getAuthConfig()

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

  if (!accessToken && !refreshToken) {
    return null
  }

  if (accessToken) {
    const user = await fetchSupabaseUser(config, accessToken)
    if (user?.id) {
      return user.id
    }
  }

  if (!refreshToken) {
    clearAuthCookies(response)
    return null
  }

  const refreshed = await refreshSupabaseSession(config, refreshToken)
  if (!refreshed) {
    clearAuthCookies(response)
    return null
  }

  setAuthCookies(response, refreshed.access_token, refreshed.refresh_token)

  if (refreshed.user?.id) {
    return refreshed.user.id
  }

  const userAfterRefresh = await fetchSupabaseUser(config, refreshed.access_token)
  return userAfterRefresh?.id ?? null
}
