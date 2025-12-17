
import React, { useState, useEffect, useRef } from 'react';
import { Basin } from '../types';
import Button from './Button';

interface Props {
  basin: Basin;
  onBack: () => void;
  onTogglePump: (basinId: string, pumpKey: keyof Basin['pumps']) => void;
}

const SENSOR_KEYS = [
  'co2Level', 'airTemp', 'humidity', 'soilTemp', 'soilMoisture',
  'soilEC', 'soilPH', 'soilN', 'soilP', 'soilK', 'lux',
];

import { fetchReadings } from '../services/apiService';

const BasinDetail: React.FC<Props> = ({ basin, onBack }) => {
  const [telemetry, setTelemetry] = useState(() => ({
    co2Level: 0,
    airTemp: 0,
    humidity: 0,
    soilTemp: 0,
    soilMoisture: 0,
    soilEC: 0,
    soilPH: 0,
    soilN: 0,
    soilP: 0,
    soilK: 0,
    lux: 0,
    ...(basin?.telemetry || {}),
  }));
  const [lastUpdate, setLastUpdate] = useState(basin?.lastUpdate || Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!basin) return;
    // Poll for latest readings every 3 seconds
    intervalRef.current = setInterval(async () => {
      const readings = await fetchReadings();
      const latest = readings.find((r: any) => r.data && r.data.basinId === basin.id);
      if (latest) {
        setTelemetry((prev) => ({ ...prev, ...latest.data }));
        setLastUpdate(new Date(latest.timestamp).getTime());
      }
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [basin?.id]);

  if (!basin) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">No Data Available</h2>
        <p>There is no telemetry data for this basin.</p>
        <Button onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="!p-0 hover:bg-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            {basin.name}
            <span className={`px-2 py-0.5 text-xs rounded-full border ${basin.status === 'online' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-red-500 text-red-600 dark:text-red-400'}`}>
              {basin.status}
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
            IP: {basin.ip} • Last Seen: {new Date(lastUpdate).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {SENSOR_KEYS.map((key) => (
          <div key={key} className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-gray-100">
              {telemetry[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasinDetail;
