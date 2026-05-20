import { NextResponse } from "next/server"

const ACCESS_COOKIE = "sb-access-token"
const REFRESH_COOKIE = "sb-refresh-token"

const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
}

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json()

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Missing session tokens" }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions)
    res.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions)
    return res
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ACCESS_COOKIE)
  res.cookies.delete(REFRESH_COOKIE)
  return res
}
