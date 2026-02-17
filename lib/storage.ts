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
    const userId = getUserId()
    
    console.log(`[STORAGE] Initiating background sync for user ${userId}...`);
    
    fetch("/api/db/save-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, state })
    })
    .then(async (res) => {
      if (res.ok) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        console.log(`[STORAGE] Background sync successful for user ${userId}`);
      } else {
        const error = await res.json();
        console.warn(`[STORAGE] Background sync failed:`, error);
      }
    })
    .catch(err => {
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
    const userId = getUserId()
    console.log(`[STORAGE] Fetching state from DB for user ${userId}...`);
    const res = await fetch(`/api/db/load-state?userId=${encodeURIComponent(userId)}`)
    
    if (!res.ok) {
      console.warn("[STORAGE] DB Load failed:", res.status)
      return null
    }
    
    const data = await res.json()
    const dbState = data.state
    
    if (dbState) {
      console.log(`[STORAGE] DB Load success. Version: ${dbState.lastSavedAt}`);
      // Also update localStorage with latest from DB to keep them in sync
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbState))
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
    } else {
      console.log(`[STORAGE] No state found in DB for user ${userId}`);
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
