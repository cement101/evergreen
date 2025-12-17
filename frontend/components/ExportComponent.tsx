import React, { useState } from 'react';
import { Basin } from '../types';
import Button from './Button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { generateCSV } from '../services/mockService';

interface Props {
  basins: Basin[];
}

const ExportComponent: React.FC<Props> = ({ basins }) => {
  const [selectedBasin, setSelectedBasin] = useState<string>(basins[0]?.id || '');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState<string | null>(null);

  const handleExport = () => {
    if (!selectedBasin || !fromDate || !toDate) return;
    
    setIsExporting(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock entry count calculation
      const estimatedCount = Math.floor(Math.random() * 500) + 100;
      const csvContent = generateCSV(selectedBasin, fromDate, toDate, estimatedCount);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `export_${selectedBasin}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLastExportInfo(`${estimatedCount} rows exported for ${basins.find(b => b.id === selectedBasin)?.name}`);
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Data Export</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Download historical telemetry data in CSV format for Excel analysis.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        
        {/* Basin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Basin</label>
          <select 
            value={selectedBasin}
            onChange={(e) => setSelectedBasin(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-evergreen-500 outline-none"
          >
            {basins.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
            <input 
              type="datetime-local" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-evergreen-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
            <input 
              type="datetime-local" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-evergreen-500 outline-none"
            />
          </div>
        </div>

        {/* Action */}
        <div className="pt-4">
            <Button 
                onClick={handleExport} 
                className="w-full flex items-center justify-center gap-2" 
                size="lg"
                disabled={!selectedBasin || !fromDate || !toDate || isExporting}
            >
                {isExporting ? (
                    'Processing...'
                ) : (
                    <>
                    <Download size={20} /> Export CSV
                    </>
                )}
            </Button>
        </div>

        {lastExportInfo && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-800 dark:text-green-300">
                <FileSpreadsheet size={20} />
                <span className="text-sm font-medium">{lastExportInfo}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ExportComponent;
