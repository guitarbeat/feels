import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Analyze.module.css';
import { analyzeEmotionTrends, getRecentHistory } from '../lib/emotion-storage';
import { EmotionPoint } from '../lib/emotion-model';

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<EmotionPoint[]>([]);
  
  useEffect(() => {
    // Only run on client-side
    const trends = analyzeEmotionTrends();
    setAnalysis(trends);
    setHistory(getRecentHistory());
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Analyze Emotions | Feels</title>
        <meta name="description" content="Analyze your emotional patterns" />
      </Head>

      <main className={styles.main}>
        <h1>Emotion Analysis</h1>
        
        {analysis && analysis.message ? (
          <div className={styles.notEnoughData}>
            <p>{analysis.message}</p>
            <p>Track more emotions to see analysis.</p>
          </div>
        ) : analysis ? (
          <div className={styles.analysisContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <h3>Entries</h3>
                <p className={styles.statValue}>{analysis.count}</p>
              </div>
              
              <div className={styles.stat}>
                <h3>Average Valence</h3>
                <p className={styles.statValue}>{analysis.valenceAvg.toFixed(2)}</p>
                <p className={styles.statLabel}>
                  {analysis.valenceAvg < -0.3 ? 'Negative' : analysis.valenceAvg > 0.3 ? 'Positive' : 'Neutral'}
                </p>
              </div>
              
              <div className={styles.stat}>
                <h3>Average Arousal</h3>
                <p className={styles.statValue}>{analysis.arousalAvg.toFixed(2)}</p>
                <p className={styles.statLabel}>
                  {analysis.arousalAvg < -0.3 ? 'Low Energy' : analysis.arousalAvg > 0.3 ? 'High Energy' : 'Moderate'}
                </p>
              </div>
              
              <div className={styles.stat}>
                <h3>Trend</h3>
                <div className={styles.trendArrows}>
                  <div className={styles.trendArrow}>
                    <span>Valence:</span>
                    {analysis.valenceTrend > 0.05 ? '↗️' : analysis.valenceTrend < -0.05 ? '↘️' : '→'}
                  </div>
                  <div className={styles.trendArrow}>
                    <span>Arousal:</span>
                    {analysis.arousalTrend > 0.05 ? '↗️' : analysis.arousalTrend < -0.05 ? '↘️' : '→'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.insights}>
              <h3>Insights</h3>
              {analysis.interpretation.length > 0 ? (
                <ul>
                  {analysis.interpretation.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              ) : (
                <p>No significant trends detected in your emotion data.</p>
              )}
            </div>
            
            <div className={styles.historyPreview}>
              <h3>Recent Emotions</h3>
              <div className={styles.emotionList}>
                {history.slice(-5).reverse().map((emotion, index) => (
                  <div key={index} className={styles.emotionItem}>
                    <strong>{emotion.label}</strong>
                    <span>
                      {new Date(emotion.timestamp || '').toLocaleDateString()} 
                      {' '}
                      {new Date(emotion.timestamp || '').toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.loading}>Loading analysis...</div>
        )}
        
        <div className={styles.controls}>
          <Link href="/" className={styles.button}>Back to Home</Link>
          <Link href="/track" className={styles.button}>Track New Emotion</Link>
        </div>
      </main>
    </div>
  );
}
