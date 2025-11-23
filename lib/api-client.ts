export async function callAICoach(exerciseData: any[], userId?: string) {
  try {
    const response = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        exerciseData,
        userId 
      }),
    })

    const data = await response.json()

    if (!response.ok && response.status !== 200) {
      throw new Error(data.message || 'Analysis failed')
    }

    let analysis = data.analysis
    try {
      if (typeof analysis === 'string') {
        analysis = JSON.parse(analysis)
      }
    } catch (e) {
      console.warn('Could not parse analysis JSON:', e)
    }

    return {
      success: true,
      analysis: analysis,
      isDemo: data.isDemo || false,
      tokensUsed: data.tokensUsed || 0,
      cached: data.cached || false,
      error: null
    }

  } catch (error: any) {
    console.error('AI Coach call failed:', error)
    
    return {
      success: false,
      analysis: null,
      isDemo: false,
      tokensUsed: 0,
      cached: false,
      error: error.message || 'Network error'
    }
  }
}
