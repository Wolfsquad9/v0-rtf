import { TrainingFramework, MovementPattern, Exercise, RPE } from "./planner"

export type IntensityStatus = "UNDER" | "ON_TARGET" | "OVER"

export interface FrameworkRules {
  targetRpe: RPE
  loadIncrementKg: number
  repRange: { min: number; max: number }
  defaultMovements: { name: string; pattern: MovementPattern }[]
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
    defaultMovements: [
      { name: "Squat", pattern: MovementPattern.SQUAT },
      { name: "Bench Press", pattern: MovementPattern.HORIZONTAL_PUSH },
      { name: "Deadlift", pattern: MovementPattern.HINGE },
      { name: "Overhead Press", pattern: MovementPattern.VERTICAL_PUSH },
    ],
  },
  [TrainingFramework.POWERLIFTING]: {
    targetRpe: 9,
    loadIncrementKg: 1,
    repRange: { min: 1, max: 3 },
    defaultMovements: [
      { name: "Competition Squat", pattern: MovementPattern.SQUAT },
      { name: "Competition Bench", pattern: MovementPattern.HORIZONTAL_PUSH },
      { name: "Competition Deadlift", pattern: MovementPattern.HINGE },
      { name: "Pause Squat", pattern: MovementPattern.SQUAT },
    ],
  },
  [TrainingFramework.HYPERTROPHY]: {
    targetRpe: 8,
    loadIncrementKg: 1,
    repRange: { min: 8, max: 12 },
    defaultMovements: [
      { name: "Hack Squat", pattern: MovementPattern.SQUAT },
      { name: "Incline Press", pattern: MovementPattern.HORIZONTAL_PUSH },
      { name: "RDL", pattern: MovementPattern.HINGE },
      { name: "Lat Pulldown", pattern: MovementPattern.PULL },
    ],
  },
  [TrainingFramework.STRENGTH_CONDITIONING]: {
    targetRpe: 7,
    loadIncrementKg: 2,
    repRange: { min: 10, max: 15 },
    defaultMovements: [
      { name: "Goblet Squat", pattern: MovementPattern.SQUAT },
      { name: "Push Ups", pattern: MovementPattern.HORIZONTAL_PUSH },
      { name: "Kettlebell Swing", pattern: MovementPattern.HINGE },
      { name: "Pull Ups", pattern: MovementPattern.PULL },
    ],
  },
}
