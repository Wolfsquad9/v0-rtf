"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { usePlanner } from "@/hooks/use-planner"
import { Plus, Target } from "lucide-react"

export function VisionBoard() {
  const { state, updateVisionBoard } = usePlanner()
  const visionItems = state?.visionBoard || []

  const addVisionItem = () => {
    const newItem = {
      id: `vision-${Date.now()}`,
      title: "NEW OBJECTIVE",
      content: "",
    }
    updateVisionBoard([...visionItems, newItem])
  }

  const updateItem = (id: string, field: "title" | "content", value: string) => {
    const updated = visionItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    updateVisionBoard(updated)
  }

  return (
    <div className="border bg-card p-8 shadow-none" id="vision-board">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
          <Target className="w-3.5 h-3.5" />
          Strategic Vision Board
        </h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visionItems.map((item) => (
          <div key={item.id} className="p-6 border bg-background/50">
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(item.id, "title", e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 focus:outline-none placeholder:text-muted-foreground/20"
              placeholder="VISION TARGET"
            />
            <Textarea
              value={item.content}
              onChange={(e) => updateItem(item.id, "content", e.target.value)}
              className="min-h-[120px] text-[10px] font-bold uppercase tracking-widest leading-relaxed border bg-background rounded-none placeholder:text-muted-foreground/10"
              placeholder="DEFINE SUCCESS PARAMETERS..."
            />
          </div>
        ))}
      </div>
      
      <Button
        onClick={addVisionItem}
        variant="outline"
        className="w-full mt-6 border uppercase tracking-widest text-[10px] font-bold h-12"
      >
        <Plus className="w-3.5 h-3.5 mr-2" />
        Initialize New Vision Target
      </Button>
    </div>
  )
}
