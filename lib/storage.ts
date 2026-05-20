import type { PlannerState } from "@/types/planner"
import { logError } from "@/lib/error-handler"
import { supabase } from "@/lib/supabase-client"

const STORAGE_KEY = "rtf_planner_state_v1"
const LAST_SYNC_KEY = "rtf_planner_last_sync_v1"

export const loadState = (): PlannerState | null => {
  if (typeof window === "undefined") return null
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    const parsed = JSON.parse(serialized)

    // Migrations / Fixes
    if (parsed && !parsed.framework) {
      parsed.framework = "STRENGTH_LINEAR"
    }
    if (parsed && !parsed.failureCount && parsed.failureCount !== 0) {
      parsed.failureCount = 0
    }
    if (parsed && !parsed.programCursor) {
      parsed.programCursor = { weekIndex: 0, dayIndex: 0 }
    }

    return parsed as PlannerState
  } catch (e) {
    logError(e, "loadState")
    return null
  }
}

export const saveState = (state: PlannerState): void => {
  if (typeof window === "undefined") return

  try {
    const serialized = JSON.stringify(state)

    // Always save to localStorage first (offline draft)
    localStorage.setItem(STORAGE_KEY, serialized)

    // Try to sync to Supabase in background (non-blocking)
    supabase.auth.getSession()
      .then(({ data }) => {
        const token = data.session?.access_token
        if (!token) {
          console.log("[STORAGE] No authenticated session. Running local-only mode.")
          return
        }

        return fetch("/api/db/save-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ state }),
        })
          .then(async (res) => {
            if (res.ok) {
              localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
              console.log("[STORAGE] Background sync successful")
            } else {
              const error = await res.json()
              console.warn("[STORAGE] Background sync failed:", error)
            }
          })
      })
      .catch((err) => {
        console.warn("[Storage] Background sync network error:", err)
      })
  } catch (e) {
    logError(e, "saveState")
    if (e instanceof Error && e.message.includes("quota")) {
      throw new Error("Storage quota exceeded. Please export your data and clear some workouts.")
    }
    throw e
  }
}

export const loadStateFromDatabase = async (): Promise<PlannerState | null> => {
  if (typeof window === "undefined") return null

  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      console.log("[STORAGE] No authenticated session. Running local-only mode.")
      return null
    }

    const res = await fetch("/api/db/load-state", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.warn("[STORAGE] DB Load failed:", res.status)
      return null
    }

    const payload = await res.json()
    const dbState = payload.state

    if (dbState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbState))
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
    }

    return dbState
  } catch (e) {
    logError(e, "loadStateFromDatabase")
    return null
  }
}

export const clearState = (): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
  } catch (e) {
    logError(e, "clearState")
  }
}

export const exportState = (): string => {
  const state = loadState()
  return JSON.stringify(state, null, 2)
}

export const importState = (jsonString: string): PlannerState => {
  try {
    const state = JSON.parse(jsonString) as PlannerState
    saveState(state)
    return state
  } catch (e) {
    logError(e, "importState")
    throw new Error("Invalid import data")
  }
}
