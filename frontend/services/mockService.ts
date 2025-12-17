import { format } from 'd3-format';
import { TelemetryData } from '../types';

// Helper to generate random walk data for charts
export const generateHistoryData = (
  basinId: string,
  key: keyof TelemetryData,
  hours: number
) => {
  const now = Date.now();
  const data = [];
  const points = hours * 12; // One point every 5 mins approx
  
  let currentValue = 50; 
  if (key.toLowerCase().includes('temp')) currentValue = 22;
  if (key.toLowerCase().includes('co2')) currentValue = 400;
  if (key.toLowerCase().includes('ph')) currentValue = 6.5;

  for (let i = points; i >= 0; i--) {
    const time = now - i * 5 * 60 * 1000;
    const randomChange = (Math.random() - 0.5) * (currentValue * 0.1); // 5% variance
    currentValue += randomChange;
    
    // Clamp values reasonably
    if (key.includes('PH')) currentValue = Math.max(5, Math.min(8, currentValue));
    if (key.includes('Moisture')) currentValue = Math.max(0, Math.min(100, currentValue));

    data.push({
      timestamp: time,
      value: Number(currentValue.toFixed(2)),
      formattedTime: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
  return data;
};

export const generateCSV = (
  basinId: string,
  startDate: string,
  endDate: string,
  entryCount: number
): string => {
  const headers = ['Timestamp', 'Unix', 'BasinID', 'AirTemp', 'Humidity', 'SoilMoisture', 'CO2'];
  const rows = [];
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const step = (end - start) / Math.max(1, entryCount);

  for (let i = 0; i < entryCount; i++) {
    const time = start + (step * i);
    rows.push([
      new Date(time).toISOString(),
      Math.floor(time / 1000),
      basinId,
      (20 + Math.random() * 5).toFixed(2),
      (50 + Math.random() * 20).toFixed(2),
      (40 + Math.random() * 30).toFixed(2),
      (400 + Math.random() * 50).toFixed(0),
    ].join(','));
  }

  return [headers.join(','), ...rows].join('\n');
};

export const formatValue = (key: string, value: number) => {
  if (key.includes('Temp')) return `${value}°C`;
  if (key.includes('Humidity') || key.includes('Moisture')) return `${value}%`;
  if (key.includes('EC')) return `${value} µS/cm`;
  if (key.includes('lux')) return `${value} lx`;
  if (key.includes('PH')) return value.toFixed(1);
  return value.toString();
};
