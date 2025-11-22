"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getThemeColors } from "@/lib/themes"
import { usePlanner } from "@/hooks/use-planner"
import { Plus, Camera, ImageIcon } from "lucide-react"

export function ProgressPhotos() {
  const { state, updateProgressPhotos } = usePlanner()
  const theme = getThemeColors(state?.theme || "dark-knight")
  const photos = state?.progressPhotos || []

  const addPhoto = () => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      date: new Date().toISOString(),
      week: Math.floor(photos.length / 2) + 1,
      notes: "",
    }
    updateProgressPhotos([...photos, newPhoto])
  }

  const updatePhoto = (id: string, field: keyof (typeof photos)[0], value: any) => {
    const updated = photos.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo))
    updateProgressPhotos(updated)
  }

  return (
    <Card
      className="backdrop-blur border"
      id="progress-photos"
      style={{
        backgroundColor: theme.surface + "CC",
        borderColor: theme.border + "60",
      }}
    >
      <CardHeader style={{ borderBottom: `1px solid ${theme.border}40` }}>
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" style={{ color: theme.primary }} />
          <span style={{ color: theme.text }}>Progress Photos</span>
        </CardTitle>
        <p className="text-xs mt-2" style={{ color: theme.text + "CC" }}>
          Document your transformation journey. Take photos every 2-4 weeks for visual progress tracking. Photos tell
          the story numbers can't.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="p-4 rounded-lg border transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: theme.background + "80",
                borderColor: theme.border + "40",
              }}
            >
              <div
                className="aspect-square rounded-lg flex items-center justify-center mb-3 transition-all hover:border-opacity-60"
                style={{
                  backgroundColor: theme.surface,
                  border: `2px dashed ${theme.border}40`,
                }}
              >
                <Camera className="w-12 h-12" style={{ color: theme.border + "60" }} />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                    Week Number
                  </Label>
                  <Input
                    type="number"
                    value={photo.week}
                    onChange={(e) => updatePhoto(photo.id, "week", Number(e.target.value))}
                    placeholder="Week #"
                    className="h-9 font-mono text-sm border"
                    style={{
                      backgroundColor: theme.surface + "80",
                      borderColor: theme.border + "40",
                      color: theme.primary,
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                    Photo Date
                  </Label>
                  <Input
                    type="date"
                    value={photo.date.split("T")[0]}
                    onChange={(e) => updatePhoto(photo.id, "date", new Date(e.target.value).toISOString())}
                    className="h-9 font-mono text-sm border"
                    style={{
                      backgroundColor: theme.surface + "80",
                      borderColor: theme.border + "40",
                      color: theme.text,
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                    Notes
                  </Label>
                  <Textarea
                    value={photo.notes}
                    onChange={(e) => updatePhoto(photo.id, "notes", e.target.value)}
                    placeholder="Observations, measurements, mood..."
                    className="text-sm font-mono min-h-[70px] border resize-none"
                    style={{
                      backgroundColor: theme.surface + "80",
                      borderColor: theme.border + "40",
                      color: theme.text,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={addPhoto}
          variant="outline"
          className="w-full mt-4 font-mono text-xs h-10 bg-transparent"
          style={{
            borderColor: theme.border + "60",
            color: theme.primary,
            backgroundColor: "transparent",
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Progress Photo
        </Button>
      </CardContent>
    </Card>
  )
}
