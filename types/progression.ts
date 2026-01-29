import { TrainingFramework, MovementPattern, Exercise, RPE } from "./planner"

export type IntensityStatus = "UNDER" | "ON_TARGET" | "OVER"

export interface FrameworkRules {
  targetRpe: RPE
  loadIncrementKg: number
  repRange: { min: number; max: number }
}

export interface GeneratedExercise extends Exercise {
  isLocked: boolean
}

export interface GeneratedSession {
  id: string
  exercises: GeneratedExercise[]
  isLocked: boolean
  generatedAt: string
}

export const FRAMEWORK_CONFIGS: Record<TrainingFramework, FrameworkRules> = {
  [TrainingFramework.STRENGTH_LINEAR]: {
    targetRpe: 8,
    loadIncrementKg: 2.5,
    repRange: { min: 5, max: 5 },
  },
  [TrainingFramework.POWERLIFTING]: {
    targetRpe: 9,
    loadIncrementKg: 1,
    repRange: { min: 1, max: 3 },
  },
  [TrainingFramework.HYPERTROPHY]: {
    targetRpe: 8,
    loadIncrementKg: 1,
    repRange: { min: 8, max: 12 },
  },
  [TrainingFramework.STRENGTH_CONDITIONING]: {
    targetRpe: 7,
    loadIncrementKg: 2,
    repRange: { min: 10, max: 15 },
  },
}
