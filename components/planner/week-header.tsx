"use client"

import { Input } from "@/components/ui/input"
import { usePlanner } from "@/hooks/use-planner"
import { format, addDays } from "date-fns"

interface WeekHeaderProps {
  weekId: string
}

export function WeekHeader({ weekId }: WeekHeaderProps) {
  const { state, updateWeekObjective } = usePlanner()

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  return (
    <div className="border bg-muted/30 p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Phase {weekIndex + 1} // 12
          </p>
          <Input
            value={week.objective || ""}
            onChange={(e) => updateWeekObjective(weekIndex, e.target.value)}
            placeholder="PRIMARY MISSION OBJECTIVE"
            className="bg-transparent border-none p-0 h-auto text-3xl md:text-4xl font-bold uppercase tracking-tighter placeholder:text-muted-foreground/10 focus-visible:ring-0"
          />
        </div>
        <div className="text-left md:text-right space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Timeline Allocation</p>
          <p className="text-[11px] font-bold uppercase tracking-widest">
            {format(new Date(week.startDate), "MMM dd")} — {format(addDays(new Date(week.startDate), 6), "MMM dd")}
          </p>
        </div>
      </div>
    </div>
  )
}
