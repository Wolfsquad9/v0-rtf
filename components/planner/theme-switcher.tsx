"use client"

import { usePlanner } from "@/hooks/use-planner"
import { THEMES } from "@/lib/themes"
import type { ThemeName } from "@/types/planner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ThemeSwitcher() {
  const { state, updateTheme } = usePlanner()
  const currentTheme = state?.theme || "dark-knight"

  return (
    <Card className="p-4 bg-zinc-950/80 backdrop-blur border-zinc-800">
      <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-3">Mission Theme</h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(THEMES) as ThemeName[]).map((themeKey) => {
          const theme = THEMES[themeKey]
          const isActive = currentTheme === themeKey
          return (
            <Button
              key={themeKey}
              onClick={() => updateTheme(themeKey)}
              variant={isActive ? "default" : "outline"}
              className="justify-start gap-2 font-mono text-xs"
              style={
                isActive
                  ? {
                      backgroundColor: theme.primary,
                      color: theme.background,
                      borderColor: theme.primary,
                    }
                  : {
                      borderColor: theme.border,
                      color: theme.text,
                    }
              }
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 8px ${theme.primary}`,
                }}
              />
              {theme.name}
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
