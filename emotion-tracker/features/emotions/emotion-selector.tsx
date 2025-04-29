"use client"
import { Card } from "@/components/ui/card"

const emotions = [
  { name: "Happy", emoji: "😊" },
  { name: "Excited", emoji: "🎉" },
  { name: "Calm", emoji: "😌" },
  { name: "Tired", emoji: "😴" },
  { name: "Stressed", emoji: "😰" },
  { name: "Anxious", emoji: "😟" },
  { name: "Sad", emoji: "😢" },
  { name: "Angry", emoji: "😠" },
  { name: "Frustrated", emoji: "😤" },
  { name: "Neutral", emoji: "😐" },
]

interface EmotionSelectorProps {
  selectedEmotion: string | null
  onSelectEmotion: (emotion: string) => void
}

export function EmotionSelector({ selectedEmotion, onSelectEmotion }: EmotionSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">How did you feel about this event?</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {emotions.map((emotion) => (
          <Card
            key={emotion.name}
            className={`p-3 cursor-pointer hover:bg-muted transition-colors flex flex-col items-center justify-center ${
              selectedEmotion === emotion.name ? "bg-secondary border-primary" : ""
            }`}
            onClick={() => onSelectEmotion(emotion.name)}
          >
            <span className="text-3xl">{emotion.emoji}</span>
            <span className="text-sm mt-1">{emotion.name}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
