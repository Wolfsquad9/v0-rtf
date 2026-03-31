export interface AICoachApiResponse {
  analysis?: unknown
  isDemo?: boolean
  tokensUsed?: number
  cached?: boolean
  message?: string
}

export interface AICoachResult {
  success: boolean
  analysis: unknown | null
  isDemo: boolean
  tokensUsed: number
  cached: boolean
  error: string | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.length > 0) {
    return error
  }

  return 'Network error'
}

export async function callAICoach(exerciseData: unknown[], userId?: string): Promise<AICoachResult> {
  try {
    const response = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exerciseData,
        userId,
      }),
    })

    const data = (await response.json()) as AICoachApiResponse

    if (!response.ok && response.status !== 200) {
      throw new Error(data.message || 'Analysis failed')
    }

    let analysis = data.analysis
    try {
      if (typeof analysis === 'string') {
        analysis = JSON.parse(analysis)
      }
    } catch (error) {
      console.warn('Could not parse analysis JSON:', error)
    }

    return {
      success: true,
      analysis,
      isDemo: data.isDemo || false,
      tokensUsed: data.tokensUsed || 0,
      cached: data.cached || false,
      error: null,
    }
  } catch (error) {
    console.error('AI Coach call failed:', error)

    return {
      success: false,
      analysis: null,
      isDemo: false,
      tokensUsed: 0,
      cached: false,
      error: getErrorMessage(error),
    }
  }
}
