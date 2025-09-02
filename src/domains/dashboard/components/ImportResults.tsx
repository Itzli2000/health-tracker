import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Alert, AlertDescription } from '@components/ui/alert';
import type { ImportResult } from '../types/renpho-import.types';

interface ImportResultsProps {
  result: ImportResult;
  onReset: () => void;
  onViewDashboard?: () => void;
  className?: string;
}

/**
 * Display import completion results and actions
 */
export const ImportResults: React.FC<ImportResultsProps> = ({
  result,
  onReset,
  onViewDashboard,
  className = '',
}) => {
  const successRate = result.successful / (result.successful + result.failed) * 100;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Import Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.successful}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">
              Imported Successfully
            </div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {result.failed}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 font-medium">
              Failed
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Success Rate
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {result.strategy === 'average' ? 'AVG' : 'ALL'}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
              Strategy Used
            </div>
          </div>
        </div>

        {/* Success message */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Import completed successfully!</strong> {result.successful} measurements have been imported 
            using the {result.strategy === 'average' ? 'daily average' : 'keep all measurements'} strategy.
            Your data is now available in the dashboard.
          </AlertDescription>
        </Alert>

        {/* Error details if any */}
        {result.errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Import Errors ({result.errors.length})
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {result.errors.slice(0, 5).map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-xs opacity-75">
                  And {result.errors.length - 5} more errors...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Sample of imported data */}
        {result.processedData.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Sample of Imported Data
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-3 text-left border-b font-medium">Date</th>
                    <th className="p-3 text-left border-b font-medium">Weight (kg)</th>
                    <th className="p-3 text-left border-b font-medium">BMI</th>
                    <th className="p-3 text-left border-b font-medium">Body Fat (%)</th>
                    <th className="p-3 text-left border-b font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.processedData.slice(0, 5).map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                      <td className="p-3 border-b">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Imported
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {result.processedData.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Showing 5 of {result.processedData.length} imported records
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="flex-1"
          >
            Import Another File
          </Button>
          
          {onViewDashboard && (
            <Button 
              onClick={onViewDashboard} 
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          )}
        </div>

        {/* Import summary */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Import Summary
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>
              <strong>Strategy:</strong> {result.strategy === 'average' ? 'Daily averages computed' : 'All measurements preserved'}
            </p>
            <p>
              <strong>Records processed:</strong> {result.successful + result.failed} total
            </p>
            <p>
              <strong>Success rate:</strong> {successRate.toFixed(1)}%
            </p>
            <p>
              <strong>Import date:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};