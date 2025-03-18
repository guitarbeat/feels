import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { getCurrentEmotion } from '../lib/emotion-storage';
import { EmotionPoint } from '../lib/emotion-model';

export default function Home() {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionPoint | null>(null);

  useEffect(() => {
    // Load the current emotion on client-side only
    setCurrentEmotion(getCurrentEmotion());
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Feels - Emotion Tracker</title>
        <meta name="description" content="Track and visualize your emotions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Emotion Tracker</h1>

        <p className={styles.description}>
          Track and analyze your emotional state using the Valence-Arousal model
        </p>

        {currentEmotion && (
          <div className={styles.currentEmotion}>
            <h2>Current Emotion</h2>
            <p><strong>{currentEmotion.label}</strong></p>
            <p>Valence: {currentEmotion.valence.toFixed(2)} | Arousal: {currentEmotion.arousal.toFixed(2)}</p>
            <p>Recorded: {new Date(currentEmotion.timestamp || '').toLocaleString()}</p>
          </div>
        )}

        <div className={styles.grid}>
          <Link href="/chart" className={styles.card}>
            <h2>View Chart &rarr;</h2>
            <p>See your emotions visualized in the valence-arousal space.</p>
          </Link>

          <Link href="/track" className={styles.card}>
            <h2>Track Emotion &rarr;</h2>
            <p>Record how you feel right now.</p>
          </Link>

          <Link href="/analyze" className={styles.card}>
            <h2>Analyze Trends &rarr;</h2>
            <p>See how your emotions have changed over time.</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Developed with 💙</p>
      </footer>
    </div>
  );
}
