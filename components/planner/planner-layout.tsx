"use client"

import type React from "react"
import { usePlanner } from "@/hooks/use-planner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Download, Trash2, BarChart3 } from "lucide-react"
import { getThemeColors } from "@/lib/themes"
import { exportToPDF } from "@/lib/export-pdf"
import { useEffect, useState } from "react"

interface PlannerLayoutProps {
  children: React.ReactNode
}

export const PlannerLayout: React.FC<PlannerLayoutProps> = ({ children }) => {
  const { resetPlanner, state } = usePlanner()
  const [isMounted, setIsMounted] = useState(false)

  const theme = state ? getThemeColors(state.theme) : getThemeColors("dark-knight")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (theme && isMounted) {
      document.documentElement.style.setProperty("--theme-primary", theme.primary)
      document.documentElement.style.setProperty("--theme-background", theme.background)
      document.documentElement.style.setProperty("--theme-surface", theme.surface)
      document.documentElement.style.setProperty("--theme-text", theme.text)
      document.documentElement.style.setProperty("--theme-border", theme.border)
      document.documentElement.style.setProperty("--theme-accent", theme.accent)
    }
  }, [theme, isMounted])

  return (
    <div
      className="min-h-screen bg-background flex flex-col font-sans selection:bg-amber-500/30 transition-colors duration-300"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{
          backgroundColor: theme.background + "E6",
          borderBottomColor: theme.border + "40",
          borderBottomWidth: "1px",
        }}
      >
        <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4 md:px-8 md:py-3 max-w-5xl mx-auto">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <div className="px-2 text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Navigation
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium text-muted-foreground hover:text-foreground"
                  >
                    Overview
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium text-muted-foreground hover:text-foreground"
                  >
                    Current Week
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium text-muted-foreground hover:text-foreground"
                  >
                    Metrics
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-sm flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: theme.background }} />
              </div>
              <h1
                className="font-black text-lg md:text-xl tracking-tight hidden sm:block"
                style={{ color: theme.text }}
              >
                RETURN TO <span style={{ color: theme.primary }}>FORM</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Status Indicator - Desktop only */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-widest"
              style={{
                backgroundColor: theme.surface + "60",
                borderColor: theme.border + "80",
                color: theme.accent,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }}
              />
              System Online
            </div>

            {/* Export & Reset - Stack on mobile, row on desktop */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2 border transition-all duration-200 hover:scale-105 text-xs md:text-sm bg-transparent"
                style={{
                  borderColor: theme.border + "60",
                  color: theme.text,
                  backgroundColor: "transparent",
                }}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPlanner}
                className="gap-2 transition-all duration-200 hover:scale-105 text-xs md:text-sm"
                style={{ color: theme.primary }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8 px-4 md:px-8 mx-auto max-w-5xl">{children}</main>
    </div>
  )
}
