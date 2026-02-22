"use client"

import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/components/auth-provider"

export function TopBar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (pathname === "/login" || !user) {
    return null
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="font-bold">Return to Form</h1>
      <button
        onClick={async () => {
          await supabase.auth.signOut()
        }}
        className="text-sm underline"
      >
        Logout
      </button>
    </header>
  )
}
