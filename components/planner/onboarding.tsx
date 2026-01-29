"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrainingFrameworkId } from "@/types/planner"
import { Shield, Zap, Target, Activity } from "lucide-react"

const FRAMEWORKS = [
  {
    id: "strength-lp",
    name: "Strength Linear Progression",
    description: "Prioritize consistent load increases. Ideal for rapid strength development.",
    icon: Activity,
    rules: "Progression: Load focus. Fatigue: Moderate. Aggressiveness: High.",
  },
  {
    id: "powerlifting",
    name: "Powerlifting",
    description: "Intensity waves and peaking protocols. Focused on 1RM performance.",
    icon: Target,
    rules: "Progression: Intensity waves. Fatigue: Managed. Aggressiveness: Calculated.",
  },
  {
    id: "hypertrophy",
    name: "Hypertrophy",
    description: "Prioritize volume accumulation and density. Ideal for muscular adaptation.",
    icon: Zap,
    rules: "Progression: Volume focus. Fatigue: High tolerance. Aggressiveness: Moderate.",
  },
  {
    id: "sc",
    name: "Strength & Conditioning",
    description: "Density and work capacity adjustments. Versatile performance protocol.",
    icon: Shield,
    rules: "Progression: Density/Capacity. Fatigue: Variable. Aggressiveness: Adaptive.",
  },
]

interface OnboardingProps {
  onSelect: (frameworkId: TrainingFrameworkId) => void
}

export function Onboarding({ onSelect }: OnboardingProps) {
  const [selected, setSelected] = useState<TrainingFrameworkId | null>(null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold uppercase tracking-[0.4em] text-primary">System Initialization</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Select training framework to establish operational constraints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FRAMEWORKS.map((f) => {
            const Icon = f.icon
            const isActive = selected === f.id
            return (
              <Card
                key={f.id}
                className={`cursor-pointer transition-all border-2 rounded-none ${
                  isActive ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"
                }`}
                onClick={() => setSelected(f.id as TrainingFrameworkId)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                    <CardTitle className="text-xs font-bold uppercase tracking-widest">{f.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wider">
                    {f.description}
                  </p>
                  <div className="pt-4 border-t border-dashed border-border/40">
                    <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Protocol Rules:</p>
                    <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest leading-tight mt-1">
                      {f.rules}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="text-[9px] font-bold text-destructive uppercase tracking-widest text-center max-w-md">
            Warning: Changing framework post-initialization forces a re-baseline and clears all future predictions.
          </p>
          <Button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="w-full max-w-sm h-14 rounded-none uppercase tracking-[0.4em] font-bold text-xs"
          >
            Deploy Protocol
          </Button>
        </div>
      </div>
    </div>
  )
}
