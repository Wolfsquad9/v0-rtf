export async function analyzeWorkout(dayData: any, _apiKey?: string | null) {
  try {
    // NOTE: apiKey is NEVER sent to server - it's only used for UI state
    // The server uses process.env.ANTHROPIC_API_KEY
    // This ensures the API key is never exposed to the client
    
    const res = await fetch("/api/ai-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayData })
    });

    if (!res.ok) {
      console.error("AI Coach API error:", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Client AI error:", err);
    return null;
  }
}
