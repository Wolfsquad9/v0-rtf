"use client"

import { memo } from "react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { RPESelector } from "./rpe-selector"
import { RPENotes } from "./rpe-notes"
import { HabitRecoveryTracker } from "./habit-recovery-tracker"
import { AICoachPanel } from "./ai-coach-panel"
import { cn } from "@/lib/utils"
import { usePlanner } from "@/hooks/use-planner"

interface DailyLogProps {
  weekId: string
  dayId: string
}

export const DailyLog = memo(function DailyLog({ weekId, dayId }: DailyLogProps) {
  const { state, updateDay, updateExercise } = usePlanner()

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
    <div className="space-y-0.5">
      <div
        className={cn("bg-card border transition-all duration-500", isToday ? "border-primary/40 shadow-2xl shadow-primary/5" : "border-border/60")}
      >
        <div className="p-4 md:p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold uppercase tracking-[0.15em]">
                {format(date, "EEEE")}
              </h3>
              {isToday && (
                <div className="flex items-center gap-2 px-2 py-0.5 border border-primary/30 bg-primary/5">
                  <span className="w-1 h-1 bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Live Session</span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              {format(date, "MMMM dd // yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Load Intensity</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">RPE Profile</p>
            </div>
            <RPESelector value={day.rpe || 0} onChange={(val) => updateDay(weekIndex, dayIndex, { rpe: val })} />
          </div>
        </div>
        <div className="p-4 md:p-8 space-y-10">
          <div className="space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-6 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 px-1">
              <div className="col-span-5">Movement Protocol</div>
              <div className="col-span-2 text-center text-[10px]">Sets</div>
              <div className="col-span-2 text-center text-[10px]">Reps</div>
              <div className="col-span-3 text-center text-[10px]">Volume (KG)</div>
            </div>
            <div className="space-y-4">
              {day.training?.map((ex, idx) => (
                <div key={ex.id} className="space-y-3">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-center">
                    <div className="w-full md:col-span-5">
                      <Input
                        value={ex.name}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "name", e.target.value)}
                        className="h-11 text-[11px] font-bold uppercase tracking-widest bg-background/50 border rounded-none focus-visible:ring-primary/10 transition-all"
                        placeholder="UNSPECIFIED MOVEMENT"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:contents w-full">
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          value={ex.sets || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            if (!isNaN(val)) {
                              updateExercise(weekIndex, dayIndex, idx, "sets", Math.min(Math.max(val, 0), 100))
                            }
                          }}
                          className="h-11 text-center text-xs font-bold bg-background/50 border rounded-none"
                          placeholder="Sets"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          value={ex.reps || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            if (!isNaN(val)) {
                              updateExercise(weekIndex, dayIndex, idx, "reps", Math.min(Math.max(val, 0), 100))
                            }
                          }}
                          className="h-11 text-center text-xs font-bold bg-background/50 border rounded-none"
                          placeholder="Reps"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          value={ex.loadKg || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            if (!isNaN(val)) {
                              updateExercise(weekIndex, dayIndex, idx, "loadKg", Math.min(Math.max(val, 0), 10000))
                            }
                          }}
                          className="h-11 text-center text-xs font-bold bg-background/50 border-primary/20 rounded-none text-primary focus-visible:ring-primary/20 transition-all"
                          placeholder="KG"
                        />
                      </div>
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
    </div>
  )
})
