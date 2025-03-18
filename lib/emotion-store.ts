import { create, type StateCreator } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { EmotionLogEntry } from '@/components/emotion-log-item';

interface Position {
  x: number;
  y: number;
}

type RecordingMode = 'idle' | 'start-selected' | 'recording' | 'completed';

interface EmotionState {
  emotionLog: EmotionLogEntry[];
  undoStack: EmotionLogEntry[][];
  currentPosition: Position;
  startPosition: Position;
  recordingMode: RecordingMode;
}

interface EmotionStateActions {
  addEntry: (entry: EmotionLogEntry) => void;
  updateEntry: (index: number, entry: EmotionLogEntry) => void;
  deleteEntry: (index: number) => void;
  setPosition: (position: Position) => void;
  setStartPosition: (position: Position) => void;
  setRecordingMode: (mode: RecordingMode) => void;
  undo: () => void;
  resetSelection: () => void;
}

type EmotionStore = EmotionState & EmotionStateActions;
type SetEmotionState = (state: EmotionState) => Partial<EmotionState> | EmotionState;
type StateUpdater = (fn: SetEmotionState) => void;

type EmotionPersist = (
  config: StateCreator<EmotionStore>,
  options: PersistOptions<EmotionStore>
) => StateCreator<EmotionStore>;

export const useEmotionStore = create<EmotionStore>()(
  (persist as EmotionPersist)(
    (set: StateUpdater) => ({
      emotionLog: [],
      undoStack: [],
      currentPosition: { x: 0.5, y: 0.5 },
      startPosition: { x: 0.5, y: 0.5 },
      recordingMode: 'idle',
      
      addEntry: (entry: EmotionLogEntry) => 
        set((state: EmotionState) => ({
          ...state,
          emotionLog: [entry, ...state.emotionLog],
          undoStack: [...state.undoStack, [...state.emotionLog]]
        })),
      
      updateEntry: (index: number, entry: EmotionLogEntry) => 
        set((state: EmotionState) => {
          const newLog = [...state.emotionLog];
          newLog[index] = entry;
          return {
            ...state,
            emotionLog: newLog,
            undoStack: [...state.undoStack, [...state.emotionLog]]
          };
        }),
      
      deleteEntry: (index: number) => 
        set((state: EmotionState) => ({
          ...state,
          emotionLog: state.emotionLog.filter((_, i) => i !== index),
          undoStack: [...state.undoStack, [...state.emotionLog]]
        })),
      
      setPosition: (position: Position) => 
        set((state: EmotionState) => ({ 
          ...state, 
          currentPosition: position 
        })),
      
      setStartPosition: (position: Position) => 
        set((state: EmotionState) => ({ 
          ...state, 
          startPosition: position 
        })),
      
      setRecordingMode: (mode: RecordingMode) => 
        set((state: EmotionState) => ({ 
          ...state, 
          recordingMode: mode 
        })),
      
      undo: () => 
        set((state: EmotionState) => {
          if (state.undoStack.length === 0) return state;
          
          const newUndoStack = [...state.undoStack];
          const previousState = newUndoStack.pop();
          
          return {
            ...state,
            emotionLog: previousState || [],
            undoStack: newUndoStack
          };
        }),
      
      resetSelection: () => 
        set((state: EmotionState) => ({
          ...state,
          currentPosition: { x: 0.5, y: 0.5 },
          startPosition: { x: 0.5, y: 0.5 },
          recordingMode: 'idle'
        }))
    }),
    {
      name: 'emotion-storage',
    }
  )
);
