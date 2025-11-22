"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RPE } from "@/types/planner"

interface RPESelectorProps {
  value?: RPE | null
  onChange: (value: RPE) => void
  disabled?: boolean
}

export function RPESelector({ value, onChange, disabled }: RPESelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as RPE[]).map((rpe) => (
        <Button
          key={rpe}
          variant={value === rpe ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-11 w-11 md:h-8 md:w-8 p-0 font-mono text-sm md:text-xs flex-shrink-0 font-bold transition-all",
            value === rpe
              ? "bg-amber-500 text-black hover:bg-amber-600 ring-2 ring-amber-300 ring-offset-1"
              : "text-muted-foreground hover:text-foreground border-2 hover:border-amber-500",
          )}
          onClick={() => onChange(rpe)}
          disabled={disabled}
        >
          {rpe}
        </Button>
      ))}
    </div>
  )
}
