"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { PlannerState, Week, DayEntry, ThemeName, VisionBoardItem, ProgressPhoto } from "@/types/planner"
import { loadState, saveState, clearState, loadStateFromDatabase } from "@/lib/storage"
import { addDays, startOfWeek } from "date-fns"

const DEFAULT_WEEKS_COUNT = 12

const generateInitialState = (): PlannerState => {
  const today = new Date()
  const start = startOfWeek(today, { weekStartsOn: 1 })
  const weeks: Week[] = []

  for (let i = 0; i < DEFAULT_WEEKS_COUNT; i++) {
    const weekStart = addDays(start, i * 7)
    const days: DayEntry[] = []
    for (let j = 0; j < 7; j++) {
      const date = addDays(weekStart, j)
      days.push({
        id: `w${i}-d${j}`,
        date: date.toISOString(),
        training: [
          { id: "ex1", name: "Squat", sets: 4, reps: 8, loadKg: 0 },
          { id: "ex2", name: "Bench Press", sets: 4, reps: 8, loadKg: 0 },
          { id: "ex3", name: "Deadlift", sets: 3, reps: 5, loadKg: 0 },
          { id: "ex4", name: "Overhead Press", sets: 3, reps: 8, loadKg: 0 },
        ],
        habits: {
          sleep: false,
          nutrition: false,
          hydration: false,
          mobility: false,
          water: false,
          mindfulness: false,
          recovery: false,
        },
        sleepHours: 0,
        waterIntake: 0,
        stressLevel: 5,
        rpe: 0,
      })
    }
    weeks.push({
      id: `week-${i}`,
      startDate: weekStart.toISOString(),
      objective: "",
      days,
    })
  }

  return {
    programName: "Return to Form",
    theme: "dark-knight",
    weeks,
    coreMetrics: { heightCm: null, weightKg: null, bodyfat: null, chest: null, waist: null, arms: null, legs: null },
    visionBoard: [
      { id: "v1", title: "Primary Goal", content: "" },
      { id: "v2", title: "Key Motivation", content: "" },
    ],
    progressPhotos: [],
    lastSavedAt: new Date().toISOString(),
  }
}

interface PlannerContextType {
  state: PlannerState | null
  isLoading: boolean
  updateTheme: (theme: ThemeName) => void
  updateMetric: (key: keyof NonNullable<PlannerState["coreMetrics"]>, value: number) => void
  updateDay: (weekIndex: number, dayIndex: number, updates: Partial<DayEntry>) => void
  updateExercise: (weekIndex: number, dayIndex: number, exerciseIndex: number, field: string, value: any) => void
  updateWeekObjective: (weekIndex: number, objective: string) => void
  updateWeekReview: (weekIndex: number, review: NonNullable<Week["review"]>) => void
  updateVisionBoard: (items: VisionBoardItem[]) => void
  updateProgressPhotos: (photos: ProgressPhoto[]) => void
  resetPlanner: () => void
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined)

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PlannerState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initializeState = async () => {
      // Try to load from database first
      const dbState = await loadStateFromDatabase()
      if (dbState) {
        setState(dbState)
      } else {
        // Fall back to localStorage
        const stored = loadState()
        if (stored) {
          setState(stored)
        } else {
          setState(generateInitialState())
        }
      }
      setIsLoading(false)
    }
    
    initializeState()
  }, [])

  useEffect(() => {
    if (state && !isLoading) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveState(state)
      }, 1000)
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state, isLoading])

  const updateTheme = useCallback((theme: ThemeName) => {
    setState((prev) => {
      if (!prev) return null
      return { ...prev, theme }
    })
  }, [])

  const updateMetric = useCallback((key: keyof NonNullable<PlannerState["coreMetrics"]>, value: number) => {
    setState((prev) => {
      if (!prev) return null
      return {
        ...prev,
        coreMetrics: { ...prev.coreMetrics, [key]: value },
      }
    })
  }, [])

  const updateDay = useCallback((weekIndex: number, dayIndex: number, updates: Partial<DayEntry>) => {
    setState((prev) => {
      if (!prev) return null
      const newWeeks = [...prev.weeks]
      const newDays = [...newWeeks[weekIndex].days]
      newDays[dayIndex] = { ...newDays[dayIndex], ...updates }
      newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
      return { ...prev, weeks: newWeeks }
    })
  }, [])

  const updateExercise = useCallback(
    (weekIndex: number, dayIndex: number, exerciseIndex: number, field: string, value: any) => {
      setState((prev) => {
        if (!prev) return null
        const newWeeks = [...prev.weeks]
        const newDays = [...newWeeks[weekIndex].days]
        const newTraining = [...(newDays[dayIndex].training || [])]
        newTraining[exerciseIndex] = {
          ...newTraining[exerciseIndex],
          [field]: value,
        }
        newDays[dayIndex] = { ...newDays[dayIndex], training: newTraining }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return { ...prev, weeks: newWeeks }
      })
    },
    [],
  )

  const updateWeekObjective = useCallback((weekIndex: number, objective: string) => {
    setState((prev) => {
      if (!prev) return null
      const newWeeks = [...prev.weeks]
      newWeeks[weekIndex] = { ...newWeeks[weekIndex], objective }
      return { ...prev, weeks: newWeeks }
    })
  }, [])

  const updateWeekReview = useCallback((weekIndex: number, review: NonNullable<Week["review"]>) => {
    setState((prev) => {
      if (!prev) return null
      const newWeeks = [...prev.weeks]
      newWeeks[weekIndex] = { ...newWeeks[weekIndex], review }
      return { ...prev, weeks: newWeeks }
    })
  }, [])

  const updateVisionBoard = useCallback((items: VisionBoardItem[]) => {
    setState((prev) => {
      if (!prev) return null
      return { ...prev, visionBoard: items }
    })
  }, [])

  const updateProgressPhotos = useCallback((photos: ProgressPhoto[]) => {
    setState((prev) => {
      if (!prev) return null
      return { ...prev, progressPhotos: photos }
    })
  }, [])

  const resetPlanner = useCallback(() => {
    if (confirm("Are you sure you want to reset all data?")) {
      clearState()
      setState(generateInitialState())
    }
  }, [])

  return (
    <PlannerContext.Provider
      value={{
        state,
        isLoading,
        updateTheme,
        updateMetric,
        updateDay,
        updateExercise,
        updateWeekObjective,
        updateWeekReview,
        updateVisionBoard,
        updateProgressPhotos,
        resetPlanner,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export const usePlanner = () => {
  const context = useContext(PlannerContext)
  if (context === undefined) {
    throw new Error("usePlanner must be used within a PlannerProvider")
  }
  return context
}
