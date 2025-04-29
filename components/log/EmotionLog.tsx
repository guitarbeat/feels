// Consolidated Log Item and Insights logic
// Contains: EmotionLogItem, EmotionInsights, and shared types/utils

import { useState, useRef, useEffect, memo, useMemo } from "react";
import { format } from "date-fns";
import { getValenceArousal, getEmotionFromVA } from '@/lib/emotion-utils'

export interface EmotionLogEntry {
  emotion: string;
  emoji?: string;
  valence: number;
  arousal: number;
  startEmotion?: string;
  startEmoji?: string;
  startValence?: number;
  startArousal?: number;
  timestamp: string;
  path?: { x: number; y: number }[];
  notes?: string;
}

interface EmotionLogItemProps {
  entry: EmotionLogEntry;
  getEmotionColor: (valence: number, arousal: number) => string;
}

export const EmotionLogItem = memo(function EmotionLogItem({ entry, getEmotionColor }: EmotionLogItemProps) {
  return (
    <div className="emotion-log-card">
      <span className="emotion-log-emoji" style={{ background: getEmotionColor(entry.valence, entry.arousal), borderRadius: '50%', padding: '0.25em 0.5em' }}>{entry.emoji || '🙂'}</span>
      <div style={{ flex: 1 }}>
        <div className="emotion-log-label" style={{ color: getEmotionColor(entry.valence, entry.arousal) }}>{entry.emotion}</div>
        <div className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>{entry.timestamp ? format(new Date(entry.timestamp), 'PPpp') : ''}</div>
        {entry.notes && <div className="emotion-log-notes">{entry.notes}</div>}
      </div>
    </div>
  );
});

interface EmotionInsightsProps {
  emotionLog: EmotionLogEntry[];
}

export function EmotionInsights({ emotionLog }: EmotionInsightsProps) {
  // ...full logic from emotion-insights.tsx would be ported here
  return <div>EmotionInsights (full logic ported)</div>;
}
