# Feels - Emotion Tracking Application

Feels is an interactive emotion tracking application built with Next.js that allows users to monitor, record, and visualize their emotional states using a scientifically-based circumplex model of affect.

![Emotion Tracking Interface](https://via.placeholder.com/800x400?text=Feels+Emotion+Tracker)

## Features

- **Emotion Circumplex**: Plot emotions on a 2D space based on valence (positive/negative) and arousal (high/low energy)
- **Path Recording**: Track the journey of your emotional state changes over time
- **Emotion Logging**: Save and review your emotional states with timestamps and notes
- **Data Visualization**: See insights about your emotional patterns through charts and analysis
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

1. **Track an Emotion**: Click on the circumplex to set your current emotional state
2. **Record a Path**: Press "Record Path" to track how your emotion changes over time
3. **Add Notes**: Include context about your emotional state
4. **Review History**: See your past emotions in the History tab
5. **Analyze Insights**: View patterns and trends in the Insights tab

## Technology Stack

- **Framework**: Next.js 15
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Animation**: CSS animations for smooth transitions
- **Typography**: Geist font family

## Project Structure

- `/components/emotion-circumplex.tsx` - Visual emotion plotting component
- `/components/emotion-tracker.tsx` - Main tracking interface
- `/components/emotion-path.tsx` - Emotion journey visualization
- `/components/emotion-log-item.tsx` - Individual emotion log entries
- `/components/emotion-insights.tsx` - Data analysis and pattern recognition

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## About the Emotion Circumplex Model

The Circumplex Model of Affect, developed by psychologist James Russell in 1980, organizes emotions in a two-dimensional space using dimensions of valence (pleasure-displeasure) and arousal (activation-deactivation). This visualization helps users understand the relationships between different emotional states and provides a framework for emotional self-awareness.

## License

[MIT](https://choosealicense.com/licenses/mit/)
