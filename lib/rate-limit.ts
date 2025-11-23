const analysisCache = new Map<string, { timestamp: number; analysis: string }>()
const COOLDOWN_MS = 10000 // 10 seconds between analyses

export function canAnalyze(userId: string, exerciseHash: string): boolean {
  const key = `${userId}:${exerciseHash}`
  const cached = analysisCache.get(key)
  
  if (!cached) return true
  
  const timeSince = Date.now() - cached.timestamp
  return timeSince > COOLDOWN_MS
}

export function cacheAnalysis(userId: string, exerciseHash: string, analysis: string) {
  const key = `${userId}:${exerciseHash}`
  analysisCache.set(key, { timestamp: Date.now(), analysis })
  
  // Clean old entries (older than 1 hour)
  for (const [k, v] of analysisCache.entries()) {
    if (Date.now() - v.timestamp > 3600000) {
      analysisCache.delete(k)
    }
  }
}

export function getCachedAnalysis(userId: string, exerciseHash: string): string | null {
  const key = `${userId}:${exerciseHash}`
  return analysisCache.get(key)?.analysis || null
}

export function hashExerciseData(data: any[]): string {
  return JSON.stringify(data.map(ex => ({
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    loadKg: ex.loadKg,
    rpe: ex.rpe
  })))
}
