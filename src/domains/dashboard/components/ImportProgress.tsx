import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import type { ImportProgress as ImportProgressType } from '../types/renpho-import.types';

interface ImportProgressProps {
  progress: ImportProgressType;
  className?: string;
}

/**
 * Import progress indicator component
 */
export const ImportProgress: React.FC<ImportProgressProps> = ({
  progress,
  className = '',
}) => {
  const getIcon = () => {
    switch (progress.step) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.step) {
      case 'complete':
        return 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950';
      case 'error':
        return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950';
      default:
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950';
    }
  };

  const getStepLabel = () => {
    switch (progress.step) {
      case 'upload':
        return 'Ready to Upload';
      case 'processing':
        return 'Processing File';
      case 'preview':
        return 'Preview Data';
      case 'importing':
        return 'Importing Data';
      case 'complete':
        return 'Import Complete';
      case 'error':
        return 'Import Error';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Status header */}
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {getStepLabel()}
                </h3>
                <span className="text-sm text-gray-500">
                  {progress.progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {progress.step !== 'upload' && progress.step !== 'error' && (
            <Progress 
              value={progress.progress} 
              className="w-full h-2"
            />
          )}

          {/* Status message */}
          <div className={`rounded-lg p-3 ${getStatusColor()}`}>
            <p className="text-sm font-medium">
              {progress.message}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center space-x-1 ${
              ['processing', 'preview', 'importing', 'complete'].includes(progress.step)
                ? 'text-green-600'
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['processing', 'preview', 'importing', 'complete'].includes(progress.step)
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
              <span>Parse</span>
            </div>

            <div className={`flex items-center space-x-1 ${
              ['preview', 'importing', 'complete'].includes(progress.step)
                ? 'text-green-600'
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['preview', 'importing', 'complete'].includes(progress.step)
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
              <span>Validate</span>
            </div>

            <div className={`flex items-center space-x-1 ${
              ['importing', 'complete'].includes(progress.step)
                ? 'text-green-600'
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['importing', 'complete'].includes(progress.step)
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
              <span>Import</span>
            </div>

            <div className={`flex items-center space-x-1 ${
              progress.step === 'complete'
                ? 'text-green-600'
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                progress.step === 'complete'
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
              <span>Complete</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};