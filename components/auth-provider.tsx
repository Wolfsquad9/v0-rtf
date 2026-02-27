"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const syncAuthCookies = (session: Session | null) => {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""

  if (!session) {
    document.cookie = `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax${secure}`
    document.cookie = `sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax${secure}`
    return
  }

  document.cookie = `sb-access-token=${session.access_token}; Path=/; SameSite=Lax${secure}`
  document.cookie = `sb-refresh-token=${session.refresh_token}; Path=/; SameSite=Lax${secure}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return

      if (error) {
        console.error("Session fetch failed:", error)
        setSession(null)
        syncAuthCookies(null)
        setLoading(false)
        return
      }

      setSession(data.session ?? null)
      syncAuthCookies(data.session ?? null)
      setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      syncAuthCookies(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loading) return

    if (!session?.user) {
      router.replace("/login")
    }
  }, [loading, router, session])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
    }),
    [session, loading],
  )

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
