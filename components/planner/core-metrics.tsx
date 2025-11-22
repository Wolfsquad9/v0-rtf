"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePlanner } from "@/hooks/use-planner"
import { getThemeColors } from "@/lib/themes"

export function CoreMetrics() {
  const { state, updateMetric } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const metrics = state.coreMetrics || {}

  return (
    <Card
      className="backdrop-blur border mb-8"
      id="metrics"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader
        className="pb-4"
        style={{
          borderBottom: `1px solid ${theme.border}40`,
        }}
      >
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          <span style={{ color: theme.accent }}>Core Metrics & Body Measurements</span>
        </CardTitle>
        <p className="text-xs mt-2" style={{ color: theme.text + "99" }}>
          Track your starting and ongoing body composition metrics for quantifiable progress
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="height"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              value={metrics.heightCm || ""}
              onChange={(e) => updateMetric("heightCm", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="weight"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={metrics.weightKg || ""}
              onChange={(e) => updateMetric("weightKg", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.primary,
              }}
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="bodyfat"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Body Fat %
            </Label>
            <Input
              id="bodyfat"
              type="number"
              value={metrics.bodyfat || ""}
              onChange={(e) => updateMetric("bodyfat", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="chest"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Chest (cm)
            </Label>
            <Input
              id="chest"
              type="number"
              value={metrics.chest || ""}
              onChange={(e) => updateMetric("chest", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="waist"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Waist (cm)
            </Label>
            <Input
              id="waist"
              type="number"
              value={metrics.waist || ""}
              onChange={(e) => updateMetric("waist", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="arms"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Arms (cm)
            </Label>
            <Input
              id="arms"
              type="number"
              value={metrics.arms || ""}
              onChange={(e) => updateMetric("arms", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="legs"
              className="text-[10px] uppercase tracking-widest font-mono"
              style={{ color: theme.accent }}
            >
              Legs (cm)
            </Label>
            <Input
              id="legs"
              type="number"
              value={metrics.legs || ""}
              onChange={(e) => updateMetric("legs", Number(e.target.value))}
              className="h-9 text-sm font-mono"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "60",
                color: theme.text,
              }}
              placeholder="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
