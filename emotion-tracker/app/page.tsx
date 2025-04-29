"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarSettings,
  CalendarHelp,
  EventList,
  RecentEvents,
  ComingSoonMessage,
  EmotionHistoryPlaceholder,
} from "@/components/calendar-event-components"
import {
  fetchCalendarEvents,
  getEmotionEvents,
  useMobile,
  type CalendarEvent,
  type EmotionEvent,
} from "@/lib/calendar-utils"

// Main dashboard component
function CalendarDashboard() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
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
              <ComingSoonMessage
                title="Emotion Rating Coming Soon"
                description="We're working on a feature to let you rate how you feel about your events."
                selectedEvent={selectedEvent}
                onGoToEvents={() => setActiveTab("events")}
              />
            </TabsContent>

            <TabsContent value="tracked">
              <EmotionHistoryPlaceholder />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component
export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Emotion Calendar Tracker</h1>
      <p className="text-muted-foreground mb-6">Track how you feel about your calendar events</p>
      <CalendarDashboard />
    </main>
  )
}
