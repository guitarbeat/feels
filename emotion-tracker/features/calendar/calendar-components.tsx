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
import { HelpCircle } from "lucide-react"

// Calendar Help Component
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

// Calendar Settings Component
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
