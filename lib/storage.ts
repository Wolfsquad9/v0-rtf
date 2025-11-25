import type { PlannerState } from "@/types/planner"
import { logError } from "@/lib/error-handler"

const STORAGE_KEY = "rtf_planner_state_v1"
const LAST_SYNC_KEY = "rtf_planner_last_sync_v1"

// Generate a simple user ID from browser if not authenticated
function getUserId(): string {
  if (typeof window === "undefined") return "server"
  
  let userId = localStorage.getItem("rtf_user_id")
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
    localStorage.setItem("rtf_user_id", userId)
  }
  return userId
}

export const loadState = (): PlannerState | null => {
  if (typeof window === "undefined") return null
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    const parsed = JSON.parse(serialized)
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
    const userId = getUserId()
    fetch("/api/db/save-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, state })
    }).catch(err => {
      console.warn("[Storage] Background sync failed:", err)
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
    const userId = getUserId()
    const res = await fetch(`/api/db/load-state?userId=${encodeURIComponent(userId)}`)
    
    if (!res.ok) {
      console.warn("[Storage] Load failed:", res.status)
      return null
    }
    
    const data = await res.json()
    const dbState = data.state
    
    if (dbState) {
      // Also update localStorage with latest from DB
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
