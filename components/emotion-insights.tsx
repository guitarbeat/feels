"use client"

import { useMemo } from "react"
import type { EmotionLogEntry } from "@/components/emotion-log-item"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import { format } from "date-fns"

interface EmotionInsightsProps {
  emotionLog: EmotionLogEntry[]
}

export function EmotionInsights({ emotionLog }: EmotionInsightsProps) {
  // Group emotions by quadrant with CORRECTED quadrant names
  const quadrantData = useMemo(() => {
    const quadrants = {
      "Positive Active": { count: 0, emotions: new Set(), color: "#EAB308", emoji: "🤩" }, // yellow-500
      "Negative Active": { count: 0, emotions: new Set(), color: "#EF4444", emoji: "😠" }, // red-500
      "Negative Inactive": { count: 0, emotions: new Set(), color: "#3B82F6", emoji: "😢" }, // blue-500
      "Positive Inactive": { count: 0, emotions: new Set(), color: "#22C55E", emoji: "😌" }, // green-500
    }

    emotionLog.forEach((entry) => {
      if (entry.valence >= 0 && entry.arousal >= 0) {
        quadrants["Positive Active"].count++
        quadrants["Positive Active"].emotions.add(entry.emotion)
      } else if (entry.valence < 0 && entry.arousal >= 0) {
        quadrants["Negative Active"].count++
        quadrants["Negative Active"].emotions.add(entry.emotion)
      } else if (entry.valence < 0 && entry.arousal < 0) {
        quadrants["Negative Inactive"].count++
        quadrants["Negative Inactive"].emotions.add(entry.emotion)
      } else {
        quadrants["Positive Inactive"].count++
        quadrants["Positive Inactive"].emotions.add(entry.emotion)
      }
    })

    return Object.entries(quadrants).map(([name, data]) => ({
      name,
      value: data.count,
      emotions: Array.from(data.emotions),
      color: data.color,
      emoji: data.emoji,
    }))
  }, [emotionLog])

  // Calculate average valence and arousal
  const averages = useMemo(() => {
    if (emotionLog.length === 0) return { valence: 0, arousal: 0 }

    const sum = emotionLog.reduce(
      (acc, entry) => {
        return {
          valence: acc.valence + entry.valence,
          arousal: acc.arousal + entry.arousal,
        }
      },
      { valence: 0, arousal: 0 },
    )

    return {
      valence: Number.parseFloat((sum.valence / emotionLog.length).toFixed(2)),
      arousal: Number.parseFloat((sum.arousal / emotionLog.length).toFixed(2)),
    }
  }, [emotionLog])

  // Get most frequent emotions
  const topEmotions = useMemo(() => {
    const counts: Record<string, number> = {}
    emotionLog.forEach((entry) => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({
        emotion,
        count,
        emoji: emotionLog.find((entry) => entry.emotion === emotion)?.emoji || "",
      }))
  }, [emotionLog])

  // Get scientific insight based on data
  const getInsight = useMemo(() => {
    if (emotionLog.length < 3) return "Log more emotions to receive personalized insights."

    const dominantQuadrant = quadrantData.reduce((max, item) => (item.value > max.value ? item : max), quadrantData[0])

    if (dominantQuadrant.name === "Positive Active") {
      return "Your emotions tend toward the positive-active quadrant, suggesting an energetic, optimistic state. Research shows this state can enhance creativity and problem-solving abilities."
    } else if (dominantQuadrant.name === "Negative Active") {
      return "Your emotions frequently fall in the negative-active quadrant, indicating heightened stress or anxiety. Studies suggest mindfulness practices may help regulate these high-arousal negative states."
    } else if (dominantQuadrant.name === "Negative Inactive") {
      return "Your emotions often register in the negative-inactive quadrant, which may indicate low energy combined with negative feelings. Research suggests physical activity and social connection can help shift from this state."
    } else {
      return "Your emotions predominantly fall in the positive-inactive quadrant, suggesting a calm, content state. This state is associated with better recovery and improved long-term decision making."
    }
  }, [emotionLog, quadrantData])

  // Helper function to determine emotion color based on valence and arousal
  const getEmotionColor = (valence: number, arousal: number): string => {
    if (valence >= 0 && arousal >= 0) return "bg-yellow-500" // Happy/Excited
    if (valence < 0 && arousal >= 0) return "bg-red-500" // Angry/Tense
    if (valence < 0 && arousal < 0) return "bg-blue-500" // Sad/Depressed
    return "bg-green-500" // Calm/Relaxed
  }

  // Find entries with notes for additional insights
  const entriesWithNotes = useMemo(() => {
    return emotionLog.filter((entry) => entry.notes && entry.notes.trim().length > 0).slice(0, 3) // Show only the 3 most recent entries with notes
  }, [emotionLog])

  if (emotionLog.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>Log some emotions to see your personalized insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-medium mb-3 text-lg text-indigo-800">Your Emotion Summary</h3>
        <p className="text-sm text-gray-600 mb-4">{getInsight}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100">
            <h4 className="text-sm font-medium mb-3 text-indigo-700">Emotion Distribution</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quadrantData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} entries`, name]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              {quadrantData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 bg-white p-1.5 rounded-md shadow-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm">
                    {entry.emoji} {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium mb-2 text-indigo-700">Most Frequent Emotions</h4>
              <div className="space-y-2">
                {topEmotions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2.5 rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-medium">{item.emotion}</span>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      {item.count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium mb-2 text-indigo-700">Average Position</h4>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Avg. Valence:</span>
                    <p className="font-medium">{averages.valence}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Avg. Arousal:</span>
                    <p className="font-medium">{averages.arousal}</p>
                  </div>
                </div>
                <div className="relative w-full h-[80px] mt-3 border border-gray-200 rounded-md overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                  {/* Quadrant backgrounds */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-100/30"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-100/30"></div>
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-100/30"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-100/30"></div>

                  {/* Axes */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>

                  {/* Average position marker */}
                  <div
                    className="absolute w-5 h-5 bg-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md border-2 border-white"
                    style={{
                      left: `${(averages.valence + 1) * 50}%`,
                      top: `${(1 - averages.arousal) * 50}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Display recent entries with notes */}
      {entriesWithNotes.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium mb-3 text-lg text-indigo-800">Recent Emotion Notes</h3>
          <div className="space-y-4">
            {entriesWithNotes.map((entry, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getEmotionColor(entry.valence, entry.arousal)}`}></div>
                  <h4 className="font-medium flex items-center gap-1">
                    <span className="text-lg">{entry.emoji}</span> {entry.emotion}
                  </h4>
                  <span className="text-xs text-gray-500 ml-auto">
                    {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

