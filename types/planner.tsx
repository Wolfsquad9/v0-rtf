export type RPE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type ThemeName = "dark-knight" | "crimson-red" | "special-ops" | "arctic-blue"

export type TrainingFrameworkId = "strength-lp" | "powerlifting" | "hypertrophy" | "sc"

export type MovementPatternId = "squat" | "hinge" | "horizontal-push" | "vertical-push" | "pull" | "carry-accessory"

export interface TrainingFramework {
  id: TrainingFrameworkId
  name: string
  description: string
  progressionMethod: "load" | "volume" | "density" | "intensity-waves"
  repRanges: {
    min: number
    max: number
  }
}

export interface MovementPattern {
  id: MovementPatternId
  name: string
  defaultExercises: string[]
}

export interface Exercise {
  id: string
  name: string
  pattern: MovementPatternId
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
  sessionScore?: number // 0-100
  coachingFeedback?: string
}

export interface Week {
  id: string
  startDate: string
  objective?: string
  days: DayEntry[]
}

export interface PlannerState {
  userId?: string | null
  programName?: string
  theme?: ThemeName
  framework?: TrainingFrameworkId
  weeks: Week[]
  coreMetrics?: {
    heightCm?: number | null
    weightKg?: number | null
    bodyfat?: number | null
  }
  lastSavedAt?: string | null
}
