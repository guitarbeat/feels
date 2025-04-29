"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmotionSelector } from "@/components/emotion-selector"
import { EventList } from "@/components/event-list"
import { EmotionEventList } from "@/components/emotion-event-list"
import { fetchCalendarEvents } from "@/lib/google-calendar"
import { saveEmotionEvent, getEmotionEvents } from "@/lib/emotion-storage"
import type { CalendarEvent, EmotionEvent } from "@/lib/types"
import { CalendarHelp } from "@/components/calendar-help"
import { useMobile } from "@/hooks/use-mobile"

export default function CalendarEmotionTracker() {
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

  // Check if we have recent events to highlight
  const hasRecentEvents = recentEvents.length > 0

  return (
    <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-3"} gap-6`}>
      {!isMobile && (
        <Card className="md:col-span-1">
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
            <form onSubmit={handleCalendarIdSubmit} className="space-y-2">
              <Label htmlFor="calendarId">Public Calendar ID</Label>
              <Input
                id="calendarId"
                value={inputCalendarId}
                onChange={(e) => setInputCalendarId(e.target.value)}
                placeholder="example@gmail.com"
              />
              <Button type="submit" className="w-full">
                Load Calendar
              </Button>
            </form>

            {calendarError && <div className="text-sm text-red-500">{calendarError}</div>}

            <div className="pt-4">
              <Label>Select Date</Label>
              <Calendar mode="single" selected={date} onSelect={handleDateChange} className="rounded-md border mt-2" />
            </div>
          </CardContent>
        </Card>
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
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border w-full"
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
              {hasRecentEvents && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Recent Events</h3>
                  <div className="space-y-3">
                    {recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-md bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer"
                        onClick={() => handleEventSelect(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              Just ended (
                              {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                            </div>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventSelect(event)
                            }}
                          >
                            Rate Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <EventList events={events} loading={loading} onSelectEvent={handleEventSelect} />
            </TabsContent>

            <TabsContent value="emotions">
              {selectedEvent ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-muted">
                    <h3 className="font-medium">Selected Event:</h3>
                    <p className="text-lg">{selectedEvent.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEvent.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date(selectedEvent.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <EmotionSelector selectedEmotion={selectedEmotion} onSelectEmotion={handleEmotionSelect} />

                  <Button onClick={handleSaveEmotionEvent} disabled={!selectedEmotion} className="w-full">
                    Save Emotion for Event
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>Please select an event from the Events tab first</p>
                  <Button variant="outline" onClick={() => setActiveTab("events")} className="mt-4">
                    Go to Events
                  </Button>
                </div>
              )}
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
