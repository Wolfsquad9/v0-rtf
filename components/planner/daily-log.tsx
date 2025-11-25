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
      <Card
        className={cn("backdrop-blur transition-all duration-200 border", isToday && "shadow-2xl")}
        style={{
          backgroundColor: theme.surface + (isToday ? "E6" : "CC"),
          borderColor: isToday ? theme.primary : theme.border + "60",
          boxShadow: isToday ? `0 0 40px ${theme.primary}30` : "none",
        }}
      >
        <CardHeader
          className="pb-4 flex flex-row items-center justify-between space-y-0"
          style={{ borderBottom: `1px solid ${theme.border}40` }}
        >
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold font-mono tracking-tight flex items-center gap-2">
              <span style={{ color: theme.text }}>{format(date, "EEEE")}</span>
              {isToday && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.background,
                  }}
                >
                  Today
                </span>
              )}
            </CardTitle>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.text + "99" }}>
              {format(date, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Session RPE
            </span>
            <RPESelector value={day.rpe || 0} onChange={(val) => updateDay(weekIndex, dayIndex, { rpe: val })} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {/* Exercises Grid */}
          <div className="space-y-3">
            <div
              className="grid grid-cols-12 gap-3 text-[10px] font-mono uppercase tracking-widest px-1"
              style={{ color: theme.accent }}
            >
              <div className="col-span-5">Movement</div>
              <div className="col-span-2 text-center">Sets</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-3 text-center">Load (KG)</div>
            </div>
            <div className="space-y-6">
              {day.training?.map((ex, idx) => (
                <div key={ex.id} className="space-y-0">
                  <div className="grid grid-cols-12 gap-3 items-center group">
                    <div className="col-span-5">
                      <Input
                        value={ex.name}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "name", e.target.value)}
                        className="h-9 transition-all text-sm font-medium border"
                        style={{
                          backgroundColor: theme.background + "60",
                          borderColor: theme.border + "40",
                          color: theme.text,
                        }}
                        placeholder="Exercise name..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={ex.sets || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "sets", Number(e.target.value))}
                        className="h-9 transition-all text-center text-sm font-mono border"
                        style={{
                          backgroundColor: theme.background + "60",
                          borderColor: theme.border + "40",
                          color: theme.text,
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={ex.reps || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "reps", Number(e.target.value))}
                        className="h-9 transition-all text-center text-sm font-mono border"
                        style={{
                          backgroundColor: theme.background + "60",
                          borderColor: theme.border + "40",
                          color: theme.text,
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={ex.loadKg || ""}
                        onChange={(e) => updateExercise(weekIndex, dayIndex, idx, "loadKg", Number(e.target.value))}
                        className="h-9 transition-all text-center text-sm font-mono font-bold border"
                        style={{
                          backgroundColor: theme.background + "60",
                          borderColor: theme.border + "40",
                          color: theme.primary,
                        }}
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <RPENotes weekIndex={weekIndex} dayIndex={dayIndex} exerciseIndex={idx} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AICoachPanel dayData={day} apiKey={state?.anthropicApiKey || null} />

      <HabitRecoveryTracker weekId={weekId} dayId={dayId} />
    </>
  )
})
