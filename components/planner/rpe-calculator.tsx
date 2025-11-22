"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { Calculator } from "lucide-react"

export function RPECalculator() {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  const [weight, setWeight] = useState<number>(100)
  const [reps, setReps] = useState<number>(5)
  const [rpe, setRPE] = useState<number>(8)

  // RPE-based 1RM calculation
  const repsInReserve = 10 - rpe
  const estimatedMax = weight * (1 + (reps + repsInReserve) * 0.0333)

  const percentages = [95, 90, 85, 80, 75, 70, 65, 60]

  return (
    <Card
      className="backdrop-blur border"
      id="rpe-calculator"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader style={{ borderBottom: `1px solid ${theme.border}40` }}>
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>RPE-Based Training Calculator</span>
        </CardTitle>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.text + "CC" }}>
          Calculate your estimated 1RM and training loads based on RPE. Input your current working weight, reps, and
          perceived effort.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Working Set Load section */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: theme.accent }}>
            Working Set Load
          </div>
          <div className="grid grid-cols-3 gap-4 pb-4 border-b" style={{ borderColor: theme.border + "40" }}>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                Weight (kg)
              </Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="h-11 font-mono text-center text-lg font-bold border px-3 py-2.5"
                style={{
                  backgroundColor: theme.background + "80",
                  borderColor: theme.border + "60",
                  color: theme.text,
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                Reps
              </Label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="h-11 font-mono text-center text-lg font-bold border px-3 py-2.5"
                style={{
                  backgroundColor: theme.background + "80",
                  borderColor: theme.border + "60",
                  color: theme.text,
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                Target RPE
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRPE(Number(e.target.value))}
                className="h-11 font-mono text-center text-lg font-bold border px-3 py-2.5"
                style={{
                  backgroundColor: theme.background + "80",
                  borderColor: theme.border + "60",
                  color: theme.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* Estimated Max Effort section */}
        <div className="pt-2">
          <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: theme.accent }}>
            Estimated Max Effort
          </div>
          <div
            className="p-6 rounded-lg border text-center"
            style={{
              backgroundColor: theme.primary + "15",
              borderColor: theme.primary + "40",
            }}
          >
            <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: theme.accent }}>
              1 Rep Max
            </div>
            <div className="text-4xl font-mono font-black" style={{ color: theme.primary }}>
              {estimatedMax.toFixed(1)} <span className="text-2xl">kg</span>
            </div>
          </div>
        </div>

        {/* Recommended Training Loads section */}
        <div className="space-y-2 pt-4 border-t" style={{ borderColor: theme.border + "40" }}>
          <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: theme.accent }}>
            Recommended Training Loads
          </div>
          <div className="grid grid-cols-2 gap-2">
            {percentages.map((pct) => (
              <div
                key={pct}
                className="flex justify-between items-center px-4 py-3 rounded-lg font-mono border"
                style={{
                  backgroundColor: theme.background + "80",
                  borderColor: theme.border + "40",
                }}
              >
                <span className="text-sm font-bold" style={{ color: theme.text + "CC" }}>
                  {pct}%
                </span>
                <span className="text-base font-bold" style={{ color: theme.primary }}>
                  {(estimatedMax * (pct / 100)).toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
