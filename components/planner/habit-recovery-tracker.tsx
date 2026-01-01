"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { Heart, Droplet, Moon, Apple, Brain, Dumbbell } from "lucide-react"

interface HabitRecoveryTrackerProps {
  weekId: string
  dayId: string
}

export function HabitRecoveryTracker({ weekId, dayId }: HabitRecoveryTrackerProps) {
  const { state, updateDay } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  if (!state) return null

  const weekIndex = state.weeks.findIndex((w) => w.id === weekId)
  const week = state.weeks[weekIndex]
  if (!week) return null

  const dayIndex = week.days.findIndex((d) => d.id === dayId)
  const day = week.days[dayIndex]
  if (!day) return null

  const habits = [
    { key: "water", label: "Hydration (2L+)", icon: Droplet },
    { key: "sleep", label: "Quality Sleep (7h+)", icon: Moon },
    { key: "nutrition", label: "Nutrition On Point", icon: Apple },
    { key: "mobility", label: "Mobility Work", icon: Dumbbell },
    { key: "mindfulness", label: "Mindfulness Practice", icon: Brain },
    { key: "recovery", label: "Active Recovery", icon: Heart },
  ]

  return (
    <div className="border bg-card mt-6">
      <div className="p-6 border-b flex flex-col gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Heart className="w-3.5 h-3.5" />
          Recovery Protocol
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Optimal adaptation requires disciplined recovery
        </p>
      </div>
      <div className="p-6 space-y-8">
        {/* Habits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {habits.map(({ key, label, icon: Icon }) => {
            const checked = day.habits?.[key] || false
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center space-x-3 p-4 border transition-colors cursor-pointer",
                  checked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                )}
                onClick={() => {
                  const newHabits = { ...day.habits, [key]: !checked }
                  updateDay(weekIndex, dayIndex, { habits: newHabits })
                }}
              >
                <div className="flex-1 flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", checked ? "text-primary" : "text-muted-foreground/30")} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", checked ? "text-foreground" : "text-muted-foreground/50")}>
                    {label}
                  </span>
                </div>
                {checked && <div className="w-1.5 h-1.5 bg-primary" />}
              </div>
            )
          })}
        </div>

        {/* Recovery Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Sleep Duration
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.sleepHours || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { sleepHours: Number(e.target.value) })}
              className="h-10 text-center text-xs font-bold bg-background border rounded-none"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Hydration (L)
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.waterIntake || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { waterIntake: Number(e.target.value) })}
              className="h-10 text-center text-xs font-bold bg-background border rounded-none"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Stress (1-10)
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={day.stressLevel || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { stressLevel: Number(e.target.value) })}
              className="h-10 text-center text-xs font-bold bg-background border rounded-none"
              placeholder="5"
            />
          </div>
        </div>

        {/* Recovery Notes */}
        <div className="space-y-2 pt-6 border-t">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Protocol Notes
          </Label>
          <Textarea
            value={day.recoveryNotes || ""}
            onChange={(e) => updateDay(weekIndex, dayIndex, { recoveryNotes: e.target.value })}
            placeholder="Document recovery state and wellness metrics..."
            className="min-h-[80px] resize-none text-[10px] font-bold uppercase tracking-widest bg-background border rounded-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
