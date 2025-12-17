import React from 'react';
import { Basin } from '../types';
import { Wifi, WifiOff, Droplets, Thermometer, Activity, Clock } from 'lucide-react';

interface Props {
  basins: Basin[];
  onSelectBasin: (id: string) => void;
}

const BasinOverview: React.FC<Props> = ({ basins, onSelectBasin }) => {
  const isPumpActive = (b: Basin) => Object.values(b.pumps).some(p => p);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Basin Overview</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Monitoring {basins.length} Systems
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {basins.map((basin) => (
          <div 
            key={basin.id}
            onClick={() => onSelectBasin(basin.id)}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-evergreen-500 dark:hover:border-evergreen-500 transition-all cursor-pointer relative overflow-hidden"
          >
             {/* Status Indicator Stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full ${basin.status === 'online' ? 'bg-evergreen-500' : 'bg-red-500'}`} />

            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-evergreen-600 dark:group-hover:text-evergreen-400 transition-colors">
                  {basin.name}
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1">{basin.id.toUpperCase()}</p>
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                basin.status === 'online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {basin.status === 'online' ? <Wifi size={12} className="mr-1" /> : <WifiOff size={12} className="mr-1" />}
                {basin.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                  <Thermometer size={12} className="mr-1" /> Air Temp
                </span>
                <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {basin.telemetry.airTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                  <Droplets size={12} className="mr-1" /> Humidity
                </span>
                <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {basin.telemetry.humidity.toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                  <Activity size={12} className="mr-1" /> Pumps
                </span>
                <span className={`font-mono font-medium ${isPumpActive(basin) ? 'text-evergreen-600 dark:text-evergreen-400' : 'text-gray-400'}`}>
                  {isPumpActive(basin) ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-1">
                  <Clock size={12} className="mr-1" /> Updated
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {new Date(basin.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasinOverview;
