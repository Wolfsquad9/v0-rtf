"use client"

import { usePlanner } from "@/hooks/use-planner"
import { LineChart } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TrendingUp, AlertCircle, Target } from "lucide-react"

interface WeeklyReviewProps {
  weekId: string
}

export function WeeklyReview({ weekId }: WeeklyReviewProps) {
  const { state, updateWeekReview } = usePlanner()

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const reviewFields = [
    {
      key: "wins",
      label: "Mission Successes",
      icon: TrendingUp,
      placeholder: "DOCUMENT WEEKLY VICTORIES...",
    },
    {
      key: "challenges",
      label: "Operational Constraints",
      icon: AlertCircle,
      placeholder: "IDENTIFY PERFORMANCE BOTTLENECKS...",
    },
    {
      key: "adjustments",
      label: "Strategic Modifications",
      icon: LineChart,
      placeholder: "DEFINE PROTOCOL EVOLUTION...",
    },
    {
      key: "nextWeek",
      label: "Next Phase Objective",
      icon: Target,
      placeholder: "ESTABLISH PRIMARY TARGETS...",
    },
  ]

  return (
    <div className="border bg-card mt-16 shadow-none">
      <div className="p-8 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 text-primary">
          <LineChart className="w-4 h-4" />
          Weekly Performance Review
        </h3>
        <div className="h-px flex-1 mx-8 bg-border opacity-30" />
      </div>
      <div className="p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {reviewFields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-3">
              <Label className="text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-muted-foreground/60">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Label>
              <Textarea
                value={(week.review as any)?.[key] || ""}
                onChange={(e) => {
                  const newReview = { ...week.review, [key]: e.target.value }
                  updateWeekReview(weekIndex, newReview as any)
                }}
                placeholder={placeholder}
                className="min-h-[140px] resize-none text-[11px] font-bold uppercase tracking-widest bg-background border rounded-none leading-relaxed placeholder:text-muted-foreground/10 focus-visible:ring-primary/20"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
