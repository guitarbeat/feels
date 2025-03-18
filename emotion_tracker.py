import datetime
from emotion_model import EmotionPoint, EmotionMap
import json
import os
import numpy as np

class EmotionTracker:
    def __init__(self, storage_file="emotion_history.json"):
        self.storage_file = storage_file
        self.emotion_map = EmotionMap()
        self.history = []
        self._load_history()
    
    def _load_history(self):
        """Load emotion history from file if it exists"""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    for entry in data:
                        point = EmotionPoint(
                            entry['valence'], 
                            entry['arousal'],
                            entry.get('label')
                        )
                        point.timestamp = entry['timestamp']
                        self.history.append(point)
            except Exception as e:
                print(f"Error loading emotion history: {e}")
    
    def _save_history(self):
        """Save emotion history to file"""
        data = []
        for point in self.history:
            entry = {
                'valence': point.valence,
                'arousal': point.arousal,
                'timestamp': getattr(point, 'timestamp', None),
                'label': point.label
            }
            data.append(entry)
            
        with open(self.storage_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_emotion(self, emotion_name=None, valence=None, arousal=None):
        """
        Record an emotion either by name or by valence-arousal coordinates
        
        Args:
            emotion_name: Name of a standard emotion
            valence: Custom valence value (-1 to 1)
            arousal: Custom arousal value (-1 to 1)
        """
        if emotion_name:
            emotion = self.emotion_map.get_emotion(emotion_name)
            if not emotion:
                raise ValueError(f"Unknown emotion: {emotion_name}")
        elif valence is not None and arousal is not None:
            emotion = EmotionPoint(valence, arousal)
            # Find closest named emotion
            closest = self.emotion_map.find_closest_emotion(valence, arousal)
            if closest:
                emotion.label = f"Near {closest.label}"
        else:
            raise ValueError("Must provide either emotion_name or both valence and arousal")
            
        # Add timestamp
        emotion.timestamp = datetime.datetime.now().isoformat()
        
        # Add to history
        self.history.append(emotion)
        self._save_history()
        return emotion
    
    def get_current_emotion(self):
        """Get the most recently recorded emotion, or None if no history"""
        if not self.history:
            return None
        return self.history[-1]
    
    def get_history(self, days=None):
        """Get emotion history, optionally limited to recent days"""
        if not days:
            return self.history
            
        cutoff = datetime.datetime.now() - datetime.timedelta(days=days)
        cutoff_str = cutoff.isoformat()
        
        return [e for e in self.history if getattr(e, 'timestamp', '') >= cutoff_str]
    
    def analyze_trends(self):
        """Analyze trends in emotion history"""
        if len(self.history) < 2:
            return {"message": "Not enough history for analysis"}
            
        valence_values = [e.valence for e in self.history]
        arousal_values = [e.arousal for e in self.history]
        
        results = {
            "count": len(self.history),
            "valence_avg": np.mean(valence_values),
            "arousal_avg": np.mean(arousal_values),
            "valence_trend": np.polyfit(range(len(valence_values)), valence_values, 1)[0],
            "arousal_trend": np.polyfit(range(len(arousal_values)), arousal_values, 1)[0]
        }
        
        # Add interpretation
        results["interpretation"] = []
        
        if results["valence_trend"] > 0.05:
            results["interpretation"].append("Your emotions are becoming more positive over time.")
        elif results["valence_trend"] < -0.05:
            results["interpretation"].append("Your emotions are becoming more negative over time.")
            
        if results["arousal_trend"] > 0.05:
            results["interpretation"].append("Your energy levels are increasing over time.")
        elif results["arousal_trend"] < -0.05:
            results["interpretation"].append("Your energy levels are decreasing over time.")
            
        return results
