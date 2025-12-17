import React, { useState, useEffect } from 'react';
import { Basin, TelemetryData } from '../types';
import Button from './Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateHistoryData } from '../services/mockService';
import { SENSOR_KEYS } from '../constants';

interface Props {
  basins: Basin[];
}

const CustomChartComponent: React.FC<Props> = ({ basins }) => {
  const [selectedBasinId, setSelectedBasinId] = useState<string>(basins[0]?.id || '');
  const [selectedMetric, setSelectedMetric] = useState<keyof TelemetryData>('airTemp');
  const [timeWindow, setTimeWindow] = useState<number>(24);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedBasinId) {
        const data = generateHistoryData(selectedBasinId, selectedMetric, timeWindow);
        setChartData(data);
    }
  }, [selectedBasinId, selectedMetric, timeWindow]);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analysis & Charting</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Source</label>
          <select 
            value={selectedBasinId}
            onChange={(e) => setSelectedBasinId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          >
            {basins.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Metric</label>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as keyof TelemetryData)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          >
            {SENSOR_KEYS.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Time Window</label>
          <div className="flex space-x-2">
            {[6, 12, 24, 48, 168].map(h => (
               <button
               key={h}
               onClick={() => setTimeWindow(h)}
               className={`flex-1 px-2 py-2 text-xs font-medium rounded-md border transition-all ${
                 timeWindow === h
                   ? 'bg-evergreen-600 text-white border-evergreen-600'
                   : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
               }`}
             >
               {h >= 24 ? `${h/24}d` : `${h}h`}
             </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis 
                dataKey="formattedTime" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
                minTickGap={30}
            />
            <YAxis 
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
                domain={['auto', 'auto']}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
                name={selectedMetric}
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
            />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomChartComponent;
