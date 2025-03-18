"use client"

import React, { useRef } from "react"

interface EmotionPathProps {
  path: { x: number; y: number }[];
  showPoints?: boolean;
  showLabels?: boolean;
}

export const EmotionPath: React.FC<EmotionPathProps> = ({ 
  path, 
  showPoints = true,
  showLabels = false
}) => {
  const size = 300; // Base size for calculations
  
  // No path or single point
  if (!path || path.length < 2) return null;
  
  // Create SVG path data
  const pathData = path.map((point, index) => {
    // Convert normalized coordinates to pixels
    const x = point.x * size;
    const y = point.y * size;
    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  
  // Create a function to determine point opacity and size
  // to prevent visual crowding
  const getPointStyle = (index: number, total: number) => {
    // Always show first and last points
    if (index === 0 || index === total - 1) {
      return {
        r: 3,
        opacity: 1
      };
    }
    
    // For middle points, use a smaller size and lower opacity
    // Show fewer points for longer paths
    const skipFactor = Math.max(1, Math.floor(total / 20));
    const isVisible = index % skipFactor === 0;
    
    return {
      r: isVisible ? 2 : 0,
      opacity: isVisible ? 0.7 : 0
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="emotion-path"
        style={{ overflow: 'visible' }}
      >
        {/* Path line with smooth curve */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(99, 102, 241, 0.7)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          style={{
            animation: 'dash 1.5s ease-in-out forwards',
            filter: 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.3))'
          }}
        />
        
        {/* Show only start and end points by default */}
        {showPoints && (
          <>
            {/* Start point */}
            <circle
              cx={path[0].x * size}
              cy={path[0].y * size}
              r="5"
              fill="#4f46e5"
              className="start-marker"
              style={{ filter: 'drop-shadow(0 0 3px rgba(79, 70, 229, 0.6))' }}
            />
            
            {/* End point */}
            <circle
              cx={path[path.length - 1].x * size}
              cy={path[path.length - 1].y * size}
              r="5"
              fill="#ef4444"
              className="end-marker"
              style={{ filter: 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.6))' }}
            />
            
            {/* Optional middle points with reduced visual prominence */}
            {path.slice(1, -1).map((point, idx) => {
              const pointStyle = getPointStyle(idx + 1, path.length);
              return pointStyle.r > 0 ? (
                <circle
                  key={`point-${idx}`}
                  cx={point.x * size}
                  cy={point.y * size}
                  r={pointStyle.r}
                  fill="rgba(99, 102, 241, 0.6)"
                  opacity={pointStyle.opacity}
                  className="path-point"
                />
              ) : null;
            })}
          </>
        )}
      </svg>
    </div>
  );
};

