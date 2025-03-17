"use client"

import { useState, useCallback, useRef } from "react"
import {
  BookmarkIcon,
  HistoryIcon,
  SaveIcon,
  InfoIcon,
  XCircleIcon,
  TrashIcon,
  UndoIcon,
  EditIcon,
  AlertCircleIcon,
  PlayIcon,
  StopCircleIcon,
  TargetIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EmotionCircumplex } from "@/components/emotion-circumplex"
import { EmotionPath } from "@/components/emotion-path"
import { type EmotionLogEntry, EmotionLogItem } from "@/components/emotion-log-item"
import { EmotionInsights } from "@/components/emotion-insights"

export default function EmotionTracker() {
  const [markerPosition, setMarkerPosition] = useState({ x: 0.5, y: 0.5 }) // Normalized 0-1 values
  const [, setIsDragging] = useState(false)
  const [emotionLog, setEmotionLog] = useState<EmotionLogEntry[]>([])
  const [currentDragPath, setCurrentDragPath] = useState<{ x: number; y: number }[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null)
  const [entryToDeleteIndex, setEntryToDeleteIndex] = useState<number | null>(null)
  const [undoStack, setUndoStack] = useState<EmotionLogEntry[][]>([])
  const [showHelp, setShowHelp] = useState(false)

  // New state for the two-step recording process
  const [recordingMode, setRecordingMode] = useState<"idle" | "start-selected" | "recording" | "completed">("idle")
  const [startPosition, setStartPosition] = useState({ x: 0.5, y: 0.5 })
  const [endPosition, setEndPosition] = useState({ x: 0.5, y: 0.5 })

  // Store initial position when starting to edit
  const initialPositionRef = useRef({ x: 0.5, y: 0.5 })

  // Add state for emotion notes
  const [emotionNotes, setEmotionNotes] = useState("")

  // Calculate valence and arousal from normalized position
  const getValenceArousal = useCallback((x: number, y: number) => {
    const valence = x * 2 - 1 // Normalize to -1 to 1
    const arousal = -(y * 2 - 1) // Normalize to -1 to 1, invert y-axis
    return {
      valence: Number.parseFloat(valence.toFixed(2)),
      arousal: Number.parseFloat(arousal.toFixed(2)),
    }
  }, [])

  // Update the getEmotionFromVA function to include emojis
  const getEmotionFromVA = useCallback((valence: number, arousal: number): { label: string; emoji: string } => {
    if (valence >= 0 && arousal >= 0) {
      if (arousal > 0.7 && valence > 0.7) return { label: "Excited", emoji: "🤩" }
      if (arousal > 0.5 && valence > 0.5) return { label: "Happy", emoji: "😄" }
      if (arousal > 0.3) return { label: "Cheerful", emoji: "😊" }
      return { label: "Content", emoji: "🙂" }
    }
    if (valence < 0 && arousal >= 0) {
      if (arousal > 0.7 && valence < -0.7) return { label: "Angry", emoji: "😠" }
      if (arousal > 0.5 && valence < -0.5) return { label: "Tense", emoji: "😤" }
      if (arousal > 0.3) return { label: "Nervous", emoji: "😰" }
      return { label: "Upset", emoji: "😟" }
    }
    if (valence < 0 && arousal < 0) {
      if (arousal < -0.7 && valence < -0.7) return { label: "Sad", emoji: "😢" }
      if (arousal < -0.5 && valence < -0.5) return { label: "Depressed", emoji: "😔" }
      if (valence < -0.3) return { label: "Bored", emoji: "😒" }
      return { label: "Fatigued", emoji: "😪" }
    }
    if (valence >= 0 && arousal < 0) {
      if (arousal < -0.7 && valence > 0.7) return { label: "Relaxed", emoji: "😌" }
      if (arousal < -0.5 && valence > 0.5) return { label: "Calm", emoji: "😇" }
      if (valence > 0.3) return { label: "Serene", emoji: "🧘" }
      return { label: "At ease", emoji: "😎" }
    }
    return { label: "Neutral", emoji: "😐" }
  }, [])

  // Handle circumplex click based on the current recording mode
  const handleCircumplexClick = useCallback(
    (position: { x: number; y: number }) => {
      if (recordingMode === "idle" || recordingMode === "completed") {
        // Set the start position
        setStartPosition(position)
        setMarkerPosition(position)
        setCurrentDragPath([position])
        setRecordingMode("start-selected")
      } else if (recordingMode === "recording") {
        // Add to the path during recording
        setCurrentDragPath((prev) => [...prev, position])
        setMarkerPosition(position)
        setEndPosition(position)
      }
    },
    [recordingMode],
  )

  // Handle position change during dragging
  const handlePositionChange = useCallback(
    (position: { x: number; y: number }) => {
      setMarkerPosition(position)

      if (recordingMode === "recording") {
        setCurrentDragPath((prev) => [...prev, position])
        setEndPosition(position)
      } else if (recordingMode === "start-selected" || recordingMode === "idle") {
        // Just update the position without recording a path
        setStartPosition(position)
        setCurrentDragPath([position])
      }
    },
    [recordingMode],
  )

  // Start recording a path
  const startRecording = useCallback(() => {
    setRecordingMode("recording")
    // Initialize the path with the current position
    setCurrentDragPath([startPosition])
  }, [startPosition])

  // Stop recording a path
  const stopRecording = useCallback(() => {
    setRecordingMode("completed")
    // Ensure we have at least two points
    if (currentDragPath.length === 1) {
      setCurrentDragPath([...currentDragPath, markerPosition])
      setEndPosition(markerPosition)
    }
  }, [currentDragPath, markerPosition])

  // Reset the current emotion selection
  const resetSelection = useCallback(() => {
    setMarkerPosition({ x: 0.5, y: 0.5 })
    setStartPosition({ x: 0.5, y: 0.5 })
    setEndPosition({ x: 0.5, y: 0.5 })
    setCurrentDragPath([])
    setRecordingMode("idle")
  }, [])

  // Cancel the current operation
  const cancelOperation = useCallback(() => {
    if (editingEntryIndex !== null) {
      // If editing, restore the original position
      setMarkerPosition(initialPositionRef.current)
      setEditingEntryIndex(null)
    }
    resetSelection()
  }, [editingEntryIndex, resetSelection])

  // Update the logEmotion function to include notes
  const logEmotion = useCallback(() => {
    // Save current state for undo
    setUndoStack((prev) => [...prev, [...emotionLog]])

    const startVA = getValenceArousal(startPosition.x, startPosition.y)
    const endVA = getValenceArousal(endPosition.x, endPosition.y)
    const startEmotionData = getEmotionFromVA(startVA.valence, startVA.arousal)
    const endEmotionData = getEmotionFromVA(endVA.valence, endVA.arousal)

    if (editingEntryIndex !== null) {
      // Update existing entry
      const updatedLog = [...emotionLog]
      updatedLog[editingEntryIndex] = {
        ...updatedLog[editingEntryIndex],
        emotion: endEmotionData.label,
        emoji: endEmotionData.emoji,
        valence: endVA.valence,
        arousal: endVA.arousal,
        startEmotion: startEmotionData.label,
        startEmoji: startEmotionData.emoji,
        startValence: startVA.valence,
        startArousal: startVA.arousal,
        path: currentDragPath.length > 1 ? [...currentDragPath] : updatedLog[editingEntryIndex].path,
        notes: emotionNotes, // Add notes
      }
      setEmotionLog(updatedLog)
      setEditingEntryIndex(null)
    } else {
      // Create new entry
      const newEntry: EmotionLogEntry = {
        emotion: endEmotionData.label,
        emoji: endEmotionData.emoji,
        valence: endVA.valence,
        arousal: endVA.arousal,
        startEmotion: startEmotionData.label,
        startEmoji: startEmotionData.emoji,
        startValence: startVA.valence,
        startArousal: startVA.arousal,
        timestamp: new Date().toISOString(),
        path: currentDragPath.length > 1 ? [...currentDragPath] : undefined,
        notes: emotionNotes, // Add notes
      }
      setEmotionLog((prev) => [newEntry, ...prev])
    }

    // Reset after logging
    resetSelection()
    setShowConfirmDialog(false)
    setEmotionNotes("") // Clear notes
  }, [
    startPosition,
    endPosition,
    currentDragPath,
    getValenceArousal,
    getEmotionFromVA,
    emotionLog,
    editingEntryIndex,
    resetSelection,
    emotionNotes,
  ])

  // Handle editing an existing entry
  const startEditEntry = useCallback(
    (index: number) => {
      const entry = emotionLog[index]

      // If we have a start position in the entry, use it
      if (entry.startValence !== undefined && entry.startArousal !== undefined) {
        const startX = (entry.startValence + 1) / 2
        const startY = (1 - entry.startArousal) / 2
        setStartPosition({ x: startX, y: startY })
      } else {
        // Otherwise use the main position as both start and end
        const x = (entry.valence + 1) / 2
        const y = (1 - entry.arousal) / 2
        setStartPosition({ x, y })
      }

      // Set end position (current emotion)
      const endX = (entry.valence + 1) / 2
      const endY = (1 - entry.arousal) / 2

      // Set current marker to end position
      setMarkerPosition({ x: endX, y: endY })

      // Store initial position for cancel operation
      initialPositionRef.current = { x: endX, y: endY }

      // Set the path if it exists
      if (entry.path && entry.path.length > 0) {
        setCurrentDragPath(entry.path)
      } else {
        // Create a simple path from start to end
        const startX =
          entry.startValence !== undefined && entry.startValence !== null
            ? (entry.startValence + 1) / 2
            : (entry.valence + 1) / 2
        const startY =
          entry.startArousal !== undefined && entry.startArousal !== null
            ? (1 - entry.startArousal) / 2
            : (1 - entry.arousal) / 2
        const endX = (entry.valence + 1) / 2
        const endY = (1 - entry.arousal) / 2
        setCurrentDragPath([
          { x: startX, y: startY },
          { x: endX, y: endY },
        ])
      }

      // Set notes if they exist
      setEmotionNotes(entry.notes || "")

      setEditingEntryIndex(index)
      setRecordingMode("completed")
    },
    [emotionLog, setEmotionNotes],
  )

  // Handle deleting an entry
  const deleteEntry = useCallback((index: number) => {
    setEntryToDeleteIndex(index)
    setShowDeleteDialog(true)
  }, [])

  // Confirm deletion
  const confirmDelete = useCallback(() => {
    if (entryToDeleteIndex !== null) {
      // Save current state for undo
      setUndoStack((prev) => [...prev, [...emotionLog]])

      // Remove the entry
      setEmotionLog((prev) => prev.filter((_, i) => i !== entryToDeleteIndex))
      setEntryToDeleteIndex(null)
      setShowDeleteDialog(false)
    }
  }, [entryToDeleteIndex, emotionLog])

  // Undo the last action
  const undoLastAction = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1]
      setEmotionLog(lastState)
      setUndoStack((prev) => prev.slice(0, -1))
    }
  }, [undoStack])

  // Get current emotion data based on marker position
  const { valence, arousal } = getValenceArousal(markerPosition.x, markerPosition.y)
  const currentEmotionData = getEmotionFromVA(valence, arousal)
  const currentEmotion = currentEmotionData.label
  const currentEmoji = currentEmotionData.emoji

  // Get start emotion data
  const startVA = getValenceArousal(startPosition.x, startPosition.y)
  const startEmotionData = getEmotionFromVA(startVA.valence, startVA.arousal)

  // Update the emotion color function to match emojis better
  const getEmotionColor = useCallback((valence: number, arousal: number): string => {
    if (valence >= 0 && arousal >= 0) return "bg-yellow-500" // Happy/Excited
    if (valence < 0 && arousal >= 0) return "bg-red-500" // Angry/Tense
    if (valence < 0 && arousal < 0) return "bg-blue-500" // Sad/Depressed
    return "bg-green-500" // Calm/Relaxed
  }, [])

  const emotionColor = getEmotionColor(valence, arousal)
  const startEmotionColor = getEmotionColor(startVA.valence, startVA.arousal)

  // Export emotion log as JSON
  const exportLog = useCallback(() => {
    const dataStr = JSON.stringify(emotionLog, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `emotion-log-${new Date().toISOString().slice(0, 10)}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }, [emotionLog])

  // Get status message based on recording mode
  const getStatusMessage = useCallback(() => {
    if (editingEntryIndex !== null) {
      return "Editing emotion - click to adjust position"
    }

    switch (recordingMode) {
      case "idle":
        return "Click on the circumplex to set your starting emotion"
      case "start-selected":
        return "Starting emotion set - click 'Record Path' to track emotional change"
      case "recording":
        return "Recording path - move to track your emotional change"
      case "completed":
        return "Path recorded - click 'Log Emotion' to save"
      default:
        return ""
    }
  }, [recordingMode, editingEntryIndex])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold text-indigo-800 mb-4 md:mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl text-indigo-600">😊</span>
        </div>
        Emotion Tracker
      </h1>

      <div className="w-full max-w-4xl">
        <Tabs defaultValue="circumplex" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 rounded-xl overflow-hidden bg-indigo-50/50 p-1">
            <TabsTrigger value="circumplex" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">
              Circumplex Model
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">
              Emotion History
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">
              Scientific Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="circumplex">
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl bg-white">
              <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border-b border-gray-100">
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <InfoIcon className="w-5 h-5 text-indigo-600" />
                    Valence-Arousal Circumplex
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => setShowHelp(true)}
                          >
                            <AlertCircleIcon className="h-4 w-4 text-indigo-600" />
                            <span className="sr-only">Help</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click for help</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <Badge
                    className={`${
                      recordingMode === "recording"
                        ? "bg-red-500"
                        : recordingMode === "completed"
                          ? "bg-green-500"
                          : "bg-indigo-500"
                    } text-white px-3 py-1 text-sm`}
                  >
                    {recordingMode === "recording"
                      ? "Recording"
                      : recordingMode === "completed"
                        ? "Path Recorded"
                        : recordingMode === "start-selected"
                          ? "Start Set"
                          : "Select Emotion"}
                  </Badge>
                </CardTitle>
                <CardDescription>{getStatusMessage()}</CardDescription>
              </CardHeader>
              
              {/* Better organization of content */}
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr,auto] gap-6">
                  {/* Left side - Emotion Circumplex */}
                  <div className="relative md:max-w-md w-full mx-auto">
                    <div className="relative w-full aspect-square">
                      <EmotionCircumplex
                        position={markerPosition}
                        onPositionChange={handlePositionChange}
                        onCircumplexClick={handleCircumplexClick}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => setIsDragging(false)}
                        recordingMode={recordingMode}
                        startPosition={startPosition}
                      />

                      {/* Path Visualization overlay */}
                      {currentDragPath.length > 1 && <EmotionPath path={currentDragPath} />}
                    </div>
                  </div>
                  
                  {/* Right side - Controls and info */}
                  <div className="flex flex-col space-y-6 w-full md:min-w-[240px]">
                    {/* Emotion information panel */}
                    <div className="space-y-4">
                      {/* Show both start and current emotions when in path recording mode */}
                      {(recordingMode === "start-selected" ||
                        recordingMode === "recording" ||
                        recordingMode === "completed") && (
                        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Starting Emotion</h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${startEmotionColor}`}></div>
                            <p className="text-base font-medium text-gray-700 flex items-center gap-1">
                              <span className="text-xl">{startEmotionData.emoji}</span> {startEmotionData.label}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-500">
                            <div>Valence: {startVA.valence}</div>
                            <div>Arousal: {startVA.arousal}</div>
                          </div>
                        </div>
                      )}

                      {/* Current/End Emotion */}
                      <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Current Emotion</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full ${emotionColor}`}></div>
                          <p className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            <span className="text-2xl">{currentEmoji}</span> {currentEmotion}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="bg-white shadow-sm p-2 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">Valence</p>
                            <p className="text-lg font-medium">{valence}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(valence + 1) * 50}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-white shadow-sm p-2 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">Arousal</p>
                            <p className="text-lg font-medium">{arousal}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(arousal + 1) * 50}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - better organized */}
                    <div className="flex flex-col gap-2">
                      {editingEntryIndex !== null ? (
                        <>
                          <Button
                            onClick={() => setShowConfirmDialog(true)}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full"
                          >
                            <EditIcon className="w-4 h-4" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelOperation} className="gap-2 border-indigo-200 w-full">
                            <XCircleIcon className="w-4 h-4" />
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <>
                          {recordingMode === "start-selected" && (
                            <Button onClick={startRecording} className="gap-2 bg-red-500 hover:bg-red-600 w-full">
                              <PlayIcon className="w-4 h-4" />
                              Record Path
                            </Button>
                          )}

                          {recordingMode === "recording" && (
                            <Button onClick={stopRecording} className="gap-2 bg-red-500 hover:bg-red-600 w-full">
                              <StopCircleIcon className="w-4 h-4" />
                              Stop Recording
                            </Button>
                          )}

                          {(recordingMode === "start-selected" || recordingMode === "completed") && (
                            <Button
                              onClick={() => setShowConfirmDialog(true)}
                              className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full"
                            >
                              <BookmarkIcon className="w-4 h-4" />
                              {recordingMode === "completed" ? "Log Emotion Path" : "Log Current Emotion"}
                            </Button>
                          )}

                          {recordingMode !== "idle" && (
                            <Button variant="outline" onClick={resetSelection} className="gap-2 border-indigo-200 w-full">
                              <UndoIcon className="w-4 h-4" />
                              Reset
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Additional actions */}
                    <div className="flex flex-wrap gap-2">
                      {undoStack.length > 0 && (
                        <Button variant="outline" onClick={undoLastAction} className="gap-1 border-indigo-200 text-xs h-8">
                          <UndoIcon className="w-3 h-3" />
                          Undo
                        </Button>
                      )}
                      {emotionLog.length > 0 && (
                        <Button variant="outline" onClick={exportLog} className="gap-1 border-indigo-200 text-xs h-8">
                          <SaveIcon className="w-3 h-3" />
                          Export
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <InfoIcon className="h-3 w-3" />
                  {recordingMode === "recording"
                    ? `Recording in progress: ${currentDragPath.length} points captured`
                    : recordingMode === "completed"
                      ? `Path recorded: ${currentDragPath.length} points from ${startEmotionData.label} to ${currentEmotion}`
                      : "Click to set your emotion position"}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-indigo-600" />
                    Emotion Log
                  </span>
                  <Badge variant="outline" className="px-3 py-1">
                    {emotionLog.length} entries
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {emotionLog.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {emotionLog.map((entry, index) => (
                        <div key={index} className="relative group">
                          <EmotionLogItem entry={entry} getEmotionColor={getEmotionColor} />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-white/80 hover:bg-white"
                                    onClick={() => startEditEntry(index)}
                                  >
                                    <EditIcon className="h-3.5 w-3.5 text-indigo-600" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit this entry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-white/80 hover:bg-white"
                                    onClick={() => deleteEntry(index)}
                                  >
                                    <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete this entry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No emotions logged yet</p>
                    <p className="text-sm">Use the Circumplex Model tab to track your emotions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5 text-indigo-600" />
                  Emotion Science
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-indigo-800">The Circumplex Model of Affect</h3>
                  <p className="text-sm text-gray-600">
                    The Circumplex Model, developed by psychologist James Russell in 1980, organizes emotions in a
                    two-dimensional circular space, using dimensions of valence (pleasure-displeasure) and arousal
                    (activation-deactivation). This model helps visualize how emotions relate to one another and
                    provides a framework for understanding emotional experiences.
                  </p>
                </div>

                {emotionLog.length > 0 && <EmotionInsights emotionLog={emotionLog} />}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium flex items-center gap-2 mb-2 text-indigo-800">
                      <span className="text-xl">🧠</span> Valence Dimension
                    </h3>
                    <p className="text-sm text-gray-600">
                      Valence refers to how pleasant or unpleasant an emotion feels. Positive valence emotions (right
                      side) like joy and contentment feel good, while negative valence emotions (left side) like fear
                      and sadness feel bad. Research shows valence strongly influences decision-making and memory
                      formation.
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium flex items-center gap-2 mb-2 text-indigo-800">
                      <span className="text-xl">⚡</span> Arousal Dimension
                    </h3>
                    <p className="text-sm text-gray-600">
                      Arousal refers to the intensity or energy level of an emotion. High arousal emotions (top) like
                      excitement and anger involve physiological activation, while low arousal emotions (bottom) like
                      calmness and depression involve deactivation. Arousal affects attention, focus, and physical
                      readiness.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium mb-3 text-indigo-800">Emotional Regulation Strategies</h3>
                  <ul className="text-sm text-gray-600 space-y-3">
                    <li className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                      <span className="text-lg">🧘</span>
                      <span>
                        <strong>Mindfulness:</strong> Observing emotions without judgment can help reduce their
                        intensity.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                      <span className="text-lg">🔄</span>
                      <span>
                        <strong>Cognitive reappraisal:</strong> Changing how you think about a situation can change how
                        you feel about it.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                      <span className="text-lg">🏃</span>
                      <span>
                        <strong>Physical activity:</strong> Exercise can help regulate both high and low arousal states.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                      <span className="text-lg">🗣️</span>
                      <span>
                        <strong>Social connection:</strong> Sharing emotions with others can help process and regulate
                        them.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntryIndex !== null ? "Save Changes?" : "Log This Emotion?"}</DialogTitle>
            <DialogDescription>
              {editingEntryIndex !== null
                ? "Are you sure you want to save these changes to your emotion log?"
                : recordingMode === "completed"
                  ? "Are you sure you want to log this emotion path?"
                  : "Are you sure you want to add this emotion to your log?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            {recordingMode === "completed" || recordingMode === "recording" ? (
              <div className="w-full">
                <div className="flex items-center mb-3">
                  <div
                    className={`w-6 h-6 rounded-full ${startEmotionColor} flex items-center justify-center text-white mr-2`}
                  >
                    <span className="text-sm">{startEmotionData.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {startEmotionData.label} &rarr; {currentEmotion}
                    </p>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full ${emotionColor} flex items-center justify-center text-white ml-2`}
                  >
                    <span className="text-sm">{currentEmoji}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Path with {currentDragPath.length} points from {startEmotionData.label} ({startVA.valence},{" "}
                  {startVA.arousal}) to {currentEmotion} ({valence}, {arousal})
                </p>
              </div>
            ) : (
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full ${emotionColor} flex items-center justify-center text-white mr-3`}
                >
                  <span className="text-lg">{currentEmoji}</span>
                </div>
                <div>
                  <p className="font-medium">{currentEmotion}</p>
                  <p className="text-sm text-gray-500">
                    Valence: {valence}, Arousal: {arousal}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Add notes textarea */}
          <div className="mt-4">
            <label htmlFor="emotion-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="emotion-notes"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add context or details about this emotional state..."
              value={emotionNotes}
              onChange={(e) => setEmotionNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={logEmotion} className="bg-indigo-600 hover:bg-indigo-700">
              {editingEntryIndex !== null ? "Save Changes" : "Log Emotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Emotion Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this emotion entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to Use the Emotion Tracker</DialogTitle>
            <DialogDescription>Quick guide to help you track your emotions effectively</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="flex gap-3 items-start">
              <div className="bg-indigo-100 p-2 rounded-full">
                <TargetIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Step 1: Set Starting Emotion</h4>
                <p className="text-xs text-gray-500">
                  Click anywhere on the circumplex to set your starting emotion. This is where your emotional journey
                  begins.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-indigo-100 p-2 rounded-full">
                <PlayIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Step 2: Record Path (Optional)</h4>
                <p className="text-xs text-gray-500">
                  Click &quot;Record Path&quot; if you want to track how your emotion changes over time. Move around the
                  circumplex to trace your emotional journey.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-indigo-100 p-2 rounded-full">
                <BookmarkIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Step 3: Log Your Emotion</h4>
                <p className="text-xs text-gray-500">
                  Click &quot;Log Emotion&quot; to save your current emotion or &quot;Log Emotion Path&quot; to save the entire emotional
                  journey you recorded.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-indigo-100 p-2 rounded-full">
                <EditIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Editing & Correcting</h4>
                <p className="text-xs text-gray-500">
                  Use &quot;Reset&quot; to start over. In the History tab, hover over entries to edit or delete them. Use &quot;Undo&quot;
                  to revert your last action.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelp(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

