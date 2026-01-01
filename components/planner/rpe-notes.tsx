"use client"

import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RPENotesProps {
  weekIndex: number
  dayIndex: number
  exerciseIndex: number
}

export function RPENotes({ weekIndex, dayIndex, exerciseIndex }: RPENotesProps) {
  const { state, updateExercise } = usePlanner()

  if (!state) return null

  const exercise = state.weeks[weekIndex]?.days[dayIndex]?.training?.[exerciseIndex]
  if (!exercise) return null

  return (
    <div className="mt-4 space-y-2">
      <Label
        htmlFor={`rpe-notes-${exercise.id}`}
        className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2"
      >
        <span className="w-1 h-1 bg-primary/40" />
        Technical Observations // RPE Notes
      </Label>
      <Textarea
        id={`rpe-notes-${exercise.id}`}
        value={exercise.rpeNotes || ""}
        onChange={(e) => updateExercise(weekIndex, dayIndex, exerciseIndex, "rpeNotes", e.target.value)}
        placeholder="LOG BIOMECHANICAL DATA OR PERCEIVED EXERTION..."
        className="min-h-[80px] resize-none text-[10px] font-bold uppercase tracking-widest bg-background/30 border rounded-none leading-relaxed placeholder:text-muted-foreground/10 focus-visible:ring-primary/10"
      />
    </div>
  )
}
