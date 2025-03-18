import { EmotionPoint, findClosestEmotion, standardEmotions } from './emotion-model';

const STORAGE_KEY = 'emotion-history';

export function saveEmotionHistory(history: EmotionPoint[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function loadEmotionHistory(): EmotionPoint[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error loading emotion history:', e);
      }
    }
  }
  return [];
}

export function recordEmotion(
  emotionName?: string, 
  valence?: number, 
  arousal?: number
): EmotionPoint {
  let emotion: EmotionPoint;
  
  if (emotionName && emotionName in standardEmotions) {
    emotion = { ...standardEmotions[emotionName] };
  } else if (typeof valence === 'number' && typeof arousal === 'number') {
    // Clamp values
    const clampedValence = Math.max(-1.0, Math.min(1.0, valence));
    const clampedArousal = Math.max(-1.0, Math.min(1.0, arousal));
    
    // Find the closest named emotion
    const closest = findClosestEmotion(clampedValence, clampedArousal);
    
    emotion = {
      valence: clampedValence,
      arousal: clampedArousal,
      label: `Near ${closest.label}`
    };
  } else {
    throw new Error('Must provide either emotion name or both valence and arousal');
  }
  
  // Add timestamp
  emotion.timestamp = new Date().toISOString();
  
  // Add to history
  const history = loadEmotionHistory();
  history.push(emotion);
  saveEmotionHistory(history);
  
  return emotion;
}

export function getCurrentEmotion(): EmotionPoint | null {
  const history = loadEmotionHistory();
  if (history.length === 0) {
    return null;
  }
  return history[history.length - 1];
}

export function getRecentHistory(days?: number): EmotionPoint[] {
  const history = loadEmotionHistory();
  
  if (!days) {
    return history;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString();
  
  return history.filter(e => e.timestamp && e.timestamp >= cutoffStr);
}

export function analyzeEmotionTrends() {
  const history = loadEmotionHistory();
  
  if (history.length < 2) {
    return { message: "Not enough history for analysis" };
  }
  
  const valenceValues = history.map(e => e.valence);
  const arousalValues = history.map(e => e.arousal);
  
  // Calculate averages
  const valenceAvg = valenceValues.reduce((a, b) => a + b, 0) / valenceValues.length;
  const arousalAvg = arousalValues.reduce((a, b) => a + b, 0) / arousalValues.length;
  
  // Simple linear regression for trend
  const xValues = Array.from({ length: history.length }, (_, i) => i);
  const valenceTrend = calculateLinearRegression(xValues, valenceValues);
  const arousalTrend = calculateLinearRegression(xValues, arousalValues);
  
  const results = {
    count: history.length,
    valenceAvg,
    arousalAvg,
    valenceTrend,
    arousalTrend,
    interpretation: [] as string[]
  };
  
  // Add interpretation
  if (valenceTrend > 0.05) {
    results.interpretation.push("Your emotions are becoming more positive over time.");
  } else if (valenceTrend < -0.05) {
    results.interpretation.push("Your emotions are becoming more negative over time.");
  }
  
  if (arousalTrend > 0.05) {
    results.interpretation.push("Your energy levels are increasing over time.");
  } else if (arousalTrend < -0.05) {
    results.interpretation.push("Your energy levels are decreasing over time.");
  }
  
  return results;
}

function calculateLinearRegression(x: number[], y: number[]) {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  
  // Calculate slope
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}
