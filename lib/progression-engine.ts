import { TrainingFramework, RPE, Exercise } from "../types/planner"
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
 * Deterministic Progression Logic
 */
export const calculateNextLoad = (
  currentLoad: number,
  actualRpe: RPE,
  rules: { targetRpe: RPE; loadIncrementKg: number }
): number => {
  const status = interpretRpe(actualRpe, rules.targetRpe)
  
  if (status === "UNDER") return currentLoad + rules.loadIncrementKg
  if (status === "OVER") return Math.max(0, currentLoad - rules.loadIncrementKg)
  return currentLoad
}

/**
 * Pure Function for Session Generation
 */
export const generateNextSession = (
  previousExercises: Exercise[],
  framework: TrainingFramework
): GeneratedSession => {
  const rules = FRAMEWORK_CONFIGS[framework]
  
  const nextExercises: GeneratedExercise[] = previousExercises.map((ex) => {
    const currentLoad = ex.loadKg ?? 0
    const actualRpe = ex.actualRpe ?? 0
    
    const nextLoad = calculateNextLoad(currentLoad, actualRpe, rules)
    
    return {
      ...ex,
      loadKg: nextLoad,
      targetRpe: rules.targetRpe,
      sets: ex.actualSets ?? ex.sets,
      reps: rules.repRange.min, // Deterministic reset to bottom of range or specific target
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
