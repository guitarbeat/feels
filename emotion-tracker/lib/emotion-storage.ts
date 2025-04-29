import type { EmotionEvent } from "./types"

const STORAGE_KEY = "emotion-events"

export function saveEmotionEvent(emotionEvent: EmotionEvent): EmotionEvent[] {
  const existingEvents = getEmotionEvents()
  const updatedEvents = [...existingEvents, emotionEvent]

  // In a real app, you might want to use a database instead of localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents))
  }

  return updatedEvents
}

export function getEmotionEvents(): EmotionEvent[] {
  if (typeof window === "undefined") {
    return []
  }

  const storedEvents = localStorage.getItem(STORAGE_KEY)
  return storedEvents ? JSON.parse(storedEvents) : []
}
