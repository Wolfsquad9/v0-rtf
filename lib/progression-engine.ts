import { TrainingFramework, MovementPattern, Exercise, RPE, PlannerState, DayEntry } from "../types/planner"
import { IntensityStatus, FRAMEWORK_CONFIGS, GeneratedExercise, GeneratedSession } from "../types/progression"

/**
 * Deterministic RPE Interpretation
 */
export const interpretRpe = (actual: RPE, target: RPE): IntensityStatus => {
  if (actual < target) return "UNDER"
  if (actual > target) return "OVER"
  return "ON_TARGET"
}

/**
 * Framework-Specific Adaptation Logic
 */
export const adaptExercise = (
  ex: Exercise,
  framework: TrainingFramework
): Partial<Exercise> => {
  const rules = FRAMEWORK_CONFIGS[framework]
  const actualRpe = ex.actualRpe ?? 0
  const status = interpretRpe(actualRpe, rules.targetRpe)

  switch (framework) {
    case TrainingFramework.STRENGTH_LINEAR:
      if (status === "UNDER") return { loadKg: (ex.loadKg ?? 0) + 5 }
      if (status === "ON_TARGET") return { loadKg: (ex.loadKg ?? 0) + 2.5 }
      if (status === "OVER") return { loadKg: Math.max(0, (ex.loadKg ?? 0) - 2.5) }
      return {}

    case TrainingFramework.HYPERTROPHY:
      if (status === "UNDER") {
        if (ex.reps >= rules.repRange.max) {
          return { loadKg: (ex.loadKg ?? 0) + 1, reps: rules.repRange.min }
        }
        return { reps: Math.min(ex.reps + 2, rules.repRange.max) }
      }
      if (status === "ON_TARGET") {
        return { sets: Math.min(ex.sets + 1, 5) }
      }
      if (status === "OVER") {
        return { reps: Math.max(ex.reps - 2, rules.repRange.min) }
      }
      return {}

    case TrainingFramework.POWERLIFTING:
      if (status === "UNDER") return { loadKg: (ex.loadKg ?? 0) + 2 }
      if (status === "ON_TARGET") return { loadKg: (ex.loadKg ?? 0) + 1 }
      if (status === "OVER") return { loadKg: Math.max(0, (ex.loadKg ?? 0) - 1) }
      return {}

    case TrainingFramework.STRENGTH_CONDITIONING:
      if (status === "UNDER") return { loadKg: (ex.loadKg ?? 0) + 2 }
      if (status === "OVER") return { loadKg: Math.max(0, (ex.loadKg ?? 0) - 2) }
      return {}

    default:
      return {}
  }
}

/**
 * Recalculate future sessions based on completed performance
 */
export const projectFutureSessions = (
  state: PlannerState,
  weekIndex: number,
  dayIndex: number
): PlannerState => {
  const completedDay = state.weeks[weekIndex].days[dayIndex]
  const framework = state.framework
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
          const adaptation = adaptExercise(matchingEx, framework)
          return { ...futureEx, ...adaptation }
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

export const generateNextSession = (
  previousExercises: Exercise[],
  framework: TrainingFramework
): GeneratedSession => {
  const rules = FRAMEWORK_CONFIGS[framework]
  
  const nextExercises: GeneratedExercise[] = previousExercises.map((ex) => {
    const adaptation = adaptExercise(ex, framework)
    
    return {
      ...ex,
      ...adaptation,
      targetRpe: rules.targetRpe,
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
