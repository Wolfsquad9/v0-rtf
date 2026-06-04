"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating Supabase client...")
      const supabase = createClient()
      
      console.log("[v0] Attempting signInWithPassword for:", email.trim())
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      
      console.log("[v0] Auth response - data:", data, "error:", authError)

      if (authError) {
        console.error("[v0] Auth error:", authError)
        setError(authError.message)
        setLoading(false)
        return
      }

      console.log("[v0] Login successful, redirecting to /app")
      router.replace("/app")
      router.refresh()
    } catch (err) {
      console.error("[v0] Caught exception:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage || "An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border p-6">
        <h1 className="text-lg font-bold">Login</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button type="submit" disabled={loading} className="w-full border px-3 py-2">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  )
}
