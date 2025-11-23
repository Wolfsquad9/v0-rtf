import type { PlannerState } from "@/types/planner"
import { logError } from "@/lib/error-handler"

const STORAGE_KEY = "rtf_planner_state_v1"

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
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (e) {
    logError(e, "saveState")
    if (e instanceof Error && e.message.includes("quota")) {
      throw new Error("Storage quota exceeded. Please export your data and clear some workouts.")
    }
    throw e
  }
}

export const clearState = (): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
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
