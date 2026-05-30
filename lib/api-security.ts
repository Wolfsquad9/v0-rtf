import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const userRateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const aiCoachExerciseSchema = z
  .object({
    name: z.string().max(500).optional(),
    sets: z.number().finite().min(0).max(100).optional(),
    reps: z.number().finite().min(0).max(100).optional(),
    loadKg: z.number().finite().min(0).max(10_000).optional(),
    rpe: z.number().finite().min(0).max(10).optional(),
    rpeNotes: z.string().max(1_000).optional(),
    notes: z.string().max(1_000).optional(),
  })
  .passthrough();

export const aiCoachRequestSchema = z.object({
  dayData: z
    .object({
      training: z.array(aiCoachExerciseSchema).max(50),
    })
    .passthrough(),
});

export type AICoachRequest = z.infer<typeof aiCoachRequestSchema>;

export function checkUserRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = userRateLimitStore.get(userId);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    userRateLimitStore.set(userId, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of userRateLimitStore.entries()) {
      if (now > entry.resetTime + RATE_LIMIT_WINDOW_MS) {
        userRateLimitStore.delete(userId);
      }
    }
  }, 5 * 60 * 1000);
}

export function sanitizeDayData(data: AICoachRequest["dayData"]): {
  training: Array<{
    name: string;
    sets: number;
    reps: number;
    loadKg: number;
    rpe: number;
    rpeNotes: string;
  }>;
} {
  return {
    training: data.training.slice(0, 50).map((ex) => ({
      name: typeof ex.name === "string" ? ex.name.substring(0, 100) : "",
      sets: typeof ex.sets === "number" ? Math.min(ex.sets, 100) : 0,
      reps: typeof ex.reps === "number" ? Math.min(ex.reps, 100) : 0,
      loadKg: typeof ex.loadKg === "number" ? Math.min(ex.loadKg, 10_000) : 0,
      rpe: typeof ex.rpe === "number" ? Math.max(0, Math.min(ex.rpe, 10)) : 0,
      rpeNotes: typeof ex.rpeNotes === "string" ? ex.rpeNotes.substring(0, 200) : "",
    })),
  };
}
