import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';

// Import components
import { FileUpload } from './components/FileUpload';
import { ImportProgress } from './components/ImportProgress';
import { ImportStatistics } from './components/ImportStatistics';
import { DataPreview } from './components/DataPreview';
import { StrategySelector } from './components/StrategySelector';
import { ImportResults } from './components/ImportResults';
import { ImportErrorBoundary } from './components/ImportErrorBoundary';

// Import hooks
import { useRenphoImport } from './hooks/useRenphoImport';

/**
 * Main RENPHO CSV Import Page Component
 * Provides a complete workflow for importing RENPHO scale data
 */
export const RenphoImportPage: React.FC = () => {
  const {
    // State
    selectedFile,
    parseResult,
    importResult,
    importProgress,
    isProcessing,
    error,
    strategy,
    
    // Computed values
    canImport,
    hasData,
    isComplete,
    
    // Actions
    handleFileSelect,
    processImport,
    resetImport,
    updateStrategy,
    
    // Helpers
    getPreviewData,
    getStatistics,
  } = useRenphoImport();

  // Handle file selection with toast notifications
  const handleFileSelectWithToast = React.useCallback((file: File) => {
    toast.info(`Processing ${file.name}...`);
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Handle import with toast notifications
  const handleImportWithToast = React.useCallback(async () => {
    try {
      await processImport();
      toast.success('Import completed successfully!');
    } catch (err) {
      toast.error('Import failed. Please try again.');
      console.error(err);
    }
  }, [processImport]);

  // Handle errors with toast notifications
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle view dashboard navigation
  const handleViewDashboard = React.useCallback(() => {
    // Navigate to dashboard - replace with actual navigation logic
    window.location.href = '/dashboard';
  }, []);

  const previewData = React.useMemo(() => {
    return getPreviewData(5);
  }, [getPreviewData]);

  const statistics = React.useMemo(() => {
    return getStatistics();
  }, [getStatistics]);

  return (
    <ImportErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Scale className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      RENPHO Data Import
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Import your scale measurements from CSV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            
            {/* Progress indicator - always visible */}
            <ImportProgress progress={importProgress} />

            {/* Step 1: File Upload (when no file selected) */}
            {!selectedFile && !isComplete && (
              <div className="space-y-6">
                <FileUpload
                  onFileSelect={handleFileSelectWithToast}
                  isProcessing={isProcessing}
                  acceptedTypes={['.csv']}
                  maxFileSize={10 * 1024 * 1024} // 10MB
                />

                {/* Help section */}
                <Card className="bg-blue-50 dark:bg-blue-950">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                      💡 Getting Started
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <p><strong>Required format:</strong> CSV file exported from the RENPHO app</p>
                      <p><strong>Duplicate handling:</strong> Choose to average multiple daily measurements or keep them all</p>
                      <p><strong>Data validation:</strong> Automatic validation ensures healthy measurement ranges</p>
                      <p><strong>Privacy:</strong> All data is processed securely and stored privately in your account</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Data Preview and Strategy Selection (when file processed) */}
            {hasData && !isComplete && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left column: Statistics and Preview */}
                <div className="lg:col-span-2 space-y-6">
                  {statistics && (
                    <ImportStatistics parseResult={parseResult!} />
                  )}
                  
                  <DataPreview
                    data={previewData}
                    strategy={strategy}
                    isLoading={isProcessing}
                  />
                </div>

                {/* Right column: Strategy Selection */}
                <div>
                  <StrategySelector
                    currentStrategy={strategy}
                    onStrategyChange={updateStrategy}
                    onImport={handleImportWithToast}
                    canImport={canImport}
                    isProcessing={isProcessing}
                    duplicateCount={parseResult?.duplicates.length || 0}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Import Results (when import completed) */}
            {isComplete && importResult && (
              <div className="space-y-6">
                <ImportResults
                  result={importResult}
                  onReset={resetImport}
                  onViewDashboard={handleViewDashboard}
                />

                {/* Additional actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      What's Next?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          View Your Data
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Explore your measurements in the dashboard with interactive charts and trends.
                        </p>
                        <Button onClick={handleViewDashboard} size="sm" className="w-full">
                          Open Dashboard
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          Import More Data
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                          Have more CSV files to import? Process them to keep your data up to date.
                        </p>
                        <Button onClick={resetImport} variant="outline" size="sm" className="w-full">
                          Import Another File
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* File info (when file selected but not yet processed) */}
            {selectedFile && !hasData && !isProcessing && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Selected File
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </p>
                    </div>
                    <Button onClick={resetImport} variant="outline" size="sm">
                      Change File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ImportErrorBoundary>
  );
};