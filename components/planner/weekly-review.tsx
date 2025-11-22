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
    <Card
      className="backdrop-blur border mt-8"
      style={{
        backgroundColor: theme.surface + "E6",
        borderColor: theme.border + "80",
      }}
    >
      <CardHeader style={{ borderBottom: `2px solid ${theme.border}60` }}>
        <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
          <LineChart className="w-5 h-5" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>Weekly Review & Strategy Session</span>
        </CardTitle>
        <p className="text-xs font-mono mt-2 leading-relaxed" style={{ color: theme.text + "CC" }}>
          Reflection drives adaptation. Analyze your week, identify patterns, and strategize for continuous improvement.
          This is where champions are made.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {reviewFields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-3">
            <Label
              className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2"
              style={{ color: theme.accent }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              {label}
            </Label>
            <Textarea
              value={week.review?.[key] || ""}
              onChange={(e) => {
                const newReview = { ...week.review, [key]: e.target.value }
                updateWeekReview(weekIndex, newReview)
              }}
              placeholder={placeholder}
              className="min-h-[100px] resize-none text-sm font-mono leading-relaxed border"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
                color: theme.text,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
