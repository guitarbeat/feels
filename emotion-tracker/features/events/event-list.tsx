"use client"

import type { CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

interface EventListProps {
  events: CalendarEvent[]
  loading: boolean
  onSelectEvent: (event: CalendarEvent) => void
}

export function EventList({ events, loading, onSelectEvent }: EventListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No events found</h3>
        <p className="text-sm text-muted-foreground">
          Try selecting a different date or make sure you have events in your calendar.
        </p>
      </div>
    )
  }

  // Get current time
  const now = new Date()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">All Events</h3>
      {events.map((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        const isPast = eventEnd < now
        const isOngoing = eventStart <= now && eventEnd >= now

        let statusClass = ""
        if (isPast) {
          statusClass = "opacity-70"
        } else if (isOngoing) {
          statusClass = "border-primary/30 bg-secondary"
        }

        return (
          <div
            key={event.id}
            className={`p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer ${statusClass}`}
            onClick={() => onSelectEvent(event)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {eventStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                    {eventEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {isPast && <span className="text-xs text-muted-foreground">Completed</span>}
                {isOngoing && <span className="text-xs text-foreground font-medium">In progress</span>}
              </div>
              <Button
                variant={isPast ? "outline" : "default"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectEvent(event)
                }}
              >
                Track Emotion
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
