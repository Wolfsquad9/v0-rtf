export async function analyzeWorkout(dayData: any, apiKey: string | null) {
  try {
    const res = await fetch("/api/ai-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayData, apiKey })
    });

    return await res.json();
  } catch (err) {
    console.error("Client AI error:", err);
    return null;
  }
}
