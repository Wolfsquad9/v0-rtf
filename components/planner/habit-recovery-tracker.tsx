"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePlanner } from "@/hooks/use-planner"
import { Heart, Droplet, Moon, Apple, Brain, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitRecoveryTrackerProps {
  weekId: string
  dayId: string
}

export function HabitRecoveryTracker({ weekId, dayId }: HabitRecoveryTrackerProps) {
  const { state, updateDay } = usePlanner()

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const dayIndex = week.days.findIndex((d) => d.id === dayId)
  const day = week.days[dayIndex]
  if (!day) return null

  const habits = [
    { key: "water", label: "Hydration // 2L+", icon: Droplet },
    { key: "sleep", label: "Recovery // 7H+", icon: Moon },
    { key: "nutrition", label: "Nutrition // Optimal", icon: Apple },
    { key: "mobility", label: "Joint Health // Active", icon: Dumbbell },
    { key: "mindfulness", label: "Neural State // Focused", icon: Brain },
    { key: "recovery", label: "Active Protocol", icon: Heart },
  ]

  return (
    <div className="border bg-card mt-6 shadow-none">
      <div className="p-8 border-b flex flex-col gap-2 bg-muted/10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
          <Heart className="w-3.5 h-3.5" />
          Operational Recovery Protocol
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          Biological systems require disciplined adaptation windows
        </p>
      </div>
      <div className="p-8 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {habits.map(({ key, label, icon: Icon }) => {
            const habitsObj = day.habits as any
            const checked = habitsObj?.[key] || false
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center space-x-4 p-5 border transition-all cursor-pointer group",
                  checked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50 border-border/60"
                )}
                onClick={() => {
                  const newHabits = { ...(day.habits || {}), [key]: !checked }
                  updateDay(weekIndex, dayIndex, { habits: newHabits as any })
                }}
              >
                <div className="flex-1 flex items-center gap-4">
                  <Icon className={cn("w-4 h-4 transition-colors", checked ? "text-primary" : "text-muted-foreground/20 group-hover:text-muted-foreground/40")} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", checked ? "text-foreground" : "text-muted-foreground/40 group-hover:text-muted-foreground/60")}>
                    {label}
                  </span>
                </div>
                {checked && <div className="w-1 h-1 bg-primary" />}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-dashed">
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Sleep Quantity (H)
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.sleepHours || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { sleepHours: Number(e.target.value) })}
              className="h-11 text-center text-xs font-bold bg-background border rounded-none focus-visible:ring-primary/10"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Hydration Vol (L)
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.waterIntake || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { waterIntake: Number(e.target.value) })}
              className="h-11 text-center text-xs font-bold bg-background border rounded-none focus-visible:ring-primary/10"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Neural Load (1-10)
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={day.stressLevel || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { stressLevel: Number(e.target.value) })}
              className="h-11 text-center text-xs font-bold bg-background border rounded-none focus-visible:ring-primary/10"
              placeholder="5"
            />
          </div>
        </div>

        <div className="space-y-2 pt-8 border-t border-dashed">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Wellness Log // Recovery Dynamics
          </Label>
          <Textarea
            value={day.recoveryNotes || ""}
            onChange={(e) => updateDay(weekIndex, dayIndex, { recoveryNotes: e.target.value })}
            placeholder="DOCUMENT PHYSIOLOGICAL FEEDBACK AND RECOVERY STATUS..."
            className="min-h-[100px] resize-none text-[10px] font-bold uppercase tracking-widest bg-background border rounded-none leading-relaxed placeholder:text-muted-foreground/10"
          />
        </div>
      </div>
    </div>
  )
}
