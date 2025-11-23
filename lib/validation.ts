export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateExercise(exercise: {
  name: string
  sets: number
  reps: number
  load: number
  rpe: number
}): ValidationResult {
  const errors: string[] = []
  
  // Name validation
  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.push('Exercise name is required')
  }
  
  if (exercise.name.length > 100) {
    errors.push('Exercise name must be less than 100 characters')
  }
  
  // Sets validation
  if (!Number.isInteger(exercise.sets) || exercise.sets < 1) {
    errors.push('Sets must be at least 1')
  }
  
  if (exercise.sets > 20) {
    errors.push('Sets cannot exceed 20')
  }
  
  // Reps validation
  if (!Number.isInteger(exercise.reps) || exercise.reps < 1) {
    errors.push('Reps must be at least 1')
  }
  
  if (exercise.reps > 100) {
    errors.push('Reps cannot exceed 100')
  }
  
  // Load validation
  if (exercise.load < 0) {
    errors.push('Load cannot be negative')
  }
  
  if (exercise.load > 10000) {
    errors.push('Load seems unrealistic (max 10,000 lbs)')
  }
  
  // RPE validation
  if (exercise.rpe < 1 || exercise.rpe > 10) {
    errors.push('RPE must be between 1 and 10')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
