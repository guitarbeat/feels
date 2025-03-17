"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Update the EmotionLogEntry interface to include notes
export interface EmotionLogEntry {
  emotion: string
  emoji?: string
  valence: number
  arousal: number
  startEmotion?: string
  startEmoji?: string
  startValence?: number
  startArousal?: number
  timestamp: string
  path?: { x: number; y: number }[]
  notes?: string // Add notes field
}

interface EmotionLogItemProps {
  entry: EmotionLogEntry
  getEmotionColor: (valence: number, arousal: number) => string
}

// Update the EmotionLogItem component to display notes
export function EmotionLogItem({ entry, getEmotionColor }: EmotionLogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const emotionColor = getEmotionColor(entry.valence, entry.arousal)
  const formattedDate = format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")

  const hasPath = entry.path && entry.path.length > 1
  const hasStartEmotion =
    entry.startEmotion && entry.startEmoji && entry.startValence !== undefined && entry.startArousal !== undefined
  const hasNotes = entry.notes && entry.notes.trim().length > 0

  // Get start emotion color if available
  const startEmotionColor = hasStartEmotion ? getEmotionColor(entry.startValence!, entry.startArousal!) : ""

  // Get start and end points if path exists
  const startPoint = hasPath && entry.path ? entry.path[0] : null
  const endPoint = hasPath && entry.path ? entry.path[entry.path.length - 1] : null

  // Create a unique ID for the gradient
  const gradientId = `logGradient-${Math.random().toString(36).substring(2, 9)}`

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 bg-white/70 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-inner ${emotionColor}`}></div>
            <h3 className="font-medium text-gray-800">
              {entry.emotion}
            </h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{formattedDate}</span>
        </div>

        {/* Show start and end emotions if available */}
        {hasStartEmotion && (
          <div className="mt-3 mb-1 flex items-center text-xs text-gray-600 bg-gray-50/70 p-2 rounded-md">
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${startEmotionColor} mr-1.5 shadow-sm`}></div>
              <span className="font-medium">{entry.startEmotion}</span>
            </div>
            <span className="mx-2 text-gray-400">→</span>
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${emotionColor} mr-1.5 shadow-sm`}></div>
              <span className="font-medium">{entry.emotion}</span>
            </div>
          </div>
        )}

        {/* Display notes if available with improved styling */}
        {hasNotes && (
          <div className="mt-3 p-3 bg-indigo-50/50 rounded-md text-sm text-gray-700 border-l-3 border-indigo-300 shadow-sm">
            <p className="whitespace-pre-wrap italic">{entry.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-1.5 px-2.5 rounded-md">
              <span className="text-gray-500 font-medium">Valence:</span> <span className="text-indigo-700">{entry.valence}</span>
            </div>
            <div className="bg-gray-50 p-1.5 px-2.5 rounded-md">
              <span className="text-gray-500 font-medium">Arousal:</span> <span className="text-indigo-700">{entry.arousal}</span>
            </div>
          </div>

          {hasPath && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)} 
              className="h-8 px-3 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronUpIcon className="h-4 w-4 text-gray-600" /> : <ChevronDownIcon className="h-4 w-4 text-gray-600" />}
              <span className="ml-1 text-xs font-medium">{expanded ? "Hide" : "Show"} Path</span>
            </Button>
          )}
        </div>

        {expanded && hasPath && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden shadow-inner">
              {/* Quadrant backgrounds with improved styling */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-100/40"></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-100/40"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-100/40"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-100/40"></div>

              {/* Improved SVG visualization */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Define gradient for the path with improved colors */}
                <defs>
                  <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={startPoint ? startPoint.x * 100 : 0}
                    y1={startPoint ? startPoint.y * 100 : 0}
                    x2={endPoint ? endPoint.x * 100 : 0}
                    y2={endPoint ? endPoint.y * 100 : 0}
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="33%" stopColor="#6366f1" />
                    <stop offset="66%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Draw axes */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Draw path with gradient and improved styling */}
                <polyline
                  points={entry.path?.map((p) => `${p.x * 100},${p.y * 100}`).join(" ") || ""}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                />

                {/* Start point with improved styling */}
                {startPoint && (
                  <g>
                    <circle
                      cx={startPoint.x * 100}
                      cy={startPoint.y * 100}
                      r="3.5"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={startPoint.x * 100}
                      y={startPoint.y * 100}
                      dy="-6"
                      textAnchor="middle"
                      fill="#047857"
                      fontSize="8"
                      fontWeight="bold"
                      style={{ textShadow: "0 0 3px rgba(255,255,255,0.8)" }}
                    >
                      Start
                    </text>
                  </g>
                )}

                {/* End point with improved styling */}
                {endPoint && (
                  <g>
                    <circle
                      cx={endPoint.x * 100}
                      cy={endPoint.y * 100}
                      r="3.5"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={endPoint.x * 100}
                      y={endPoint.y * 100}
                      dy="-6"
                      textAnchor="middle"
                      fill="#b91c1c"
                      fontSize="8"
                      fontWeight="bold"
                      style={{ textShadow: "0 0 3px rgba(255,255,255,0.8)" }}
                    >
                      End
                    </text>
                  </g>
                )}

                {/* Add dots for intermediate points with improved styling */}
                {entry.path?.map((point, index) => {
                  // Skip start and end points
                  if (index === 0 || index === entry.path!.length - 1) return null

                  // Make dots slightly larger with better styling
                  return (
                    <circle 
                      key={index} 
                      cx={point.x * 100} 
                      cy={point.y * 100} 
                      r="1.8" 
                      fill="rgba(99, 102, 241, 0.8)" 
                      filter="drop-shadow(0 0 1px rgba(255,255,255,0.5))"
                    />
                  )
                })}
              </svg>

              {/* Labels with improved styling */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500 bg-white/70 px-2 rounded-b-md shadow-sm">
                Activated
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-500 bg-white/70 px-2 rounded-t-md shadow-sm">
                Deactivated
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-gray-500 bg-white/70 px-2 rounded-r-md shadow-sm">
                Negative
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-gray-500 bg-white/70 px-2 rounded-l-md shadow-sm">
                Positive
              </div>
            </div>
            
            {/* Path information with improved styling */}
            <div className="mt-2 text-xs text-gray-600 flex justify-between bg-gray-50 p-2 rounded-md">
              <span className="font-medium">Path: <span className="text-indigo-600">{entry.path?.length || 0} points</span></span>
              <div className="flex items-center gap-3">
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Start
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span> End
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

