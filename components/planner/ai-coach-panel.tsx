"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"
import { analyzeWorkout, type CoachAnalysis } from "@/hooks/use-ai-coach-engine"
import type { DayEntry } from "@/types/planner"

interface AiCoachPanelProps {
  weekIndex: number
  dayIndex: number
}

export function AiCoachPanel({ weekIndex, dayIndex }: AiCoachPanelProps) {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  const day = state?.weeks?.[weekIndex]?.days?.[dayIndex]

  // Trigger analysis when day has exercises
  useEffect(() => {
    const hasExercises = day?.training && day.training.length > 0 && !analyzed

    if (hasExercises) {
      setLoading(true)
      analyzeWorkout(day as DayEntry)
        .then((result) => {
          setAnalysis(result)
          setAnalyzed(true)
        })
        .catch((err) => {
          console.error("[v0] Coach panel error:", err)
          setAnalysis({
            strengthTrend: "Analysis error",
            formAlert: "Unable to generate",
            recommendations: [],
          })
        })
        .finally(() => setLoading(false))
    }
  }, [day, analyzed]) // Updated dependency array

  if (!analysis) return null

  return (
    <Card
      className="mt-6 border transition-all"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.accent + "40",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className="text-sm font-mono font-bold uppercase tracking-wide flex items-center gap-2"
          style={{ color: theme.accent }}
        >
          <span
            className="text-xs px-2 py-1 rounded font-mono"
            style={{
              backgroundColor: theme.primary + "30",
              color: theme.primary,
            }}
          >
            AI Coach
          </span>
          Session Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strength Trend */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: theme.background + "60",
            borderColor: theme.border + "30",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: theme.accent }}>
            Strength Trend
          </div>
          <div className="text-sm leading-relaxed" style={{ color: theme.text + "DD" }}>
            {loading ? (
              <span className="text-xs" style={{ color: theme.text + "88" }}>
                Analyzing...
              </span>
            ) : (
              analysis.strengthTrend
            )}
          </div>
        </div>

        {/* Form Alert */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: analysis.formAlert === "No alerts" ? theme.background + "40" : theme.primary + "15",
            borderColor: analysis.formAlert === "No alerts" ? theme.border + "20" : theme.primary + "40",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: theme.accent }}>
            Form Alert
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{
              color: analysis.formAlert === "No alerts" ? theme.text + "99" : theme.primary,
              fontWeight: analysis.formAlert === "No alerts" ? 400 : 600,
            }}
          >
            {analysis.formAlert}
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Recommendations
            </div>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="text-sm flex gap-2 p-2 rounded"
                  style={{
                    backgroundColor: theme.background + "60",
                    color: theme.text + "DD",
                  }}
                >
                  <span style={{ color: theme.accent }}>→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
