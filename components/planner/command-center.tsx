"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { exportToPDF } from "@/lib/export-pdf" // Import real export function
import { Target, TrendingUp, Calendar, ImageIcon, Gauge, BookOpen, Download } from "lucide-react"

export function CommandCenter() {
  const { state } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")

  const sections = [
    { id: "metrics", label: "Core Metrics", icon: TrendingUp },
    { id: "vision-board", label: "Vision Board", icon: Target },
    { id: "progress-photos", label: "Progress Photos", icon: ImageIcon },
    { id: "rpe-guide", label: "RPE Guide", icon: Gauge },
    { id: "rpe-calculator", label: "RPE Calculator", icon: BookOpen },
    { id: "weeks", label: "Weekly Plans", icon: Calendar },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="border bg-card p-6 shadow-none space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Command Center</h2>
        <div className="px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest bg-secondary">
          Phase 01
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sections.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => scrollToSection(id)}
            variant="outline"
            className="justify-start gap-3 h-auto py-4 px-4 border text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
