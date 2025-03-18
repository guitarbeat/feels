"use client"

import { memo } from "react"

interface EmotionPathProps {
  path: { x: number; y: number }[]
  width?: number
  height?: number
  animate?: boolean
  color?: string
}

export const EmotionPath = memo(function EmotionPath({
  path,
  width = 100,
  height = 100,
  animate = true,
  color = "rgba(99, 102, 241, 0.6)",
}: EmotionPathProps) {
  if (!path || path.length < 2) return null

  return (
    <svg width={width} height={height} className="emotion-path">
      <path
        d={path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x * width},${p.y * height}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={animate ? "1000" : "0"}
        strokeDashoffset={animate ? "1000" : "0"}
        style={{
          animation: animate ? "dash 1.5s ease-in-out forwards" : "none",
        }}
      />
      {/* Start point */}
      <circle
        cx={path[0].x * width}
        cy={path[0].y * height}
        r="3"
        fill="#10b981"
        stroke="white"
        strokeWidth="1.5"
        className="dark:stroke-gray-800"
      />
      {/* End point */}
      <circle
        cx={path[path.length - 1].x * width}
        cy={path[path.length - 1].y * height}
        r="3"
        fill="#ef4444"
        stroke="white"
        strokeWidth="1.5"
        className="dark:stroke-gray-800"
      />
    </svg>
  )
})

