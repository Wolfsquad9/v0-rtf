"use client"

import { usePlanner } from "@/hooks/use-planner"
import { TrainingFramework } from "@/types/planner"
import { FRAMEWORK_CONFIGS } from "@/types/progression"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Target, Zap, Shield, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const FRAMEWORK_METADATA = {
  [TrainingFramework.STRENGTH_LINEAR]: {
    name: "Strength Linear Progression",
    icon: Activity,
    description: "Prioritize consistent load increases. Ideal for rapid strength development.",
  },
  [TrainingFramework.POWERLIFTING]: {
    name: "Powerlifting",
    icon: Target,
    description: "Intensity waves and peaking protocols. Focused on 1RM performance.",
  },
  [TrainingFramework.HYPERTROPHY]: {
    name: "Hypertrophy",
    icon: Zap,
    description: "Prioritize volume accumulation and density. Ideal for muscular adaptation.",
  },
  [TrainingFramework.STRENGTH_CONDITIONING]: {
    name: "Strength & Conditioning",
    icon: Shield,
    description: "Density and work capacity adjustments. Versatile performance protocol.",
  },
}

export function FrameworkSettings() {
  const { state, changeFramework } = usePlanner()
  if (!state) return null

  return (
    <div className="border bg-card p-8 shadow-none" id="framework-settings">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Operational Protocol Constraints</h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.values(TrainingFramework) as TrainingFramework[]).map((fw) => {
          const meta = FRAMEWORK_METADATA[fw]
          const config = FRAMEWORK_CONFIGS[fw]
          const isActive = state.framework === fw
          const Icon = meta.icon

          return (
            <Card
              key={fw}
              className={cn(
                "rounded-none border-2 transition-all",
                isActive ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground/40")} />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest">{meta.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider">
                  {meta.description}
                </p>
                <div className="pt-4 border-t border-dashed border-border/40 space-y-2">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Target RPE:</span>
                    <span className="text-primary">{config.targetRpe}</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Increment:</span>
                    <span className="text-primary">+{config.loadIncrementKg}kg</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Rep Range:</span>
                    <span className="text-primary">{config.repRange.min}-{config.repRange.max}</span>
                  </div>
                </div>
                {!isActive && (
                  <Button
                    variant="outline"
                    className="w-full h-8 rounded-none border-primary/20 hover:border-primary text-[8px] font-bold uppercase tracking-widest"
                    onClick={() => changeFramework(fw)}
                  >
                    Switch Protocol
                  </Button>
                )}
                {isActive && (
                  <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-primary">
                    <span className="w-1 h-1 bg-primary animate-pulse rounded-full" />
                    Active Protocol
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-4 border border-destructive/20 bg-destructive/5 flex items-start gap-4">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-destructive uppercase tracking-widest">Strategic Warning</p>
          <p className="text-[9px] text-destructive/70 uppercase tracking-widest leading-relaxed">
            Changing the training framework will immediately clear all future session predictions and force a full system re-baseline. This action is irreversible.
          </p>
        </div>
      </div>
    </div>
  )
}
