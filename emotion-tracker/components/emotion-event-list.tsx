import type { EmotionEvent } from "@/lib/types"
import { Calendar, Clock } from "lucide-react"

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
