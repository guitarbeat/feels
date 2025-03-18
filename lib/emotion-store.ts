import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmotionLogEntry } from '@/components/emotion-log-item';

interface EmotionState {
  emotionLog: EmotionLogEntry[];
  undoStack: EmotionLogEntry[][];
  currentPosition: { x: number; y: number };
  startPosition: { x: number; y: number };
  recordingMode: 'idle' | 'start-selected' | 'recording' | 'completed';
  
  // Actions
  addEntry: (entry: EmotionLogEntry) => void;
  updateEntry: (index: number, entry: EmotionLogEntry) => void;
  deleteEntry: (index: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setStartPosition: (position: { x: number; y: number }) => void;
  setRecordingMode: (mode: 'idle' | 'start-selected' | 'recording' | 'completed') => void;
  undo: () => void;
  resetSelection: () => void;
}

export const useEmotionStore = create<EmotionState>()(
  persist(
    (set) => ({
      emotionLog: [],
      undoStack: [],
      currentPosition: { x: 0.5, y: 0.5 },
      startPosition: { x: 0.5, y: 0.5 },
      recordingMode: 'idle',
      
      addEntry: (entry) => set((state) => {
        const newUndoStack = [...state.undoStack, [...state.emotionLog]];
        return { 
          emotionLog: [entry, ...state.emotionLog],
          undoStack: newUndoStack 
        };
      }),
      
      updateEntry: (index, entry) => set((state) => {
        const newLog = [...state.emotionLog];
        newLog[index] = entry;
        const newUndoStack = [...state.undoStack, [...state.emotionLog]];
        return { 
          emotionLog: newLog,
          undoStack: newUndoStack 
        };
      }),
      
      deleteEntry: (index) => set((state) => {
        const newLog = state.emotionLog.filter((_, i) => i !== index);
        const newUndoStack = [...state.undoStack, [...state.emotionLog]];
        return { 
          emotionLog: newLog,
          undoStack: newUndoStack 
        };
      }),
      
      setPosition: (position) => set({ currentPosition: position }),
      
      setStartPosition: (position) => set({ startPosition: position }),
      
      setRecordingMode: (mode) => set({ recordingMode: mode }),
      
      undo: () => set((state) => {
        if (state.undoStack.length === 0) return state;
        
        const newUndoStack = [...state.undoStack];
        const previousState = newUndoStack.pop();
        
        return {
          emotionLog: previousState || [],
          undoStack: newUndoStack
        };
      }),
      
      resetSelection: () => set({
        currentPosition: { x: 0.5, y: 0.5 },
        startPosition: { x: 0.5, y: 0.5 },
        recordingMode: 'idle'
      })
    }),
    {
      name: 'emotion-storage',
    }
  )
);
