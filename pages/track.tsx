import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Track.module.css';
import { recordEmotion } from '../lib/emotion-storage';
import { standardEmotions } from '../lib/emotion-model';

export default function TrackPage() {
  const router = useRouter();
  const [customMode, setCustomMode] = useState(false);
  const [valence, setValence] = useState(0);
  const [arousal, setArousal] = useState(0);
  
  const handleRecordEmotion = (emotionName: string) => {
    recordEmotion(emotionName);
    router.push('/chart');
  };
  
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordEmotion(undefined, valence, arousal);
    router.push('/chart');
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Track Emotion | Feels</title>
        <meta name="description" content="Record your current emotional state" />
      </Head>

      <main className={styles.main}>
        <h1>Track Your Emotion</h1>
        
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${!customMode ? styles.activeTab : ''}`} 
            onClick={() => setCustomMode(false)}
          >
            Choose Emotion
          </button>
          <button 
            className={`${styles.tab} ${customMode ? styles.activeTab : ''}`}
            onClick={() => setCustomMode(true)}
          >
            Custom Input
          </button>
        </div>
        
        {!customMode ? (
          <div className={styles.emotionGrid}>
            {Object.entries(standardEmotions).map(([key, emotion]) => (
              <button 
                key={key}
                className={styles.emotionButton}
                onClick={() => handleRecordEmotion(key)}
              >
                {emotion.label}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className={styles.customForm}>
            <div className={styles.sliderContainer}>
              <label htmlFor="valence">
                Valence: {valence.toFixed(2)}
                <span className={styles.sliderEndLabels}>
                  <span>Negative</span>
                  <span>Positive</span>
                </span>
              </label>
              <input 
                type="range" 
                id="valence"
                min="-1" 
                max="1" 
                step="0.01"
                value={valence}
                onChange={(e) => setValence(parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
            
            <div className={styles.sliderContainer}>
              <label htmlFor="arousal">
                Arousal: {arousal.toFixed(2)}
                <span className={styles.sliderEndLabels}>
                  <span>Low Energy</span>
                  <span>High Energy</span>
                </span>
              </label>
              <input 
                type="range" 
                id="arousal" 
                min="-1" 
                max="1" 
                step="0.01"
                value={arousal}
                onChange={(e) => setArousal(parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Record Emotion
            </button>
          </form>
        )}
        
        <div className={styles.controls}>
          <Link href="/" className={styles.button}>Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
