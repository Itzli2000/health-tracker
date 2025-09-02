import { useState, useCallback } from 'react';
import type {
  ParseResult,
  ImportResult,
  ImportProgress,
  ImportStrategy,
} from '../types/renpho-import.types';
import { RenphoImportError } from '../types/renpho-import.types';
import { RenphoImportService } from '../services/renpho-import.service';

/**
 * Custom hook for managing RENPHO import state and operations
 */
export const useRenphoImport = () => {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    step: 'upload',
    progress: 0,
    message: 'Ready to upload CSV file',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>('average');

  /**
   * Parse the selected CSV file
   */
  const parseFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setImportProgress({
      step: 'processing',
      progress: 25,
      message: 'Parsing CSV file...',
    });

    try {
      const result = await RenphoImportService.parseFile(file);
      
      setParseResult(result);
      setImportProgress({
        step: 'preview',
        progress: 100,
        message: 'File parsed successfully',
      });
    } catch (err) {
      const error = err as RenphoImportError;
      setError(error.message);
      setImportProgress({
        step: 'error',
        progress: 0,
        message: 'Failed to parse file',
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Handle file selection and validation
   */
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = RenphoImportService.validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file selected');
      return;
    }

    setSelectedFile(file);
    setParseResult(null);
    setImportResult(null);
    
    // Start parsing immediately
    await parseFile(file);
  }, [parseFile]);

  /**
   * Process the import with selected strategy
   */
  const processImport = useCallback(async () => {
    if (!parseResult) {
      setError('No data to import');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setImportProgress({
      step: 'importing',
      progress: 0,
      message: 'Starting import...',
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90),
          message: 'Importing measurements...',
        }));
      }, 400);

      const result = await RenphoImportService.processImport(parseResult, strategy);
      
      clearInterval(progressInterval);
      
      setImportResult(result);
      setImportProgress({
        step: 'complete',
        progress: 100,
        message: `Successfully imported ${result.successful} measurements`,
      });
    } catch (err) {
      const error = err as RenphoImportError;
      setError(error.message);
      setImportProgress({
        step: 'error',
        progress: 0,
        message: 'Import failed',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parseResult, strategy]);

  /**
   * Reset the entire import process
   */
  const resetImport = useCallback(() => {
    setSelectedFile(null);
    setParseResult(null);
    setImportResult(null);
    setError(null);
    setIsProcessing(false);
    setStrategy('average');
    setImportProgress({
      step: 'upload',
      progress: 0,
      message: 'Ready to upload CSV file',
    });
  }, []);

  /**
   * Get preview data for current strategy
   */
  const getPreviewData = useCallback((limit = 5) => {
    if (!parseResult) return [];
    return RenphoImportService.previewData(parseResult, strategy, limit);
  }, [parseResult, strategy]);

  /**
   * Get import statistics
   */
  const getStatistics = useCallback(() => {
    if (!parseResult) return null;
    return RenphoImportService.getImportStatistics(parseResult);
  }, [parseResult]);

  /**
   * Change import strategy
   */
  const updateStrategy = useCallback((newStrategy: ImportStrategy) => {
    setStrategy(newStrategy);
  }, []);

  return {
    // State
    selectedFile,
    parseResult,
    importResult,
    importProgress,
    isProcessing,
    error,
    strategy,
    
    // Computed values
    canImport: parseResult?.validation.isValid === true,
    hasData: parseResult !== null,
    isComplete: importResult !== null,
    
    // Actions
    handleFileSelect,
    parseFile,
    processImport,
    resetImport,
    updateStrategy,
    
    // Helpers
    getPreviewData,
    getStatistics,
  };
};