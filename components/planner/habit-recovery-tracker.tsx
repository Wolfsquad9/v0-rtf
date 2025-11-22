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
    <Card
      className="backdrop-blur border mt-6"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader style={{ borderBottom: `1px solid ${theme.border}40` }}>
        <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>Habit & Recovery Tracker</span>
        </CardTitle>
        <p className="text-xs font-mono mt-2" style={{ color: theme.text + "99" }}>
          Elite performance is built on consistent daily habits. Track your recovery protocols here.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Habits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {habits.map(({ key, label, icon: Icon }) => {
            const checked = day.habits?.[key] || false
            return (
              <div
                key={key}
                className="flex items-center space-x-3 p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  backgroundColor: checked ? theme.primary + "20" : "transparent",
                  borderColor: checked ? theme.primary + "60" : theme.border + "40",
                }}
                onClick={() => {
                  const newHabits = { ...day.habits, [key]: !checked }
                  updateDay(weekIndex, dayIndex, { habits: newHabits })
                }}
              >
                <Checkbox
                  id={`${day.id}-${key}`}
                  checked={checked}
                  onCheckedChange={(c) => {
                    const newHabits = { ...day.habits, [key]: !!c }
                    updateDay(weekIndex, dayIndex, { habits: newHabits })
                  }}
                  style={{
                    borderColor: checked ? theme.primary : theme.border,
                  }}
                />
                <div className="flex-1 flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: checked ? theme.primary : theme.text + "66" }} />
                  <Label
                    htmlFor={`${day.id}-${key}`}
                    className="text-xs font-medium font-mono cursor-pointer"
                    style={{ color: checked ? theme.text : theme.text + "99" }}
                  >
                    {label}
                  </Label>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recovery Metrics */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
          style={{ borderTop: `1px solid ${theme.border}40` }}
        >
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Sleep Hours
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.sleepHours || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { sleepHours: Number(e.target.value) })}
              className="h-10 text-center font-mono font-bold border"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
                color: theme.primary,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Water (Liters)
            </Label>
            <Input
              type="number"
              step="0.5"
              value={day.waterIntake || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { waterIntake: Number(e.target.value) })}
              className="h-10 text-center font-mono font-bold border"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
                color: theme.primary,
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
              Stress Level (1-10)
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={day.stressLevel || ""}
              onChange={(e) => updateDay(weekIndex, dayIndex, { stressLevel: Number(e.target.value) })}
              className="h-10 text-center font-mono font-bold border"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
                color: theme.primary,
              }}
              placeholder="5"
            />
          </div>
        </div>

        {/* Recovery Notes */}
        <div className="space-y-2">
          <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
            Recovery & Wellness Notes
          </Label>
          <Textarea
            value={day.recoveryNotes || ""}
            onChange={(e) => updateDay(weekIndex, dayIndex, { recoveryNotes: e.target.value })}
            placeholder="Log soreness, energy levels, mood, recovery protocols (ice bath, massage, etc.)..."
            className="min-h-[80px] resize-none text-sm font-mono leading-relaxed border"
            style={{
              backgroundColor: theme.background + "80",
              borderColor: theme.border + "40",
              color: theme.text,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
