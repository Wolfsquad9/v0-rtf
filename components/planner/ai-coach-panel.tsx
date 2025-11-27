"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeWorkout } from "@/hooks/use-ai-coach-engine";

interface AICoachPanelProps {
  dayData: any;
  apiKey: string | null;
}

interface AnalysisResult {
  strengthTrend?: string;
  recoveryStatus?: string;
  techniqueFlags?: string[];
  recommendedChanges?: string[];
  demoMode?: boolean;
  empty?: boolean;
}

export const AICoachPanel = ({ dayData, apiKey }: AICoachPanelProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const prevSig = useRef("");

  // Extract meaningful data
  const exercises = (dayData?.training || []).filter((ex: any) =>
    ex.name ||
    ex.notes ||
    (Array.isArray(ex.sets) && ex.sets.some((s: any) => s.reps || s.weight || s.rpe)) ||
    (typeof ex.sets === 'number' && ex.sets > 0)
  );

  const signature = JSON.stringify(exercises);

  useEffect(() => {
    // Hide if no data
    if (exercises.length === 0) {
      setAnalysis(null);
      prevSig.current = "";
      setLoading(false);
      return;
    }

    // Skip if same signature
    if (signature === prevSig.current) return;
    if (loading) return;

    setLoading(true);

    const timer = setTimeout(async () => {
      const result = await analyzeWorkout(dayData, apiKey);
      setAnalysis(result);
      setLoading(false);
      prevSig.current = signature;
    }, 500);

    return () => clearTimeout(timer);
  }, [signature, apiKey, exercises.length]);

  if (exercises.length === 0) return null;

  return (
    <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">AI Coach</h2>

      {loading && (
        <p className="text-muted-foreground">Analyzing your session…</p>
      )}

      {!loading && analysis ? (
        <div className="space-y-2">
          {analysis.strengthTrend && typeof analysis.strengthTrend === "string" && (
            <p>
              <strong>Strength Trend:</strong> {analysis.strengthTrend}
            </p>
          )}
          {analysis.recoveryStatus && typeof analysis.recoveryStatus === "string" && (
            <p>
              <strong>Recovery:</strong> {analysis.recoveryStatus}
            </p>
          )}

          {Array.isArray(analysis.techniqueFlags) && analysis.techniqueFlags.length > 0 && (
            <ul className="text-sm list-disc ml-4">
              {analysis.techniqueFlags.map((t: any) => {
                if (typeof t === "string") return <li key={t}>{t}</li>;
                return null;
              })}
            </ul>
          )}

          {Array.isArray(analysis.recommendedChanges) && analysis.recommendedChanges.length > 0 && (
            <ul className="text-sm list-disc ml-4">
              {analysis.recommendedChanges.map((c: any) => {
                if (typeof c === "string") return <li key={c}>{c}</li>;
                return null;
              })}
            </ul>
          )}

          {analysis.demoMode === true && (
            <p className="text-xs text-muted-foreground mt-2">
              Running in demo mode — add a real API key to unlock full analysis.
            </p>
          )}
        </div>
      ) : !loading && (
        <p className="text-muted-foreground text-sm">Ready to analyze your workout data.</p>
      )}
    </div>
  );
};
