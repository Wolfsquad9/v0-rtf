// Rate limiter: in-memory store for request tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

export function getRateLimitKey(req: Request): string {
  // Use IP from headers or connection
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ai-coach-${ip}`;
}

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Reset: new window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime + RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function validateDayData(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.training)) return false;
  if (!Array.isArray(data.training) || data.training.length === 0) return true; // Empty is OK

  // Validate training array
  return data.training.every((ex: any) =>
    typeof ex === "object" &&
    (typeof ex.name === "string" || ex.name === undefined) &&
    (typeof ex.sets === "number" || typeof ex.sets === "undefined") &&
    (typeof ex.reps === "number" || typeof ex.reps === "undefined") &&
    (typeof ex.loadKg === "number" || typeof ex.loadKg === "undefined") &&
    (typeof ex.rpe === "number" || typeof ex.rpe === "undefined")
  );
}

export function sanitizeDayData(data: any): any {
  return {
    training: Array.isArray(data?.training) 
      ? data.training.slice(0, 50).map((ex: any) => ({
          name: typeof ex?.name === "string" ? ex.name.substring(0, 100) : "",
          sets: typeof ex?.sets === "number" ? Math.min(ex.sets, 100) : 0,
          reps: typeof ex?.reps === "number" ? Math.min(ex.reps, 100) : 0,
          loadKg: typeof ex?.loadKg === "number" ? Math.min(ex.loadKg, 10000) : 0,
          rpe: typeof ex?.rpe === "number" ? Math.max(1, Math.min(ex.rpe, 10)) : 0,
          rpeNotes: typeof ex?.rpeNotes === "string" ? ex.rpeNotes.substring(0, 200) : ""
        }))
      : []
  };
}
