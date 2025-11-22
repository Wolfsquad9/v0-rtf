"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"

interface WeekHeaderProps {
  weekId: string
}

export function WeekHeader({ weekId }: WeekHeaderProps) {
  const { state, updateWeekObjective } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const weekNumber = weekIndex + 1
  const progressPercent = Number.parseFloat(((weekNumber / state.weeks.length) * 100).toFixed(0))

  return (
    <div className="pt-8 pb-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Training Phase
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: theme.text }}>
              WEEK {weekNumber}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: theme.text + "99" }}>
              Program Progress
            </div>
            <div className="text-3xl font-black" style={{ color: theme.primary }}>
              {progressPercent}%
            </div>
          </div>
        </div>

        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{
            backgroundColor: theme.border + "40",
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: theme.primary,
              boxShadow: `0 0 12px ${theme.primary}80`,
            }}
          />
        </div>
      </div>

      {/* Objective Card */}
      <Card
        className="backdrop-blur border transition-all duration-200"
        style={{
          backgroundColor: theme.surface + "80",
          borderColor: theme.border + "60",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider" style={{ color: theme.accent }}>
            Weekly Objective & Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor={`week-${weekId}-objective`} className="sr-only">
              Objective
            </Label>
            <Textarea
              id={`week-${weekId}-objective`}
              placeholder="What is your main goal this week? (e.g., Progressive overload on squats, Focus on recovery, Master form on new movements)"
              value={week.objective || ""}
              onChange={(e) => updateWeekObjective(weekIndex, e.target.value)}
              className="min-h-[80px] resize-none text-sm font-mono transition-colors duration-200 focus:ring-1"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
