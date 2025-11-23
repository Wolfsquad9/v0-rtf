import { NextResponse } from 'next/server'
import { canAnalyze, cacheAnalysis, getCachedAnalysis, hashExerciseData } from '@/lib/rate-limit'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    const body = await request.json()
    const { exerciseData, userId } = body

    if (!exerciseData || !Array.isArray(exerciseData)) {
      return NextResponse.json(
        { error: 'INVALID_DATA', message: 'Exercise data must be an array' },
        { status: 400 }
      )
    }

    const exerciseHash = hashExerciseData(exerciseData)
    const tempUserId = userId || 'anonymous'

    // Check cache first
    const cached = getCachedAnalysis(tempUserId, exerciseHash)
    if (cached) {
      return NextResponse.json({
        success: true,
        analysis: cached,
        tokensUsed: 0,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    // Check rate limit
    if (!canAnalyze(tempUserId, exerciseHash)) {
      return NextResponse.json(
        { 
          error: 'RATE_LIMITED',
          message: 'Please wait 10 seconds between analyses',
          retryAfter: 10
        },
        { status: 429 }
      )
    }

    if (!apiKey) {
      const demoAnalysis = generateDemoAnalysis(exerciseData)
      cacheAnalysis(tempUserId, exerciseHash, demoAnalysis)
      return NextResponse.json(
        { 
          error: 'AI_UNAVAILABLE',
          message: 'Running in demo mode. Add ANTHROPIC_API_KEY to enable real analysis.',
          analysis: demoAnalysis,
          isDemo: true,
          tokensUsed: 0,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

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
            content: buildWorkoutAnalysisPrompt(exerciseData),
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Anthropic API error:", error)
      return NextResponse.json(
        { 
          error: 'API_ERROR',
          message: 'Failed to generate analysis. Please try again.',
          analysis: generateDemoAnalysis(exerciseData),
          isDemo: true,
          tokensUsed: 0,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    const content = data.content[0]?.text || ""

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    let analysis = content

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        analysis = JSON.stringify({
          strengthTrend: parsed.strengthTrend || "Session complete",
          formAlert: parsed.formAlert || null,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [],
        })
      } catch (e) {
        console.error("Parse error:", e)
      }
    }

    cacheAnalysis(tempUserId, exerciseHash, analysis)

    return NextResponse.json({
      success: true,
      analysis: analysis,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('AI Coach API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'API_ERROR',
        message: 'Failed to generate analysis. Please try again.',
        analysis: generateDemoAnalysis([]),
        isDemo: true,
        tokensUsed: 0,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  }
}

function buildWorkoutAnalysisPrompt(exerciseData: any[]): string {
  const workoutSummary = exerciseData
    .map((ex) => `- ${ex.name}: ${ex.sets}x${ex.reps} @ ${ex.loadKg}kg (RPE ${ex.rpe})`)
    .join("\n") || "No exercises logged"

  return `You are a professional strength and conditioning coach analyzing a training session.

Session Data:
- Exercises: 
${workoutSummary}

Provide analysis in exactly this JSON format:
{
  "strengthTrend": "One sentence observation about intensity/progression (max 60 chars)",
  "formAlert": "One specific technical cue or warning (max 60 chars) or 'No alerts' if form looks good",
  "recommendations": ["Short recommendation 1", "Short recommendation 2", "Short recommendation 3"]
}

Be concise, specific, and actionable.`
}

function generateDemoAnalysis(exerciseData: any[]): string {
  return JSON.stringify({
    strengthTrend: "🤖 DEMO MODE - Training load appropriate for progressive overload",
    formAlert: "Maintain controlled tempo on eccentric phase",
    recommendations: [
      "Add 5lbs to main lifts next session if RPE stays 7-8",
      "Incorporate a deload week after 3-4 weeks of progression",
      "Track bar speed to detect fatigue earlier"
    ]
  })
}
