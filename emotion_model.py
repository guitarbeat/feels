import numpy as np

class EmotionPoint:
    def __init__(self, valence, arousal, label=None):
        """
        Create an emotion point in the valence-arousal space.
        
        Args:
            valence (float): Value from -1.0 (negative) to 1.0 (positive)
            arousal (float): Value from -1.0 (low energy) to 1.0 (high energy)
            label (str, optional): Name of this emotion
        """
        self.valence = max(-1.0, min(1.0, valence))
        self.arousal = max(-1.0, min(1.0, arousal))
        self.label = label
    
    def distance_to(self, other_emotion):
        """Calculate Euclidean distance to another emotion point"""
        return np.sqrt((self.valence - other_emotion.valence)**2 + 
                      (self.arousal - other_emotion.arousal)**2)
    
    def __repr__(self):
        if self.label:
            return f"{self.label} (v:{self.valence:.2f}, a:{self.arousal:.2f})"
        return f"Emotion(v:{self.valence:.2f}, a:{self.arousal:.2f})"


class EmotionMap:
    """A collection of standard emotions mapped in the valence-arousal space"""
    
    def __init__(self):
        # Define standard emotions with their valence-arousal coordinates
        self.emotions = {
            # High Arousal, Negative Valence (top-left)
            "angry": EmotionPoint(-0.6, 0.6, "Angry"),
            "frustrated": EmotionPoint(-0.5, 0.4, "Frustrated"),
            "alarmed": EmotionPoint(-0.7, 0.7, "Alarmed"),
            "infuriated": EmotionPoint(-0.9, 0.8, "Infuriated"),
            "panicked": EmotionPoint(-0.8, 0.9, "Panicked"),
            
            # Low Arousal, Negative Valence (bottom-left)
            "sad": EmotionPoint(-0.6, -0.4, "Sad"),
            "miserable": EmotionPoint(-0.8, -0.6, "Miserable"),
            "gloomy": EmotionPoint(-0.5, -0.5, "Gloomy"),
            "bored": EmotionPoint(-0.3, -0.7, "Bored"),
            "tired": EmotionPoint(-0.2, -0.8, "Tired"),
            
            # High Arousal, Positive Valence (top-right)
            "excited": EmotionPoint(0.7, 0.7, "Excited"),
            "delighted": EmotionPoint(0.8, 0.6, "Delighted"),
            "astonished": EmotionPoint(0.5, 0.8, "Astonished"),
            "ecstatic": EmotionPoint(0.9, 0.8, "Ecstatic"),
            
            # Low Arousal, Positive Valence (bottom-right)
            "calm": EmotionPoint(0.4, -0.6, "Calm"),
            "relaxed": EmotionPoint(0.6, -0.7, "Relaxed"),
            "serene": EmotionPoint(0.7, -0.5, "Serene"),
            
            # Neutral zone
            "neutral": EmotionPoint(0.0, 0.0, "Neutral"),
            "apathetic": EmotionPoint(0.0, -0.2, "Apathetic"),
            "contemplative": EmotionPoint(0.1, -0.1, "Contemplative"),
        }
    
    def get_emotion(self, name):
        """Get an emotion by name"""
        return self.emotions.get(name.lower())
    
    def find_closest_emotion(self, valence, arousal):
        """Find the named emotion closest to the given valence-arousal coordinates"""
        test_point = EmotionPoint(valence, arousal)
        closest = None
        min_distance = float('inf')
        
        for emotion in self.emotions.values():
            distance = test_point.distance_to(emotion)
            if distance < min_distance:
                min_distance = distance
                closest = emotion
        
        return closest
```
