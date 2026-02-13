"use client"

import { useMemo, useRef, memo } from "react"
import { usePlanner } from "@/hooks/use-planner"
import { DailyLog } from "./daily-log"
import { WeekHeader } from "./week-header"
import { CoreMetrics } from "./core-metrics"
import { CommandCenter } from "./command-center"
import { ThemeSwitcher } from "./theme-switcher"
import { RPEScaleGuide } from "./rpe-scale-guide"
import { RPECalculator } from "./rpe-calculator"
import { VisionBoard } from "./vision-board"
import { ProgressPhotos } from "./progress-photos"
import { WeeklyReview } from "./weekly-review"

import { FrameworkSettings } from "./framework-settings"

// Memoize section components
const MemoizedCommandCenter = memo(CommandCenter)
const MemoizedFrameworkSettings = memo(FrameworkSettings)
const MemoizedThemeSwitcher = memo(ThemeSwitcher)
const MemoizedCoreMetrics = memo(CoreMetrics)
const MemoizedVisionBoard = memo(VisionBoard)
const MemoizedProgressPhotos = memo(ProgressPhotos)
const MemoizedRPEScaleGuide = memo(RPEScaleGuide)
const MemoizedRPECalculator = memo(RPECalculator)
const MemoizedWeekHeader = memo(WeekHeader)
const MemoizedWeeklyReview = memo(WeeklyReview)

type ListItem =
  | { type: "command-center" }
  | { type: "framework-settings" }
  | { type: "theme-switcher" }
  | { type: "metrics" }
  | { type: "vision-board" }
  | { type: "progress-photos" }
  | { type: "rpe-guide" }
  | { type: "rpe-calculator" }
  | { type: "week-header"; weekId: string }
  | { type: "day"; dayId: string; weekId: string }
  | { type: "week-review"; weekId: string }

export function PlannerList() {
  const { state, isLoading } = usePlanner()
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => {
    const list: ListItem[] = [
      { type: "command-center" },
      { type: "framework-settings" },
      { type: "theme-switcher" },
      { type: "metrics" },
      { type: "vision-board" },
      { type: "progress-photos" },
      { type: "rpe-guide" },
      { type: "rpe-calculator" },
    ]

    if (state && state.weeks && state.weeks.length > 0) {
      state.weeks.forEach((week) => {
        list.push({ type: "week-header", weekId: week.id })
        week.days.forEach((day) => {
          list.push({ type: "day", dayId: day.id, weekId: week.id })
        })
        list.push({ type: "week-review", weekId: week.id })
      })
    }

    return list
  }, [state])

  if (isLoading || !state || !state.weeks) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Initializing Transformation Protocol...</div>
      </div>
    )
  }

  return (
    <div ref={listRef} className="max-w-5xl mx-auto px-4 pb-32" id="planner-content">
      <div className="w-full relative">
        {items.map((item, index) => {
          const isDividerNeeded =
            index > 0 &&
            (items[index - 1].type === "rpe-calculator" ||
              (item.type === "week-header" && items[index - 1].type !== "week-review"))

          return (
            <div key={`${item.type}-${index}`} className="w-full">
              {isDividerNeeded && (
                <div className="my-20 h-px bg-border max-w-xs mx-auto opacity-30" />
              )}
              <div className="pb-12">
                {item.type === "command-center" && <MemoizedCommandCenter />}
                {item.type === "framework-settings" && <MemoizedFrameworkSettings />}
                {item.type === "theme-switcher" && <MemoizedThemeSwitcher />}
                {item.type === "metrics" && <MemoizedCoreMetrics />}
                {item.type === "vision-board" && <MemoizedVisionBoard />}
                {item.type === "progress-photos" && <MemoizedProgressPhotos />}
                {item.type === "rpe-guide" && <MemoizedRPEScaleGuide />}
                {item.type === "rpe-calculator" && <MemoizedRPECalculator />}
                {item.type === "week-header" && <MemoizedWeekHeader weekId={item.weekId} />}
                {item.type === "day" && <DailyLog dayId={item.dayId} weekId={item.weekId} />}
                {item.type === "week-review" && <MemoizedWeeklyReview weekId={item.weekId} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
