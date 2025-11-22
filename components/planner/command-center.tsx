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
    <Card className="bg-zinc-950/80 backdrop-blur border-zinc-800">
      <CardHeader>
        <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
          <span style={{ color: theme.primary }}>●</span>
          Command Center
        </CardTitle>
        <p className="text-xs text-zinc-400 mt-2">
          Mission control for your 12-week transformation. Navigate to any section instantly.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {sections.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => scrollToSection(id)}
              variant="outline"
              className="justify-start gap-2 font-mono text-xs h-auto py-3"
              style={{
                borderColor: theme.border + "60",
                color: theme.text,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: theme.primary }} />
              {label}
            </Button>
          ))}
        </div>
        <Button
          onClick={exportToPDF}
          className="w-full mt-3 font-mono text-xs"
          style={{
            backgroundColor: theme.primary,
            color: theme.background,
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export to PDF
        </Button>
      </CardContent>
    </Card>
  )
}
