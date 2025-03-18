import type { EmotionLogEntry } from '@/components/emotion-log-item';

export type ExportFormat = 'json' | 'csv';

interface CsvHeader {
  emotion: string;
  valence: number;
  arousal: number;
  timestamp: string;
  notes?: string;
  startEmotion?: string;
  startValence?: number;
  startArousal?: number;
  path?: string;
}

export const exportEmotionData = (
  emotionLog: EmotionLogEntry[], 
  format: ExportFormat = 'json',
  filename: string = 'emotion-log'
) => {
  if (emotionLog.length === 0) return;

  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === 'csv') {
    // Create CSV with headers including new fields
    const headers = ['timestamp', 'emotion', 'valence', 'arousal', 'startEmotion', 'startValence', 
      'startArousal', 'notes', 'collection', 'tags', 'pathPoints'];
    
    const rows = emotionLog.map(entry => {
      // Convert path to string representation (number of points)
      const pathPoints = entry.path ? entry.path.length : 0;
      
      // Format tags as comma-separated string
      const tags = entry.tags ? entry.tags.join(', ') : '';
      
      return [
        entry.timestamp,
        entry.emotion,
        entry.valence,
        entry.arousal,
        entry.startEmotion || '',
        entry.startValence || '',
        entry.startArousal || '',
        entry.notes || '',
        entry.collection || 'default',
        tags,
        pathPoints,
      ];
    });

    content = [headers, ...rows].map(row => row.map(value => `"${value}"`).join(',')).join('\n');
    mimeType = 'text/csv';
    extension = 'csv';
  } else {
    // JSON format - full data
    content = JSON.stringify(emotionLog, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
