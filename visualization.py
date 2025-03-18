import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from emotion_model import EmotionMap

class EmotionVisualizer:
    def __init__(self):
        self.emotion_map = EmotionMap()
        self.quadrant_colors = {
            "top-left": "#ffcccc",     # Light red for high arousal, negative valence
            "bottom-left": "#ccccff",  # Light blue for low arousal, negative valence
            "top-right": "#ffffcc",    # Light yellow for high arousal, positive valence
            "bottom-right": "#ccffcc", # Light green for low arousal, positive valence
        }
        
    def plot_emotion_space(self, figsize=(10, 10), current_emotion=None, history=None):
        """
        Plot the emotion space with labeled emotions
        
        Args:
            figsize: Size of the figure
            current_emotion: Optional EmotionPoint to highlight as current
            history: Optional list of EmotionPoints to show as a trajectory
        """
        fig, ax = plt.subplots(figsize=figsize)
        
        # Draw quadrants as colored backgrounds
        ax.add_patch(patches.Rectangle((-1, 0), 1, 1, color=self.quadrant_colors["top-left"], alpha=0.3))
        ax.add_patch(patches.Rectangle((-1, -1), 1, 1, color=self.quadrant_colors["bottom-left"], alpha=0.3))
        ax.add_patch(patches.Rectangle((0, 0), 1, 1, color=self.quadrant_colors["top-right"], alpha=0.3))
        ax.add_patch(patches.Rectangle((0, -1), 1, 1, color=self.quadrant_colors["bottom-right"], alpha=0.3))
        
        # Draw axes
        ax.axhline(y=0, color='k', linestyle='-', alpha=0.3)
        ax.axvline(x=0, color='k', linestyle='-', alpha=0.3)
        
        # Plot emotion points
        for name, emotion in self.emotion_map.emotions.items():
            ax.plot(emotion.valence, emotion.arousal, 'o', markersize=8, alpha=0.7)
            ax.annotate(emotion.label, 
                       (emotion.valence, emotion.arousal),
                       xytext=(5, 5), 
                       textcoords='offset points')
                       
        # Plot history as a trajectory if provided
        if history:
            history_x = [e.valence for e in history]
            history_y = [e.arousal for e in history]
            ax.plot(history_x, history_y, '-', color='purple', alpha=0.5, linewidth=2)
            
        # Highlight current emotion if provided
        if current_emotion:
            ax.plot(current_emotion.valence, current_emotion.arousal, 'o', 
                   markersize=12, color='red', alpha=0.8)
            ax.annotate('Current', 
                      (current_emotion.valence, current_emotion.arousal),
                      xytext=(10, 10),
                      textcoords='offset points',
                      color='red',
                      bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="red", alpha=0.8))
        
        # Set up the plot
        ax.set_xlim(-1.1, 1.1)
        ax.set_ylim(-1.1, 1.1)
        ax.set_xlabel('Valence (Negative → Positive)', fontsize=12)
        ax.set_ylabel('Arousal (Low Energy → High Energy)', fontsize=12)
        ax.set_title('Valence-Arousal Emotion Space', fontsize=14)
        
        # Add quadrant labels
        ax.text(-0.5, 0.9, "Negative\nHigh Energy", ha='center', va='center', fontsize=10)
        ax.text(-0.5, -0.5, "Negative\nLow Energy", ha='center', va='center', fontsize=10)
        ax.text(0.5, 0.9, "Positive\nHigh Energy", ha='center', va='center', fontsize=10)
        ax.text(0.5, -0.5, "Positive\nLow Energy", ha='center', va='center', fontsize=10)
        
        plt.grid(alpha=0.3)
        plt.tight_layout()
        return fig, ax
        
    def create_interactive_chart(self):
        """Create an interactive chart that shows closest emotion when clicked"""
        from matplotlib.widgets import Button
        
        fig, ax = self.plot_emotion_space()
        
        def on_click(event):
            if event.inaxes == ax:
                x, y = event.xdata, event.ydata
                if -1 <= x <= 1 and -1 <= y <= 1:
                    closest = self.emotion_map.find_closest_emotion(x, y)
                    ax.clear()
                    self.plot_emotion_space(current_emotion=closest)
                    plt.draw()
        
        fig.canvas.mpl_connect('button_press_event', on_click)
        plt.show()
        
    def save_chart(self, filename="emotion_chart.png", current_emotion=None, history=None):
        """Save the emotion chart to a file"""
        fig, _ = self.plot_emotion_space(current_emotion=current_emotion, history=history)
        fig.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close(fig)
        return filename
