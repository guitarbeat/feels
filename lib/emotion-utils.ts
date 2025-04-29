// Shared utility functions for emotion mapping and normalization

export function getValenceArousal(x: number, y: number) {
  const valence = x * 2 - 1; // Normalize to -1 to 1
  const arousal = -(y * 2 - 1); // Normalize to -1 to 1, invert y-axis
  return {
    valence: Number.parseFloat(valence.toFixed(2)),
    arousal: Number.parseFloat(arousal.toFixed(2)),
  };
}

export function getEmotionFromVA(valence: number, arousal: number): { label: string; emoji: string } {
  if (valence >= 0 && arousal >= 0) {
    if (arousal > 0.7 && valence > 0.7) return { label: "Excited", emoji: "🤩" };
    if (arousal > 0.5 && valence > 0.5) return { label: "Happy", emoji: "😄" };
    if (arousal > 0.3) return { label: "Cheerful", emoji: "😊" };
    return { label: "Content", emoji: "🙂" };
  }
  if (valence < 0 && arousal >= 0) {
    if (arousal > 0.7 && valence < -0.7) return { label: "Angry", emoji: "😠" };
    if (arousal > 0.5 && valence < -0.5) return { label: "Tense", emoji: "😤" };
    if (arousal > 0.3) return { label: "Nervous", emoji: "😰" };
    return { label: "Upset", emoji: "😟" };
  }
  if (valence < 0 && arousal < 0) {
    if (arousal < -0.7 && valence < -0.7) return { label: "Sad", emoji: "😢" };
    if (arousal < -0.5 && valence < -0.5) return { label: "Depressed", emoji: "😔" };
    if (valence < -0.3) return { label: "Bored", emoji: "😒" };
    return { label: "Fatigued", emoji: "😪" };
  }
  if (valence >= 0 && arousal < 0) {
    if (arousal < -0.7 && valence > 0.7) return { label: "Relaxed", emoji: "😌" };
    if (arousal < -0.5 && valence > 0.5) return { label: "Calm", emoji: "😇" };
    if (valence > 0.3) return { label: "Serene", emoji: "🧘" };
    return { label: "At ease", emoji: "😎" };
  }
  return { label: "Neutral", emoji: "😐" };
}
