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
      {/* Define gradient for the path with improved colors */}
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
          <stop offset="33%" stopColor="#6366f1" />
          <stop offset="66%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Animated path with gradient and improved styling */}
      <polyline
        points={pathPoints}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.15))"
        style={{
          animation: "dash 1.5s ease-in-out forwards",
        }}
      />

      {/* Start point marker with improved styling */}
      <g className="start-marker">
        <circle
          cx={`${startPoint.x * 100}%`}
          cy={`${startPoint.y * 100}%`}
          r="6"
          fill="#10b981"
          stroke="white"
          strokeWidth="2"
          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
        />
        <text
          x={`${startPoint.x * 100}%`}
          y={`${startPoint.y * 100}%`}
          dy="-12"
          textAnchor="middle"
          fill="#047857"
          fontSize="10"
          fontWeight="bold"
          className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
        >
          Start
        </text>
      </g>

      {/* End point marker with improved styling */}
      <g className="end-marker">
        <circle
          cx={`${endPoint.x * 100}%`}
          cy={`${endPoint.y * 100}%`}
          r="6"
          fill="#ef4444"
          stroke="white"
          strokeWidth="2"
          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
        />
        <text
          x={`${endPoint.x * 100}%`}
          y={`${endPoint.y * 100}%`}
          dy="-12"
          textAnchor="middle"
          fill="#b91c1c"
          fontSize="10"
          fontWeight="bold"
          className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
        >
          End
        </text>
      </g>

      {/* Add subtle dots at each point with improved styling */}
      {path.map((point, index) => {
        // Skip start and end points as they have their own markers
        if (index === 0 || index === path.length - 1) return null

        // Make points more visible with subtle glow effect
        return (
          <circle
            key={index}
            cx={`${point.x * 100}%`}
            cy={`${point.y * 100}%`}
            r="2.2"
            fill="rgba(99, 102, 241, 0.8)"
            className="path-point"
            filter="drop-shadow(0 0 1px rgba(255,255,255,0.7))"
          />
        )
      })}
    </svg>
  )
}

