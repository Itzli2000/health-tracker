import Papa from 'papaparse';
import type {
  RenphoRawData,
  TransformedMeasurement,
} from '../types/renpho-import.types';
import {
  RenphoImportError,
  weightValidationSchema,
} from '../types/renpho-import.types';

/**
 * Service for parsing RENPHO CSV files using Papaparse
 */
export class CsvParsingService {
  /**
   * Parse RENPHO CSV file and return structured data
   */
  static async parseRenphoCSV(file: File): Promise<RenphoRawData[]> {
    return new Promise((resolve, reject) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        reject(new RenphoImportError('Invalid file type. Please select a CSV file.', 'INVALID_FILE'));
        return;
      }

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';'],
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            const data = results.data as RenphoRawData[];
            
            // Basic validation to ensure this is a RENPHO file
            this.validateRenphoFormat(data);
            
            resolve(data);
          } catch (error) {
            reject(new RenphoImportError(
              'Failed to parse CSV data. Please ensure the file is exported from RENPHO app.',
              'PARSING_ERROR',
              error
            ));
          }
        },
        error: (error) => {
          reject(new RenphoImportError(
            `CSV parsing failed: ${error.message}`,
            'PARSING_ERROR',
            error
          ));
        }
      });
    });
  }

  /**
   * Transform raw RENPHO data to our internal format
   */
  static transformRenphoData(rawData: RenphoRawData[]): TransformedMeasurement[] {
    return rawData.map((row, index) => {
      try {
        // Parse date from DD/MM/YY format to YYYY-MM-DD
        const dateParts = row.Fecha.split('/');
        if (dateParts.length !== 3) {
          throw new Error(`Invalid date format: ${row.Fecha}`);
        }

        const [day, month, year] = dateParts;
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Clean time format (remove extra spaces)
        const cleanTime = row[' Hora'].trim();

        const transformed: TransformedMeasurement = {
          date: isoDate,
          time: cleanTime,
          weight: Number(row[' Peso(kg)']),
          bmi: Number(row['IMC']),
          body_fat_percentage: Number(row['Grasa corporal(%)']),
          skeletal_muscle_percentage: Number(row['Músculo esquelético(%)'] || 0),
          fat_free_body_weight: Number(row['Peso corporal sin grasa(kg)'] || 0),
          subcutaneous_fat_percentage: Number(row['Grasa subcutánea(%)'] || 0),
          visceral_fat: Number(row['Grasa visceral'] || 0),
          body_water_percentage: Number(row['Agua corporal(%)'] || 0),
          muscle_mass: Number(row['Masa muscular(kg)'] || 0),
          bone_mass: Number(row['Masa ósea(kg)'] || 0),
          protein_percentage: Number(row['Proteína (%)'] || 0),
          basal_metabolic_rate: Number(row['Tasa Metabólica Basal(kcal)'] || 0),
          metabolic_age: Number(row['Edad metabólica'] || 0),
          body_type: Number(row['Tipo de cuerpo'] || 0),
          source: 'renpho_import',
        };

        // Validate essential measurements
        const validation = weightValidationSchema.safeParse({
          weight: transformed.weight,
          bmi: transformed.bmi,
          body_fat_percentage: transformed.body_fat_percentage,
        });

        if (!validation.success) {
          console.warn(`Validation warnings for row ${index + 1}:`, validation.error.issues);
        }

        return transformed;
      } catch (error) {
        throw new RenphoImportError(
          `Failed to transform row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
          'PARSING_ERROR',
          { row, index }
        );
      }
    });
  }

  /**
   * Group measurements by date and detect duplicates
   */
  static groupByDate(data: TransformedMeasurement[]): {
    grouped: Record<string, TransformedMeasurement[]>;
    duplicates: Array<{ date: string; count: number }>;
  } {
    const grouped: Record<string, TransformedMeasurement[]> = {};
    
    // Group by date
    data.forEach(record => {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    });

    // Find duplicates
    const duplicates = Object.entries(grouped)
      .filter(([, records]) => records.length > 1)
      .map(([date, records]) => ({ date, count: records.length }));

    return { grouped, duplicates };
  }

  /**
   * Create daily averages from grouped measurements
   */
  static averageDailyMeasurements(grouped: Record<string, TransformedMeasurement[]>): TransformedMeasurement[] {
    return Object.entries(grouped).map(([date, records]) => {
      const count = records.length;
      
      // Get first record as template
      const first = records[0];
      
      // Calculate averages for all numeric fields
      const averaged: TransformedMeasurement = {
        date,
        time: first.time, // Keep first measurement's time
        weight: this.roundToDecimal(records.reduce((sum, r) => sum + r.weight, 0) / count, 1),
        bmi: this.roundToDecimal(records.reduce((sum, r) => sum + r.bmi, 0) / count, 1),
        body_fat_percentage: this.roundToDecimal(records.reduce((sum, r) => sum + r.body_fat_percentage, 0) / count, 1),
        skeletal_muscle_percentage: this.roundToDecimal(records.reduce((sum, r) => sum + r.skeletal_muscle_percentage, 0) / count, 1),
        fat_free_body_weight: this.roundToDecimal(records.reduce((sum, r) => sum + r.fat_free_body_weight, 0) / count, 1),
        subcutaneous_fat_percentage: this.roundToDecimal(records.reduce((sum, r) => sum + r.subcutaneous_fat_percentage, 0) / count, 1),
        visceral_fat: this.roundToDecimal(records.reduce((sum, r) => sum + r.visceral_fat, 0) / count, 1),
        body_water_percentage: this.roundToDecimal(records.reduce((sum, r) => sum + r.body_water_percentage, 0) / count, 1),
        muscle_mass: this.roundToDecimal(records.reduce((sum, r) => sum + r.muscle_mass, 0) / count, 1),
        bone_mass: this.roundToDecimal(records.reduce((sum, r) => sum + r.bone_mass, 0) / count, 1),
        protein_percentage: this.roundToDecimal(records.reduce((sum, r) => sum + r.protein_percentage, 0) / count, 1),
        basal_metabolic_rate: Math.round(records.reduce((sum, r) => sum + r.basal_metabolic_rate, 0) / count),
        metabolic_age: Math.round(records.reduce((sum, r) => sum + r.metabolic_age, 0) / count),
        body_type: Math.round(records.reduce((sum, r) => sum + r.body_type, 0) / count),
        source: 'renpho_import',
      };

      return averaged;
    });
  }

  /**
   * Validate that the CSV has expected RENPHO format
   */
  private static validateRenphoFormat(data: unknown[]): void {
    if (!data || data.length === 0) {
      throw new Error('CSV file is empty');
    }

    const first = data[0] as Record<string, unknown>;
    const requiredColumns = ['Fecha', ' Hora', ' Peso(kg)', 'IMC', 'Grasa corporal(%)'];
    
    const missingColumns = requiredColumns.filter(col => !(col in first));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required RENPHO columns: ${missingColumns.join(', ')}`);
    }
  }

  /**
   * Round number to specified decimal places
   */
  private static roundToDecimal(num: number, decimals: number): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}