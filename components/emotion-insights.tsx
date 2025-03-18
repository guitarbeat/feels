"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type EmotionLogEntry } from "@/components/emotion-log-item"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface EmotionInsightsProps {
  emotionLog: EmotionLogEntry[]
}

// Recharts helper for tooltip formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-md border border-gray-200 dark:border-gray-700 rounded-md">
        <p className="font-medium text-sm">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function EmotionInsights({ emotionLog }: EmotionInsightsProps) {
  const [chartTab, setChartTab] = useState("emotions")

  // Count occurrences of each emotion
  const emotionFrequency = useMemo(() => {
    const counts: Record<string, number> = {}
    emotionLog.forEach((entry) => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [emotionLog])

  // Get average valence and arousal over time
  const averageMetrics = useMemo(() => {
    if (emotionLog.length === 0) return { valence: 0, arousal: 0 }
    const sum = emotionLog.reduce(
      (acc, entry) => {
        return {
          valence: acc.valence + entry.valence,
          arousal: acc.arousal + entry.arousal,
        }
      },
      { valence: 0, arousal: 0 }
    )
    return {
      valence: Number((sum.valence / emotionLog.length).toFixed(2)),
      arousal: Number((sum.arousal / emotionLog.length).toFixed(2)),
    }
  }, [emotionLog])

  // Calculate emotion distribution by quadrant
  const quadrantData = useMemo(() => {
    const quadrants: Record<string, number> = {
      "Excited (Q1)": 0,
      "Angry (Q2)": 0,
      "Sad (Q3)": 0,
      "Relaxed (Q4)": 0,
    }

    emotionLog.forEach((entry) => {
      if (entry.valence >= 0 && entry.arousal >= 0) quadrants["Excited (Q1)"]++
      else if (entry.valence < 0 && entry.arousal >= 0) quadrants["Angry (Q2)"]++
      else if (entry.valence < 0 && entry.arousal < 0) quadrants["Sad (Q3)"]++
      else quadrants["Relaxed (Q4)"]++
    })

    return Object.entries(quadrants).map(([name, value]) => ({ name, value }))
  }, [emotionLog])

  // Colors for the different charts
  const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899"]
  const QUADRANT_COLORS = ["#eab308", "#ef4444", "#3b82f6", "#10b981"]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 shadow-sm border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-md font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Average Emotional State</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Average Valence</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{averageMetrics.valence}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {averageMetrics.valence >= 0 ? "Positive" : "Negative"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full ${
                      averageMetrics.valence >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.abs(averageMetrics.valence) * 50 + 50}%`,
                      marginLeft: averageMetrics.valence < 0 ? 0 : "50%",
                      transform: averageMetrics.valence < 0 ? "translateX(-100%)" : "translateX(-100%)",
                      maxWidth: "50%",
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Average Arousal</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{averageMetrics.arousal}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {averageMetrics.arousal >= 0 ? "Activated" : "Deactivated"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full ${
                      averageMetrics.arousal >= 0 ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.abs(averageMetrics.arousal) * 50 + 50}%`,
                      marginLeft: averageMetrics.arousal < 0 ? 0 : "50%",
                      transform: averageMetrics.arousal < 0 ? "translateX(-100%)" : "translateX(-100%)",
                      maxWidth: "50%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-sm border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-md font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Emotion Distribution</h3>
            <div className="h-32 md:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quadrantData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    label
                  >
                    {quadrantData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={QUADRANT_COLORS[index % QUADRANT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border border-gray-100 dark:border-gray-700">
        <CardContent className="pt-4 px-0 pb-0">
          <div className="px-4">
            <h3 className="text-md font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Emotional Patterns</h3>
            <Tabs value={chartTab} onValueChange={setChartTab} className="w-full">
              <TabsList className="mb-2 bg-indigo-50/70 dark:bg-indigo-900/30">
                <TabsTrigger value="emotions" className="text-xs">
                  Emotion Frequency
                </TabsTrigger>
                <TabsTrigger value="quadrants" className="text-xs">
                  Quadrant Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="mt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={emotionFrequency.slice(0, 10)} // Top 10 emotions
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#6366f1">
                        {emotionFrequency.slice(0, 10).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="quadrants" className="mt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quadrantData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#6366f1">
                        {quadrantData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={QUADRANT_COLORS[index % QUADRANT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

