"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { LineChart, Target, AlertCircle, TrendingUp } from "lucide-react"

interface WeeklyReviewProps {
  weekId: string
}

export function WeeklyReview({ weekId }: WeeklyReviewProps) {
  const { state, updateWeekReview } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const reviewFields = [
    {
      key: "wins",
      label: "Weekly Wins & Achievements",
      icon: TrendingUp,
      placeholder: "What went well? PRs hit? Consistency maintained? New skills mastered?",
    },
    {
      key: "challenges",
      label: "Challenges & Obstacles",
      icon: AlertCircle,
      placeholder: "What held you back? Technical issues? Recovery problems? Time constraints?",
    },
    {
      key: "adjustments",
      label: "Strategic Adjustments",
      icon: LineChart,
      placeholder: "What needs to change? Volume adjustments? Exercise swaps? Recovery protocols?",
    },
    {
      key: "nextWeek",
      label: "Next Week Strategy",
      icon: Target,
      placeholder: "Primary focus? Intensity targets? Specific goals to accomplish?",
    },
  ]

  return (
    <div className="border bg-card mt-12 shadow-none">
      <div className="p-6 border-b bg-muted/30">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
          <LineChart className="w-4 h-4" />
          Weekly Strategy Session
        </h3>
      </div>
      <div className="p-6 space-y-8">
        {reviewFields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-3">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Label>
            <Textarea
              value={week.review?.[key] || ""}
              onChange={(e) => {
                const newReview = { ...week.review, [key]: e.target.value }
                updateWeekReview(weekIndex, newReview)
              }}
              placeholder={placeholder}
              className="min-h-[120px] resize-none text-xs font-bold uppercase tracking-widest bg-background border rounded-none leading-relaxed placeholder:text-muted-foreground/30"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
