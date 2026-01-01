"use client"

import { cn } from "@/lib/utils"
import type { RPE } from "@/types/planner"

interface RPESelectorProps {
  value?: RPE | null
  onChange: (value: RPE) => void
  disabled?: boolean
}

export function RPESelector({ value, onChange, disabled }: RPESelectorProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as RPE[]).map((rpe) => (
        <button
          key={rpe}
          disabled={disabled}
          onClick={() => onChange(rpe)}
          className={cn(
            "h-8 w-8 text-[10px] font-bold border flex-shrink-0 transition-colors uppercase",
            value === rpe
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          )}
        >
          {rpe}
        </button>
      ))}
    </div>
  )
}
