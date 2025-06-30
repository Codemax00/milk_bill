import React, { useState } from 'react';
import { ProcessedMilkData } from '../types';
import { Calendar, TrendingUp, Droplets, DollarSign, Download, Image } from 'lucide-react';
import { format } from 'date-fns';

interface DataVisualizationProps {
  data: ProcessedMilkData;
  onExport: () => void;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data, onExport }) => {
  const formatCurrency = (amount: number) => `₹${(amount ?? 0).toFixed(2)}`;

  // Debug log
  console.log('DataVisualization data:', data);

  // Local state for editable entries
  const [editableEntries, setEditableEntries] = useState(() => data.entries.map(entry => ({ ...entry, morning: entry.morning ? { ...entry.morning } : undefined, evening: entry.evening ? { ...entry.evening } : undefined, cowMilk: entry.cowMilk ? { ...entry.cowMilk } : undefined })));

  // Handle cell change
  const handleCellChange = (index: number, field: 'morning' | 'evening' | 'cowMilk', subfield: 'milkInLiters' | 'fatPercentage', value: string) => {
    setEditableEntries(prev => {
      const updated = [...prev];
      if (field === 'cowMilk') {
        if (!updated[index].cowMilk) updated[index].cowMilk = { milkInLiters: 0, rate: 32, amount: 0 };
        if (subfield === 'milkInLiters') {
          updated[index].cowMilk.milkInLiters = parseFloat(value) || 0;
          updated[index].cowMilk.amount = updated[index].cowMilk.milkInLiters * (updated[index].cowMilk.rate || 32);
        }
      } else {
        if (!updated[index][field]) updated[index][field] = { milkInLiters: 0, fatPercentage: 0 };
        if (subfield === 'milkInLiters') {
          updated[index][field].milkInLiters = parseFloat(value) || 0;
        } else {
          updated[index][field].fatPercentage = parseFloat(value) || 0;
        }
      }
      // Recalculate totals
      let totalMilk = 0;
      let totalAmount = 0;
      if (updated[index].morning) {
        totalMilk += updated[index].morning.milkInLiters;
        totalAmount += updated[index].morning.milkInLiters * updated[index].morning.fatPercentage * 5;
      }
      if (updated[index].evening) {
        totalMilk += updated[index].evening.milkInLiters;
        totalAmount += updated[index].evening.milkInLiters * updated[index].evening.fatPercentage * 5;
      }
      if (updated[index].cowMilk) {
        totalMilk += updated[index].cowMilk.milkInLiters;
        totalAmount += updated[index].cowMilk.amount;
      }
      updated[index].totalMilk = totalMilk;
      updated[index].totalAmount = totalAmount;
      return updated;
    });
  };

  const exportAsImage = async () => {
    // Calculate dynamic canvas height based on number of entries
    const baseHeight = 700; // Height for header and summary
    const rowHeight = 28; // Height per entry row
    const entryCount = data.entries.length;
    const tableHeight = entryCount * rowHeight + 100; // 100 for table header/footer
    const canvasHeight = baseHeight + tableHeight;

    // Create a canvas element to render the data as an image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (increased width, dynamic height)
    canvas.width = 1800;
    canvas.height = canvasHeight;

    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties (scaled up)
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Title
    ctx.fillText('Milk Collection Summary', canvas.width / 2, 80);

    // Collector info
    ctx.font = '32px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Collector ID: ${data.collectorId}`, 100, 160);
    ctx.fillText(`Period: ${format(new Date(data.startDate), 'MMM dd')} - ${format(new Date(data.endDate), 'MMM dd, yyyy')}`, 100, 200);

    // Summary stats
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('Summary:', 100, 260);
    
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText(`Total Milk: ${data.totalMilk}L`, 100, 300);
    ctx.fillText(`Total Amount: ${formatCurrency(data.totalAmount)}`, 100, 340);
    ctx.fillText(`Average Fat: ${data.summary.averageFat}%`, 100, 380);
    ctx.fillText(`Total Days: ${data.summary.totalDays}`, 100, 420);
    ctx.fillText(`Buffalo Milk: ${data.summary.buffaloMilkTotal}L`, 100, 460);
    ctx.fillText(`Cow Milk: ${data.summary.cowMilkTotal}L`, 100, 500);

    // Table header
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('Daily Entries:', 100, 560);
    
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('S.No', 100, 600);
    ctx.fillText('Morning', 350, 600);
    ctx.fillText('Evening', 600, 600);
    ctx.fillText('Cow Milk', 850, 600);
    ctx.fillText('Total', 1100, 600);

    // Draw line under header
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 620);
    ctx.lineTo(1300, 620);
    ctx.stroke();

    // Table data (all entries, dynamic height)
    for (let i = 0; i < data.entries.length; i++) {
      const entry = data.entries[i];
      const y = 650 + (i * rowHeight);
      ctx.fillText(entry.sNo ?? '-', 100, y);
      ctx.fillText(entry.morning ? `${entry.morning.milkInLiters}L (${entry.morning.fatPercentage}%)` : '-', 350, y);
      ctx.fillText(entry.evening ? `${entry.evening.milkInLiters}L (${entry.evening.fatPercentage}%)` : '-', 600, y);
      ctx.fillText(entry.cowMilk ? `${entry.cowMilk.milkInLiters}L` : '-', 850, y);
      ctx.fillText(entry.totalMilk ? `${entry.totalMilk.toFixed(2)}L` : '-', 1100, y);
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `milk-log-${data.collectorId}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Two-column layout: summary left, table right */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Summary and Collector Info */}
          <div className="md:w-1/3 w-full space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Collector ID</p>
              <p className="text-lg font-semibold text-gray-900">{data.collectorId}</p>
              <p className="text-sm text-gray-600 mb-1 mt-4">Period</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(data.startDate), 'MMM dd')} - {format(new Date(data.endDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Buffalo Milk</p>
              <p className="text-lg font-semibold text-secondary-600">{data.summary.buffaloMilkTotal}L</p>
              <p className="text-sm text-gray-600 mb-1 mt-4">Cow Milk</p>
              <p className="text-lg font-semibold text-accent-600">{data.summary.cowMilkTotal}L</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Milk</p>
              <p className="text-lg font-semibold text-gray-900">{data.totalMilk}L</p>
              <p className="text-sm text-gray-600 mb-1 mt-4">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.totalAmount)}</p>
              <p className="text-sm text-gray-600 mb-1 mt-4">Avg. Fat %</p>
              <p className="text-lg font-semibold text-gray-900">{data.summary.averageFat}%</p>
              <p className="text-sm text-gray-600 mb-1 mt-4">Total Days</p>
              <p className="text-lg font-semibold text-gray-900">{data.summary.totalDays}</p>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={exportAsImage}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <Image className="h-4 w-4" />
                <span>Export Image</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
          {/* Right: Daily Entries Table */}
          <div className="md:w-2/3 w-full">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cow Milk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                  {editableEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.sNo ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.morning ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                className="w-16 border rounded px-1 text-secondary-600 font-medium"
                                value={entry.morning.milkInLiters ?? ''}
                                onChange={e => handleCellChange(index, 'morning', 'milkInLiters', e.target.value)}
                                step="0.1"
                                min="0"
                              />
                              <span className="text-gray-400">L</span>
                              <input
                                type="number"
                                className="w-12 border rounded px-1 text-gray-600"
                                value={entry.morning.fatPercentage ?? ''}
                                onChange={e => handleCellChange(index, 'morning', 'fatPercentage', e.target.value)}
                                step="0.1"
                                min="0"
                              />
                              <span className="text-gray-400">%</span>
                              <span className="text-gray-400">fat</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.evening ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                className="w-16 border rounded px-1 text-secondary-600 font-medium"
                                value={entry.evening.milkInLiters ?? ''}
                                onChange={e => handleCellChange(index, 'evening', 'milkInLiters', e.target.value)}
                                step="0.1"
                                min="0"
                              />
                              <span className="text-gray-400">L</span>
                              <input
                                type="number"
                                className="w-12 border rounded px-1 text-gray-600"
                                value={entry.evening.fatPercentage ?? ''}
                                onChange={e => handleCellChange(index, 'evening', 'fatPercentage', e.target.value)}
                                step="0.1"
                                min="0"
                              />
                              <span className="text-gray-400">%</span>
                              <span className="text-gray-400">fat</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.cowMilk ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                className="w-16 border rounded px-1 text-accent-600 font-medium"
                                value={entry.cowMilk.milkInLiters ?? ''}
                                onChange={e => handleCellChange(index, 'cowMilk', 'milkInLiters', e.target.value)}
                                step="0.1"
                                min="0"
                              />
                              <span className="text-gray-400">L</span>
                          <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{formatCurrency(entry.cowMilk.amount ?? 0)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="font-medium">{(entry.totalMilk ?? 0).toFixed(2)}L</div>
                      <div className="text-green-600 font-medium">{formatCurrency(entry.totalAmount ?? 0)}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Summary Row at the bottom of the table */}
          <div className="w-full border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4">
              <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-700">Total Milk:</span>
                <span className="text-primary-700 font-bold">{data.totalMilk}L</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-700">Avg. Fat %:</span>
                <span className="text-secondary-700 font-bold">{data.summary.averageFat}%</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-green-700 font-bold">{formatCurrency(data.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};