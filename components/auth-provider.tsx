"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return

      if (error) {
        console.error("Session fetch failed:", error)
        setSession(null)
        setLoading(false)
        return
      }

      setSession(data.session ?? null)
      setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
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
