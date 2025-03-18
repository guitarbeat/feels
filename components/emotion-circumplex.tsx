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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null)
  
  // Calculate marker size based on container size for better responsiveness
  const getMarkerSize = useCallback(() => {
    if (containerSize.width <= 0) return 28; // Default size
    return Math.max(Math.min(containerSize.width / 12, 32), 20); // Responsive size between 20-32px
  }, [containerSize.width]);
  
  const markerSize = getMarkerSize();

  // Resize observer to track container dimensions
  useEffect(() => {
    if (!planeRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    
    resizeObserver.observe(planeRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Function to determine which quadrant the mouse is in
  const getQuadrant = useCallback((x: number, y: number): string => {
    if (x >= 0.5 && y < 0.5) return "topRight";
    if (x < 0.5 && y < 0.5) return "topLeft";
    if (x < 0.5 && y >= 0.5) return "bottomLeft";
    return "bottomRight";
  }, []);

  // Handle mouse move over the plane to track position for label visibility
  const handleMouseMoveOverPlane = (event: React.MouseEvent<HTMLDivElement>) => {
    if (planeRef.current) {
      const rect = planeRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      setMousePosition({ x, y })
      
      // Update hovered quadrant for interactive effects
      const currentQuadrant = getQuadrant(x, y);
      if (currentQuadrant !== hoveredQuadrant) {
        setHoveredQuadrant(currentQuadrant);
      }
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

  // Function to determine if a label should be visible based on mouse proximity and screen size
  const isLabelVisible = (labelX: number, labelY: number) => {
    // Adjust threshold based on container size for better mobile experience
    const threshold = containerSize.width < 400 ? 0.12 : containerSize.width < 600 ? 0.1 : 0.08;
    const distance = Math.sqrt(Math.pow(mousePosition.x - labelX, 2) + Math.pow(mousePosition.y - labelY, 2));
    return distance < threshold && !isDragging;
  }
  // Organized emotion label positions
  const emotionLabels = [
    // Top-right (High arousal, positive valence)
    { x: 0.75, y: 0.15, label: "Excited", emoji: "🤩", color: "text-yellow-700" },
    { x: 0.85, y: 0.3, label: "Happy", emoji: "😄", color: "text-yellow-700" },
    { x: 0.88, y: 0.22, label: "Cheerful", emoji: "😁", color: "text-yellow-700" },
    { x: 0.78, y: 0.25, label: "Delighted", emoji: "😍", color: "text-yellow-700" },
    { x: 0.82, y: 0.15, label: "Euphoric", emoji: "🤗", color: "text-yellow-700" },

    // Top-left (High arousal, negative valence)
    { x: 0.25, y: 0.15, label: "Angry", emoji: "😠", color: "text-red-700" },
    { x: 0.15, y: 0.3, label: "Anxious", emoji: "😰", color: "text-red-700" },
    { x: 0.2,  y: 0.2, label: "Annoyed", emoji: "😖", color: "text-red-700" },
    { x: 0.15, y: 0.25, label: "Frustrated", emoji: "😤", color: "text-red-700" },
    { x: 0.22, y: 0.18, label: "Tense", emoji: "😬", color: "text-red-700" },

    // Bottom-left (Low arousal, negative valence)
    { x: 0.25, y: 0.85, label: "Sad", emoji: "😢", color: "text-blue-700" },
    { x: 0.15, y: 0.7,  label: "Depressed", emoji: "😔", color: "text-blue-700" },
    { x: 0.25, y: 0.9,  label: "Hopeless", emoji: "😩", color: "text-blue-700" },
    { x: 0.2,  y: 0.8,  label: "Discouraged", emoji: "😞", color: "text-blue-700" },
    { x: 0.18, y: 0.75, label: "Lonely", emoji: "😟", color: "text-blue-700" },

    // Bottom-right (Low arousal, positive valence)
    { x: 0.75, y: 0.85, label: "Relaxed", emoji: "😌", color: "text-green-700" },
    { x: 0.85, y: 0.7,  label: "Calm", emoji: "😇", color: "text-green-700" },
    { x: 0.8,  y: 0.8,  label: "Serene", emoji: "😌", color: "text-green-700" },
    { x: 0.85, y: 0.85, label: "Tranquil", emoji: "🌿", color: "text-green-700" },
    { x: 0.78, y: 0.75, label: "Content", emoji: "😊", color: "text-green-700" },
  ]
  const getQuadrantInfo = (quadrant: string) => {
    switch (quadrant) {
      case "topRight":
        return {
          name: "Excitement",
          description: "High energy, positive",
          color: "",
          hoverClass: ""
        }
      case "topLeft":
        return {
          name: "Distress",
          description: "High energy, negative",
          color: "",
          hoverClass: ""
        }
      case "bottomLeft":
        return {
          name: "Depression",
          description: "Low energy, negative",
          color: "",
          hoverClass: ""
        }
      case "bottomRight":
        return {
          name: "Contentment",
          description: "Low energy, positive",
          color: "",
          hoverClass: ""
        }
      default:
        return { name: "", description: "", color: "", hoverClass: "" }
    }
  }

  // Helper function to get valence and arousal from position
  const getValenceArousal = (x: number, y: number) => {
    const valence = x * 2 - 1; // -1 to 1
    const arousal = -(y * 2 - 1); // -1 to 1, inverted y-axis
    return { valence, arousal };
  };

  // Add keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = 0.05;
    const newPosition = { ...position };
    
    switch (event.key) {
      case 'ArrowUp':
        newPosition.y = Math.max(0, position.y - step);
        break;
      case 'ArrowDown':
        newPosition.y = Math.min(1, position.y + step);
        break;
      case 'ArrowLeft':
        newPosition.x = Math.max(0, position.x - step);
        break;
      case 'ArrowRight':
        newPosition.x = Math.min(1, position.x + step);
        break;
      default:
        return;
    }
    
    onPositionChange(newPosition);
    event.preventDefault();
  };
  
  return (
    <div className="relative">
      <div
        ref={planeRef}
        className="relative bg-white border border-gray-200 rounded-xl cursor-pointer overflow-hidden shadow-lg w-full aspect-square transition-all duration-300 hover:shadow-xl"
        onClick={handlePlaneClick}
        onMouseMove={handleMouseMoveOverPlane}
        onMouseLeave={() => setHoveredQuadrant(null)}
        tabIndex={0}
        role="slider"
        aria-label="Emotion selector"
        aria-valuetext={`Valence: ${getValenceArousal(position.x, position.y).valence.toFixed(2)}, Arousal: ${getValenceArousal(position.x, position.y).arousal.toFixed(2)}`}
        onKeyDown={handleKeyDown}
        aria-valuenow={position.x}
      >
        {/* Background with cleaner, more distinct quadrants */}
        <div className="absolute inset-0">
          {/* Base plain white background */}
          <div className="absolute inset-0 bg-white"></div>
          
          {/* Quadrants with improved color separation - removed accent circles */}
          <div className={`absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-100/80 to-red-200/70 transition-opacity duration-200 ${hoveredQuadrant === "topLeft" ? "opacity-100" : "opacity-80"}`}></div>
          <div className={`absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-100/80 to-amber-200/70 transition-opacity duration-200 ${hoveredQuadrant === "topRight" ? "opacity-100" : "opacity-80"}`}></div>
          <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/80 to-sky-200/70 transition-opacity duration-200 ${hoveredQuadrant === "bottomLeft" ? "opacity-100" : "opacity-80"}`}></div>
          <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-green-100/80 to-emerald-200/70 transition-opacity duration-200 ${hoveredQuadrant === "bottomRight" ? "opacity-100" : "opacity-80"}`}></div>
          
          {/* Grid overlay for better positioning reference */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIiAvPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        {/* Stronger, more visible axes */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-400/60 z-[1]"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gray-400/60 z-[1]"></div>

        {/* Concentric circles with enhanced visibility */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border border-gray-300/50 rounded-full"></div>
        {containerSize.width >= 300 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-gray-300/50 rounded-full"></div>
        )}
        {containerSize.width >= 400 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] border border-gray-300/50 rounded-full"></div>
        )}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[10%] border-2 border-gray-300/60 rounded-full bg-gray-100/30"></div>

        {/* Interactive tooltip that follows cursor */}
        {mousePosition.x > 0 && !isDragging && hoveredQuadrant && (
          <div
            className="absolute px-3 py-2 bg-white/95 backdrop-blur-sm rounded-md shadow-lg text-xs border border-gray-100 transition-opacity z-50 animate-fade-in-up"
            style={{
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100 + 15}px`,
              transform: 'translateX(-50%)',
              opacity: isDragging ? 0 : 1,
              pointerEvents: 'none'
            }}
          >
            <div className="font-medium text-gray-800">{getQuadrantInfo(hoveredQuadrant).name}</div>
            <div className="text-xs text-gray-600">{getQuadrantInfo(hoveredQuadrant).description}</div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 text-xs text-gray-700">
              <span>Valence: <strong>{getValenceArousal(mousePosition.x, mousePosition.y).valence.toFixed(2)}</strong></span>
              <span>Arousal: <strong>{getValenceArousal(mousePosition.x, mousePosition.y).arousal.toFixed(2)}</strong></span>
            </div>
          </div>
        )}
        
        {/* Enhanced emotion labels */}
        {emotionLabels.map((emotion, index) => {
          if (containerSize.width < 300 && index % 2 !== 0) return null;
          
          return (
            <div
              key={index}
              className={`absolute text-xs font-medium ${emotion.color} bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md flex items-center gap-1 transition-all duration-300 ${
                isLabelVisible(emotion.x, emotion.y) ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{
                left: `${emotion.x * 100}%`,
                top: `${emotion.y * 100}%`,
                transform: "translate(-50%, -50%)",
                fontSize: containerSize.width < 400 ? '0.65rem' : '0.75rem',
                zIndex: 5
              }}
            >
              <span className="text-base">{emotion.emoji}</span>
              {containerSize.width >= 350 && <span>{emotion.label}</span>}
            </div>
          );
        })}

        {/* Cleaner axis labels with consistent styling */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm"
             style={{ fontSize: containerSize.width < 400 ? '0.65rem' : '0.75rem', zIndex: 5 }}>
          {containerSize.width < 350 ? '-' : 'Negative'}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm"
             style={{ fontSize: containerSize.width < 400 ? '0.65rem' : '0.75rem', zIndex: 5 }}>
          {containerSize.width < 350 ? '+' : 'Positive'}
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm"
             style={{ fontSize: containerSize.width < 400 ? '0.65rem' : '0.75rem', zIndex: 5 }}>
          {containerSize.width < 350 ? '↑' : 'High Energy'}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm"
             style={{ fontSize: containerSize.width < 400 ? '0.65rem' : '0.75rem', zIndex: 5 }}>
          {containerSize.width < 350 ? '↓' : 'Low Energy'}
        </div>

        {/* Cleaner quadrant labels */}
        {containerSize.width >= 450 && (
          <>
            <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-red-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-10">
              Distress
            </div>
            <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-yellow-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-10">
              Excitement
            </div>
            <div className="absolute top-[75%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-blue-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-10">
              Depression
            </div>
            <div className="absolute top-[75%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-green-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-10">
              Contentment
            </div>
          </>
        )}

        {/* Enhanced start position marker */}
        {(recordingMode === "start-selected" || recordingMode === "recording" || recordingMode === "completed") && (
          <div
            className="absolute bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-md z-20"
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

        {/* Enhanced current position marker */}
        <div
          className={`absolute rounded-full border-2 border-white shadow-lg cursor-grab ${
            isDragging ? "cursor-grabbing scale-110 shadow-xl" : ""
          } transition-all duration-300 ease-out z-30 ${
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
            boxShadow: isDragging ? '0 0 0 3px rgba(99, 102, 241, 0.3)' : '',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <span className="sr-only">Emotion marker</span>
          {/* Improved pulse animation */}
          <span
            className={`absolute inset-0 rounded-full ${
              recordingMode === "recording" ? "bg-red-400" : "bg-indigo-400"
            } opacity-30 animate-ping`}
          ></span>
        </div>

        {/* More visible recording indicator */}
        {recordingMode === "recording" && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-md z-40">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            REC
          </div>
        )}
      </div>
      
      {/* More compact, clearer legend */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-2xs sm:text-xs px-1">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-300 to-red-400"></div>
          <span className="truncate">Distress (High-Neg)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400"></div>
          <span className="truncate">Excitement (High-Pos)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-300 to-sky-400"></div>
          <span className="truncate">Depression (Low-Neg)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-300 to-emerald-400"></div>
          <span className="truncate">Contentment (Low-Pos)</span>
        </div>
      </div>
    </div>
  )
}

