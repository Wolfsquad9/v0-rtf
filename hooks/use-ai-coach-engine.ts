import { Anthropic } from "@anthropic-ai/sdk";

interface AIResult {
  strengthTrend: string;
  recoveryStatus: string;
  techniqueFlags: string[];
  recommendedChanges: string[];
  demoMode?: boolean;
}

export async function analyzeWorkout(dayData: any, apiKey: string | null) {
  try {
    // ---- Meaningful data detection ----
    const meaningful = (dayData.training || []).filter((ex: any) =>
      ex.name || ex.notes ||
      ex.sets.some((s: any) => s.reps || s.weight || s.rpe)
    );

    if (meaningful.length === 0) {
      return null; // Nothing to analyze
    }

    // ---- DEMO MODE ----
    if (!apiKey || apiKey === "TEST") {
      return {
        strengthTrend: "Maintaining strength with stable RPE.",
        recoveryStatus: "Moderate fatigue — consider light mobility.",
        techniqueFlags: ["Watch lower-back rounding on hinge movements."],
        recommendedChanges: ["Add 1–2% load next week.", "Add 1 extra back-off set."],
        demoMode: true
      };
    }

    // ---- REAL MODE ----
    const client = new Anthropic({ apiKey });

    const prompt = `
You are an advanced strength coach. Analyze this workout:

${JSON.stringify(meaningful, null, 2)}

Respond ONLY in JSON:
{
  "strengthTrend": "...",
  "recoveryStatus": "...",
  "techniqueFlags": ["..."],
  "recommendedChanges": ["..."]
}
`;

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    });

    const text = msg.content[0].text;
    let parsed = null;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        strengthTrend: "Data unclear.",
        recoveryStatus: "Proceed cautiously.",
        techniqueFlags: [],
        recommendedChanges: []
      };
    }

    return parsed;

  } catch (err) {
    console.error("AI Coach error:", err);
    return null;
  }
}
