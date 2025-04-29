"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarSettings, CalendarHelp } from "@/features/calendar/calendar-components"
import { EventList, RecentEvents } from "@/features/events/event-components"
import { EmotionForm, EmotionEventList } from "@/features/emotions/emotion-components"
import { fetchCalendarEvents, saveEmotionEvent, getEmotionEvents } from "@/lib/calendar-utils"
import type { CalendarEvent, EmotionEvent } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

export function EmotionTracker() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [emotionEvents, setEmotionEvents] = useState<EmotionEvent[]>([])
  const [activeTab, setActiveTab] = useState("events")
  const [calendarId, setCalendarId] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("calendarId") || "" : "",
  )
  const [inputCalendarId, setInputCalendarId] = useState(calendarId)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const isMobile = useMobile()

  useEffect(() => {
    // Load emotion events from storage
    const storedEmotionEvents = getEmotionEvents()
    setEmotionEvents(storedEmotionEvents)
  }, [])

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setCalendarError(null)

      try {
        // Use a placeholder calendar ID if none is provided
        const calendarEvents = await fetchCalendarEvents(date, calendarId || "demo-calendar")
        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
        // Suppress error display during testing
        // setCalendarError("Failed to load calendar events. Using mock data instead.")
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [date, calendarId])

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setSelectedEvent(null)
    }
  }

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setActiveTab("emotions")
  }

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion)
  }

  const handleSaveEmotionEvent = () => {
    if (selectedEvent && selectedEmotion) {
      const newEmotionEvent: EmotionEvent = {
        id: `${selectedEvent.id}-${Date.now()}`,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventStart: selectedEvent.start,
        eventEnd: selectedEvent.end,
        emotion: selectedEmotion,
        timestamp: new Date().toISOString(),
      }

      const updatedEmotionEvents = saveEmotionEvent(newEmotionEvent)
      setEmotionEvents(updatedEmotionEvents)
      setSelectedEvent(null)
      setSelectedEmotion(null)
      setActiveTab("tracked")
    }
  }

  const handleCalendarIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCalendarId(inputCalendarId)
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarId", inputCalendarId)
    }
  }

  // Filter for recent events (ended in the last 3 hours)
  const recentEvents = events.filter((event) => {
    const eventEnd = new Date(event.end)
    const now = new Date()
    const threeHoursAgo = new Date(now)
    threeHoursAgo.setHours(now.getHours() - 3)

    return eventEnd >= threeHoursAgo && eventEnd <= now
  })

  return (
    <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-3"} gap-6`}>
      {!isMobile && (
        <div className="md:col-span-1">
          <CalendarSettings
            date={date}
            calendarId={calendarId}
            inputCalendarId={inputCalendarId}
            calendarError={calendarError}
            onDateChange={handleDateChange}
            onCalendarIdChange={setInputCalendarId}
            onCalendarIdSubmit={handleCalendarIdSubmit}
          />
        </div>
      )}

      <Card className={isMobile ? "col-span-1" : "md:col-span-2"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Emotion Tracker</CardTitle>
              <CardDescription>Track how you feel about your events</CardDescription>
            </div>
            {isMobile && (
              <div className="flex items-center space-x-2">
                <CalendarHelp />
              </div>
            )}
          </div>
          {isMobile && (
            <div className="mt-4">
              <CalendarSettings
                date={date}
                calendarId={calendarId}
                inputCalendarId={inputCalendarId}
                calendarError={calendarError}
                onDateChange={handleDateChange}
                onCalendarIdChange={setInputCalendarId}
                onCalendarIdSubmit={handleCalendarIdSubmit}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="emotions">Rate</TabsTrigger>
              <TabsTrigger value="tracked">History</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <RecentEvents events={recentEvents} onSelectEvent={handleEventSelect} />
              <EventList events={events} loading={loading} onSelectEvent={handleEventSelect} />
            </TabsContent>

            <TabsContent value="emotions">
              <EmotionForm
                selectedEvent={selectedEvent}
                selectedEmotion={selectedEmotion}
                onEmotionSelect={handleEmotionSelect}
                onSaveEmotion={handleSaveEmotionEvent}
                onGoToEvents={() => setActiveTab("events")}
              />
            </TabsContent>

            <TabsContent value="tracked">
              <EmotionEventList emotionEvents={emotionEvents} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
