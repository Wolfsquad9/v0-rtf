"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { Gauge } from "lucide-react"

const RPE_DESCRIPTIONS = [
  { rpe: 10, desc: "Maximum effort - couldn't do another rep", intensity: "MAX" },
  { rpe: 9, desc: "Could do 1 more rep", intensity: "EXTREME" },
  { rpe: 8, desc: "Could do 2-3 more reps", intensity: "VERY HARD" },
  { rpe: 7, desc: "Could do 3-4 more reps", intensity: "HARD" },
  { rpe: 6, desc: "Moderate effort, sustainable", intensity: "MODERATE" },
  { rpe: 5, desc: "Light effort, easy conversation", intensity: "LIGHT" },
  { rpe: 4, desc: "Very light, warmup intensity", intensity: "WARMUP" },
  { rpe: 3, desc: "Minimal effort", intensity: "MINIMAL" },
  { rpe: 2, desc: "Almost no effort", intensity: "RECOVERY" },
  { rpe: 1, desc: "No effort at all", intensity: "REST" },
]

export function RPEScaleGuide() {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  return (
    <Card
      className="backdrop-blur border"
      id="rpe-guide"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader style={{ borderBottom: `1px solid ${theme.border}40` }}>
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Gauge className="w-4 h-4" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>RPE Scale Reference Guide</span>
        </CardTitle>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.text + "CC" }}>
          Rate of Perceived Exertion (RPE) - Your primary tool for tracking intensity. Use this to optimize progression
          and manage recovery across your training cycle.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-2">
        {RPE_DESCRIPTIONS.map(({ rpe, desc, intensity }, idx) => {
          const isNewRange = rpe === 10 || rpe === 7 || rpe === 4
          return (
            <div key={rpe}>
              {isNewRange && idx > 0 && <div className="my-3 border-b" style={{ borderColor: theme.border + "30" }} />}
              <div
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: theme.background + "60",
                  borderColor: theme.border + "30",
                }}
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center font-mono font-black text-2xl shrink-0 transition-all"
                  style={{
                    backgroundColor: theme.primary + "20",
                    color: theme.primary,
                    border: `2px solid ${theme.border}60`,
                  }}
                >
                  {rpe}
                </div>
                <div className="flex-1">
                  <div
                    className="text-xs font-mono font-bold uppercase tracking-wide mb-1.5"
                    style={{ color: theme.accent }}
                  >
                    {intensity}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: theme.text + "DD" }}>
                    {desc}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
