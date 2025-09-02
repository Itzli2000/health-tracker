import type {
  ParseResult,
  ImportResult,
  ImportStrategy,
  TransformedMeasurement,
} from '../types/renpho-import.types';
import { RenphoImportError } from '../types/renpho-import.types';
import { CsvParsingService } from './csv-parsing.service';
import { ImportValidationService } from './import-validation.service';

/**
 * Main service for RENPHO CSV import functionality
 * Orchestrates parsing, validation, and import operations
 */
export class RenphoImportService {
  /**
   * Parse RENPHO CSV file and return structured results
   */
  static async parseFile(file: File): Promise<ParseResult> {
    try {
      // Step 1: Parse CSV file
      const rawData = await CsvParsingService.parseRenphoCSV(file);
      
      if (rawData.length === 0) {
        throw new RenphoImportError('No data found in CSV file', 'PARSING_ERROR');
      }

      // Step 2: Transform to internal format
      const transformedData = CsvParsingService.transformRenphoData(rawData);

      // Step 3: Group by date and detect duplicates
      const { grouped, duplicates } = CsvParsingService.groupByDate(transformedData);

      // Step 4: Validate data
      const validation = ImportValidationService.validateMeasurements(transformedData, duplicates);

      return {
        originalData: rawData,
        transformedData,
        grouped,
        duplicates,
        validation,
      };
    } catch (error) {
      if (error instanceof RenphoImportError) {
        throw error;
      }
      
      throw new RenphoImportError(
        `Failed to parse RENPHO file: ${error instanceof Error ? error.message : String(error)}`,
        'PARSING_ERROR',
        error
      );
    }
  }

  /**
   * Process import with selected strategy
   */
  static async processImport(
    parseResult: ParseResult,
    strategy: ImportStrategy
  ): Promise<ImportResult> {
    try {
      if (!parseResult.validation.isValid) {
        throw new RenphoImportError(
          'Cannot import data with validation errors. Please fix the errors first.',
          'VALIDATION_ERROR',
          parseResult.validation.errors
        );
      }

      // Determine final data based on strategy
      let finalData: TransformedMeasurement[];
      
      if (strategy === 'average') {
        finalData = CsvParsingService.averageDailyMeasurements(parseResult.grouped);
      } else {
        finalData = parseResult.transformedData;
      }

      // TODO: Replace with actual API call to save measurements
      // await measurementsService.createBatch(finalData);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        strategy,
        successful: finalData.length,
        failed: 0,
        errors: [],
        processedData: finalData,
      };
    } catch (error) {
      if (error instanceof RenphoImportError) {
        throw error;
      }
      
      throw new RenphoImportError(
        `Import failed: ${error instanceof Error ? error.message : String(error)}`,
        'IMPORT_ERROR',
        error
      );
    }
  }

  /**
   * Get import statistics for display
   */
  static getImportStatistics(parseResult: ParseResult): {
    totalMeasurements: number;
    uniqueDates: number;
    duplicateDates: number;
    dateRange: { start: string; end: string } | null;
  } {
    const { transformedData, duplicates } = parseResult;
    
    if (transformedData.length === 0) {
      return {
        totalMeasurements: 0,
        uniqueDates: 0,
        duplicateDates: 0,
        dateRange: null,
      };
    }

    const dates = transformedData.map(m => m.date).sort();
    
    return {
      totalMeasurements: transformedData.length,
      uniqueDates: new Set(dates).size,
      duplicateDates: duplicates.length,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1],
      },
    };
  }

  /**
   * Preview data for a specific strategy
   */
  static previewData(
    parseResult: ParseResult,
    strategy: ImportStrategy,
    limit = 5
  ): TransformedMeasurement[] {
    let data: TransformedMeasurement[];
    
    if (strategy === 'average') {
      data = CsvParsingService.averageDailyMeasurements(parseResult.grouped);
    } else {
      data = parseResult.transformedData;
    }

    // Sort by date descending and limit
    return data
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Validate file before processing
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return {
        isValid: false,
        error: 'Please select a CSV file',
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum allowed size is 10MB',
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
  }
}