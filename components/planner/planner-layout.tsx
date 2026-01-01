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

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <SheetContent side="left" className="w-[240px] sm:w-[300px] border-r">
                <nav className="flex flex-col gap-4 mt-8">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                    Navigation
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Overview
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Current Week
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Metrics
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-bold text-lg md:text-xl tracking-tighter hidden sm:block uppercase">
                RETURN TO <span className="text-muted-foreground">FORM</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-primary" />
              System Active
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2 border uppercase tracking-widest text-[10px] font-bold px-4"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPlanner}
                className="gap-2 uppercase tracking-widest text-[10px] font-bold text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
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
