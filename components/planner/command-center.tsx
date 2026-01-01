"use client"

import { usePlanner } from "@/hooks/use-planner"
import { Activity, Shield, Zap, BarChart3, Target, TrendingUp, ImageIcon, Gauge, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"

export function CommandCenter() {
  const { state } = usePlanner()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!state) return null

  const stats = [
    { label: "Active Phase", value: "01 / 12", icon: Activity },
    { label: "Neural Load", value: "Stable", icon: Shield },
    { label: "System Sync", value: "100%", icon: Zap },
  ]

  const sections = [
    { id: "metrics", label: "Biometrics", icon: TrendingUp },
    { id: "vision-board", label: "Strategic Vision", icon: Target },
    { id: "progress-photos", label: "Visual Documentation", icon: ImageIcon },
    { id: "rpe-guide", label: "Intensity Index", icon: Gauge },
    { id: "rpe-calculator", label: "Load Projection", icon: BookOpen },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="border bg-card p-10 shadow-none mb-12">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-primary">
              <BarChart3 className="w-5 h-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Operational Overview</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
              System initialization successful // {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full md:w-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-3 text-muted-foreground/40">
                  <Icon className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-tighter">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border opacity-30" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="flex flex-col items-center justify-center gap-3 p-6 border bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all group"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
