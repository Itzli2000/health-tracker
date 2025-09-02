import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp, Activity } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import type { ImportStrategy } from '../types/renpho-import.types';
import { importSettingsSchema, type ImportSettingsFormData } from '../types/renpho-import.types';

interface StrategySelectorProps {
  currentStrategy: ImportStrategy;
  onStrategyChange: (strategy: ImportStrategy) => void;
  onImport: () => void;
  canImport: boolean;
  isProcessing: boolean;
  duplicateCount: number;
  className?: string;
}

/**
 * Import strategy selection form component
 */
export const StrategySelector: React.FC<StrategySelectorProps> = ({
  currentStrategy,
  onStrategyChange,
  onImport,
  canImport,
  isProcessing,
  duplicateCount,
  className = '',
}) => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(importSettingsSchema),
    defaultValues: {
      strategy: currentStrategy,
      skipDuplicates: true,
      validateRanges: true,
    },
  });

  const watchedStrategy = watch('strategy');

  // Update parent component when strategy changes
  React.useEffect(() => {
    if (watchedStrategy !== currentStrategy) {
      onStrategyChange(watchedStrategy);
    }
  }, [watchedStrategy, currentStrategy, onStrategyChange]);

  const onSubmit = async (data: any) => {
    console.log('Import settings:', data);
    onImport();
  };

  const strategies = [
    {
      value: 'average' as const,
      icon: TrendingUp,
      title: 'Daily Average',
      description: 'Combine multiple measurements from the same day into a single average',
      benefits: [
        'Cleaner trend analysis',
        'Reduces data noise',
        'Better for long-term tracking',
      ],
      recommended: duplicateCount > 0,
    },
    {
      value: 'keep_all' as const,
      icon: Activity,
      title: 'Keep All Measurements',
      description: 'Preserve all measurements with their complete timestamps',
      benefits: [
        'No data loss',
        'Detailed daily patterns',
        'Intra-day analysis possible',
      ],
      recommended: duplicateCount === 0,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Import Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Strategy selection */}
          <Controller
            name="strategy"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose how to handle your measurements:
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.map((strategy) => {
                    const Icon = strategy.icon;
                    const isSelected = field.value === strategy.value;
                    
                    return (
                      <div
                        key={strategy.value}
                        className={`
                          relative p-4 border-2 rounded-lg cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        onClick={() => field.onChange(strategy.value)}
                      >
                        {strategy.recommended && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Recommended
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <Icon className={`w-6 h-6 mt-1 ${
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          
                          <div className="flex-1 space-y-2">
                            <h3 className={`font-semibold ${
                              isSelected 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {strategy.title}
                            </h3>
                            
                            <p className={`text-sm ${
                              isSelected 
                                ? 'text-blue-700 dark:text-blue-200' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {strategy.description}
                            </p>
                            
                            <ul className={`text-xs space-y-1 ${
                              isSelected 
                                ? 'text-blue-600 dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {strategy.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <span className="text-green-500">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {errors.strategy && (
                  <p className="text-sm text-red-600">{errors.strategy.message}</p>
                )}
              </div>
            )}
          />

          {/* Additional options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Import Options
            </h4>
            
            <div className="space-y-3">
              <Controller
                name="skipDuplicates"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="skipDuplicates"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor="skipDuplicates" 
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Skip duplicate measurements (recommended)
                    </label>
                  </div>
                )}
              />
              
              <Controller
                name="validateRanges"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="validateRanges"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor="validateRanges" 
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Validate measurement ranges
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Import button */}
          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={!canImport || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Import
                </>
              )}
            </Button>
            
            {!canImport && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Please fix validation errors before importing
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};