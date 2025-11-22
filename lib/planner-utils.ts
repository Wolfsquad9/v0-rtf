import type { PlannerState, Week, DayEntry } from "@/types/planner"
import { addDays, startOfWeek } from "date-fns"

export const generateInitialState = (): PlannerState => {
  const weeks: Week[] = []
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday

  for (let w = 0; w < 12; w++) {
    const weekStart = addDays(startDate, w * 7)
    const days: DayEntry[] = []

    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d)
      days.push({
        id: `w${w + 1}-d${d + 1}`,
        date: date.toISOString(),
        completed: false,
        notes: "",
        rpe: null,
        training: [
          { id: "ex1", name: "Squat", sets: 4, reps: 8, loadKg: null },
          { id: "ex2", name: "Bench Press", sets: 4, reps: 8, loadKg: null },
          { id: "ex3", name: "Deadlift", sets: 3, reps: 5, loadKg: null },
          { id: "ex4", name: "Overhead Press", sets: 3, reps: 10, loadKg: null },
          { id: "ex5", name: "Pull Ups", sets: 3, reps: 10, loadKg: null },
          { id: "ex6", name: "Core", sets: 3, reps: 15, loadKg: null },
        ],
        habits: {
          sleep: false,
          nutrition: false,
          hydration: false,
          mobility: false,
        },
      })
    }

    weeks.push({
      id: `week-${w + 1}`,
      startDate: weekStart.toISOString(),
      days,
    })
  }

  return {
    programName: "Return to Form",
    weeks,
    coreMetrics: {
      heightCm: null,
      weightKg: null,
      bodyfat: null,
    },
    lastSavedAt: new Date().toISOString(),
  }
}
