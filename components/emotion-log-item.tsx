"use client"

import { useState, useRef, useEffect, memo } from "react"
import { format } from "date-fns"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Update the EmotionLogEntry interface to include notes
export interface EmotionLogEntry {
  emotion: string
  emoji?: string
  valence: number
  arousal: number
  startEmotion?: string
  startEmoji?: string
  startValence?: number
  startArousal?: number
  timestamp: string
  path?: { x: number; y: number }[]
  notes?: string // Add notes field
  collection?: string
  tags?: string[]
}

interface EmotionLogItemProps {
  entry: EmotionLogEntry
  getEmotionColor: (valence: number, arousal: number) => string
}

// Update the EmotionLogItem component to display notes
export const EmotionLogItem = memo(function EmotionLogItem({ entry, getEmotionColor }: EmotionLogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const emotionColor = getEmotionColor(entry.valence, entry.arousal)
  const formattedDate = format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")

  const hasPath = entry.path && entry.path.length > 1
  const hasStartEmotion =
    entry.startEmotion && entry.startEmoji && entry.startValence !== undefined && entry.startArousal !== undefined
  const hasNotes = entry.notes && entry.notes.trim().length > 0

  // Get start emotion color if available
  const startEmotionColor = hasStartEmotion ? getEmotionColor(entry.startValence!, entry.startArousal!) : ""

  // Get start and end points if path exists
  const startPoint = hasPath && entry.path ? entry.path[0] : null
  const endPoint = hasPath && entry.path ? entry.path[entry.path.length - 1] : null

  // Create a unique ID for the gradient
  const gradientId = `logGradient-${Math.random().toString(36).substring(2, 9)}`

  // Monitor chart container size for responsiveness
  useEffect(() => {
    if (!chartRef.current || !expanded) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setChartDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(chartRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [expanded]);

  // Calculate appropriate dimensions and font sizes based on available space
  const getFontSize = () => {
    if (chartDimensions.width < 300) return '8px';
    if (chartDimensions.width < 400) return '9px';
    return '10px';
  };
  
  const getMarkerRadius = () => {
    if (chartDimensions.width < 300) return 2.5;
    if (chartDimensions.width < 400) return 3;
    return 3.5;
  };
  
  const getStrokeWidth = () => {
    if (chartDimensions.width < 300) return 2;
    if (chartDimensions.width < 400) return 2.25;
    return 2.5;
  };

  // Animation playback handler for path
  const handlePlayAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setActivePointIndex(null);
      return;
    }
    
    setIsPlaying(true);
    const animate = () => {
      let currentIndex = 0;
      
      const step = () => {
        if (!entry.path || currentIndex >= entry.path.length) {
          setIsPlaying(false);
          setActivePointIndex(null);
          return;
        }
        
        setActivePointIndex(currentIndex);
        currentIndex++;
        
        if (currentIndex < entry.path.length) {
          animationRef.current = requestAnimationFrame(() => {
            setTimeout(step, 200);
          });
        } else {
          setTimeout(() => {
            setIsPlaying(false);
            setActivePointIndex(null);
          }, 1000);
        }
      };
      
      step();
    };
    
    animate();
  };
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Get position info at a specific point in the path
  const getPointInfo = (index: number | null) => {
    if (index === null || !entry.path || index >= entry.path.length) return null;
    
    const point = entry.path[index];
    const valence = point.x * 2 - 1; // -1 to 1
    const arousal = -(point.y * 2 - 1); // -1 to 1, inverted
    
    return {
      position: point,
      valence: Number(valence.toFixed(2)),
      arousal: Number(arousal.toFixed(2)),
    };
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 bg-white/70 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-inner ${emotionColor}`}></div>
            <h3 className="font-medium text-gray-800">
              {entry.emotion}
            </h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{formattedDate}</span>
        </div>

        {/* Show start and end emotions if available */}
        {hasStartEmotion && (
          <div className="mt-3 mb-1 flex items-center text-xs text-gray-600 bg-gray-50/70 p-2 rounded-md">
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${startEmotionColor} mr-1.5 shadow-sm`}></div>
              <span className="font-medium">{entry.startEmotion}</span>
            </div>
            <span className="mx-2 text-gray-400">→</span>
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${emotionColor} mr-1.5 shadow-sm`}></div>
              <span className="font-medium">{entry.emotion}</span>
            </div>
          </div>
        )}

        {/* Display notes if available with improved styling */}
        {hasNotes && (
          <div className="mt-3 p-3 bg-indigo-50/50 rounded-md text-sm text-gray-700 border-l-3 border-indigo-300 shadow-sm">
            <p className="whitespace-pre-wrap italic">{entry.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-1.5 px-2.5 rounded-md">
              <span className="text-gray-500 font-medium">Valence:</span> <span className="text-indigo-700">{entry.valence}</span>
            </div>
            <div className="bg-gray-50 p-1.5 px-2.5 rounded-md">
              <span className="text-gray-500 font-medium">Arousal:</span> <span className="text-indigo-700">{entry.arousal}</span>
            </div>
          </div>

          {hasPath && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)} 
              className="h-8 px-3 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronUpIcon className="h-4 w-4 text-gray-600" /> : <ChevronDownIcon className="h-4 w-4 text-gray-600" />}
              <span className="ml-1 text-xs font-medium">{expanded ? "Hide" : "Show"} Path</span>
            </Button>
          )}
        </div>

        {expanded && hasPath && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Emotion Path Visualization</h4>
              
              {/* Add interactive controls */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePlayAnimation} 
                  className="h-7 px-2 text-xs"
                >
                  {isPlaying ? "Stop" : "Play"} Animation
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpanded(!expanded)} 
                  className="h-7 px-2"
                >
                  {expanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            
            {/* Display current point info during animation */}
            {isPlaying && activePointIndex !== null && (
              <div className="mb-2 p-2 bg-indigo-50 rounded-md text-xs animate-fade-in-up">
                <div className="font-medium text-indigo-800">Path Position: {activePointIndex + 1}/{entry.path?.length || 0}</div>
                {getPointInfo(activePointIndex) && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>Valence: {getPointInfo(activePointIndex)?.valence}</span>
                    <span>Arousal: {getPointInfo(activePointIndex)?.arousal}</span>
                  </div>
                )}
              </div>
            )}
            
            <div 
              ref={chartRef}
              className="relative w-full h-[40vw] max-h-40 min-h-[120px] bg-gray-50 rounded-lg overflow-hidden shadow-inner"
            >
              {/* Quadrant backgrounds with significantly more vibrant colors */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-200/80 to-red-300/70"></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-200/80 to-amber-300/70"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-200/80 to-sky-300/70"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-green-200/80 to-emerald-300/70"></div>

              {/* Clear quadrant separators */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-400/30"></div>
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gray-400/30"></div>

              {/* Improved SVG visualization with responsive dimensions */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Define gradient for the path with improved colors */}
                <defs>
                  <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={startPoint ? startPoint.x * 100 : 0}
                    y1={startPoint ? startPoint.y * 100 : 0}
                    x2={endPoint ? endPoint.x * 100 : 0}
                    y2={endPoint ? endPoint.y * 100 : 0}
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="33%" stopColor="#6366f1" />
                    <stop offset="66%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Draw axes with responsive styling */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Draw path with gradient and responsive styling */}
                <polyline
                  points={entry.path?.map((p) => `${p.x * 100},${p.y * 100}`).join(" ") || ""}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={getStrokeWidth()}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                  className={isPlaying ? "emotion-path" : ""}
                />

                {/* Start point with responsive styling */}
                {startPoint && (
                  <g>
                    <circle
                      cx={startPoint.x * 100}
                      cy={startPoint.y * 100}
                      r={getMarkerRadius()}
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    />
                    {chartDimensions.width >= 250 && (
                      <text
                        x={startPoint.x * 100}
                        y={startPoint.y * 100}
                        dy="-6"
                        textAnchor="middle"
                        fill="#047857"
                        fontSize={getFontSize()}
                        fontWeight="bold"
                        style={{ textShadow: "0 0 3px rgba(255,255,255,0.8)" }}
                      >
                        Start
                      </text>
                    )}
                  </g>
                )}

                {/* End point with responsive styling */}
                {endPoint && (
                  <g>
                    <circle
                      cx={endPoint.x * 100}
                      cy={endPoint.y * 100}
                      r={getMarkerRadius()}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    />
                    {chartDimensions.width >= 250 && (
                      <text
                        x={endPoint.x * 100}
                        y={endPoint.y * 100}
                        dy="-6"
                        textAnchor="middle"
                        fill="#b91c1c"
                        fontSize={getFontSize()}
                        fontWeight="bold"
                        style={{ textShadow: "0 0 3px rgba(255,255,255,0.8)" }}
                      >
                        End
                      </text>
                    )}
                  </g>
                )}

                {/* Add dots for intermediate points with responsive styling */}
                {entry.path?.map((point, index) => {
                  // Skip start and end points
                  if (index === 0 || index === entry.path!.length - 1) return null;
                  
                  // Skip some points on small screens to reduce visual clutter
                  if (chartDimensions.width < 300 && index % 2 !== 0 && !isPlaying) return null;

                  const isActive = activePointIndex === index;
                  const dotSize = isActive ? 
                    (chartDimensions.width < 400 ? 3 : 4) : 
                    (chartDimensions.width < 400 ? 1.4 : 1.8);
                  
                  return (
                    <circle 
                      key={index} 
                      cx={point.x * 100} 
                      cy={point.y * 100} 
                      r={dotSize} 
                      fill={isActive ? "rgba(99, 102, 241, 1)" : "rgba(99, 102, 241, 0.8)"}
                      className={isActive ? "emotion-marker" : ""}
                      filter={isActive ? "drop-shadow(0 0 3px rgba(99, 102, 241, 0.7))" : "drop-shadow(0 0 1px rgba(255,255,255,0.5))"}
                    />
                  );
                })}
                
                {/* Show current position during animation */}
                {isPlaying && activePointIndex !== null && entry.path && activePointIndex < entry.path.length && (
                  <circle 
                    cx={entry.path[activePointIndex].x * 100} 
                    cy={entry.path[activePointIndex].y * 100} 
                    r="3.5" 
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="1.5"
                    className="emotion-marker"
                  />
                )}
              </svg>

              {/* Labels with responsive styling - hide on very small screens */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[9px] font-medium text-gray-500 bg-white/70 px-1 rounded-b-md shadow-sm"
                   style={{ fontSize: getFontSize() }}>
                {chartDimensions.width < 250 ? "+" : "Activated"}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[9px] font-medium text-gray-500 bg-white/70 px-1 rounded-t-md shadow-sm"
                   style={{ fontSize: getFontSize() }}>
                {chartDimensions.width < 250 ? "-" : "Deactivated"}
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[9px] font-medium text-gray-500 bg-white/70 px-1 rounded-r-md shadow-sm"
                   style={{ fontSize: getFontSize() }}>
                {chartDimensions.width < 250 ? "-" : "Negative"}
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[9px] font-medium text-gray-500 bg-white/70 px-1 rounded-l-md shadow-sm"
                   style={{ fontSize: getFontSize() }}>
                {chartDimensions.width < 250 ? "+" : "Positive"}
              </div>
            </div>
            
            {/* Interactive timeline slider for path exploration */}
            {hasPath && entry.path && entry.path.length > 2 && (
              <div className="mt-3 px-1">
                <input
                  type="range"
                  min="0"
                  max={entry.path.length - 1}
                  value={activePointIndex !== null ? activePointIndex : 0}
                  aria-valuenow={activePointIndex !== null ? activePointIndex : 0}
                  onChange={(e) => {
                    if (isPlaying) {
                      if (animationRef.current !== null) {
                        cancelAnimationFrame(animationRef.current);
                        animationRef.current = null;
                      }
                      setIsPlaying(false);
                    }
                    setActivePointIndex(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={isPlaying}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Start</span>
                  <span>End</span>
                </div>
              </div>
            )}
            
            {/* Responsive path information footer */}
            <div className="mt-2 text-xs text-gray-600 flex flex-wrap justify-between bg-gray-50 p-2 rounded-md">
              <span className="font-medium">
                Path: <span className="text-indigo-600">{entry.path?.length || 0} points</span>
              </span>
              <div className="flex items-center gap-2 md:gap-3 ml-auto">
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Start
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span> End
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})

