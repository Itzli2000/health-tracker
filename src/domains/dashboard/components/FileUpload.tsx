import React from 'react';
import { Upload, FileText } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  isProcessing?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

/**
 * Drag and drop file upload component for CSV files
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onError,
  isProcessing = false,
  acceptedTypes = ['.csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = '',
}) => {
  const { isDragActive, getDragHandlers, handleFileSelect } = useDragAndDrop({
    onFileDrop: onFileSelect,
    acceptedTypes,
    maxFileSize,
    onError,
  });

  const dragHandlers = getDragHandlers();

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={dragHandlers.onDragEnter}
          onDragLeave={dragHandlers.onDragLeave}
          onDragOver={dragHandlers.onDragOver}
          onDrop={dragHandlers.onDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload 
              className={`h-12 w-12 transition-colors ${
                isDragActive 
                  ? 'text-blue-500' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} 
            />
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isDragActive ? 'Drop your CSV file here' : 'Upload RENPHO CSV File'}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isDragActive
                  ? 'Release to upload the file'
                  : 'Drag and drop your file here, or click to select'
                }
              </p>
            </div>

            {/* File input and button */}
            <div className="space-y-2">
              <input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload-input"
                disabled={isProcessing}
              />
              
              <Button 
                asChild 
                disabled={isProcessing}
                className="min-w-[160px]"
              >
                <label 
                  htmlFor="csv-upload-input" 
                  className="cursor-pointer inline-flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Select CSV File'}
                </label>
              </Button>

              <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p>Accepted formats: {acceptedTypes.join(', ')}</p>
                <p>Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};