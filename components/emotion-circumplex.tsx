"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"

interface EmotionCircumplexProps {
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onCircumplexClick: (position: { x: number; y: number }) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  recordingMode?: string
  startPosition?: { x: number; y: number }
}

interface EmotionDomain {
  label: string
  emoji: string
  color: string
  valenceRange: [number, number] // normalized 0-1
  arousalRange: [number, number] // normalized 0-1
  intensity?: number // 1-3, higher means stronger emotion
}

export const EmotionCircumplex: React.FC<EmotionCircumplexProps> = ({
  position,
  onPositionChange,
  onCircumplexClick,
  onDragStart,
  onDragEnd,
  recordingMode,
  startPosition = { x: 0.5, y: 0.5 },
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)

  // Define emotion domains for each quadrant
  const emotionDomains: EmotionDomain[] = [
    // Q1: Positive valence, high arousal (top right)
    { label: "Excited", emoji: "🤩", color: "rgba(250, 204, 21, 0.7)", valenceRange: [0.7, 1], arousalRange: [0, 0.3], intensity: 3 },
    { label: "Happy", emoji: "😄", color: "rgba(250, 204, 21, 0.6)", valenceRange: [0.6, 0.85], arousalRange: [0.15, 0.4], intensity: 2 },
    { label: "Cheerful", emoji: "😊", color: "rgba(250, 204, 21, 0.5)", valenceRange: [0.55, 0.75], arousalRange: [0.25, 0.45], intensity: 1 },
    { label: "Content", emoji: "🙂", color: "rgba(250, 204, 21, 0.4)", valenceRange: [0.5, 0.65], arousalRange: [0.35, 0.5], intensity: 1 },
    
    // Q2: Negative valence, high arousal (top left)
    { label: "Angry", emoji: "😠", color: "rgba(239, 68, 68, 0.7)", valenceRange: [0, 0.3], arousalRange: [0, 0.3], intensity: 3 },
    { label: "Tense", emoji: "😤", color: "rgba(239, 68, 68, 0.6)", valenceRange: [0.15, 0.4], arousalRange: [0.15, 0.4], intensity: 2 },
    { label: "Nervous", emoji: "😰", color: "rgba(239, 68, 68, 0.5)", valenceRange: [0.25, 0.45], arousalRange: [0.25, 0.45], intensity: 1 },
    { label: "Upset", emoji: "😟", color: "rgba(239, 68, 68, 0.4)", valenceRange: [0.35, 0.5], arousalRange: [0.35, 0.5], intensity: 1 },
    
    // Q3: Negative valence, low arousal (bottom left)
    { label: "Sad", emoji: "😢", color: "rgba(59, 130, 246, 0.7)", valenceRange: [0, 0.3], arousalRange: [0.7, 1], intensity: 3 },
    { label: "Depressed", emoji: "😔", color: "rgba(59, 130, 246, 0.6)", valenceRange: [0.15, 0.4], arousalRange: [0.6, 0.85], intensity: 2 },
    { label: "Bored", emoji: "😒", color: "rgba(59, 130, 246, 0.5)", valenceRange: [0.25, 0.45], arousalRange: [0.55, 0.75], intensity: 1 },
    { label: "Fatigued", emoji: "😪", color: "rgba(59, 130, 246, 0.4)", valenceRange: [0.35, 0.5], arousalRange: [0.5, 0.65], intensity: 1 },
    
    // Q4: Positive valence, low arousal (bottom right)
    { label: "Relaxed", emoji: "😌", color: "rgba(34, 197, 94, 0.7)", valenceRange: [0.7, 1], arousalRange: [0.7, 1], intensity: 3 },
    { label: "Calm", emoji: "😇", color: "rgba(34, 197, 94, 0.6)", valenceRange: [0.6, 0.85], arousalRange: [0.6, 0.85], intensity: 2 },
    { label: "Serene", emoji: "🧘", color: "rgba(34, 197, 94, 0.5)", valenceRange: [0.55, 0.75], arousalRange: [0.55, 0.75], intensity: 1 },
    { label: "At ease", emoji: "😎", color: "rgba(34, 197, 94, 0.4)", valenceRange: [0.5, 0.65], arousalRange: [0.5, 0.65], intensity: 1 },
    
    // Center neutral emotion
    { label: "Neutral", emoji: "😐", color: "rgba(156, 163, 175, 0.5)", valenceRange: [0.4, 0.6], arousalRange: [0.4, 0.6], intensity: 1 },
  ]

  // Find the current emotion domain based on position
  const getCurrentEmotionDomain = useCallback((pos: { x: number; y: number }): EmotionDomain | null => {
    // Convert from normalized coordinates to valence-arousal space for easier matching
    const valence = pos.x
    const arousal = 1 - pos.y  // Invert y-axis so higher y = higher arousal
    
    return emotionDomains.find(domain => 
      valence >= domain.valenceRange[0] && 
      valence <= domain.valenceRange[1] && 
      arousal >= domain.arousalRange[0] && 
      arousal <= domain.arousalRange[1]
    ) || null
  }, [emotionDomains])

  // Position the marker within the container
  const updateMarkerPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

    onPositionChange({ x, y })
  }, [onPositionChange])

  // Handle mouse/touch events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    if (onDragStart) onDragStart()
    updateMarkerPosition(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [onDragStart, updateMarkerPosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    updateMarkerPosition(e.clientX, e.clientY)
  }, [isDragging, updateMarkerPosition])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false)
    if (onDragEnd) onDragEnd()
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [onDragEnd])

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only treat as a click if not dragging
    if (!isDragging) {
      updateMarkerPosition(e.clientX, e.clientY)
      onCircumplexClick({ x: position.x, y: position.y })
    }
  }, [isDragging, onCircumplexClick, position.x, position.y, updateMarkerPosition])

  // Calculate current domain for both marker positions
  const currentDomain = getCurrentEmotionDomain(position)
  
  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-md border-[1.5px] border-gray-300/60 overflow-hidden cursor-grab active:cursor-grabbing bg-white shadow-sm"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {/* Background quadrants with gradient coloring */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-200/80 to-red-300/70"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-200/80 to-amber-300/70"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-200/80 to-sky-300/70"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-green-200/80 to-emerald-300/70"></div>

        {/* Axes */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-400/30"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gray-400/30"></div>

        {/* Axis labels */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-700">
          High Arousal
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-700">
          Low Arousal
        </div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-gray-700">
          Negative
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-gray-700">
          Positive
        </div>

        {/* Emotion domain visualization */}
        <div className="absolute inset-0">
          {emotionDomains.map((domain) => {
            // Calculate domain region position 
            const centerX = (domain.valenceRange[0] + domain.valenceRange[1]) / 2;
            const centerY = 1 - (domain.arousalRange[0] + domain.arousalRange[1]) / 2; // Invert Y for proper positioning
            const isActive = currentDomain?.label === domain.label;
            
            // Create a rectangular domain instead of a circular one
            return (
              <div 
                key={domain.label}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  isActive ? 'scale-110 z-10' : 'opacity-70'
                }`}
                style={{
                  left: `${centerX * 100}%`,
                  top: `${centerY * 100}%`
                }}
              >
                {/* Emotion bubble */}
                <div 
                  className={`flex flex-col items-center justify-center ${
                    isActive ? 'filter drop-shadow-lg' : ''
                  }`}
                >
                  <div 
                    className={`flex items-center justify-center ${
                      isActive ? 'animate-pulse-glow' : ''
                    }`}
                    style={{
                      backgroundColor: domain.color,
                      width: (domain.intensity || 1) * 14 + 'px',
                      height: (domain.intensity || 1) * 14 + 'px',
                      borderRadius: '6px',
                      opacity: isActive ? 1 : 0.7
                    }}
                  >
                    <span 
                      className={`${isActive ? 'text-lg' : 'text-xs'} ${
                        isActive ? 'opacity-100' : 'opacity-80'
                      }`}
                    >
                      {domain.emoji}
                    </span>
                  </div>
                  
                  {/* Only show label if active or medium/high intensity */}
                  {(isActive || (domain.intensity && domain.intensity > 1)) && (
                    <span className={`text-xs font-medium mt-1 px-1 py-0.5 rounded-sm ${
                      isActive 
                        ? 'bg-white/80 text-gray-800 shadow-sm' 
                        : 'text-gray-600'
                    }`}>
                      {domain.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Highlight current domain area with subtle background */}
        {currentDomain && (
          <div
            className="absolute bg-white/30 backdrop-blur-sm transition-all duration-200 z-0 rounded-md"
            style={{
              left: `${currentDomain.valenceRange[0] * 100}%`,
              top: `${(1 - currentDomain.arousalRange[1]) * 100}%`,
              width: `${(currentDomain.valenceRange[1] - currentDomain.valenceRange[0]) * 100}%`,
              height: `${(currentDomain.arousalRange[1] - currentDomain.arousalRange[0]) * 100}%`,
            }}
          />
        )}

        {/* Starting position marker */}
        {recordingMode && recordingMode !== "idle" && startPosition && (
          <div
            className="absolute w-4 h-4 bg-indigo-500 border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 z-20 rounded-sm"
            style={{
              left: `${startPosition.x * 100}%`,
              top: `${startPosition.y * 100}%`,
              opacity: recordingMode === "recording" || recordingMode === "completed" ? 0.8 : 1,
            }}
          />
        )}

        {/* Main position marker */}
        <div
          ref={markerRef}
          className={`absolute w-6 h-6 bg-indigo-600 border-2 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out z-30 ${
            isDragging ? "scale-110" : "scale-100"
          }`}
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            borderRadius: '4px',
          }}
        >
          {/* Current emotion indicator */}
          {currentDomain && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-md text-xs font-medium whitespace-nowrap z-40">
              <div className="flex items-center gap-1">
                <span className="text-base">{currentDomain.emoji}</span>
                <span>{currentDomain.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

