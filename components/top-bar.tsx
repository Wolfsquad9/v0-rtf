"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/components/auth-provider"

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (pathname === "/login" || !user) {
    return null
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="font-bold">Return to Form</h1>
      <button
        onClick={async () => {
          if (isLoggingOut) return
          setIsLoggingOut(true)
          await supabase.auth.signOut()
          router.replace("/login")
        }}
        className="text-sm underline disabled:opacity-60"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  )
}
