"use client"

import type { CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface RecentEventsProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

export function RecentEvents({ events, onSelectEvent }: RecentEventsProps) {
  if (events.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Recent Events</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border rounded-md bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
            onClick={() => onSelectEvent(event)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  Just ended ({new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectEvent(event)
                }}
              >
                Rate Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
