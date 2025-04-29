"use client"

import { Button } from "@/components/ui/button"
import { EmotionSelector } from "@/features/emotions/emotion-selector"
import type { CalendarEvent } from "@/lib/types"

interface EmotionFormProps {
  selectedEvent: CalendarEvent | null
  selectedEmotion: string | null
  onEmotionSelect: (emotion: string) => void
  onSaveEmotion: () => void
  onGoToEvents: () => void
}

export function EmotionForm({
  selectedEvent,
  selectedEmotion,
  onEmotionSelect,
  onSaveEmotion,
  onGoToEvents,
}: EmotionFormProps) {
  if (!selectedEvent) {
    return (
      <div className="text-center py-8">
        <p>Please select an event from the Events tab first</p>
        <Button variant="outline" onClick={onGoToEvents} className="mt-4">
          Go to Events
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-muted">
        <h3 className="font-medium">Selected Event:</h3>
        <p className="text-lg">{selectedEvent.title}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(selectedEvent.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
          {new Date(selectedEvent.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <EmotionSelector selectedEmotion={selectedEmotion} onSelectEmotion={onEmotionSelect} />

      <Button onClick={onSaveEmotion} disabled={!selectedEmotion} className="w-full">
        Save Emotion for Event
      </Button>
    </div>
  )
}
