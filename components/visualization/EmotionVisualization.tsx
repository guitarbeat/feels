// Consolidated Circumplex and Path visualization logic
// Contains: EmotionCircumplex, EmotionPath, and shared utils

import React, { useState, useRef, useEffect, useCallback } from "react";

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
    >
      <svg>
        <circle
          cx={position.x * containerSize.width}
          cy={position.y * containerSize.height}
          r={markerSize}
          fill="black"
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
    <svg ref={svgRef}>
      <path
        d={path.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")}
        stroke="black"
        strokeWidth={2}
      />
    </svg>
  );
}

export { EmotionCircumplex, EmotionPath };
