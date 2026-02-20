import { TrainingFramework, RPE, Exercise, PlannerState } from "../types/planner"
import { IntensityStatus, FRAMEWORK_CONFIGS, GeneratedExercise, GeneratedSession } from "../types/progression"

const MIN_WEIGHT_KG = 0
const MAX_WEIGHT_KG = 500
const OPTIMAL_ZONE_MAX = 8.5

type ProgressionModel = "powerlifting" | "hypertrophy" | "default"

export interface CompletedSessionSnapshot {
  weightKg: number
  reps: number
  repRange: { min: number; max: number }
  actualRpe?: number | null
}

export interface CalculateNextWeightInput {
  currentWeightKg: number
  reps: number
  repRange: { min: number; max: number }
  actualRpe?: number | null
  progressionModel: ProgressionModel
  history?: CompletedSessionSnapshot[]
}

const clampWeight = (weightKg: number): number => {
  if (!Number.isFinite(weightKg)) return MIN_WEIGHT_KG
  return Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, Number(weightKg.toFixed(2))))
}

const applyPercent = (weightKg: number, minPct: number, maxPct: number): number => {
  const midpoint = (minPct + maxPct) / 2
  return weightKg * (1 + midpoint)
}

const isSlightOvershoot = (rpe?: number | null): boolean =>
  typeof rpe === "number" && rpe > OPTIMAL_ZONE_MAX && rpe < 9.5

const hadConsecutiveSlightOvershoots = (history: CompletedSessionSnapshot[]): boolean => {
  if (history.length < 2) return false
  const lastTwo = history.slice(-2)
  return lastTwo.every((session) => isSlightOvershoot(session.actualRpe))
}


const resolveSessionRpe = (exercise: Exercise, dayRpe?: number): number | undefined => {
  const typedActual = typeof exercise.actualRpe === "number" ? exercise.actualRpe : undefined
  const legacyPerExercise = typeof (exercise as any).rpe === "number" ? (exercise as any).rpe : undefined
  const sessionLevel = typeof dayRpe === "number" ? dayRpe : undefined

  return typedActual ?? legacyPerExercise ?? sessionLevel
}

/**
 * Pure deterministic weight progression function.
 *
 * Rules:
 * - Optimal stimulus zone: RPE 7.5-8.5
 * - Missing RPE or first session: maintain weight
 * - <=7: increase load (powerlifting +2.5kg, hypertrophy +2.5%)
 * - 7-8.5: maintain; only increase when reps hit top range and RPE <=8
 * - 8.5-9.5: maintain; reduce 2.5% if two consecutive slight overshoots
 * - >=9.5: reduce load (powerlifting -2.5kg, hypertrophy -4%)
 *
 * Example I/O:
 * - {100kg, rpe:6.5, model:"powerlifting"} -> 102.5kg
 * - {100kg, reps:12, repRange:8-12, rpe:8, model:"hypertrophy"} -> 102.5kg
 * - {100kg, rpe:9.7, model:"powerlifting"} -> 97.5kg
 */
export const calculateNextWeight = ({
  currentWeightKg,
  reps,
  repRange,
  actualRpe,
  progressionModel,
  history = [],
}: CalculateNextWeightInput): number => {
  const current = clampWeight(currentWeightKg)

  if (typeof actualRpe !== "number" || history.length === 0) {
    return current
  }

  if (actualRpe <= 7) {
    if (progressionModel === "powerlifting") {
      return clampWeight(current + 2.5)
    }
    return clampWeight(applyPercent(current, 0.02, 0.03))
  }

  if (actualRpe > 7 && actualRpe <= OPTIMAL_ZONE_MAX) {
    const hitTopRange = reps >= repRange.max
    if (hitTopRange && actualRpe <= 8) {
      if (progressionModel === "powerlifting") {
        return clampWeight(current + 2.5)
      }
      return clampWeight(applyPercent(current, 0.02, 0.03))
    }
    return current
  }

  if (actualRpe > OPTIMAL_ZONE_MAX && actualRpe < 9.5) {
    if (hadConsecutiveSlightOvershoots(history)) {
      return clampWeight(current * (1 - 0.025))
    }
    return current
  }

  if (actualRpe >= 9.5) {
    if (progressionModel === "powerlifting") {
      return clampWeight(current - 2.5)
    }
    return clampWeight(current * (1 - 0.04))
  }

  return current
}

const resolveProgressionModel = (framework: TrainingFramework): ProgressionModel => {
  if (framework === TrainingFramework.POWERLIFTING) return "powerlifting"
  if (framework === TrainingFramework.HYPERTROPHY) return "hypertrophy"
  return "default"
}

const collectExerciseHistory = (
  state: PlannerState,
  movementPattern: Exercise["movementPattern"],
  upToWeekIndex: number,
  upToDayIndex: number,
): CompletedSessionSnapshot[] => {
  const sessions: CompletedSessionSnapshot[] = []

  for (let w = 0; w <= upToWeekIndex; w++) {
    const maxDay = w === upToWeekIndex ? upToDayIndex : 6
    for (let d = 0; d <= maxDay; d++) {
      const day = state.weeks[w]?.days[d]
      if (!day || day.status !== "COMPLETED") continue

      for (const ex of day.training) {
        if (ex.movementPattern !== movementPattern) continue
        sessions.push({
          weightKg: ex.loadKg || 0,
          reps: ex.actualReps || ex.reps,
          repRange: { min: ex.reps, max: ex.reps },
          actualRpe: resolveSessionRpe(ex, day.rpe),
        })
      }
    }
  }

  return sessions
}

/**
 * Legacy helper kept for compatibility.
 */
export const interpretRpe = (actual: RPE, target: RPE): IntensityStatus => {
  if (actual < target) return "UNDER"
  if (actual > target) return "OVER"
  return "ON_TARGET"
}

/**
 * Legacy API wrapper around calculateNextWeight.
 */
export const calculateNextPrescription = (
  framework: TrainingFramework,
  prescribed: { load: number; reps: number; rpe: RPE },
  actual: { load: number; reps: number; rpe: RPE },
): { load: number; reps: number; rpe: RPE; sets?: number } => {
  const nextLoad = calculateNextWeight({
    currentWeightKg: actual.load,
    reps: actual.reps,
    repRange: FRAMEWORK_CONFIGS[framework].repRange,
    actualRpe: actual.rpe,
    progressionModel: resolveProgressionModel(framework),
    history: [{
      weightKg: actual.load,
      reps: actual.reps,
      repRange: FRAMEWORK_CONFIGS[framework].repRange,
      actualRpe: actual.rpe,
    }],
  })

  return {
    load: nextLoad,
    reps: prescribed.reps,
    rpe: prescribed.rpe,
  }
}

export const projectFutureSessions = (
  state: PlannerState,
  weekIndex: number,
  dayIndex: number,
): PlannerState => {
  const completedDay = state.weeks[weekIndex].days[dayIndex]
  const framework = state.framework
  const newWeeks = [...state.weeks]

  let projectionsCount = 0
  for (let w = weekIndex; w < newWeeks.length; w++) {
    for (let d = w === weekIndex ? dayIndex + 1 : 0; d < 7; d++) {
      if (projectionsCount >= 2) break

      const futureDay = newWeeks[w].days[d]
      if (futureDay.status === "COMPLETED" || futureDay.status === "LOCKED") continue

      const updatedTraining = futureDay.training.map((futureEx) => {
        const matchingEx = completedDay.training.find(
          (ce) => ce.movementPattern === futureEx.movementPattern,
        )

        if (!matchingEx) return futureEx

        const repRange = FRAMEWORK_CONFIGS[framework].repRange
        const history = collectExerciseHistory(state, matchingEx.movementPattern, weekIndex, dayIndex)
        const nextLoad = calculateNextWeight({
          currentWeightKg: matchingEx.loadKg || 0,
          reps: matchingEx.actualReps || matchingEx.reps,
          repRange,
          actualRpe: resolveSessionRpe(matchingEx, completedDay.rpe),
          progressionModel: resolveProgressionModel(framework),
          history,
        })

        return {
          ...futureEx,
          loadKg: nextLoad,
          reps: futureEx.reps,
        }
      })

      newWeeks[w] = {
        ...newWeeks[w],
        days: newWeeks[w].days.map((day, idx) => (idx === d ? { ...day, training: updatedTraining } : day)),
      }
      projectionsCount++
    }
    if (projectionsCount >= 2) break
  }

  return { ...state, weeks: newWeeks }
}

export const generateNextSession = (
  previousExercises: Exercise[],
  framework: TrainingFramework,
): GeneratedSession => {
  const repRange = FRAMEWORK_CONFIGS[framework].repRange

  const nextExercises: GeneratedExercise[] = previousExercises.map((ex) => {
    const nextLoad = calculateNextWeight({
      currentWeightKg: ex.loadKg || 0,
      reps: ex.actualReps || ex.reps,
      repRange,
      actualRpe: resolveSessionRpe(ex),
      progressionModel: resolveProgressionModel(framework),
      history: [
        {
          weightKg: ex.loadKg || 0,
          reps: ex.actualReps || ex.reps,
          repRange,
          actualRpe: resolveSessionRpe(ex),
        },
      ],
    })

    return {
      ...ex,
      loadKg: nextLoad,
      actualRpe: undefined,
      actualReps: undefined,
      actualSets: undefined,
      isLocked: true,
    }
  })

  return {
    id: `gen-${Date.now()}`,
    exercises: nextExercises,
    isLocked: true,
    generatedAt: new Date().toISOString(),
  }
}
