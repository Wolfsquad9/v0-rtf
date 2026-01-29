"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePlanner } from "@/hooks/use-planner"

export function CoreMetrics() {
  const { state, updateMetric } = usePlanner()

  if (!state) return null

  const metrics = state.coreMetrics || {}

  const metricFields = [
    { id: "heightCm", label: "Height (cm)", value: metrics.heightCm },
    { id: "weightKg", label: "Weight (kg)", value: metrics.weightKg },
    { id: "bodyfat", label: "Body Fat %", value: metrics.bodyfat },
    { id: "chest", label: "Chest (cm)", value: metrics.chest },
    { id: "waist", label: "Waist (cm)", value: metrics.waist },
    { id: "arms", label: "Arms (cm)", value: metrics.arms },
    { id: "legs", label: "Legs (cm)", value: metrics.legs },
  ]

  return (
    <div className="border bg-card p-8 shadow-none" id="metrics">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Biometric Tracking Profile</h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
        {metricFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              {field.label}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={field.value || ""}
              onChange={(e) => updateMetric(field.id as any, Number(e.target.value))}
              className="h-10 text-xs font-bold uppercase tracking-wider bg-background border rounded-none focus-visible:ring-primary/20"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
