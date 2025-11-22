"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { Plus, Target } from "lucide-react"

export function VisionBoard() {
  const { state, updateVisionBoard } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")
  const visionItems = state?.visionBoard || []

  const addVisionItem = () => {
    const newItem = {
      id: `vision-${Date.now()}`,
      title: "New Vision",
      content: "",
    }
    updateVisionBoard([...visionItems, newItem])
  }

  const updateItem = (id: string, field: "title" | "content", value: string) => {
    const updated = visionItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    updateVisionBoard(updated)
  }

  return (
    <Card
      className="backdrop-blur border"
      id="vision-board"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader style={{ borderBottom: `1px solid ${theme.border}40` }}>
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>Vision Board</span>
        </CardTitle>
        <p className="text-xs mt-2" style={{ color: theme.text + "CC" }}>
          Define your transformation vision. What does success look like? Who do you want to become? Visualize your
          goals.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visionItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
              }}
            >
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(item.id, "title", e.target.value)}
                className="w-full bg-transparent border-0 font-mono text-sm uppercase tracking-wider mb-3 focus:outline-none"
                style={{ color: theme.accent }}
                placeholder="Vision Title"
              />
              <Textarea
                value={item.content}
                onChange={(e) => updateItem(item.id, "content", e.target.value)}
                className="min-h-[120px] text-sm font-mono leading-relaxed border"
                style={{
                  backgroundColor: theme.surface + "60",
                  borderColor: theme.border + "40",
                  color: theme.text,
                }}
                placeholder="Describe your vision, goals, or inspiration in detail..."
              />
            </div>
          ))}
        </div>
        <Button
          onClick={addVisionItem}
          variant="outline"
          className="w-full mt-4 font-mono text-xs h-10 bg-transparent"
          style={{
            borderColor: theme.border + "60",
            color: theme.primary,
            backgroundColor: "transparent",
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vision Item
        </Button>
      </CardContent>
    </Card>
  )
}
