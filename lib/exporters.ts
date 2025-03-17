export type ExportFormat = 'json' | 'csv';

export function exportEmotionData(data: any, format: ExportFormat, filename: string): void {
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

function exportAsJSON(data: any, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  downloadFile(dataUri, `${filename}.json`);
}

function exportAsCSV(data: any, filename: string): void {
  if (!Array.isArray(data) || data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(entry => 
    Object.values(entry).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  downloadFile(dataUri, `${filename}.csv`);
}

function downloadFile(dataUri: string, filename: string): void {
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}
