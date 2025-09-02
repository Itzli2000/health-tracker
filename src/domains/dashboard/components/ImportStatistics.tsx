import React from 'react';
import { Calendar, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import type { ParseResult } from '../types/renpho-import.types';

interface ImportStatisticsProps {
  parseResult: ParseResult;
  className?: string;
}

/**
 * Display import statistics and validation results
 */
export const ImportStatistics: React.FC<ImportStatisticsProps> = ({
  parseResult,
  className = '',
}) => {
  const { transformedData, duplicates, validation } = parseResult;
  const uniqueDates = new Set(transformedData.map(m => m.date)).size;
  
  const dates = transformedData.map(m => m.date).sort();
  const dateRange = dates.length > 0 ? {
    start: dates[0],
    end: dates[dates.length - 1],
  } : null;

  const stats = [
    {
      icon: FileText,
      label: 'Total Measurements',
      value: transformedData.length,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    },
    {
      icon: Calendar,
      label: 'Unique Dates',
      value: uniqueDates,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    },
    {
      icon: AlertTriangle,
      label: 'Duplicate Dates',
      value: duplicates.length,
      color: duplicates.length > 0 
        ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950'
        : 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
    },
    {
      icon: validation.isValid ? CheckCircle : AlertTriangle,
      label: 'Validation Status',
      value: validation.isValid ? 'Valid' : 'Issues Found',
      color: validation.isValid
        ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950'
        : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Import Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${stat.color}`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className="w-6 h-6" />
                  <div className="text-2xl font-bold">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-sm font-medium opacity-90">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date range */}
        {dateRange && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Date Range
            </h4>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                <strong>From:</strong> {new Date(dateRange.start).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span>
                <strong>To:</strong> {new Date(dateRange.end).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation Warnings
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {validation.warnings.slice(0, 5).map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
              {validation.warnings.length > 5 && (
                <li className="text-xs opacity-75">
                  And {validation.warnings.length - 5} more warnings...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Validation errors */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation Errors
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {validation.errors.slice(0, 5).map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
              {validation.errors.length > 5 && (
                <li className="text-xs opacity-75">
                  And {validation.errors.length - 5} more errors...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Duplicate details */}
        {duplicates.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Duplicate Date Details
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {duplicates.slice(0, 3).map((dup, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(dup.date).toLocaleDateString()}</span>
                  <span className="font-medium">{dup.count} measurements</span>
                </div>
              ))}
              {duplicates.length > 3 && (
                <div className="text-xs opacity-75">
                  And {duplicates.length - 3} more dates with duplicates...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};