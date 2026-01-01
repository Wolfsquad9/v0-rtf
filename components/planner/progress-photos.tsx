"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePlanner } from "@/hooks/use-planner"
import { Plus, Camera, ImageIcon } from "lucide-react"

export function ProgressPhotos() {
  const { state, updateProgressPhotos } = usePlanner()
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

  const updatePhoto = (id: string, field: string, value: any) => {
    const updated = photos.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo))
    updateProgressPhotos(updated as any)
  }

  return (
    <div className="border bg-card p-8 shadow-none" id="progress-photos">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
          <ImageIcon className="w-3.5 h-3.5" />
          Biometric Documentation
        </h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="p-6 border bg-background/50">
            <div className="aspect-square border border-dashed flex items-center justify-center mb-6 bg-muted/20 group cursor-pointer transition-colors hover:bg-muted/40">
              <Camera className="w-8 h-8 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Phase</Label>
                  <Input
                    type="number"
                    value={photo.week}
                    onChange={(e) => updatePhoto(photo.id, "week", Number(e.target.value))}
                    className="h-9 text-[10px] font-bold bg-background border rounded-none text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Timeline</Label>
                  <Input
                    type="date"
                    value={photo.date.split("T")[0]}
                    onChange={(e) => updatePhoto(photo.id, "date", new Date(e.target.value).toISOString())}
                    className="h-9 text-[10px] font-bold bg-background border rounded-none text-center"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Operational Notes</Label>
                <Textarea
                  value={photo.notes}
                  onChange={(e) => updatePhoto(photo.id, "notes", e.target.value)}
                  placeholder="LOG PHYSICAL STATE..."
                  className="text-[10px] font-bold uppercase tracking-widest min-h-[80px] border bg-background rounded-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        onClick={addPhoto}
        variant="outline"
        className="w-full mt-6 border uppercase tracking-widest text-[10px] font-bold h-12"
      >
        <Plus className="w-3.5 h-3.5 mr-2" />
        Capture Progress Frame
      </Button>
    </div>
  )
}
