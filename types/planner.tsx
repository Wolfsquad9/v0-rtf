export enum TrainingFramework {
  STRENGTH_LINEAR = "STRENGTH_LINEAR",
  POWERLIFTING = "POWERLIFTING",
  HYPERTROPHY = "HYPERTROPHY",
  STRENGTH_CONDITIONING = "STRENGTH_CONDITIONING",
}

export enum MovementPattern {
  SQUAT = "SQUAT",
  HINGE = "HINGE",
  HORIZONTAL_PUSH = "HORIZONTAL_PUSH",
  VERTICAL_PUSH = "VERTICAL_PUSH",
  PULL = "PULL",
  CARRY_ACCESSORY = "CARRY_ACCESSORY",
}

export type RPE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type ThemeName = "dark-knight" | "crimson-red" | "special-ops" | "arctic-blue"

export interface ThemeColors {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  border: string
}

export type SessionStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "LOCKED"

export interface Exercise {
  id: string
  name: string
  movementPattern: MovementPattern
  sets: number
  reps: number
  targetRpe?: RPE
  loadKg?: number | null
  actualRpe?: RPE
  actualReps?: number
  actualSets?: number
  notes?: string
  rpeNotes?: string
}

export interface DayEntry {
  id: string
  date: string
  status: SessionStatus
  completed?: boolean
  rpe?: RPE
  training: Exercise[]
  habits?: {
    sleep: boolean
    nutrition: boolean
    hydration: boolean
    mobility: boolean
    water: boolean
    mindfulness: boolean
    recovery: boolean
  }
  sleepHours?: number
  waterIntake?: number
  stressLevel?: number
  difficultyFlag?: "easy" | "moderate" | "hard"
  sessionScore?: number
  coachingFeedback?: string
  recoveryNotes?: string
}

export interface Week {
  id: string
  startDate: string
  objective?: string
  days: DayEntry[]
  review?: {
    wins?: string
    challenges?: string
    adjustments?: string
    nextWeek?: string
  }
}

export interface VisionBoardItem {
  id: string
  title: string
  content: string
}

export interface ProgramCursor {
  weekIndex: number
  dayIndex: number
}

import { GeneratedSession } from "./progression"

export interface PlannerState {
  userId?: string | null
  programName?: string
  theme: ThemeName
  framework: TrainingFramework
  programCursor: ProgramCursor
  weeks: Week[]
  futureSessions?: GeneratedSession[]
  failureCount: number
  coreMetrics: {
    heightCm: number | null
    weightKg: number | null
    bodyfat: number | null
    chest?: number | null
    waist?: number | null
    arms?: number | null
    legs?: number | null
  }
  visionBoard: VisionBoardItem[]
  progressPhotos: ProgressPhoto[]
  lastSavedAt: string | null
}

export interface ProgressPhoto {
  id: string
  date: string
  week: number
  url?: string
  notes?: string
}
