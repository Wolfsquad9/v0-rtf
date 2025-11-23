"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"
import { callAICoach } from "@/lib/api-client"
import type { DayEntry } from "@/types/planner"

interface CoachAnalysis {
  strengthTrend: string
  formAlert: string | null
  recommendations: string[]
}

interface AiCoachPanelProps {
  weekIndex: number
  dayIndex: number
}

function hasMeaningfulData(day: DayEntry | undefined): boolean {
  if (!day?.training || day.training.length === 0) return false
  
  return day.training.some((ex) => {
    const hasSets = ex.sets && ex.sets > 0
    const hasReps = ex.reps && ex.reps > 0
    const hasLoad = ex.loadKg && ex.loadKg > 0
    const hasRpe = ex.rpe && ex.rpe > 0
    const hasNotes = ex.rpeNotes && ex.rpeNotes.trim() !== ""
    return hasSets || hasReps || hasLoad || hasRpe || hasNotes
  })
}

function createDataSignature(day: DayEntry | undefined): string {
  if (!day?.training) return ""
  
  return JSON.stringify(
    day.training.map((ex) => ({
      sets: ex.sets,
      reps: ex.reps,
      loadKg: ex.loadKg,
      rpe: ex.rpe,
      rpeNotes: ex.rpeNotes,
    }))
  )
}

export function AiCoachPanel({ weekIndex, dayIndex }: AiCoachPanelProps) {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const lastSignatureRef = useRef<string>("")

  const day = state?.weeks?.[weekIndex]?.days?.[dayIndex]
  const meaningfulData = hasMeaningfulData(day)

  useEffect(() => {
    if (!meaningfulData) {
      setAnalysis(null)
      lastSignatureRef.current = ""
      return
    }

    const currentSignature = createDataSignature(day)
    const signatureChanged = currentSignature !== lastSignatureRef.current

    if (!signatureChanged || loading) {
      return
    }

    setLoading(true)
    const exerciseData = (day as DayEntry).training.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      loadKg: ex.loadKg,
      rpe: ex.rpe,
      rpeNotes: ex.rpeNotes,
    }))

    callAICoach(exerciseData)
      .then((result) => {
        if (result.success && result.analysis) {
          setAnalysis(result.analysis)
          lastSignatureRef.current = currentSignature
        } else {
          console.error("[v0] Coach panel error:", result.error)
          setAnalysis({
            strengthTrend: "Analysis error",
            formAlert: "Unable to generate",
            recommendations: [],
          })
        }
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
  }, [meaningfulData, day])

  useEffect(() => {
    const isDemoMode = analysis?.strengthTrend?.includes("DEMO MODE")
    
    if (!isDemoMode || !meaningfulData || loading) {
      return
    }

    const pollInterval = setInterval(() => {
      if (loading) return
      
      setLoading(true)
      const currentSignature = createDataSignature(day)
      const exerciseData = (day as DayEntry).training.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        loadKg: ex.loadKg,
        rpe: ex.rpe,
        rpeNotes: ex.rpeNotes,
      }))
      
      callAICoach(exerciseData)
        .then((result) => {
          if (result.success && result.analysis) {
            setAnalysis(result.analysis)
            lastSignatureRef.current = currentSignature
          }
        })
        .catch((err) => {
          console.error("[v0] Coach panel demo retry:", err)
        })
        .finally(() => setLoading(false))
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [analysis?.strengthTrend, meaningfulData, loading, day])

  if (!meaningfulData) {
    return null
  }

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
            {loading ? "Analyzing..." : analysis?.strengthTrend || "—"}
          </div>
        </div>

        {/* Form Alert */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: analysis?.formAlert === "No alerts" ? theme.background + "40" : theme.primary + "15",
            borderColor: analysis?.formAlert === "No alerts" ? theme.border + "20" : theme.primary + "40",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: theme.accent }}>
            Form Alert
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{
              color: analysis?.formAlert === "No alerts" ? theme.text + "99" : theme.primary,
              fontWeight: analysis?.formAlert === "No alerts" ? 400 : 600,
            }}
          >
            {loading ? "Analyzing..." : analysis?.formAlert || "—"}
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
          ) : analysis?.recommendations && analysis.recommendations.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Demo Mode Message */}
        {!loading && analysis?.strengthTrend?.includes("DEMO MODE") && (
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
