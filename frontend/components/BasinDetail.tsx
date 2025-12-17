import React, { useState, useEffect } from 'react';
import { Basin, TelemetryData } from '../types';
import { ArrowLeft, RefreshCw, Power } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateHistoryData, formatValue } from '../services/mockService';
import Button from './Button';
import { SENSOR_KEYS } from '../constants';

interface Props {
  basin: Basin;
  onBack: () => void;
  onTogglePump: (basinId: string, pumpKey: keyof Basin['pumps']) => void;
}

const BasinDetail: React.FC<Props> = ({ basin, onBack, onTogglePump }) => {
  const [timeRange, setTimeRange] = useState<1 | 12 | 24>(1);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<keyof TelemetryData>('airTemp');

  useEffect(() => {
    // Simulate fetching history from backend
    const data = generateHistoryData(basin.id, selectedMetric, timeRange);
    setChartData(data);
  }, [basin.id, timeRange, selectedMetric]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="!p-0 hover:bg-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft size={24} />
        </Button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            {basin.name}
            <span className={`px-2 py-0.5 text-xs rounded-full border ${basin.status === 'online' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-red-500 text-red-600 dark:text-red-400'}`}>
                {basin.status}
            </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
            IP: {basin.ip} • Last Seen: {new Date(basin.lastUpdate).toLocaleString()}
            </p>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {SENSOR_KEYS.map((key) => (
          <div 
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedMetric === key 
                ? 'bg-evergreen-50 dark:bg-evergreen-900/20 border-evergreen-500 ring-1 ring-evergreen-500' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-evergreen-300'
            }`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-gray-100">
              {formatValue(key, basin.telemetry[key])}
            </p>
          </div>
        ))}
      </div>

      {/* Control Panel & Chart Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pump Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Power className="mr-2" size={20} /> Pump Control
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {(['pump1', 'pump2', 'pump3', 'pump4'] as const).map((pumpKey, idx) => (
              <button
                key={pumpKey}
                onClick={() => onTogglePump(basin.id, pumpKey)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  basin.pumps[pumpKey]
                    ? 'border-evergreen-500 bg-evergreen-50 dark:bg-evergreen-900/20 text-evergreen-700 dark:text-evergreen-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Power size={24} className="mb-2" />
                <span className="font-semibold">Pump {idx + 1}</span>
                <span className="text-xs mt-1">{basin.pumps[pumpKey] ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
              {selectedMetric.replace(/([A-Z])/g, ' $1')} History
            </h3>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[1, 12, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => setTimeRange(h as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeRange === h 
                      ? 'bg-white dark:bg-gray-600 text-evergreen-600 dark:text-evergreen-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="formattedTime" 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                   domain={['auto', 'auto']}
                   tick={{ fontSize: 10, fill: '#9CA3AF' }}
                   tickLine={false}
                   width={40}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                  itemStyle={{ color: '#34D399' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BasinDetail;
