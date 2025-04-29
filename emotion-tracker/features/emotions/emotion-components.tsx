"use client"

import type { EmotionEvent, CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

// Emotion Selector Component
const emotions = [
  { name: "Happy", emoji: "😊" },
  { name: "Excited", emoji: "🎉" },
  { name: "Calm", emoji: "😌" },
  { name: "Tired", emoji: "😴" },
  { name: "Stressed", emoji: "😰" },
  { name: "Anxious", emoji: "😟" },
  { name: "Sad", emoji: "😢" },
  { name: "Angry", emoji: "😠" },
  { name: "Frustrated", emoji: "😤" },
  { name: "Neutral", emoji: "😐" },
]

interface EmotionSelectorProps {
  selectedEmotion: string | null
  onSelectEmotion: (emotion: string) => void
}

export function EmotionSelector({ selectedEmotion, onSelectEmotion }: EmotionSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">How did you feel about this event?</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {emotions.map((emotion) => (
          <Card
            key={emotion.name}
            className={`p-3 cursor-pointer hover:bg-muted transition-colors flex flex-col items-center justify-center ${
              selectedEmotion === emotion.name ? "bg-secondary border-primary" : ""
            }`}
            onClick={() => onSelectEmotion(emotion.name)}
          >
            <span className="text-3xl">{emotion.emoji}</span>
            <span className="text-sm mt-1">{emotion.name}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Emotion Form Component
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

// Emotion Event List Component
interface EmotionEventListProps {
  emotionEvents: EmotionEvent[]
}

export function EmotionEventList({ emotionEvents }: EmotionEventListProps) {
  if (emotionEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No tracked emotions yet</h3>
        <p className="text-sm text-muted-foreground">Select an event and track your emotion to see it here.</p>
      </div>
    )
  }

  // Group emotion events by date
  const groupedEvents: Record<string, EmotionEvent[]> = {}

  emotionEvents.forEach((event) => {
    const date = new Date(event.eventStart).toLocaleDateString()
    if (!groupedEvents[date]) {
      groupedEvents[date] = []
    }
    groupedEvents[date].push(event)
  })

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, events]) => (
          <div key={date} className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">{date}</h3>
            {events.map((event) => (
              <div key={event.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.eventTitle}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {new Date(event.eventStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                        {new Date(event.eventEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg">{getEmotionEmoji(event.emotion)}</div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Felt:</span> {event.emotion}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}

function getEmotionEmoji(emotion: string): string {
  const emotionMap: Record<string, string> = {
    Happy: "😊",
    Excited: "🎉",
    Calm: "😌",
    Tired: "😴",
    Stressed: "😰",
    Anxious: "😟",
    Sad: "😢",
    Angry: "😠",
    Frustrated: "😤",
    Neutral: "😐",
  }

  return emotionMap[emotion] || "❓"
}
