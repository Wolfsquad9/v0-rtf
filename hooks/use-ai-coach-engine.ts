"use server"

import type { DayEntry } from "@/types/planner"

export interface CoachAnalysis {
  strengthTrend: string
  formAlert: string | null
  recommendations: string[]
  loading?: boolean
  error?: string
}

export async function analyzeWorkout(dayData: DayEntry): Promise<CoachAnalysis> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey || apiKey === "TEST") {
      // Simulate network delay to ensure loading states are visible
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        strengthTrend: "Demo mode: stable workload and consistent RPE.",
        formAlert: null,
        recommendations: [
          "Increase top set by +2.5kg next week.",
          "Add 1 backoff set for volume.",
          "Maintain current warmup structure.",
        ],
      }
    }

    // Validate API key
    if (!apiKey) {
      return {
        strengthTrend: "API not configured",
        formAlert: "Unable to connect to coaching system",
        recommendations: ["Please configure ANTHROPIC_API_KEY in environment variables"],
        error: "Missing API key",
      }
    }

    // Format workout data for prompt
    const workoutSummary =
      dayData.training
        ?.map((ex) => `- ${ex.name}: ${ex.sets}x${ex.reps} @ ${ex.loadKg}kg (RPE ${ex.rpe})`)
        .join("\n") || "No exercises logged"
    const sessionRPE = dayData.rpe || "Not set"

    const prompt = `You are a professional strength and conditioning coach analyzing a training session.

Session Data:
- Session RPE: ${sessionRPE}/10
- Exercises: 
${workoutSummary}
- Notes: ${dayData.training?.[0]?.rpeNotes || "None"}

Provide analysis in exactly this JSON format:
{
  "strengthTrend": "One sentence observation about intensity/progression (max 60 chars)",
  "formAlert": "One specific technical cue or warning (max 60 chars) or 'No alerts' if form looks good",
  "recommendations": ["Short recommendation 1", "Short recommendation 2", "Short recommendation 3"]
}

Be concise, specific, and actionable.`

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Anthropic API error:", error)
      return {
        strengthTrend: "Analysis unavailable",
        formAlert: "Coach system error",
        recommendations: ["Check API configuration"],
        error: "API error",
      }
    }

    const data = await response.json()
    const content = data.content[0]?.text || ""

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        strengthTrend: "Unable to analyze",
        formAlert: "Response parsing error",
        recommendations: ["Try logging your session again"],
        error: "Parse error",
      }
    }

    const analysis = JSON.parse(jsonMatch[0])
    return {
      strengthTrend: analysis.strengthTrend || "Session complete",
      formAlert: analysis.formAlert || null,
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations.slice(0, 3) : [],
    }
  } catch (err) {
    console.error("[v0] Coach engine error:", err)
    return {
      strengthTrend: "Error occurred",
      formAlert: "Unable to generate analysis",
      recommendations: [],
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
