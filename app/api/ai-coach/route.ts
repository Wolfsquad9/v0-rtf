import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dayData, apiKey } = await req.json();

    const meaningful = (dayData?.training || []).filter((ex: any) =>
      ex.name ||
      ex.notes ||
      (Array.isArray(ex.sets) && ex.sets.some((s: any) => s.reps || s.weight || s.rpe)) ||
      (typeof ex.sets === 'number' && ex.sets > 0)
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      return NextResponse.json({
        strengthTrend: "API error",
        recoveryStatus: "Check API key",
        techniqueFlags: [],
        recommendedChanges: []
      });
    }

    const data = await response.json();
    let parsed = {};
    
    try {
      const text = data.content?.[0]?.text || "";
      parsed = JSON.parse(text);
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
    return NextResponse.json({ 
      strengthTrend: "Error",
      recoveryStatus: "Try again",
      techniqueFlags: [],
      recommendedChanges: []
    });
  }
}
