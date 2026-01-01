"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator } from "lucide-react"

export function RPECalculator() {
  const [weight, setWeight] = useState<number>(100)
  const [reps, setReps] = useState<number>(5)
  const [rpe, setRPE] = useState<number>(8)

  const repsInReserve = 10 - rpe
  const estimatedMax = weight * (1 + (reps + repsInReserve) * 0.0333)
  const percentages = [95, 90, 85, 80, 75, 70]

  return (
    <div className="border bg-card p-8 shadow-none" id="rpe-calculator">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
          <Calculator className="w-3.5 h-3.5" />
          Load Projection Engine
        </h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Input Parameters</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase tracking-widest">Gross Load (KG)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="h-12 text-center text-lg font-bold border bg-background rounded-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase tracking-widest">Reps</Label>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="h-12 text-center text-lg font-bold border bg-background rounded-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase tracking-widest">RPE</Label>
                <Input
                  type="number"
                  value={rpe}
                  onChange={(e) => setRPE(Number(e.target.value))}
                  className="h-12 text-center text-lg font-bold border bg-background rounded-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border border-primary/20 bg-primary/5">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-2">Estimated 1RM</p>
          <div className="text-5xl font-bold tracking-tighter">
            {estimatedMax.toFixed(1)} <span className="text-xl text-muted-foreground">KG</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Intensity Brackets</p>
          <div className="grid grid-cols-2 gap-2">
            {percentages.map((pct) => (
              <div key={pct} className="flex justify-between items-center p-4 border bg-background/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{pct}%</span>
                <span className="text-xs font-bold text-primary">{(estimatedMax * (pct / 100)).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
