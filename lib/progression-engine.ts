import { TrainingFramework, RPE, Exercise, PlannerState, DayEntry } from "../types/planner"
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
 * Core Adaptive Progression Logic
 * Calculates the next prescription based on prescribed vs actual performance
 */
export const calculateNextPrescription = (
  framework: TrainingFramework,
  prescribed: { load: number; reps: number; rpe: RPE },
  actual: { load: number; reps: number; rpe: RPE }
): { load: number; reps: number; rpe: RPE; sets?: number } => {
  const config = FRAMEWORK_CONFIGS[framework]
  const rpeDelta = actual.rpe - prescribed.rpe
  const repDelta = actual.reps - prescribed.reps
  
  // Performance Classification
  // Underperform: actual RPE > target OR missed reps
  // Overperform: actual RPE < target AND hit or exceeded reps
  const isUnderperforming = actual.rpe > config.targetRpe || actual.reps < prescribed.reps
  const isOverperforming = actual.rpe < config.targetRpe && actual.reps >= prescribed.reps
  
  switch (framework) {
    case TrainingFramework.STRENGTH_LINEAR:
      if (isOverperforming) {
        return { load: actual.load + (config.loadIncrementKg * 2), reps: prescribed.reps, rpe: config.targetRpe }
      } else if (isUnderperforming) {
        // If they missed reps, drop weight. If they hit reps but overshot RPE, repeat or small drop.
        const newLoad = actual.reps < prescribed.reps 
          ? Math.max(0, actual.load - config.loadIncrementKg)
          : actual.load
        return { load: newLoad, reps: prescribed.reps, rpe: config.targetRpe }
      }
      return { load: actual.load + config.loadIncrementKg, reps: prescribed.reps, rpe: config.targetRpe }

    case TrainingFramework.HYPERTROPHY:
      if (isOverperforming) {
        // Add reps first until max of range, then add load
        if (actual.reps >= config.repRange.max) {
          return { load: actual.load + config.loadIncrementKg, reps: config.repRange.min, rpe: config.targetRpe }
        }
        return { load: actual.load, reps: Math.min(actual.reps + 2, config.repRange.max), rpe: config.targetRpe }
      } else if (isUnderperforming) {
        // Reduce reps to min of range, preserve load
        return { load: actual.load, reps: Math.max(actual.reps - 1, config.repRange.min), rpe: config.targetRpe }
      }
      // On target: add a set (if we had sets input) or just hold load/reps
      return { load: actual.load, reps: actual.reps, rpe: config.targetRpe }

    case TrainingFramework.POWERLIFTING:
      if (isOverperforming) {
        return { load: actual.load + 2.5, reps: prescribed.reps, rpe: config.targetRpe }
      } else if (isUnderperforming) {
        return { load: Math.max(0, actual.load - 2.5), reps: prescribed.reps, rpe: config.targetRpe }
      }
      return { load: actual.load + 1, reps: prescribed.reps, rpe: config.targetRpe }

    case TrainingFramework.STRENGTH_CONDITIONING:
      // Load changes are secondary, focus on maintaining performance
      if (isOverperforming) {
        return { load: actual.load + 2, reps: prescribed.reps, rpe: config.targetRpe }
      } else if (isUnderperforming) {
        return { load: actual.load, reps: prescribed.reps, rpe: config.targetRpe }
      }
      return { load: actual.load, reps: prescribed.reps, rpe: config.targetRpe }

    default:
      return { load: actual.load, reps: prescribed.reps, rpe: prescribed.rpe }
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
          const prescription = calculateNextPrescription(
            framework,
            { load: matchingEx.loadKg || 0, reps: matchingEx.reps, rpe: matchingEx.targetRpe || 8 },
            { load: matchingEx.loadKg || 0, reps: matchingEx.actualReps || matchingEx.reps, rpe: matchingEx.actualRpe || 0 }
          )
          
          return { 
            ...futureEx, 
            loadKg: prescription.load, 
            reps: prescription.reps, 
            targetRpe: prescription.rpe,
            sets: prescription.sets || futureEx.sets
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

/**
 * Pure Function for Session Generation (Legacy/Internal)
 */
export const generateNextSession = (
  previousExercises: Exercise[],
  framework: TrainingFramework
): GeneratedSession => {
  const rules = FRAMEWORK_CONFIGS[framework]
  
  const nextExercises: GeneratedExercise[] = previousExercises.map((ex) => {
    const prescription = calculateNextPrescription(
      framework,
      { load: ex.loadKg || 0, reps: ex.reps, rpe: ex.targetRpe || 8 },
      { load: ex.loadKg || 0, reps: ex.actualReps || ex.reps, rpe: ex.actualRpe || 0 }
    )
    
    return {
      ...ex,
      loadKg: prescription.load,
      reps: prescription.reps,
      targetRpe: prescription.rpe,
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
