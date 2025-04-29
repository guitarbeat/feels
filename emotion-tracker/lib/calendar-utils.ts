"use client"

import { useState, useEffect } from "react"

// Type definitions
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  description?: string
  location?: string
}

export interface EmotionEvent {
  id: string
  eventId: string
  eventTitle: string
  eventStart: string
  eventEnd: string
  emotion: string
  timestamp: string
}

// Storage utilities
const STORAGE_KEY = "emotion-events"

export function getEmotionEvents(): EmotionEvent[] {
  if (typeof window === "undefined") {
    return []
  }

  const storedEvents = localStorage.getItem(STORAGE_KEY)
  return storedEvents ? JSON.parse(storedEvents) : []
}

export function saveEmotionEvent(emotionEvent: EmotionEvent): EmotionEvent[] {
  const existingEvents = getEmotionEvents()
  const updatedEvents = [...existingEvents, emotionEvent]

  // In a real app, you might want to use a database instead of localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents))
  }

  return updatedEvents
}

// Calendar utilities
export async function fetchCalendarEvents(date: Date, calendarId: string): Promise<CalendarEvent[]> {
  // Always use mock data for testing
  return generateMockEvents(date)
}

// Generate events for the selected date with a focus on recent events
export function generateMockEvents(date: Date): CalendarEvent[] {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const now = new Date()
  const isToday = startOfDay.toDateString() === now.toDateString()

  // Create 3-7 events for the day
  const numberOfEvents = Math.floor(Math.random() * 5) + 3
  const events: CalendarEvent[] = []

  const eventTitles = [
    "Team Meeting",
    "Project Review",
    "Coffee Break",
    "Client Call",
    "Lunch with Team",
    "Brainstorming Session",
    "Weekly Planning",
    "1:1 with Manager",
    "Product Demo",
    "Workout",
    "Dentist Appointment",
    "Family Dinner",
  ]

  // For today, create some events that have just passed
  if (isToday) {
    // Current hour
    const currentHour = now.getHours()

    // Create 1-3 events that have just passed (within the last 3 hours)
    const recentEventsCount = Math.min(Math.floor(Math.random() * 3) + 1, currentHour)

    for (let i = 0; i < recentEventsCount; i++) {
      // Event ended between 15 minutes and 2 hours ago
      const minutesAgo = Math.floor(Math.random() * 105) + 15

      const eventEnd = new Date(now)
      eventEnd.setMinutes(eventEnd.getMinutes() - minutesAgo)

      // Event duration between 30 minutes and 90 minutes
      const durationMinutes = Math.floor(Math.random() * 60) + 30

      const eventStart = new Date(eventEnd)
      eventStart.setMinutes(eventStart.getMinutes() - durationMinutes)

      events.push({
        id: `recent-event-${i}-${Date.now()}`,
        title: `${eventTitles[Math.floor(Math.random() * eventTitles.length)]} (Recent)`,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        description: "This is a recent event that just ended.",
        location: "Virtual / Office",
      })
    }
  }

  // Add regular events throughout the day
  for (let i = 0; i < numberOfEvents; i++) {
    // Create random start time between 8 AM and 6 PM
    const startHour = 8 + Math.floor(Math.random() * 10)
    const startMinute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, or 45

    const eventStart = new Date(date)
    eventStart.setHours(startHour, startMinute, 0, 0)

    // For today, don't create future events that are too far ahead
    if (isToday && eventStart > now) {
      // Only create future events within the next 3 hours
      if (eventStart.getTime() - now.getTime() > 3 * 60 * 60 * 1000) {
        continue
      }
    }

    // Event duration between 30 minutes and 2 hours
    const durationMinutes = (Math.floor(Math.random() * 4) + 1) * 30

    const eventEnd = new Date(eventStart)
    eventEnd.setMinutes(eventStart.getMinutes() + durationMinutes)

    events.push({
      id: `mock-event-${i}-${Date.now()}`,
      title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      description: "This is a mock event for demonstration purposes.",
      location: "Virtual / Office",
    })
  }

  // Sort events by start time
  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// Mobile detection hook
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}
