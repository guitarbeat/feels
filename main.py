from emotion_model import EmotionPoint, EmotionMap
from visualization import EmotionVisualizer
from emotion_tracker import EmotionTracker
import argparse

def main():
    parser = argparse.ArgumentParser(description='Emotion Visualization and Tracking')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Show chart command
    show_parser = subparsers.add_parser('show', help='Show emotion chart')
    
    # Track emotion command
    track_parser = subparsers.add_parser('track', help='Track an emotion')
    track_parser.add_argument('--name', help='Name of the emotion to track')
    track_parser.add_argument('--valence', type=float, help='Valence value (-1 to 1)')
    track_parser.add_argument('--arousal', type=float, help='Arousal value (-1 to 1)')
    
    # Analyze command
    analyze_parser = subparsers.add_parser('analyze', help='Analyze emotion history')
    
    # Save chart command
    save_parser = subparsers.add_parser('save', help='Save emotion chart')
    save_parser.add_argument('--output', default='emotion_chart.png', help='Output file')
    
    args = parser.parse_args()
    
    tracker = EmotionTracker()
    visualizer = EmotionVisualizer()
    
    if args.command == 'show':
        current = tracker.get_current_emotion()
        history = tracker.get_history()
        visualizer.plot_emotion_space(current_emotion=current, history=history)
        import matplotlib.pyplot as plt
        plt.show()
    
    elif args.command == 'track':
        if args.name:
            emotion = tracker.record_emotion(emotion_name=args.name)
        elif args.valence is not None and args.arousal is not None:
            emotion = tracker.record_emotion(valence=args.valence, arousal=args.arousal)
        else:
            visualizer.create_interactive_chart()
            return
            
        print(f"Recorded emotion: {emotion}")
        
    elif args.command == 'analyze':
        analysis = tracker.analyze_trends()
        print("\nEmotion Analysis:")
        print(f"Number of entries: {analysis['count']}")
        print(f"Average valence: {analysis['valence_avg']:.2f} (negative to positive)")
        print(f"Average arousal: {analysis['arousal_avg']:.2f} (low to high energy)")
        print(f"Valence trend: {analysis['valence_trend']:.4f}")
        print(f"Arousal trend: {analysis['arousal_trend']:.4f}")
        print("\nInterpretation:")
        for insight in analysis["interpretation"]:
            print(f"- {insight}")
    
    elif args.command == 'save':
        current = tracker.get_current_emotion()
        history = tracker.get_history()
        filename = visualizer.save_chart(args.output, current_emotion=current, history=history)
        print(f"Chart saved to {filename}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
