"use client"

import { usePlanner } from "@/hooks/use-planner"
import { Gauge } from "lucide-react"

const RPE_DESCRIPTIONS = [
  { rpe: 10, desc: "MAXIMUM EFFORT - ZERO REPS REMAINING", intensity: "CRITICAL" },
  { rpe: 9, desc: "EXTREME EFFORT - 1 REP REMAINING", intensity: "ELITE" },
  { rpe: 8, desc: "VERY HARD - 2 REPS REMAINING", intensity: "HEAVY" },
  { rpe: 7, desc: "HARD - 3-4 REPS REMAINING", intensity: "INTENSE" },
  { rpe: 6, desc: "MODERATE EFFORT - SUSTAINABLE", intensity: "STABLE" },
  { rpe: 5, desc: "LIGHT EFFORT - RECOVERY PACE", intensity: "MINIMAL" },
]

export function RPEScaleGuide() {
  const { state } = usePlanner()

  return (
    <div className="border bg-card p-8 shadow-none" id="rpe-guide">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
          <Gauge className="w-3.5 h-3.5" />
          Operational Intensity Index (RPE)
        </h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {RPE_DESCRIPTIONS.map(({ rpe, desc, intensity }) => (
          <div key={rpe} className="flex items-center gap-6 p-6 bg-card transition-colors hover:bg-muted/20">
            <div className="w-12 h-12 border border-primary/20 flex items-center justify-center text-xl font-bold bg-muted/30">
              {rpe}
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60">{intensity}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
