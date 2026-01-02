"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeWorkout } from "@/hooks/use-ai-coach-engine";
import { Gauge } from "lucide-react";

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

  const exercises = (dayData?.training || []).filter((ex: any) =>
    ex.name ||
    ex.notes ||
    (Array.isArray(ex.sets) && ex.sets.some((s: any) => s.reps || s.weight || s.rpe)) ||
    (typeof ex.sets === 'number' && ex.sets > 0)
  );

  const signature = JSON.stringify(exercises);

  useEffect(() => {
    if (exercises.length === 0) {
      setAnalysis(null);
      prevSig.current = "";
      setLoading(false);
      return;
    }

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
  }, [signature, apiKey, exercises.length, dayData, loading]);

  if (exercises.length === 0) return null;

  return (
    <div className="border bg-card p-8 shadow-none mt-0.5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
          <Gauge className="w-3.5 h-3.5" />
          Neural Intelligence Report
        </h2>
        {analysis?.demoMode && (
          <span className="text-[8px] font-bold px-2 py-0.5 border border-border bg-muted/30 uppercase tracking-widest text-muted-foreground/40">
            Simulated Node
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-6 py-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <div className="h-2 w-24 bg-primary/10 rounded-none" />
              <div className="h-10 w-full bg-primary/5 rounded-none border-l-2 border-primary/20" />
            </div>
            <div className="space-y-3">
              <div className="h-2 w-24 bg-primary/10 rounded-none" />
              <div className="h-10 w-full bg-primary/5 rounded-none border-l-2 border-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-dashed border-primary/10">
            <div className="space-y-4">
              <div className="h-2 w-32 bg-primary/10 rounded-none" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-primary/5 rounded-none" />
                <div className="h-4 w-3/4 bg-primary/5 rounded-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-32 bg-primary/10 rounded-none" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-primary/5 rounded-none" />
                <div className="h-4 w-3/4 bg-primary/5 rounded-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && analysis ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {analysis.strengthTrend && typeof analysis.strengthTrend === "string" && (
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Load Adaptation Velocity</p>
                <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed border-l-2 border-primary/20 pl-4">{analysis.strengthTrend}</p>
              </div>
            )}
            {analysis.recoveryStatus && typeof analysis.recoveryStatus === "string" && (
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Systemic Recovery State</p>
                <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed border-l-2 border-primary/20 pl-4">{analysis.recoveryStatus}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-dashed">
            {Array.isArray(analysis.techniqueFlags) && analysis.techniqueFlags.length > 0 && (
              <div className="space-y-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Mechanical Warnings</p>
                <ul className="space-y-3">
                  {analysis.techniqueFlags.map((t: any) => {
                    if (typeof t === "string") return (
                      <li key={t} className="text-[10px] font-bold uppercase tracking-widest flex items-start gap-3">
                        <span className="mt-1.5 w-1 h-1 bg-primary flex-shrink-0" />
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    );
                    return null;
                  })}
                </ul>
              </div>
            )}

            {Array.isArray(analysis.recommendedChanges) && analysis.recommendedChanges.length > 0 && (
              <div className="space-y-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Strategic Protocol Delta</p>
                <ul className="space-y-3">
                  {analysis.recommendedChanges.map((c: any) => {
                    if (typeof c === "string") return (
                      <li key={c} className="text-[10px] font-bold uppercase tracking-widest flex items-start gap-3">
                        <span className="mt-1.5 w-1 h-1 bg-primary/40 flex-shrink-0" />
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    );
                    return null;
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : !loading && (
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20 italic py-4">Awaiting bio-data stream for session synthesis.</p>
      )}
    </div>
  );
};
