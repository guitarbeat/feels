"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { CalendarHelp } from "@/features/calendar/calendar-help"

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
