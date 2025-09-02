import type {
  TransformedMeasurement,
  ValidationResult,
  DuplicateDetection,
} from '../types/renpho-import.types';
import {
  weightValidationSchema,
} from '../types/renpho-import.types';

/**
 * Service for validating imported RENPHO data
 */
export class ImportValidationService {
  /**
   * Validate transformed measurement data
   */
  static validateMeasurements(
    data: TransformedMeasurement[],
    duplicates: DuplicateDetection[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for empty data
    if (!data || data.length === 0) {
      errors.push('No valid measurements found in the CSV file');
      return { errors, warnings, isValid: false };
    }

    // Validate each measurement
    data.forEach((measurement, index) => {
      const validation = this.validateSingleMeasurement(measurement, index + 1);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    });

    // Check for duplicates
    if (duplicates.length > 0) {
      warnings.push(`Found ${duplicates.length} dates with multiple measurements`);
      
      // Add specific duplicate warnings
      duplicates.forEach(({ date, count }) => {
        warnings.push(`${count} measurements found for ${date}`);
      });
    }

    // Check date range validity
    const dateValidation = this.validateDateRange(data);
    errors.push(...dateValidation.errors);
    warnings.push(...dateValidation.warnings);

    // Check for measurement consistency
    const consistencyValidation = this.validateMeasurementConsistency(data);
    warnings.push(...consistencyValidation.warnings);

    return {
      errors: errors.filter(Boolean),
      warnings: warnings.filter(Boolean),
      isValid: errors.length === 0,
    };
  }

  /**
   * Validate a single measurement
   */
  private static validateSingleMeasurement(
    measurement: TransformedMeasurement,
    rowNumber: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate essential measurements using Zod schema
    const validation = weightValidationSchema.safeParse({
      weight: measurement.weight,
      bmi: measurement.bmi,
      body_fat_percentage: measurement.body_fat_percentage,
    });

    if (!validation.success) {
      validation.error.issues.forEach(issue => {
        errors.push(`Row ${rowNumber}: ${issue.path.join('.')}: ${issue.message}`);
      });
    }

    // Additional range validations
    if (measurement.skeletal_muscle_percentage < 0 || measurement.skeletal_muscle_percentage > 100) {
      warnings.push(`Row ${rowNumber}: Skeletal muscle percentage (${measurement.skeletal_muscle_percentage}%) seems unusual`);
    }

    if (measurement.body_water_percentage < 30 || measurement.body_water_percentage > 80) {
      warnings.push(`Row ${rowNumber}: Body water percentage (${measurement.body_water_percentage}%) seems unusual`);
    }

    if (measurement.visceral_fat < 0 || measurement.visceral_fat > 30) {
      warnings.push(`Row ${rowNumber}: Visceral fat level (${measurement.visceral_fat}) seems unusual`);
    }

    if (measurement.basal_metabolic_rate < 800 || measurement.basal_metabolic_rate > 4000) {
      warnings.push(`Row ${rowNumber}: BMR (${measurement.basal_metabolic_rate} kcal) seems unusual`);
    }

    if (measurement.metabolic_age < 10 || measurement.metabolic_age > 120) {
      warnings.push(`Row ${rowNumber}: Metabolic age (${measurement.metabolic_age}) seems unusual`);
    }

    // Validate date format
    if (!this.isValidDate(measurement.date)) {
      errors.push(`Row ${rowNumber}: Invalid date format: ${measurement.date}`);
    }

    // Validate time format
    if (!this.isValidTime(measurement.time)) {
      warnings.push(`Row ${rowNumber}: Unusual time format: ${measurement.time}`);
    }

    return {
      errors: errors.filter(Boolean),
      warnings: warnings.filter(Boolean),
      isValid: errors.length === 0,
    };
  }

  /**
   * Validate date range of measurements
   */
  private static validateDateRange(data: TransformedMeasurement[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const dates = data.map(m => new Date(m.date)).filter(d => !isNaN(d.getTime()));
    
    if (dates.length === 0) {
      errors.push('No valid dates found in the data');
      return { errors, warnings, isValid: false };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const now = new Date();

    // Check for future dates
    if (maxDate > now) {
      warnings.push(`Found measurements dated in the future (${maxDate.toLocaleDateString()})`);
    }

    // Check for very old dates (more than 10 years ago)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    
    if (minDate < tenYearsAgo) {
      warnings.push(`Found very old measurements (${minDate.toLocaleDateString()})`);
    }

    // Check date range span
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      warnings.push(`Data spans ${daysDiff} days (${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()})`);
    }

    return { errors, warnings, isValid: true };
  }

  /**
   * Validate measurement consistency and detect outliers
   */
  private static validateMeasurementConsistency(data: TransformedMeasurement[]): ValidationResult {
    const warnings: string[] = [];

    if (data.length < 2) {
      return { errors: [], warnings, isValid: true };
    }

    // Check for extreme weight variations
    const weights = data.map(m => m.weight).filter(w => w > 0);
    if (weights.length > 1) {
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      const weightVariation = ((maxWeight - minWeight) / minWeight) * 100;

      if (weightVariation > 30) {
        warnings.push(`Large weight variation detected: ${minWeight}kg to ${maxWeight}kg (${weightVariation.toFixed(1)}%)`);
      }
    }

    // Check for inconsistent BMI calculations
    const bmiInconsistencies = data.filter(m => {
      if (m.weight <= 0 || m.bmi <= 0) return false;
      
      // Estimate height from BMI and weight: height = sqrt(weight / BMI)
      const estimatedHeight = Math.sqrt(m.weight / m.bmi);
      
      // Check if this height is consistent across measurements
      return estimatedHeight < 1.2 || estimatedHeight > 2.5; // 1.2m to 2.5m range
    });

    if (bmiInconsistencies.length > 0) {
      warnings.push(`${bmiInconsistencies.length} measurements have inconsistent BMI calculations`);
    }

    return { errors: [], warnings, isValid: true };
  }

  /**
   * Check if date string is valid ISO format
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }

  /**
   * Check if time string has valid format
   */
  private static isValidTime(timeString: string): boolean {
    // Accept various time formats: "7:57:06 a.m.", "14:30:00", "2:30 PM", etc.
    const timeRegex = /^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(a\.m\.|p\.m\.|AM|PM)?$/i;
    return timeRegex.test(timeString.trim());
  }

  /**
   * Get validation summary for display
   */
  static getValidationSummary(validation: ValidationResult, totalRecords: number): string {
    const { errors, warnings, isValid } = validation;
    
    let summary = `Processed ${totalRecords} records`;
    
    if (isValid) {
      summary += ' successfully';
    } else {
      summary += ` with ${errors.length} errors`;
    }
    
    if (warnings.length > 0) {
      summary += ` and ${warnings.length} warnings`;
    }
    
    return summary;
  }
}