import type { ReactNode } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TopBar />
      {children}
    </AuthProvider>
  )
}
