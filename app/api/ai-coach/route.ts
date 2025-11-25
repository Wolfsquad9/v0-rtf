import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dayData, apiKey } = await req.json();

    const meaningful = (dayData.training || []).filter((ex: any) =>
      ex.name ||
      ex.notes ||
      ex.sets.some((s: any) => s.reps || s.weight || s.rpe)
    );

    if (meaningful.length === 0) {
      return NextResponse.json({ empty: true });
    }

    // DEMO MODE
    if (!apiKey || apiKey === "TEST") {
      return NextResponse.json({
        strengthTrend: "Maintaining strength with stable RPE.",
        recoveryStatus: "Moderate fatigue — consider light mobility.",
        techniqueFlags: ["Watch lower-back rounding on hinge movements."],
        recommendedChanges: ["Add 1–2% load next week.", "Add 1 extra back-off set."],
        demoMode: true
      });
    }

    const client = new Anthropic({ apiKey });

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

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    });

    let parsed = {};
    try {
      parsed = JSON.parse(msg.content[0].text);
    } catch {
      parsed = {
        strengthTrend: "Data unclear.",
        recoveryStatus: "Proceed cautiously.",
        techniqueFlags: [],
        recommendedChanges: []
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI Coach server error:", err);
    return NextResponse.json({ error: true });
  }
}
