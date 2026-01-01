"use client"

import { usePlanner } from "@/hooks/use-planner"
import { THEMES } from "@/lib/themes"
import type { ThemeName } from "@/types/planner"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { state, updateTheme } = usePlanner()
  const currentTheme = state?.theme || "dark-knight"

  return (
    <div className="border bg-card p-8 shadow-none" id="theme-switcher">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Interface Profile Configuration</h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(THEMES) as ThemeName[]).map((themeKey) => {
          const t = THEMES[themeKey]
          const isActive = currentTheme === themeKey
          return (
            <button
              key={themeKey}
              onClick={() => updateTheme(themeKey)}
              className={cn(
                "flex flex-col gap-4 p-6 border transition-all text-left group",
                isActive ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "hover:bg-muted/50 border-border"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                  {t.name}
                </span>
                {isActive && <div className="w-1.5 h-1.5 bg-primary" />}
              </div>
              <div className="flex gap-1.5">
                <div className="h-1 w-6" style={{ backgroundColor: t.primary }} />
                <div className="h-1 w-3 opacity-30" style={{ backgroundColor: t.accent }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
