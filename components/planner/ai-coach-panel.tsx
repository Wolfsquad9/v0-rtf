"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeWorkout } from "@/hooks/use-ai-coach-engine";

export const AICoachPanel = ({ dayData, apiKey }: any) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Signature of meaningful data to detect changes
  const prevSig = useRef("");

  // ---- Extract meaningful data ----
  const exercises = (dayData?.training || []).filter((ex) =>
    ex.name ||
    ex.notes ||
    ex.sets.some((s) => s.reps || s.weight || s.rpe)
  );

  const signature = JSON.stringify(exercises);

  // ---- Main analysis trigger ----
  useEffect(() => {
    // No meaningful data → hide panel
    if (exercises.length === 0) {
      setAnalysis(null);
      prevSig.current = "";
      setLoading(false);
      return;
    }

    // If same signature → no re-analysis
    if (signature === prevSig.current) return;

    // Avoid double calls
    if (loading) return;

    setLoading(true);

    // Debounce to prevent rapid-fire API calls
    const timer = setTimeout(async () => {
      const result = await analyzeWorkout(dayData, apiKey);
      setAnalysis(result);
      setLoading(false);
      prevSig.current = signature;
    }, 500);

    return () => clearTimeout(timer);
  }, [signature, apiKey]);

  // ---- Panel hidden state ----
  if (exercises.length === 0) return null;

  return (
    <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">AI Coach</h2>

      {/* LOADING */}
      {loading && (
        <p className="text-muted-foreground">Analyzing your session…</p>
      )}

      {/* ANALYSIS SHOWN */}
      {!loading && analysis && (
        <div className="space-y-2">
          <p><strong>Strength Trend:</strong> {analysis.strengthTrend}</p>
          <p><strong>Recovery:</strong> {analysis.recoveryStatus}</p>

          {analysis.techniqueFlags?.length > 0 && (
            <ul className="text-sm list-disc ml-4">
              {analysis.techniqueFlags.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}

          {analysis.recommendedChanges?.length > 0 && (
            <ul className="text-sm list-disc ml-4">
              {analysis.recommendedChanges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}

          {/* DEMO CTA */}
          {!loading && analysis?.demoMode && (
            <p className="text-xs text-muted-foreground mt-2">
              Running in demo mode — add a real API key to unlock full analysis.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
