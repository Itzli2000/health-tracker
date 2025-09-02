import { useState, useCallback, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface DragAndDropOptions {
  onFileDrop: (file: File) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  onError?: (error: string) => void;
}

/**
 * Custom hook for drag and drop file handling
 */
export const useDragAndDrop = ({
  onFileDrop,
  acceptedTypes = ['.csv'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onError,
}: DragAndDropOptions) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  /**
   * Validate dropped file
   */
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size too large. Maximum allowed: ${maxSizeMB}MB`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Selected file is empty',
      };
    }

    return { isValid: true };
  }, [acceptedTypes, maxFileSize]);

  /**
   * Handle drag enter event
   */
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragActive(true);
  }, []);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    
    // Only set drag inactive when counter reaches 0
    // This prevents flickering when dragging over child elements
    if (dragCounter <= 1) {
      setIsDragActive(false);
    }
  }, [dragCounter]);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragActive(false);
    setDragCounter(0);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      onError?.(validation.error || 'Invalid file');
      return;
    }

    onFileDrop(file);
  }, [onFileDrop, onError, validateFile]);

  /**
   * Handle programmatic file selection
   */
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const file = target.files?.[0];
    
    if (!file) return;

    const validation = validateFile(file);
    
    if (!validation.isValid) {
      onError?.(validation.error || 'Invalid file');
      return;
    }

    onFileDrop(file);
    
    // Clear input value to allow selecting the same file again
    target.value = '';
  }, [onFileDrop, onError, validateFile]);

  /**
   * Get drag and drop event handlers
   */
  const getDragHandlers = useCallback(() => ({
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  }), [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  /**
   * Set up global drag event listeners to prevent default browser behavior
   */
  useEffect(() => {
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const events = ['dragenter', 'dragover', 'dragleave', 'drop'] as const;
    
    events.forEach(eventName => {
      document.addEventListener(eventName, preventDefaults, false);
    });

    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, preventDefaults, false);
      });
    };
  }, []);

  return {
    isDragActive,
    getDragHandlers,
    handleFileSelect,
    validateFile,
  };
};