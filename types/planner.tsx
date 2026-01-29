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
}

export interface DayEntry {
  id: string
  date: string
  completed?: boolean
  rpe?: RPE
  training: Exercise[]
  habits?: {
    sleep: boolean
    nutrition: boolean
    hydration: boolean
    mobility: boolean
  }
  sleepHours?: number
  waterIntake?: number
  stressLevel?: number
  difficultyFlag?: "easy" | "moderate" | "hard"
  sessionScore?: number
  coachingFeedback?: string
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

export interface ProgressPhoto {
  id: string
  date: string
  week: number
  url?: string
  notes?: string
}

export interface PlannerState {
  userId?: string | null
  programName?: string
  theme: ThemeName
  framework: TrainingFramework
  weeks: Week[]
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
