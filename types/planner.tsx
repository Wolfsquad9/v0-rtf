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

export interface DayEntry {
  id: string
  date: string
  notes?: string
  completed?: boolean
  rpe?: RPE
  training?: Array<{
    id: string
    name: string
    sets?: number
    reps?: number
    loadKg?: number | null
    rpe?: RPE
    rpeNotes?: string
  }>
  habits?: {
    sleep: boolean
    nutrition: boolean
    hydration: boolean
    mobility: boolean
    water?: boolean
    mindfulness?: boolean
    recovery?: boolean
  }
  sleepHours?: number
  waterIntake?: number
  stressLevel?: number
  recoveryNotes?: string
  recovery?: {
    soreness?: number
    energy?: number
    mood?: number
  }
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
  theme?: ThemeName
  weeks: Week[]
  coreMetrics?: {
    heightCm?: number | null
    weightKg?: number | null
    bodyfat?: number | null
    chest?: number | null
    waist?: number | null
    arms?: number | null
    legs?: number | null
  }
  visionBoard?: VisionBoardItem[]
  progressPhotos?: ProgressPhoto[]
  lastSavedAt?: string | null
}
