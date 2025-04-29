"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, Clock, HelpCircle, ClipboardList, HeartHandshake } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-utils"

// ===== COMING SOON COMPONENTS =====

interface ComingSoonMessageProps {
  title: string
  description: string
  selectedEvent: CalendarEvent | null
  onGoToEvents: () => void
}

export function ComingSoonMessage({ title, description, selectedEvent, onGoToEvents }: ComingSoonMessageProps) {
  return (
    <div className="text-center py-12 space-y-4">
      {selectedEvent ? (
        <div className="p-4 border rounded-md bg-muted mb-6">
          <h3 className="font-medium">Selected Event:</h3>
          <p className="text-lg">{selectedEvent.title}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(selectedEvent.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
            {new Date(selectedEvent.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ) : null}

      <HeartHandshake className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>

      <div className="pt-4">
        <Button variant="outline" onClick={onGoToEvents}>
          Return to Events
        </Button>
      </div>
    </div>
  )
}

export function EmotionHistoryPlaceholder() {
  return (
    <div className="text-center py-12 space-y-4">
      <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="text-xl font-medium">Emotion History Coming Soon</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Soon you'll be able to track and review your emotional responses to calendar events over time.
      </p>
    </div>
  )
}

// ===== EVENT COMPONENTS =====

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
        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
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

// ===== CALENDAR COMPONENTS =====

export function CalendarHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How to Find Your Calendar ID</DialogTitle>
          <DialogDescription>Follow these steps to make your Google Calendar public and get its ID</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Go to{" "}
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Calendar
              </a>
            </li>
            <li>On the left side, find the calendar you want to use</li>
            <li>Click the three dots next to the calendar name</li>
            <li>Select "Settings and sharing"</li>
            <li>Scroll down to "Access permissions for events"</li>
            <li>Check "Make available to public"</li>
            <li>Scroll down to "Integrate calendar"</li>
            <li>Copy the "Calendar ID" (it looks like an email address)</li>
          </ol>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium">Note:</p>
            <p>Only make calendars public if you're comfortable with anyone seeing the event details.</p>
            <p className="mt-2">For testing, you can also use public holiday calendars like:</p>
            <p className="font-mono text-xs mt-1 break-all">en.usa#holiday@group.v.calendar.google.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CalendarSettingsProps {
  date: Date
  calendarId: string
  inputCalendarId: string
  calendarError: string | null
  onDateChange: (date: Date | undefined) => void
  onCalendarIdChange: (id: string) => void
  onCalendarIdSubmit: (e: React.FormEvent) => void
}

export function CalendarSettings({
  date,
  calendarId,
  inputCalendarId,
  calendarError,
  onDateChange,
  onCalendarIdChange,
  onCalendarIdSubmit,
}: CalendarSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendar Settings</CardTitle>
            <CardDescription>Enter your public Google Calendar ID</CardDescription>
          </div>
          <CalendarHelp />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onCalendarIdSubmit} className="space-y-2">
          <Label htmlFor="calendarId">Public Calendar ID</Label>
          <Input
            id="calendarId"
            value={inputCalendarId}
            onChange={(e) => onCalendarIdChange(e.target.value)}
            placeholder="example@gmail.com"
          />
          <Button type="submit" className="w-full">
            Load Calendar
          </Button>
        </form>

        {calendarError && <div className="text-sm text-red-500">{calendarError}</div>}

        <div className="pt-4">
          <Label>Select Date</Label>
          <Calendar mode="single" selected={date} onSelect={onDateChange} className="rounded-md border mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
