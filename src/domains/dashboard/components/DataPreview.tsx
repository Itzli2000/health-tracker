import React from 'react';
import type { TransformedMeasurement, ImportStrategy } from '../types/renpho-import.types';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

interface DataPreviewProps {
  data: TransformedMeasurement[];
  strategy: ImportStrategy;
  isLoading?: boolean;
  className?: string;
}

/**
 * Data preview table component for showing processed measurements
 */
export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  strategy,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available to preview
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Preview</span>
          <span className="text-sm font-normal text-gray-500">
            {strategy === 'average' ? 'Daily Averages' : 'All Measurements'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left border-b font-medium">Date</th>
                <th className="p-3 text-left border-b font-medium">Weight (kg)</th>
                <th className="p-3 text-left border-b font-medium">BMI</th>
                <th className="p-3 text-left border-b font-medium">Body Fat (%)</th>
                <th className="p-3 text-left border-b font-medium">Muscle Mass (kg)</th>
                {strategy === 'keep_all' && (
                  <th className="p-3 text-left border-b font-medium">Time</th>
                )}
                {strategy === 'average' && (
                  <th className="p-3 text-left border-b font-medium">Source</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr 
                  key={`${record.date}-${record.time}-${index}`} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="p-3 border-b font-medium text-gray-900 dark:text-gray-100">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-3 border-b text-gray-700 dark:text-gray-300">
                    {record.weight.toFixed(1)}
                  </td>
                  <td className="p-3 border-b text-gray-700 dark:text-gray-300">
                    {record.bmi.toFixed(1)}
                  </td>
                  <td className="p-3 border-b text-gray-700 dark:text-gray-300">
                    {record.body_fat_percentage.toFixed(1)}%
                  </td>
                  <td className="p-3 border-b text-gray-700 dark:text-gray-300">
                    {record.muscle_mass.toFixed(1)}
                  </td>
                  {strategy === 'keep_all' && (
                    <td className="p-3 border-b text-xs text-gray-500 dark:text-gray-400">
                      {record.time}
                    </td>
                  )}
                  {strategy === 'average' && (
                    <td className="p-3 border-b">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Average
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {data.length} {data.length === 1 ? 'record' : 'records'}
            </span>
            <span>
              Strategy: {strategy === 'average' ? 'Daily Average' : 'Keep All Measurements'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};