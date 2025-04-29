// Consolidated Circumplex and Path visualization logic
// Contains: EmotionCircumplex, EmotionPath, and shared utils

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getValenceArousal, getEmotionFromVA } from '@/lib/emotion-utils'

// Consolidated Props
interface EmotionCircumplexProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onCircumplexClick?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  recordingMode?: "idle" | "start-selected" | "recording" | "completed";
  startPosition?: { x: number; y: number };
}

function EmotionCircumplex({
  position,
  onPositionChange,
  onCircumplexClick,
  onDragStart,
  onDragEnd,
  recordingMode = "idle",
  startPosition = { x: 0.5, y: 0.5 },
}: EmotionCircumplexProps) {
  const planeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);

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
      const rect = planeRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
      // Update hovered quadrant for interactive effects
      const currentQuadrant = getQuadrant(x, y);
      if (currentQuadrant !== hoveredQuadrant) {
        setHoveredQuadrant(currentQuadrant);
      }
    }
  };

  // Handle click on the plane
  const handlePlaneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (planeRef.current) {
      const rect = planeRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      if (onCircumplexClick) {
        onCircumplexClick({ x, y });
      } else {
        onPositionChange({ x, y });
      }
    }
  };

  // Handle mouse down on the marker
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  // Handle mouse move
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging && planeRef.current) {
        const rect = planeRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        onPositionChange({ x, y });
      }
    },
    [isDragging, onPositionChange]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle touch events for mobile
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (isDragging && planeRef.current && event.touches[0]) {
        const rect = planeRef.current.getBoundingClientRect();
        const touch = event.touches[0];
        const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
        onPositionChange({ x, y });
      }
    },
    [isDragging, onPositionChange]
  );

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  // Add and remove touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }
    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={planeRef}
      onMouseMove={handleMouseMoveOverPlane}
      onClick={handlePlaneClick}
      onTouchStart={handleTouchStart}
      style={{ width: '100%', height: '100%', position: 'relative', aspectRatio: '1/1', borderRadius: '1rem', boxShadow: '0 4px 32px 0 rgba(99,102,241,0.10)' }}
      className="emotion-circumplex-container"
    >
      <svg
        width={containerSize.width}
        height={containerSize.height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="circumplexGradient" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="70%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#fff" />
          </radialGradient>
          <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Circumplex background with gradient */}
        <circle
          cx={containerSize.width / 2}
          cy={containerSize.height / 2}
          r={Math.min(containerSize.width, containerSize.height) / 2 - markerSize}
          fill="url(#circumplexGradient)"
          stroke="#d1d5db"
          strokeWidth={2}
          filter="url(#glow)"
        />
        {/* Axes */}
        <line
          x1={containerSize.width / 2}
          y1={markerSize}
          x2={containerSize.width / 2}
          y2={containerSize.height - markerSize}
          stroke="#a3a3a3"
          strokeWidth={1}
          strokeDasharray="6 6"
          opacity="0.5"
        />
        <line
          x1={markerSize}
          y1={containerSize.height / 2}
          x2={containerSize.width - markerSize}
          y2={containerSize.height / 2}
          stroke="#a3a3a3"
          strokeWidth={1}
          strokeDasharray="6 6"
          opacity="0.5"
        />
        {/* Quadrant Labels with glow and larger font */}
        <text x={containerSize.width - markerSize * 2} y={markerSize * 2.5} fontSize={22} fill="#6366f1" textAnchor="end" style={{ fontWeight: 700, textShadow: '0 0 8px #6366f1AA' }}>Excited</text>
        <text x={markerSize * 2} y={markerSize * 2.5} fontSize={22} fill="#f59e42" textAnchor="start" style={{ fontWeight: 700, textShadow: '0 0 8px #f59e42AA' }}>Tense</text>
        <text x={markerSize * 2} y={containerSize.height - markerSize * 1.5} fontSize={22} fill="#f87171" textAnchor="start" style={{ fontWeight: 700, textShadow: '0 0 8px #f87171AA' }}>Sad</text>
        <text x={containerSize.width - markerSize * 2} y={containerSize.height - markerSize * 1.5} fontSize={22} fill="#34d399" textAnchor="end" style={{ fontWeight: 700, textShadow: '0 0 8px #34d399AA' }}>Calm</text>
        {/* Marker with animated glow */}
        <circle
          cx={position.x * containerSize.width}
          cy={position.y * containerSize.height}
          r={markerSize}
          fill="#6366f1"
          style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 16px #6366f1AA)', transition: 'fill 0.2s' }}
          className="emotion-marker-animated"
          onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e as any); }}
          onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e as any); }}
        />
      </svg>
    </div>
  );
}

interface EmotionPathProps {
  path: { x: number; y: number }[];
}

function EmotionPath({ path }: EmotionPathProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  if (path.length < 2) return null;
  return (
    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d={path.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")}
        stroke="url(#pathGradient)"
        strokeWidth={4}
        fill="none"
        style={{ filter: 'drop-shadow(0 0 8px #6366f1AA)', strokeDasharray: 2000, strokeDashoffset: 0, transition: 'stroke-dashoffset 1s' }}
        className="emotion-path-animated"
      />
    </svg>
  );
}

export { EmotionCircumplex, EmotionPath };
