import { TrainingFramework, RPE, Exercise, PlannerState } from "../types/planner"
import { IntensityStatus, FRAMEWORK_CONFIGS, GeneratedExercise, GeneratedSession } from "../types/progression"

const MIN_WEIGHT_KG = 0
const MAX_WEIGHT_KG = 500
const OPTIMAL_ZONE_MAX = 8.5

type ProgressionModel = "powerlifting" | "hypertrophy" | "default"
type ProgressionDirection = "UP" | "DOWN" | "HOLD"

export interface CompletedSessionSnapshot {
  weightKg: number
  reps: number
  repRange: { min: number; max: number }
  actualRpe: number | null
}

export interface CalculateNextWeightInput {
  currentWeightKg: number
  reps: number
  repRange: { min: number; max: number }
  actualRpe: number | null
  progressionModel: ProgressionModel
  history?: CompletedSessionSnapshot[]
}

const clampWeight = (weightKg: number): number => {
  if (!Number.isFinite(weightKg)) return MIN_WEIGHT_KG
  return Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, Number(weightKg.toFixed(2))))
}

const isSlightOvershoot = (rpe?: number | null): boolean =>
  typeof rpe === "number" && rpe > OPTIMAL_ZONE_MAX && rpe < 9.5

const hadConsecutiveSlightOvershoots = (history: CompletedSessionSnapshot[]): boolean => {
  if (history.length < 2) return false
  const lastTwo = history.slice(-2)
  return lastTwo.every((session) => isSlightOvershoot(session.actualRpe))
}

const resolveSessionRpe = (exercise: Exercise, sessionRpe?: number): number | null => {
  const typedActual = typeof exercise.actualRpe === "number" ? exercise.actualRpe : null
  const legacyPerExercise = typeof (exercise as any).rpe === "number" ? (exercise as any).rpe : null
  const sessionLevel = typeof sessionRpe === "number" ? sessionRpe : null

  return typedActual ?? legacyPerExercise ?? sessionLevel
}

const buildCompletedSnapshot = (
  exercise: Exercise,
  repRange: { min: number; max: number },
  sessionRpe?: number,
): CompletedSessionSnapshot => ({
  weightKg: exercise.loadKg || 0,
  reps: exercise.actualReps || exercise.reps,
  repRange,
  actualRpe: resolveSessionRpe(exercise, sessionRpe),
})

const getFrameworkIncrement = (progressionModel: ProgressionModel): number => {
  if (progressionModel === "powerlifting") {
    return FRAMEWORK_CONFIGS[TrainingFramework.POWERLIFTING].loadIncrementKg
  }
  if (progressionModel === "hypertrophy") {
    return FRAMEWORK_CONFIGS[TrainingFramework.HYPERTROPHY].loadIncrementKg
  }
  return FRAMEWORK_CONFIGS[TrainingFramework.STRENGTH_LINEAR].loadIncrementKg
}

const applySteppedLoadChange = (
  currentWeightKg: number,
  direction: ProgressionDirection,
  stepKg: number,
): number => {
  const safeStep = stepKg > 0 ? stepKg : 1
  const snappedCurrent = Math.round(currentWeightKg / safeStep) * safeStep
  const stepDelta = direction === "UP" ? safeStep : direction === "DOWN" ? -safeStep : 0
  const nextUnclamped = snappedCurrent + stepDelta
  const clamped = clampWeight(nextUnclamped)
  return Number((Math.round(clamped / safeStep) * safeStep).toFixed(2))
}

/**
 * Pure deterministic weight progression function.
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
  const increment = getFrameworkIncrement(progressionModel)

  let direction: ProgressionDirection = "HOLD"

  if (actualRpe !== null && history.length > 0) {
    if (actualRpe <= 7) {
      direction = "UP"
    } else if (actualRpe > 7 && actualRpe <= OPTIMAL_ZONE_MAX) {
      const hitTopRange = reps >= repRange.max
      direction = hitTopRange && actualRpe <= 8 ? "UP" : "HOLD"
    } else if (actualRpe > OPTIMAL_ZONE_MAX && actualRpe < 9.5) {
      direction = hadConsecutiveSlightOvershoots(history) ? "DOWN" : "HOLD"
    } else if (actualRpe >= 9.5) {
      direction = "DOWN"
    }
  }

  return applySteppedLoadChange(current, direction, increment)
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
        sessions.push(buildCompletedSnapshot(ex, { min: ex.reps, max: ex.reps }, day.rpe))
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
        const completedSnapshot = buildCompletedSnapshot(matchingEx, repRange, completedDay.rpe)
        const history = collectExerciseHistory(state, matchingEx.movementPattern, weekIndex, dayIndex)
        const nextLoad = calculateNextWeight({
          currentWeightKg: completedSnapshot.weightKg,
          reps: completedSnapshot.reps,
          repRange: completedSnapshot.repRange,
          actualRpe: completedSnapshot.actualRpe,
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
    const snapshot = buildCompletedSnapshot(ex, repRange)
    const nextLoad = calculateNextWeight({
      currentWeightKg: snapshot.weightKg,
      reps: snapshot.reps,
      repRange: snapshot.repRange,
      actualRpe: snapshot.actualRpe,
      progressionModel: resolveProgressionModel(framework),
      history: [snapshot],
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
