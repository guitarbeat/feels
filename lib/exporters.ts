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

export function exportEmotionData(data: EmotionLogEntry[], format: ExportFormat, filename: string): void {
  switch (format) {
    case 'csv':
      exportAsCSV(data, filename);
      break;
    case 'json':
    default:
      exportAsJSON(data, filename);
      break;
  }
}

function exportAsJSON(data: EmotionLogEntry[], filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  downloadFile(dataUri, `${filename}.json`);
}

function exportAsCSV(data: EmotionLogEntry[], filename: string): void {
  if (!Array.isArray(data) || data.length === 0) return;
  
  const headers = Object.keys(data[0]) as (keyof CsvHeader)[];
  const rows = data.map(entry => 
    headers.map(key => {
      const value = entry[key];
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (Array.isArray(value)) return `"${JSON.stringify(value)}"`;
      return value;
    }).join(',')
  );
  
  const csv = [headers.join(','), ...rows].join('\n');
  const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  downloadFile(dataUri, `${filename}.csv`);
}

function downloadFile(dataUri: string, filename: string): void {
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}
