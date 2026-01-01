"use client"

import type React from "react"
import { usePlanner } from "@/hooks/use-planner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Download, Trash2, BarChart3 } from "lucide-react"
import { exportToPDF } from "@/lib/export-pdf"
import { useEffect, useState } from "react"

interface PlannerLayoutProps {
  children: React.ReactNode
}

export const PlannerLayout: React.FC<PlannerLayoutProps> = ({ children }) => {
  const { resetPlanner, state } = usePlanner()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4 md:px-8 md:py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] border-r bg-background">
                <nav className="flex flex-col gap-4 mt-8">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">
                    Navigation Profile
                  </div>
                  {["Overview", "Current Phase", "Biometrics", "Archives"].map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="justify-start font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none h-12 px-4 border-l-2 border-transparent hover:border-primary transition-all"
                    >
                      {item}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-4">
              <div className="h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="flex flex-col -space-y-1">
                <h1 className="font-bold text-lg md:text-xl tracking-tighter uppercase leading-tight">
                  RETURN TO <span className="text-muted-foreground/40 italic">FORM</span>
                </h1>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">Transformation Protocol</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-border/40 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 bg-muted/5">
              <span className="w-1 h-1 bg-primary animate-pulse" />
              Operational State // Active
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2 border-border/60 uppercase tracking-[0.2em] text-[9px] font-bold px-5 h-9 rounded-none hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPlanner}
                className="gap-2 uppercase tracking-[0.2em] text-[9px] font-bold text-muted-foreground hover:text-destructive transition-colors rounded-none h-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 px-4 md:px-8 mx-auto max-w-5xl">{children}</main>
      
      <footer className="border-t py-8 bg-muted/5">
        <div className="container max-w-5xl mx-auto px-8 flex justify-between items-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-muted-foreground/20">© 2026 RTF Operational Intelligence</p>
          <div className="flex gap-6">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 italic">Discipline Equals Freedom</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
