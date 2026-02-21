"use client"

import { PlannerApp } from "@/components/planner/planner-app"
import { supabase } from "@/lib/supabase-client"

export default function Page() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <button
          className="border bg-background px-3 py-2 text-sm"
          onClick={async () => {
            await supabase.auth.signOut()
          }}
        >
          Logout
        </button>
      </div>
      <PlannerApp />
    </>
  )
}
