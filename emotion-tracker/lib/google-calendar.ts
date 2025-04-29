import type { CalendarEvent } from "./types"
import { generateMockEvents } from "./mock-data"

// Function to fetch events from a public Google Calendar
export async function fetchCalendarEvents(date: Date, calendarId: string): Promise<CalendarEvent[]> {
  // Always use mock data for testing
  return generateMockEvents(date)
}
