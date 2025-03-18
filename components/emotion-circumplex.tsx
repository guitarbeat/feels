"use client"

import { useRef, useState, useEffect, useCallback } from "react"

interface EmotionCircumplexProps {
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onCircumplexClick: (position: { x: number; y: number }) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  recordingMode?: string
  startPosition?: { x: number; y: number }
}

// Emotion reference points mapped to circumplex coordinates
const emotionReferencePoints = [
  { name: "Excited", x: 0.75, y: 0.25, color: "yellow" },
  { name: "Delighted", x: 0.85, y: 0.35, color: "yellow" },
  { name: "Happy", x: 0.9, y: 0.5, color: "yellow" },
  { name: "Pleased", x: 0.85, y: 0.65, color: "green" },
  { name: "Relaxed", x: 0.75, y: 0.75, color: "green" },
  { name: "Calm", x: 0.65, y: 0.85, color: "green" },
  { name: "Sleepy", x: 0.5, y: 0.9, color: "blue" },
  { name: "Bored", x: 0.35, y: 0.85, color: "blue" },
  { name: "Sad", x: 0.25, y: 0.75, color: "blue" },
  { name: "Upset", x: 0.15, y: 0.65, color: "blue" },
  { name: "Stressed", x: 0.1, y: 0.5, color: "red" },
  { name: "Nervous", x: 0.15, y: 0.35, color: "red" },
  { name: "Tense", x: 0.25, y: 0.25, color: "red" },
  { name: "Alert", x: 0.35, y: 0.15, color: "red" },
  { name: "Active", x: 0.5, y: 0.1, color: "yellow" },
  { name: "Elated", x: 0.65, y: 0.15, color: "yellow" },
]

export function EmotionCircumplex({
  position,
  onPositionChange,
  onCircumplexClick,
  onDragStart,
  onDragEnd,
  recordingMode,
  startPosition,
}: EmotionCircumplexProps) {
  const [isDragging, setIsDragging] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)
  
  // Calculate marker positions based on the container's size
  const calculatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!circleRef.current) return
      const rect = circleRef.current.getBoundingClientRect()
      const x = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1)
      const y = Math.min(Math.max(0, (clientY - rect.top) / rect.height), 1)
      return { x, y }
    },
    []
  )

  // Handle mouse down event
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const newPos = calculatePosition(e.clientX, e.clientY)
      if (!newPos) return
      setIsDragging(true)
      if (onDragStart) onDragStart()
      if (recordingMode === "idle" || recordingMode === "completed") {
        onCircumplexClick(newPos)
      } else {
        onPositionChange(newPos)
      }
    },
    [calculatePosition, onPositionChange, onCircumplexClick, onDragStart, recordingMode]
  )

  // Handle mouse move event during drag
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const newPos = calculatePosition(e.clientX, e.clientY)
      if (!newPos) return
      onPositionChange(newPos)
    },
    [isDragging, calculatePosition, onPositionChange]
  )

  // Handle mouse up event to end drag
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (onDragEnd) onDragEnd()
  }, [isDragging, onDragEnd])

  // Handle click event
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const newPos = calculatePosition(e.clientX, e.clientY)
      if (!newPos) return
      onCircumplexClick(newPos)
    },
    [calculatePosition, onCircumplexClick]
  )

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const newPos = calculatePosition(touch.clientX, touch.clientY)
      if (!newPos) return
      setIsDragging(true)
      if (onDragStart) onDragStart()
      if (recordingMode === "idle" || recordingMode === "completed") {
        onCircumplexClick(newPos)
      } else {
        onPositionChange(newPos)
      }
    },
    [calculatePosition, onPositionChange, onCircumplexClick, onDragStart, recordingMode]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      const touch = e.touches[0]
      const newPos = calculatePosition(touch.clientX, touch.clientY)
      if (!newPos) return
      onPositionChange(newPos)
      e.preventDefault() // Prevent scrolling while dragging
    },
    [isDragging, calculatePosition, onPositionChange]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (onDragEnd) onDragEnd()
  }, [isDragging, onDragEnd])

  // Add event listeners to window for mouse events
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false)
        if (onDragEnd) onDragEnd()
      }
      window.addEventListener("mouseup", handleGlobalMouseUp)
      window.addEventListener("touchend", handleGlobalMouseUp)
      return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp)
        window.removeEventListener("touchend", handleGlobalMouseUp)
      }
    }
  }, [isDragging, onDragEnd])

  return (
    <div 
      ref={circleRef}
      className="relative w-full h-full rounded-full bg-gray-50 dark:bg-gray-900 overflow-hidden shadow-xl"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ touchAction: "none" }}
    >
      {/* Quadrant backgrounds with improved gradients */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-100/80 via-red-200/60 to-red-300/50 dark:from-red-950/40 dark:via-red-900/30 dark:to-red-800/20 opacity-70"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-100/80 via-yellow-200/60 to-yellow-300/50 dark:from-yellow-950/40 dark:via-yellow-900/30 dark:to-yellow-800/20 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/80 via-blue-200/60 to-blue-300/50 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-800/20 opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-green-100/80 via-green-200/60 to-green-300/50 dark:from-green-950/40 dark:via-green-900/30 dark:to-green-800/20 opacity-70"></div>

      {/* Concentric circles for intensity visualization */}
      <div className="absolute w-[25%] h-[25%] rounded-full border border-gray-300 dark:border-gray-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute w-[50%] h-[50%] rounded-full border border-gray-300 dark:border-gray-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute w-[75%] h-[75%] rounded-full border border-gray-300 dark:border-gray-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Circle outline with grid lines */}
      <div className="absolute w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-700 border-dashed"></div>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-300 dark:bg-gray-600"></div>
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-300 dark:bg-gray-600"></div>

      {/* Axes labels */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
        High Arousal
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Low Arousal
      </div>
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Negative
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Positive
      </div>

      {/* Reference emotion markers */}
      {emotionReferencePoints.map((emotion) => (
        <div 
          key={emotion.name}
          className="absolute w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
          style={{
            left: `${emotion.x * 100}%`,
            top: `${emotion.y * 100}%`,
          }}
          title={emotion.name}
        />
      ))}

      {/* Emotion labels - strategically positioned around the circle */}
      {emotionReferencePoints.map((emotion) => (
        <div 
          key={`label-${emotion.name}`}
          className={`absolute text-xs font-semibold ${
            emotion.color === "red" ? "text-red-600 dark:text-red-400" : 
            emotion.color === "yellow" ? "text-yellow-600 dark:text-yellow-400" :
            emotion.color === "green" ? "text-green-600 dark:text-green-400" :
            "text-blue-600 dark:text-blue-400"
          }`}
          style={{
            left: `${
              emotion.x < 0.5 ? 
                (emotion.x * 100) - 2 : 
                (emotion.x * 100) + 2
            }%`,
            top: `${
              emotion.y < 0.5 ? 
                (emotion.y * 100) - 2 : 
                (emotion.y * 100) + 2
            }%`,
            transform: `translate(${
              emotion.x < 0.5 ? '-100%' : '0'
            }, ${
              emotion.y < 0.5 ? '-100%' : '0'
            })`,
          }}
        >
          {emotion.name}
        </div>
      ))}

      {/* Draggable marker */}
      {/* Show start position marker when applicable */}
      {startPosition && recordingMode !== "idle" && (
        <div
          className="absolute w-6 h-6 bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 transition-transform duration-150"
          style={{
            left: `${startPosition.x * 100}%`,
            top: `${startPosition.y * 100}%`,
            transform: `translate(-50%, -50%) ${isDragging ? "scale(1.1)" : ""}`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
        </div>
      )}
      
      {/* Current position marker (main) */}
      <div
        className={`absolute w-8 h-8 bg-white dark:bg-gray-800 border-4 ${
          isDragging ? "border-indigo-600 dark:border-indigo-400" : "border-indigo-500 dark:border-indigo-500"
        } rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 transition-transform duration-150 ${
          isDragging ? "scale-110" : ""
        }`}
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
      </div>
      
      {/* Emotion label for current position */}
      <div 
        className="absolute z-30 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md text-xs font-semibold border border-gray-200 dark:border-gray-700"
        style={{
          left: `${position.x * 100}%`,
          top: `${(position.y * 100) - 15}%`,
          transform: 'translate(-50%, -100%)',
          display: isDragging ? 'block' : 'none'
        }}
      >
        {getNearestEmotion(position.x, position.y)}
      </div>
    </div>
  )

  // Helper function to find nearest emotion to current position
  function getNearestEmotion(x: number, y: number) {
    let nearestEmotion = "Neutral";
    let minDistance = Number.MAX_VALUE;
    
    emotionReferencePoints.forEach(emotion => {
      const distance = Math.sqrt(
        Math.pow(emotion.x - x, 2) + Math.pow(emotion.y - y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestEmotion = emotion.name;
      }
    });
    
    return nearestEmotion;
  }
}

