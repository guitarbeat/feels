export interface EmotionPoint {
  valence: number;  // -1.0 (negative) to 1.0 (positive)
  arousal: number;  // -1.0 (low energy) to 1.0 (high energy)
  label?: string;
  timestamp?: string;
}

export const distanceBetween = (e1: EmotionPoint, e2: EmotionPoint): number => {
  return Math.sqrt(
    Math.pow(e1.valence - e2.valence, 2) + 
    Math.pow(e1.arousal - e2.arousal, 2)
  );
};

export const standardEmotions: Record<string, EmotionPoint> = {
  // High Arousal, Negative Valence (top-left)
  angry: { valence: -0.6, arousal: 0.6, label: "Angry" },
  frustrated: { valence: -0.5, arousal: 0.4, label: "Frustrated" },
  alarmed: { valence: -0.7, arousal: 0.7, label: "Alarmed" },
  infuriated: { valence: -0.9, arousal: 0.8, label: "Infuriated" },
  panicked: { valence: -0.8, arousal: 0.9, label: "Panicked" },
  
  // Low Arousal, Negative Valence (bottom-left)
  sad: { valence: -0.6, arousal: -0.4, label: "Sad" },
  miserable: { valence: -0.8, arousal: -0.6, label: "Miserable" },
  gloomy: { valence: -0.5, arousal: -0.5, label: "Gloomy" },
  bored: { valence: -0.3, arousal: -0.7, label: "Bored" },
  tired: { valence: -0.2, arousal: -0.8, label: "Tired" },
  
  // High Arousal, Positive Valence (top-right)
  excited: { valence: 0.7, arousal: 0.7, label: "Excited" },
  delighted: { valence: 0.8, arousal: 0.6, label: "Delighted" },
  astonished: { valence: 0.5, arousal: 0.8, label: "Astonished" },
  ecstatic: { valence: 0.9, arousal: 0.8, label: "Ecstatic" },
  
  // Low Arousal, Positive Valence (bottom-right)
  calm: { valence: 0.4, arousal: -0.6, label: "Calm" },
  relaxed: { valence: 0.6, arousal: -0.7, label: "Relaxed" },
  serene: { valence: 0.7, arousal: -0.5, label: "Serene" },
  
  // Neutral zone
  neutral: { valence: 0.0, arousal: 0.0, label: "Neutral" },
  apathetic: { valence: 0.0, arousal: -0.2, label: "Apathetic" },
  contemplative: { valence: 0.1, arousal: -0.1, label: "Contemplative" },
};

export function findClosestEmotion(valence: number, arousal: number): EmotionPoint {
  const testPoint: EmotionPoint = { valence, arousal };
  let closest: EmotionPoint | null = null;
  let minDistance = Infinity;
  
  Object.values(standardEmotions).forEach(emotion => {
    const distance = distanceBetween(testPoint, emotion);
    if (distance < minDistance) {
      minDistance = distance;
      closest = emotion;
    }
  });
  
  return closest || { valence: 0, arousal: 0, label: "Unknown" };
}
export interface EmotionPoint {
  valence: number;  // -1.0 (negative) to 1.0 (positive)
  arousal: number;  // -1.0 (low energy) to 1.0 (high energy)
  label?: string;
  timestamp?: string;
}

export const distanceBetween = (e1: EmotionPoint, e2: EmotionPoint): number => {
  return Math.sqrt(
    Math.pow(e1.valence - e2.valence, 2) + 
    Math.pow(e1.arousal - e2.arousal, 2)
  );
};

export const standardEmotions: Record<string, EmotionPoint> = {
  // High Arousal, Negative Valence (top-left)
  angry: { valence: -0.6, arousal: 0.6, label: "Angry" },
  frustrated: { valence: -0.5, arousal: 0.4, label: "Frustrated" },
  alarmed: { valence: -0.7, arousal: 0.7, label: "Alarmed" },
  infuriated: { valence: -0.9, arousal: 0.8, label: "Infuriated" },
  panicked: { valence: -0.8, arousal: 0.9, label: "Panicked" },
  
  // Low Arousal, Negative Valence (bottom-left)
  sad: { valence: -0.6, arousal: -0.4, label: "Sad" },
  miserable: { valence: -0.8, arousal: -0.6, label: "Miserable" },
  gloomy: { valence: -0.5, arousal: -0.5, label: "Gloomy" },
  bored: { valence: -0.3, arousal: -0.7, label: "Bored" },
  tired: { valence: -0.2, arousal: -0.8, label: "Tired" },
  
  // High Arousal, Positive Valence (top-right)
  excited: { valence: 0.7, arousal: 0.7, label: "Excited" },
  delighted: { valence: 0.8, arousal: 0.6, label: "Delighted" },
  astonished: { valence: 0.5, arousal: 0.8, label: "Astonished" },
  ecstatic: { valence: 0.9, arousal: 0.8, label: "Ecstatic" },
  
  // Low Arousal, Positive Valence (bottom-right)
  calm: { valence: 0.4, arousal: -0.6, label: "Calm" },
  relaxed: { valence: 0.6, arousal: -0.7, label: "Relaxed" },
  serene: { valence: 0.7, arousal: -0.5, label: "Serene" },
  
  // Neutral zone
  neutral: { valence: 0.0, arousal: 0.0, label: "Neutral" },
  apathetic: { valence: 0.0, arousal: -0.2, label: "Apathetic" },
  contemplative: { valence: 0.1, arousal: -0.1, label: "Contemplative" },
};

export function findClosestEmotion(valence: number, arousal: number): EmotionPoint {
  const testPoint: EmotionPoint = { valence, arousal };
  let closest: EmotionPoint | null = null;
  let minDistance = Infinity;
  
  Object.values(standardEmotions).forEach(emotion => {
    const distance = distanceBetween(testPoint, emotion);
    if (distance < minDistance) {
      minDistance = distance;
      closest = emotion;
    }
  });
  
  return closest || { valence: 0, arousal: 0, label: "Unknown" };
}
