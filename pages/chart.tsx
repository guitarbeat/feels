import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Chart.module.css';
import { EmotionChart } from '../components/EmotionChart';
import { getRecentHistory, getCurrentEmotion } from '../lib/emotion-storage';
import { EmotionPoint } from '../lib/emotion-model';

export default function ChartPage() {
  const [history, setHistory] = useState<EmotionPoint[]>([]);
  const [current, setCurrent] = useState<EmotionPoint | null>(null);
  
  useEffect(() => {
    // Client-side only
    setHistory(getRecentHistory());
    setCurrent(getCurrentEmotion());
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Emotion Chart | Feels</title>
        <meta name="description" content="Visualize your emotions" />
      </Head>

      <main className={styles.main}>
        <h1>Emotion Chart</h1>
        
        <div className={styles.chartContainer}>
          <EmotionChart 
            history={history}
            currentEmotion={current}
            width={800}
            height={600}
          />
        </div>
        
        <div className={styles.controls}>
          <Link href="/" className={styles.button}>Back to Home</Link>
          <Link href="/track" className={styles.button}>Track New Emotion</Link>
        </div>
      </main>
    </div>
  );
}
