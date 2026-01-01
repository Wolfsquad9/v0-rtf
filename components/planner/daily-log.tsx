"use client"

import { memo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RPESelector } from "./rpe-selector"
import { RPENotes } from "./rpe-notes"
import { HabitRecoveryTracker } from "./habit-recovery-tracker"
import { AICoachPanel } from "./ai-coach-panel"
import { cn } from "@/lib/utils"
import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"

interface DailyLogProps {
  weekId: string
  dayId: string
}

export const DailyLog = memo(function DailyLog({ weekId, dayId }: DailyLogProps) {
  const { state, updateDay, updateExercise } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const dayIndex = week.days.findIndex((d) => d.id === dayId)
  const day = week.days[dayIndex]
  if (!day) return null

  const date = new Date(day.date)
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <>
      <div
        className={cn("bg-card border p-0 transition-all duration-300", isToday && "border-primary/50")}
      >
        <div className="p-6 border-b flex flex-row items-center justify-between bg-muted/30">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] flex items-center gap-3">
              <span>{format(date, "EEEE")}</span>
              {isToday && (
                <span className="text-[9px] font-bold px-2 py-0.5 bg-primary text-primary-foreground uppercase tracking-widest">
                  Active
                </span>
              )}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {format(date, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Intensity
            </span>
            <RPESelector value={day.rpe || 0} onChange={(val) => updateDay(weekIndex, dayIndex, { rpe: val })} />
          </div>
        </div>
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
              <div className="col-span-5">Movement</div>
              <div className="col-span-2 text-center">Sets</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-3 text-center">Load (KG)</div>
            </div>
            <div className="space-y-4">
              {day.training?.map((ex, idx) => (
                <div key={ex.id} className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <Input
                        value={ex.name}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "name", e.target.value)}
                        className="h-10 text-xs font-bold uppercase tracking-wide bg-background border rounded-none"
                        placeholder="EXERCISE"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={ex.sets || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "sets", Number(e.target.value))}
                        className="h-10 text-center text-xs font-bold bg-background border rounded-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={ex.reps || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "reps", Number(e.target.value))}
                        className="h-10 text-center text-xs font-bold bg-background border rounded-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={ex.loadKg || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "loadKg", Number(e.target.value))}
                        className="h-10 text-center text-xs font-bold bg-background border-primary/30 rounded-none text-primary"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <RPENotes weekIndex={weekIndex} dayIndex={dayIndex} exerciseIndex={idx} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AICoachPanel dayData={day} apiKey={null} />

      <HabitRecoveryTracker weekId={weekId} dayId={dayId} />
    </>
  )
})
