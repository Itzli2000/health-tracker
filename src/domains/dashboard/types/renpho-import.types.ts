import { z } from 'zod';

// Raw RENPHO CSV data structure
export interface RenphoRawData {
  Fecha: string;
  ' Hora': string;
  ' Peso(kg)': number;
  'IMC': number;
  'Grasa corporal(%)': number;
  'Músculo esquelético(%)': number;
  'Peso corporal sin grasa(kg)': number;
  'Grasa subcutánea(%)': number;
  'Grasa visceral': number;
  'Agua corporal(%)': number;
  'Masa muscular(kg)': number;
  'Masa ósea(kg)': number;
  'Proteína (%)': number;
  'Tasa Metabólica Basal(kcal)': number;
  'Edad metabólica': number;
  'Tipo de cuerpo': number;
}

// Transformed measurement data
export interface TransformedMeasurement {
  date: string;
  time: string;
  weight: number;
  bmi: number;
  body_fat_percentage: number;
  skeletal_muscle_percentage: number;
  fat_free_body_weight: number;
  subcutaneous_fat_percentage: number;
  visceral_fat: number;
  body_water_percentage: number;
  muscle_mass: number;
  bone_mass: number;
  protein_percentage: number;
  basal_metabolic_rate: number;
  metabolic_age: number;
  body_type: number;
  source: 'renpho_import';
}

// Import strategies
export type ImportStrategy = 'average' | 'keep_all';

// Duplicate detection result
export interface DuplicateDetection {
  date: string;
  count: number;
}

// Validation result structure
export interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

// Parse result structure
export interface ParseResult {
  originalData: RenphoRawData[];
  transformedData: TransformedMeasurement[];
  grouped: Record<string, TransformedMeasurement[]>;
  duplicates: DuplicateDetection[];
  validation: ValidationResult;
}

// Import progress state
export interface ImportProgress {
  step: 'upload' | 'processing' | 'preview' | 'importing' | 'complete' | 'error';
  progress: number;
  message: string;
}

// Import result
export interface ImportResult {
  strategy: ImportStrategy;
  successful: number;
  failed: number;
  errors: string[];
  processedData: TransformedMeasurement[];
}

// Form schema for import settings
export const importSettingsSchema = z.object({
  strategy: z.enum(['average', 'keep_all']),
  skipDuplicates: z.boolean().default(true),
  validateRanges: z.boolean().default(true),
});

export type ImportSettingsFormData = z.infer<typeof importSettingsSchema>;

// Weight measurement validation schema
export const weightValidationSchema = z.object({
  weight: z.number().min(30, 'Minimum weight is 30kg').max(300, 'Maximum weight is 300kg'),
  bmi: z.number().min(10, 'BMI too low').max(60, 'BMI too high'),
  body_fat_percentage: z.number().min(3, 'Body fat percentage too low').max(70, 'Body fat percentage too high'),
});

// Error types for better error handling
export class RenphoImportError extends Error {
  public code: 'INVALID_FILE' | 'PARSING_ERROR' | 'VALIDATION_ERROR' | 'IMPORT_ERROR';
  public details?: unknown;

  constructor(
    message: string,
    code: 'INVALID_FILE' | 'PARSING_ERROR' | 'VALIDATION_ERROR' | 'IMPORT_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'RenphoImportError';
    this.code = code;
    this.details = details;
  }
}

// Zustand store state interface
export interface RenphoImportState {
  // File handling
  selectedFile: File | null;
  
  // Processing results
  parseResult: ParseResult | null;
  importResult: ImportResult | null;
  
  // UI state
  importProgress: ImportProgress;
  isProcessing: boolean;
  showPreview: boolean;
  
  // Settings
  strategy: ImportStrategy;
  
  // Actions
  setSelectedFile: (file: File | null) => void;
  setParseResult: (result: ParseResult | null) => void;
  setImportResult: (result: ImportResult | null) => void;
  setImportProgress: (progress: ImportProgress) => void;
  setIsProcessing: (processing: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setStrategy: (strategy: ImportStrategy) => void;
  resetImport: () => void;
}