import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

interface ImportErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ImportErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * Error boundary for catching and handling import-related errors
 */
export class ImportErrorBoundary extends React.Component<
  ImportErrorBoundaryProps,
  ImportErrorBoundaryState
> {
  constructor(props: ImportErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ImportErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Import Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Import Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Something went wrong during the import process
          </h4>
          
          {error && (
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <p><strong>Error:</strong> {error.message}</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    Technical Details (Development Mode)
                  </summary>
                  <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900 p-2 rounded overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            What you can do:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Try refreshing the page and uploading your file again</li>
            <li>• Check that your CSV file is properly formatted</li>
            <li>• Ensure your file is exported from the RENPHO app</li>
            <li>• Try with a smaller file if the current one is very large</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetError} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="flex-1"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};