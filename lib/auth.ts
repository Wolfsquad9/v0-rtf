import { NextRequest, NextResponse } from "next/server"

const ACCESS_COOKIE = "sb-access-token"
const REFRESH_COOKIE = "sb-refresh-token"

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
}

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

interface AuthValidationResult {
  userId: string | null
  tokensRefreshed: boolean
}

const getAuthConfig = (): SupabaseAuthConfig => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
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
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${config.url}/auth/v1/user`, {
      method: "GET",
      headers: buildAuthHeaders(config.anonKey, accessToken),
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as SupabaseUserResponse
    return data?.id ? data : null
  } catch {
    console.warn("[Auth] Supabase user lookup failed")
    return null
  }
}

const refreshSupabaseSession = async (
  config: SupabaseAuthConfig,
  refreshToken: string,
): Promise<SupabaseRefreshResponse | null> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        ...buildAuthHeaders(config.anonKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as SupabaseRefreshResponse
    if (!data.access_token || !data.refresh_token) {
      return null
    }

    return data
  } catch {
    console.warn("[Auth] Supabase token refresh failed")
    return null
  }
}

export const getCookieTokens = (request: NextRequest) => {
  return {
    accessToken: request.cookies.get(ACCESS_COOKIE)?.value || null,
    refreshToken: request.cookies.get(REFRESH_COOKIE)?.value || null,
  }
}

export const setCookieTokens = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  response.cookies.set(ACCESS_COOKIE, accessToken, COOKIE_OPTIONS)
  response.cookies.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)
}

export const clearCookieTokens = (response: NextResponse): void => {
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)
}

export const resolveSupabaseUserIdFromCookies = async (
  request: NextRequest,
  response: NextResponse,
): Promise<AuthValidationResult> => {
  const config = getAuthConfig()
  const { accessToken, refreshToken } = getCookieTokens(request)

  if (!accessToken && !refreshToken) {
    return { userId: null, tokensRefreshed: false }
  }

  if (accessToken) {
    const user = await fetchSupabaseUser(config, accessToken)
    if (user?.id) {
      return { userId: user.id, tokensRefreshed: false }
    }
  }

  if (!refreshToken) {
    clearCookieTokens(response)
    return { userId: null, tokensRefreshed: false }
  }

  const refreshed = await refreshSupabaseSession(config, refreshToken)
  if (!refreshed) {
    clearCookieTokens(response)
    return { userId: null, tokensRefreshed: false }
  }

  setCookieTokens(response, refreshed.access_token, refreshed.refresh_token)

  if (refreshed.user?.id) {
    return { userId: refreshed.user.id, tokensRefreshed: true }
  }

  const userAfterRefresh = await fetchSupabaseUser(config, refreshed.access_token)
  return { userId: userAfterRefresh?.id || null, tokensRefreshed: true }
}

export const validateApiToken = async (token: string): Promise<string | null> => {
  if (!token) return null

  const config = getAuthConfig()
  const user = await fetchSupabaseUser(config, token)
  return user?.id || null
}

export const AUTH_CONSTANTS = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  COOKIE_OPTIONS,
}
