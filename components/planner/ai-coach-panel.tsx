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

// Helper: Check if exercises have meaningful data
function hasMeaningfulData(day: DayEntry | undefined): boolean {
  if (!day?.training || day.training.length === 0) return false
  
  // At least one exercise must have sets, reps, load, RPE, or rpeNotes
  return day.training.some((ex) => {
    const hasSets = ex.sets && ex.sets > 0
    const hasReps = ex.reps && ex.reps > 0
    const hasLoad = ex.loadKg && ex.loadKg > 0
    const hasRpe = ex.rpe && ex.rpe > 0
    const hasNotes = ex.rpeNotes && ex.rpeNotes.trim() !== ""
    return hasSets || hasReps || hasLoad || hasRpe || hasNotes
  })
}

// Helper: Create data signature for re-analysis detection
function createDataSignature(day: DayEntry | undefined): string {
  if (!day?.training) return ""
  
  return day.training
    .map((ex) => `${ex.name}|${ex.sets}|${ex.reps}|${ex.loadKg}|${ex.rpe}`)
    .join("||")
}

export function AiCoachPanel({ weekIndex, dayIndex }: AiCoachPanelProps) {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastSignature, setLastSignature] = useState<string>("")

  const day = state?.weeks?.[weekIndex]?.days?.[dayIndex]

  // FIX 1 & 2: Trigger analysis when exercises have meaningful data AND data changes
  useEffect(() => {
    const currentSignature = createDataSignature(day)
    const hasData = hasMeaningfulData(day)
    const dataChanged = currentSignature !== lastSignature && currentSignature !== ""

    if (hasData && dataChanged) {
      setLoading(true)
      
      analyzeWorkout(day as DayEntry)
        .then((result) => {
          setAnalysis(result)
          // ARCHITECT FIX: Only update signature AFTER successful analysis
          setLastSignature(currentSignature)
        })
        .catch((err) => {
          console.error("[v0] Coach panel error:", err)
          setAnalysis({
            strengthTrend: "Analysis error",
            formAlert: "Unable to generate",
            recommendations: [],
          })
          // ARCHITECT FIX: Don't update signature on error - allow retries
        })
        .finally(() => setLoading(false))
    } else if (!hasData) {
      // FIX 1: Clear analysis if no meaningful data exists
      setAnalysis(null)
      setLastSignature("")
    }
  }, [day, lastSignature])

  // ARCHITECT FIX: Auto-retry when in demo mode to detect API key addition
  useEffect(() => {
    const isDemoMode = analysis?.strengthTrend?.includes("DEMO MODE")
    const hasData = hasMeaningfulData(day)
    
    if (isDemoMode && hasData && !loading) {
      // Poll every 5 seconds to check if real API key was added
      const pollInterval = setInterval(() => {
        const currentSignature = createDataSignature(day)
        setLoading(true)
        
        analyzeWorkout(day as DayEntry)
          .then((result) => {
            setAnalysis(result)
            setLastSignature(currentSignature)
          })
          .catch((err) => {
            console.error("[v0] Coach panel demo retry:", err)
          })
          .finally(() => setLoading(false))
      }, 5000)
      
      return () => clearInterval(pollInterval)
    }
  }, [analysis?.strengthTrend, day, loading])

  // STATE MACHINE: Show panel if meaningful data exists OR is loading
  const hasData = hasMeaningfulData(day)
  if (!hasData && !loading) return null

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
            {loading
              ? "Analyzing..."
              : analysis
              ? analysis.strengthTrend
              : "—"}
          </div>
        </div>

        {/* Form Alert */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: (analysis?.formAlert === "No alerts") ? theme.background + "40" : theme.primary + "15",
            borderColor: (analysis?.formAlert === "No alerts") ? theme.border + "20" : theme.primary + "40",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: theme.accent }}>
            Form Alert
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{
              color: (analysis?.formAlert === "No alerts") ? theme.text + "99" : theme.primary,
              fontWeight: (analysis?.formAlert === "No alerts") ? 400 : 600,
            }}
          >
            {loading
              ? "Analyzing..."
              : analysis
              ? analysis.formAlert
              : "—"}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
            Recommendations
          </div>
          {loading ? (
            <ul className="list-disc pl-4 space-y-1">
              <li>Analyzing...</li>
              <li>Analyzing...</li>
              <li>Analyzing...</li>
            </ul>
          ) : analysis ? (
            <ul className="list-disc pl-4 space-y-1">
              {analysis.recommendations?.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Demo Mode Message - PATCH D: Only show after analysis completes */}
        {!loading && analysis && analysis?.strengthTrend?.includes("DEMO MODE") && (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: theme.accent + "10",
              borderColor: theme.accent + "30",
            }}
          >
            <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
              Enable Real AI
            </div>
            <ul className="text-sm space-y-1.5" style={{ color: theme.text + "CC" }}>
              {analysis?.recommendations?.map((rec, idx) => (
                <li key={idx} className="flex gap-2">
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
