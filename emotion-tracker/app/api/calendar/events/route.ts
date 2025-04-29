import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request) {
  const session = await auth()
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Missing date parameters" }, { status: 400 })
  }

  try {
    // Call the Google Calendar API
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )

    if (!calendarResponse.ok) {
      return NextResponse.json({ error: "Calendar API error" }, { status: calendarResponse.status })
    }

    const calendarData = await calendarResponse.json()

    // Transform the response to match our app's format
    const events = calendarData.items.map((item) => ({
      id: item.id,
      title: item.summary,
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
      description: item.description,
      location: item.location,
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}
