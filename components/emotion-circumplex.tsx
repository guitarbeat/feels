"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"

interface EmotionCircumplexProps {
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onCircumplexClick?: (position: { x: number; y: number }) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  recordingMode?: "idle" | "start-selected" | "recording" | "completed"
  startPosition?: { x: number; y: number }
}

export function EmotionCircumplex({
  position,
  onPositionChange,
  onCircumplexClick,
  onDragStart,
  onDragEnd,
  recordingMode = "idle",
  startPosition = { x: 0.5, y: 0.5 },
}: EmotionCircumplexProps) {
  const planeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const markerSize = 28 // Increased marker size for better visibility

  // Handle mouse move over the plane to track position for label visibility
  const handleMouseMoveOverPlane = (event: React.MouseEvent<HTMLDivElement>) => {
    if (planeRef.current) {
      const rect = planeRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      setMousePosition({ x, y })
    }
  }

  // Handle click on the plane
  const handlePlaneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (planeRef.current) {
      const rect = planeRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))

      if (onCircumplexClick) {
        onCircumplexClick({ x, y })
      } else {
        onPositionChange({ x, y })
      }
    }
  }

  // Handle mouse down on the marker
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsDragging(true)
    if (onDragStart) onDragStart()
  }

  // Handle mouse move
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging && planeRef.current) {
        const rect = planeRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
        onPositionChange({ x, y })
      }
    },
    [isDragging, onPositionChange],
  )

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (onDragEnd) onDragEnd()
    }
  }, [isDragging, onDragEnd])

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle touch events for mobile
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsDragging(true)
    if (onDragStart) onDragStart()
  }

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (isDragging && planeRef.current && event.touches[0]) {
        const rect = planeRef.current.getBoundingClientRect()
        const touch = event.touches[0]
        const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height))
        onPositionChange({ x, y })
      }
    },
    [isDragging, onPositionChange],
  )

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (onDragEnd) onDragEnd()
    }
  }, [isDragging, onDragEnd])

  // Add and remove touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)
    } else {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, handleTouchMove, handleTouchEnd])

  // Function to determine if a label should be visible based on mouse proximity
  const isLabelVisible = (labelX: number, labelY: number, threshold = 0.08) => {
    const distance = Math.sqrt(Math.pow(mousePosition.x - labelX, 2) + Math.pow(mousePosition.y - labelY, 2))
    return distance < threshold && !isDragging  // Only show on hover, hide when dragging
  }

  // Emotion label positions
  const emotionLabels = [
    // Top-right quadrant - High arousal, positive valence (Yellow)
    { x: 0.75, y: 0.15, label: "Excited", emoji: "🤩", color: "text-yellow-700" },
    { x: 0.85, y: 0.3, label: "Happy", emoji: "😄", color: "text-yellow-700" },

    // Top-left quadrant - High arousal, negative valence (Red)
    { x: 0.25, y: 0.15, label: "Angry", emoji: "😠", color: "text-red-700" },
    { x: 0.15, y: 0.3, label: "Anxious", emoji: "😰", color: "text-red-700" },

    // Bottom-left quadrant - Low arousal, negative valence (Blue)
    { x: 0.25, y: 0.85, label: "Sad", emoji: "😢", color: "text-blue-700" },
    { x: 0.15, y: 0.7, label: "Depressed", emoji: "😔", color: "text-blue-700" },

    // Bottom-right quadrant - Low arousal, positive valence (Green)
    { x: 0.75, y: 0.85, label: "Relaxed", emoji: "😌", color: "text-green-700" },
    { x: 0.85, y: 0.7, label: "Calm", emoji: "😇", color: "text-green-700" },
  ]

  return (
    <div
      ref={planeRef}
      className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl cursor-pointer overflow-hidden shadow-lg w-full aspect-square transition-all duration-300 hover:shadow-xl"
      onClick={handlePlaneClick}
      onMouseMove={handleMouseMoveOverPlane}
    >
      {/* Enhanced background with improved gradients */}
      <div className="absolute inset-0">
        {/* Create a complex background with softer, more vibrant gradients */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-red-400/60 via-red-300/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-amber-300/60 via-yellow-200/30 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-emerald-400/60 via-green-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-sky-400/60 via-blue-300/30 to-transparent"></div>

        {/* Add diagonal gradients for more depth */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-transparent via-red-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-green-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-transparent via-blue-500/5 to-transparent"></div>
        
        {/* Add a subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Emotion labels with better styling */}
      {emotionLabels.map((emotion, index) => (
        <div
          key={index}
          className={`absolute text-xs font-medium ${emotion.color} bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md flex items-center gap-1 transition-all duration-300 ${
            isLabelVisible(emotion.x, emotion.y) ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          style={{
            left: `${emotion.x * 100}%`,
            top: `${emotion.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="text-base">{emotion.emoji}</span> {emotion.label}
        </div>
      ))}

      {/* Axes with improved styling */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-400/50"></div>
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gray-400/50"></div>

      {/* Axis labels with improved styling */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Negative
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Positive
      </div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        High Energy
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm"></div>
        Low Energy
      </div>

      {/* Quadrant labels with improved styling */}
      <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-red-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Distress
      </div>
      <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-yellow-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Excitement
      </div>
      <div className="absolute top-[75%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-blue-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Depression
      </div>
      <div className="absolute top-[75%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-green-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
        Contentment
      </div>

      {/* Start position marker with improved styling */}
      {(recordingMode === "start-selected" || recordingMode === "recording" || recordingMode === "completed") && (
        <div
          className="absolute bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-md z-10"
          style={{
            width: markerSize - 4,
            height: markerSize - 4,
            left: `calc(${startPosition.x * 100}% - ${(markerSize - 4) / 2}px)`,
            top: `calc(${startPosition.y * 100}% - ${(markerSize - 4) / 2}px)`,
          }}
        >
          <span className="sr-only">Starting emotion</span>
          {recordingMode === "start-selected" && (
            <span className="absolute inset-0 rounded-full bg-green-300 opacity-30 animate-ping"></span>
          )}
        </div>
      )}

      {/* Current position marker with improved styling */}
      <div
        className={`absolute rounded-full border-2 border-white shadow-lg cursor-grab ${
          isDragging ? "cursor-grabbing scale-110 shadow-xl" : ""
        } transition-all duration-200 ease-out z-20 ${
          recordingMode === "recording" 
            ? "bg-gradient-to-br from-red-500 to-rose-600" 
            : "bg-gradient-to-br from-indigo-500 to-violet-700"
        }`}
        style={{
          width: markerSize,
          height: markerSize,
          left: `calc(${position.x * 100}% - ${markerSize / 2}px)`,
          top: `calc(${position.y * 100}% - ${markerSize / 2}px)`,
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span className="sr-only">Emotion marker</span>
        {/* Pulse animation for the marker */}
        <span
          className={`absolute inset-0 rounded-full ${
            recordingMode === "recording" ? "bg-red-400" : "bg-indigo-400"
          } opacity-30 animate-ping`}
        ></span>
      </div>

      {/* Recording indicator with improved styling */}
      {recordingMode === "recording" && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-md">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          REC
        </div>
      )}

      {/* Concentric circles with improved styling */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border border-gray-300/30 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-gray-300/30 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] border border-gray-300/30 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[10%] border border-gray-300/30 rounded-full bg-gray-100/30 backdrop-blur-sm"></div>
    </div>
  )
}

