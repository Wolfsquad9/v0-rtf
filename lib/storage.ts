import type { PlannerState } from "@/types/planner"

const STORAGE_KEY = "rtf_planner_state_v1"

export const loadState = (): PlannerState | null => {
  if (typeof window === "undefined") return null
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    return JSON.parse(serialized)
  } catch (e) {
    console.error("Failed to load state", e)
    return null
  }
}

export const saveState = (state: PlannerState) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save state", e)
  }
}

export const clearState = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
