import { NextResponse } from "next/server";
import {
  getRateLimitKey,
  checkRateLimit,
  validateDayData,
  sanitizeDayData,
} from "@/lib/api-security";

export async function POST(req: Request) {
  try {
    // 1. RATE LIMITING
    const rateLimitKey = getRateLimitKey(req);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    // 2. REQUEST VALIDATION
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { dayData } = body;

    // Validate input
    if (!validateDayData(dayData)) {
      return NextResponse.json(
        { error: "Invalid day data format" },
        { status: 400 },
      );
    }

    // Sanitize input to prevent injection
    const sanitized = sanitizeDayData(dayData);

    const meaningful = sanitized.training.filter(
      (ex: any) =>
        ex.name || ex.rpeNotes || ex.sets > 0 || ex.reps > 0 || ex.loadKg > 0,
    );

    if (meaningful.length === 0) {
      return NextResponse.json({
        empty: true,
        demoMode: false,
      });
    }

    // 3. GET API KEY FROM SERVER ONLY (NOT FROM CLIENT)
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // DEMO MODE - no API key configured
    if (!apiKey || apiKey === "TEST") {
      return NextResponse.json({
        strengthTrend: "Maintaining strength with stable RPE.",
        recoveryStatus: "Moderate fatigue — consider light mobility.",
        techniqueFlags: ["Watch lower-back rounding on hinge movements."],
        recommendedChanges: [
          "Add 1–2% load next week.",
          "Add 1 extra back-off set.",
        ],
        demoMode: true,
      });
    }

    // 4. CALL ANTHROPIC API WITH SERVER-SIDE KEY
    const prompt = `
You are an expert strength coach. Analyze this workout:

${JSON.stringify(meaningful, null, 2)}

Respond ONLY in JSON:
{
  "strengthTrend": "...",
  "recoveryStatus": "...",
  "techniqueFlags": ["..."],
  "recommendedChanges": ["..."]
}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "[AI Coach] Anthropic API error:",
        response.status,
        response.statusText,
      );

      // Return demo if API fails
      return NextResponse.json({
        strengthTrend: "API temporarily unavailable",
        recoveryStatus: "Falling back to demo analysis",
        techniqueFlags: [],
        recommendedChanges: ["Check back in a moment"],
        demoMode: true,
      });
    }

    const data = await response.json();

    // Defensive parsing with guaranteed shape
    let parsed: any = {
      strengthTrend: "Analysis unavailable",
      recoveryStatus: "Please try again",
      techniqueFlags: [],
      recommendedChanges: [],
    };

    try {
      const text = data.content?.[0]?.text;
      if (!text || typeof text !== "string") {
        console.error("[AI Coach] No text in response:", data);
      } else {
        const extracted = JSON.parse(text);

        // Merge extracted with defaults to ensure all fields exist
        parsed = {
          strengthTrend: extracted?.strengthTrend || "Analysis unavailable",
          recoveryStatus: extracted?.recoveryStatus || "Please try again",
          techniqueFlags: Array.isArray(extracted?.techniqueFlags)
            ? extracted.techniqueFlags
            : [],
          recommendedChanges: Array.isArray(extracted?.recommendedChanges)
            ? extracted.recommendedChanges
            : [],
        };
      }
    } catch (e) {
      console.error("[AI Coach] Parse error:", e);
      // Keep defaults already set
    }

    // 5. ADD SECURITY HEADERS
    const responseHeaders = new Headers({
      "X-RateLimit-Remaining": remaining.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Content-Type": "application/json",
    });

    return NextResponse.json(parsed, { headers: responseHeaders });
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error("[AI Coach] Request timeout");
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    console.error("[AI Coach] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
