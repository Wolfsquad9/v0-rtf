"use client"

import { useMemo, useRef } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
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
import { getThemeColors } from "@/lib/themes"

type ListItem =
  | { type: "command-center" }
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
  const theme = state ? getThemeColors(state.theme) : getThemeColors("dark-knight")

  const items = useMemo(() => {
    const list: ListItem[] = [
      { type: "command-center" },
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

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) => {
      const item = items[index]
      if (item.type === "command-center") return 300
      if (item.type === "theme-switcher") return 200
      if (item.type === "metrics") return 400
      if (item.type === "vision-board") return 500
      if (item.type === "progress-photos") return 600
      if (item.type === "rpe-guide") return 800
      if (item.type === "rpe-calculator") return 700
      if (item.type === "week-header") return 250
      if (item.type === "week-review") return 800
      return 1400
    },
    overscan: 2,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  if (isLoading || !state || !state.weeks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground font-mono animate-pulse">Loading planner...</div>
      </div>
    )
  }

  return (
    <div ref={listRef} className="max-w-5xl mx-auto px-4 pb-20" id="planner-content">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]
          const isDividerNeeded =
            virtualItem.index > 0 &&
            (items[virtualItem.index - 1].type === "rpe-calculator" ||
              (items[virtualItem.index].type === "week-header" && items[virtualItem.index - 1].type !== "week-review"))

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {/* Visual divider before major sections */}
              {isDividerNeeded && (
                <div className="my-10 h-px bg-border max-w-xs mx-auto opacity-50" />
              )}
              <div className="pb-8">
                {item.type === "command-center" && <CommandCenter />}
                {item.type === "theme-switcher" && <ThemeSwitcher />}
                {item.type === "metrics" && <CoreMetrics />}
                {item.type === "vision-board" && <VisionBoard />}
                {item.type === "progress-photos" && <ProgressPhotos />}
                {item.type === "rpe-guide" && <RPEScaleGuide />}
                {item.type === "rpe-calculator" && <RPECalculator />}
                {item.type === "week-header" && <WeekHeader weekId={item.weekId} />}
                {item.type === "day" && <DailyLog dayId={item.dayId} weekId={item.weekId} />}
                {item.type === "week-review" && <WeeklyReview weekId={item.weekId} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
