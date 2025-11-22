"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"

interface RPENotesProps {
  weekIndex: number
  dayIndex: number
  exerciseIndex: number
}

export function RPENotes({ weekIndex, dayIndex, exerciseIndex }: RPENotesProps) {
  const { state, updateExercise } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const exercise = state.weeks[weekIndex]?.days[dayIndex]?.training?.[exerciseIndex]

  if (!exercise) return null

  return (
    <div className="mt-3 space-y-2 animate-in fade-in-50 duration-200">
      <Label
        htmlFor={`rpe-notes-${exercise.id}`}
        className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2"
        style={{ color: theme.accent }}
      >
        <span className="w-1 h-3" style={{ backgroundColor: theme.primary }} />
        RPE Notes & Form Check
      </Label>
      <Textarea
        id={`rpe-notes-${exercise.id}`}
        value={exercise.rpeNotes || ""}
        onChange={(e) => updateExercise(weekIndex, dayIndex, exerciseIndex, "rpeNotes", e.target.value)}
        placeholder="Notes on difficulty, technique, fatigue, tempo, or form adjustments…"
        className="min-h-[100px] resize-none text-sm font-mono leading-relaxed border transition-all px-3.5 py-2.5"
        style={{
          backgroundColor: theme.background + "80",
          borderColor: theme.border + "40",
          color: theme.text + "DD",
        }}
      />
      <div className="text-xs" style={{ color: theme.text + "88" }}>
        Max 500 characters
      </div>
    </div>
  )
}
