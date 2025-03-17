"use client"

import { useRef } from "react"

interface EmotionPathProps {
  path: { x: number; y: number }[]
}

export function EmotionPath({ path }: EmotionPathProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  if (path.length < 2) return null

  // Get start and end points
  const startPoint = path[0]
  const endPoint = path[path.length - 1]

  // Convert normalized coordinates to SVG path
  const pathPoints = path
    .map((point) => {
      const x = point.x * 100
      const y = point.y * 100
      return `${x},${y}`
    })
    .join(" ")

  // Create a unique ID for the gradient
  const gradientId = `pathGradient-${Math.random().toString(36).substring(2, 9)}`

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
    >
      {/* Define gradient for the path */}
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={`${startPoint.x * 100}%`}
          y1={`${startPoint.y * 100}%`}
          x2={`${endPoint.x * 100}%`}
          y2={`${endPoint.y * 100}%`}
        >
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>

      {/* Animated path with gradient */}
      <polyline
        points={pathPoints}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{
          animation: "dash 1.5s ease-in-out forwards",
        }}
      />

      {/* Start point marker */}
      <g className="start-marker">
        <circle
          cx={`${startPoint.x * 100}%`}
          cy={`${startPoint.y * 100}%`}
          r="6"
          fill="#10b981"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={`${startPoint.x * 100}%`}
          y={`${startPoint.y * 100}%`}
          dy="-12"
          textAnchor="middle"
          fill="#047857"
          fontSize="10"
          fontWeight="bold"
          className="bg-white px-1 rounded"
        >
          Start
        </text>
      </g>

      {/* End point marker */}
      <g className="end-marker">
        <circle
          cx={`${endPoint.x * 100}%`}
          cy={`${endPoint.y * 100}%`}
          r="6"
          fill="#ef4444"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={`${endPoint.x * 100}%`}
          y={`${endPoint.y * 100}%`}
          dy="-12"
          textAnchor="middle"
          fill="#b91c1c"
          fontSize="10"
          fontWeight="bold"
          className="bg-white px-1 rounded"
        >
          End
        </text>
      </g>

      {/* Add subtle dots at each point for better visualization */}
      {path.map((point, index) => {
        // Skip start and end points as they have their own markers
        if (index === 0 || index === path.length - 1) return null

        return (
          <circle
            key={index}
            cx={`${point.x * 100}%`}
            cy={`${point.y * 100}%`}
            r="2"
            fill="rgba(99, 102, 241, 0.7)"
            className="path-point"
          />
        )
      })}
    </svg>
  )
}

