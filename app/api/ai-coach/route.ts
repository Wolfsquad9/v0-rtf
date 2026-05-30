import { NextResponse } from "next/server";
import {
  aiCoachRequestSchema,
  checkUserRateLimit,
  sanitizeDayData,
} from "@/lib/api-security";
import {
  createSupabaseClientWithToken,
  extractBearerToken,
  getAuthenticatedUserId,
} from "@/lib/supabase";

interface AICoachResponse {
  strengthTrend: string;
  recoveryStatus: string;
  techniqueFlags: string[];
  recommendedChanges: string[];
}

const FALLBACK_RESPONSE: AICoachResponse = {
  strengthTrend: "Analysis unavailable.",
  recoveryStatus: "Please try again later.",
  techniqueFlags: [],
  recommendedChanges: ["Review your logged sets, reps, load, and RPE before your next session."],
};

const TEST_MODE_RESPONSE: AICoachResponse = {
  strengthTrend: "Test mode: logged training data indicates a stable strength trend.",
  recoveryStatus: "Test mode: recovery status is acceptable for continued training.",
  techniqueFlags: ["Test mode: keep movement quality consistent across working sets."],
  recommendedChanges: [
    "Test mode: maintain current load until real AI coaching is enabled.",
    "Test mode: continue logging RPE after each session.",
  ],
};

const EMPTY_WORKOUT_RESPONSE: AICoachResponse = {
  strengthTrend: "No meaningful training data logged yet.",
  recoveryStatus: "Recovery cannot be assessed until workout data is entered.",
  techniqueFlags: [],
  recommendedChanges: ["Log at least one exercise with sets, reps, load, or RPE notes."],
};

function normalizeAICoachResponse(value: unknown): AICoachResponse {
  if (!value || typeof value !== "object") {
    return FALLBACK_RESPONSE;
  }

  const candidate = value as Partial<AICoachResponse>;

  return {
    strengthTrend:
      typeof candidate.strengthTrend === "string" && candidate.strengthTrend.trim()
        ? candidate.strengthTrend
        : FALLBACK_RESPONSE.strengthTrend,
    recoveryStatus:
      typeof candidate.recoveryStatus === "string" && candidate.recoveryStatus.trim()
        ? candidate.recoveryStatus
        : FALLBACK_RESPONSE.recoveryStatus,
    techniqueFlags: Array.isArray(candidate.techniqueFlags)
      ? candidate.techniqueFlags.filter((item): item is string => typeof item === "string")
      : [],
    recommendedChanges: Array.isArray(candidate.recommendedChanges)
      ? candidate.recommendedChanges.filter((item): item is string => typeof item === "string")
      : FALLBACK_RESPONSE.recommendedChanges,
  };
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createSupabaseClientWithToken(token);
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const userId = await getAuthenticatedUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsedBody = aiCoachRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid day data format" }, { status: 400 });
    }

    const { allowed, remaining, resetTime } = checkUserRateLimit(userId);
    if (!allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
      console.warn(`[AI Coach] Rate limit exceeded for userId=${userId}`);
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": retryAfterSeconds.toString() },
        },
      );
    }

    const isTestMode = process.env.AI_COACH_TEST_MODE === "true";
    console.info(`[AI Coach] Request accepted for userId=${userId} testMode=${isTestMode}`);

    const sanitized = sanitizeDayData(parsedBody.data.dayData);
    const meaningful = sanitized.training.filter(
      (ex) => ex.name || ex.rpeNotes || ex.sets > 0 || ex.reps > 0 || ex.loadKg > 0,
    );

    const responseHeaders = new Headers({
      "X-RateLimit-Remaining": remaining.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Content-Type": "application/json",
    });

    if (meaningful.length === 0) {
      return NextResponse.json(EMPTY_WORKOUT_RESPONSE, { headers: responseHeaders });
    }

    if (isTestMode) {
      return NextResponse.json(TEST_MODE_RESPONSE, { headers: responseHeaders });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "TEST") {
      return NextResponse.json(TEST_MODE_RESPONSE, { headers: responseHeaders });
    }

    const prompt = `
You are an expert strength coach. Analyze this workout.

Respond ONLY in JSON with this exact shape:
{
  "strengthTrend": "...",
  "recoveryStatus": "...",
  "techniqueFlags": ["..."],
  "recommendedChanges": ["..."]
}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `${prompt}\nWorkout summary:\n${JSON.stringify(meaningful)}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!anthropicResponse.ok) {
      console.error(`[AI Coach] Anthropic API error for userId=${userId}: ${anthropicResponse.status}`);
      return NextResponse.json(FALLBACK_RESPONSE, { headers: responseHeaders });
    }

    const data = await anthropicResponse.json();
    let parsedAnalysis: unknown = null;

    try {
      const text = data.content?.[0]?.text;
      if (typeof text === "string") {
        parsedAnalysis = JSON.parse(text);
      }
    } catch {
      console.error(`[AI Coach] Failed to parse Anthropic response for userId=${userId}`);
    }

    return NextResponse.json(normalizeAICoachResponse(parsedAnalysis), { headers: responseHeaders });
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error("[AI Coach] Request timeout");
      return NextResponse.json(FALLBACK_RESPONSE, { status: 504 });
    }

    console.error("[AI Coach] Unexpected error");
    return NextResponse.json(FALLBACK_RESPONSE, { status: 500 });
  }
}
