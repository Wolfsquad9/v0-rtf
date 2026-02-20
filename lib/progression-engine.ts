import { TrainingFramework, RPE, Exercise, PlannerState, DayEntry } from "../types/planner"
import { IntensityStatus, FRAMEWORK_CONFIGS, GeneratedExercise, GeneratedSession } from "../types/progression"

// ---------------------------------------------------------------------------
// Constants: Global RPE Zones (science-based autoregulation)
// ---------------------------------------------------------------------------

/** Optimal stimulus zone boundaries */
const RPE_ZONE = {
  EASY_CEILING: 7,        // actual_rpe <= 7 → increase weight
  OPTIMAL_LOW: 7,         // 7 < actual_rpe <= 8.5 → maintain / micro-progress
  OPTIMAL_HIGH: 8.5,      // within zone → hold steady unless reps topped out
  OVERSHOOT_CEILING: 9.5, // 8.5 < actual_rpe < 9.5 → slight overshoot
  // actual_rpe >= 9.5 → clear overshoot, reduce weight
} as const

/** Minimum allowed weight in kg */
const MIN_WEIGHT_KG = 0

// ---------------------------------------------------------------------------
// Progression model helpers
// ---------------------------------------------------------------------------

type ProgressionModel = "powerlifting" | "hypertrophy"

/** Map a TrainingFramework enum to a simple progression model */
function resolveModel(framework: TrainingFramework): ProgressionModel {
  switch (framework) {
    case TrainingFramework.POWERLIFTING:
    case TrainingFramework.STRENGTH_LINEAR:
      return "powerlifting"
    case TrainingFramework.HYPERTROPHY:
    case TrainingFramework.STRENGTH_CONDITIONING:
    default:
      return "hypertrophy"
  }
}

/** Round to nearest 0.5 kg for practical plate math */
function roundWeight(kg: number): number {
  return Math.round(kg * 2) / 2
}

/** Clamp to sane bounds */
function clampWeight(kg: number): number {
  return Math.max(MIN_WEIGHT_KG, roundWeight(kg))
}

// ---------------------------------------------------------------------------
// Core pure function
// ---------------------------------------------------------------------------

export interface CalculateNextWeightInput {
  currentWeight: number
  reps: number
  repRangeMin: number
  repRangeMax: number
  actualRpe: RPE | undefined | null
  framework: TrainingFramework
  /** Number of consecutive sessions where actual_rpe was in slight-overshoot zone */
  consecutiveOvershootCount?: number
}

export interface CalculateNextWeightOutput {
  nextWeight: number
  reason: string
}

/**
 * Deterministic, science-based RPE zone progression.
 *
 * Pure function - no side-effects, no database writes, no state mutation.
 *
 * Zones:
 *   actual_rpe <= 7          → increase weight
 *   7 < actual_rpe <= 8.5    → optimal zone (maintain; micro-increase if reps topped out & RPE <= 8)
 *   8.5 < actual_rpe < 9.5   → slight overshoot (maintain; reduce if repeated twice)
 *   actual_rpe >= 9.5         → clear overshoot (reduce weight)
 *
 * Example I/O:
 *   { currentWeight: 100, reps: 8, repRangeMin: 8, repRangeMax: 12, actualRpe: 6, framework: HYPERTROPHY }
 *     → { nextWeight: 103, reason: "RPE under-zone: +3% (hypertrophy)" }
 *
 *   { currentWeight: 100, reps: 12, repRangeMin: 8, repRangeMax: 12, actualRpe: 7.5, framework: HYPERTROPHY }
 *     → { nextWeight: 102.5, reason: "Optimal zone, reps topped out at RPE 7.5: +2.5% (hypertrophy)" }
 *
 *   { currentWeight: 100, reps: 5, repRangeMin: 1, repRangeMax: 3, actualRpe: 10, framework: POWERLIFTING }
 *     → { nextWeight: 97.5, reason: "Clear overshoot: -2.5kg (powerlifting)" }
 */
export function calculateNextWeight(input: CalculateNextWeightInput): CalculateNextWeightOutput {
  const {
    currentWeight,
    reps,
    repRangeMin,
    repRangeMax,
    actualRpe,
    framework,
    consecutiveOvershootCount = 0,
  } = input

  // Edge case: missing RPE → return current weight
  if (actualRpe === undefined || actualRpe === null || actualRpe === 0) {
    return { nextWeight: currentWeight, reason: "No RPE recorded; weight unchanged" }
  }

  // Edge case: first session / zero weight → return current weight
  if (currentWeight <= 0) {
    return { nextWeight: currentWeight, reason: "No weight history; weight unchanged" }
  }

  const model = resolveModel(framework)
  const rpe = actualRpe as number

  // ----- Zone 1: Easy (RPE <= 7) → increase weight -----
  if (rpe <= RPE_ZONE.EASY_CEILING) {
    if (model === "powerlifting") {
      const next = clampWeight(currentWeight + 2.5)
      return { nextWeight: next, reason: "RPE under-zone: +2.5kg (powerlifting)" }
    } else {
      // Hypertrophy: +2-3% (use 2.5% midpoint)
      const increment = currentWeight * 0.025
      const next = clampWeight(currentWeight + increment)
      return { nextWeight: next, reason: `RPE under-zone: +2.5% (hypertrophy)` }
    }
  }

  // ----- Zone 2: Optimal (7 < RPE <= 8.5) -----
  if (rpe > RPE_ZONE.OPTIMAL_LOW && rpe <= RPE_ZONE.OPTIMAL_HIGH) {
    // Micro-increase only if reps hit top of range AND RPE <= 8
    const repsAtTop = reps >= repRangeMax
    if (repsAtTop && rpe <= 8) {
      if (model === "powerlifting") {
        const next = clampWeight(currentWeight + 2.5)
        return { nextWeight: next, reason: `Optimal zone, reps topped out at RPE ${rpe}: +2.5kg (powerlifting)` }
      } else {
        const increment = currentWeight * 0.025
        const next = clampWeight(currentWeight + increment)
        return { nextWeight: next, reason: `Optimal zone, reps topped out at RPE ${rpe}: +2.5% (hypertrophy)` }
      }
    }
    return { nextWeight: currentWeight, reason: `Optimal zone (RPE ${rpe}); weight maintained` }
  }

  // ----- Zone 3: Slight overshoot (8.5 < RPE < 9.5) -----
  if (rpe > RPE_ZONE.OPTIMAL_HIGH && rpe < RPE_ZONE.OVERSHOOT_CEILING) {
    // Only reduce if this is the second consecutive overshoot
    if (consecutiveOvershootCount >= 1) {
      if (model === "powerlifting") {
        // ~2.5% reduction, rounded to plate math
        const reduction = currentWeight * 0.025
        const next = clampWeight(currentWeight - reduction)
        return { nextWeight: next, reason: `Repeated slight overshoot (${consecutiveOvershootCount + 1}x): -2.5% (powerlifting)` }
      } else {
        const reduction = currentWeight * 0.025
        const next = clampWeight(currentWeight - reduction)
        return { nextWeight: next, reason: `Repeated slight overshoot (${consecutiveOvershootCount + 1}x): -2.5% (hypertrophy)` }
      }
    }
    return { nextWeight: currentWeight, reason: `Slight overshoot (RPE ${rpe}); monitoring — weight maintained` }
  }

  // ----- Zone 4: Clear overshoot (RPE >= 9.5) -----
  if (model === "powerlifting") {
    const next = clampWeight(currentWeight - 2.5)
    return { nextWeight: next, reason: "Clear overshoot: -2.5kg (powerlifting)" }
  } else {
    // Hypertrophy: -3-5% (use 4% midpoint)
    const reduction = currentWeight * 0.04
    const next = clampWeight(currentWeight - reduction)
    return { nextWeight: next, reason: `Clear overshoot: -4% (hypertrophy)` }
  }
}

// ---------------------------------------------------------------------------
// Legacy adapter: interpretRpe (kept for backward compat)
// ---------------------------------------------------------------------------

export const interpretRpe = (actual: RPE, target: RPE): IntensityStatus => {
  if (actual < target) return "UNDER"
  if (actual > target) return "OVER"
  return "ON_TARGET"
}

// ---------------------------------------------------------------------------
// Future session projection
// ---------------------------------------------------------------------------

/**
 * Recalculate future sessions based on completed performance.
 * Uses calculateNextWeight under the hood.
 */
export const projectFutureSessions = (
  state: PlannerState,
  weekIndex: number,
  dayIndex: number
): PlannerState => {
  const completedDay = state.weeks[weekIndex].days[dayIndex]
  const framework = state.framework
  const config = FRAMEWORK_CONFIGS[framework]
  const newWeeks = [...state.weeks]

  let projectionsCount = 0
  for (let w = weekIndex; w < newWeeks.length; w++) {
    for (let d = (w === weekIndex ? dayIndex + 1 : 0); d < 7; d++) {
      if (projectionsCount >= 2) break

      const futureDay = newWeeks[w].days[d]
      if (futureDay.status === "COMPLETED" || futureDay.status === "LOCKED") continue

      const updatedTraining = futureDay.training.map((futureEx) => {
        const matchingEx = completedDay.training.find(
          (ce) => ce.movementPattern === futureEx.movementPattern
        )

        if (matchingEx) {
          const result = calculateNextWeight({
            currentWeight: matchingEx.loadKg || 0,
            reps: matchingEx.actualReps || matchingEx.reps,
            repRangeMin: config.repRange.min,
            repRangeMax: config.repRange.max,
            actualRpe: matchingEx.actualRpe,
            framework,
            consecutiveOvershootCount: 0,
          })

          return {
            ...futureEx,
            loadKg: result.nextWeight,
            reps: futureEx.reps,
            sets: futureEx.sets,
          }
        }
        return futureEx
      })

      newWeeks[w] = {
        ...newWeeks[w],
        days: newWeeks[w].days.map((day, idx) =>
          idx === d ? { ...day, training: updatedTraining } : day
        )
      }
      projectionsCount++
    }
    if (projectionsCount >= 2) break
  }

  return { ...state, weeks: newWeeks }
}

// ---------------------------------------------------------------------------
// Generate next session from previous exercises
// ---------------------------------------------------------------------------

export const generateNextSession = (
  previousExercises: Exercise[],
  framework: TrainingFramework
): GeneratedSession => {
  const config = FRAMEWORK_CONFIGS[framework]

  const nextExercises: GeneratedExercise[] = previousExercises.map((ex) => {
    const result = calculateNextWeight({
      currentWeight: ex.loadKg || 0,
      reps: ex.actualReps || ex.reps,
      repRangeMin: config.repRange.min,
      repRangeMax: config.repRange.max,
      actualRpe: ex.actualRpe,
      framework,
      consecutiveOvershootCount: 0,
    })

    return {
      ...ex,
      loadKg: result.nextWeight,
      reps: ex.reps,
      targetRpe: undefined,
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
