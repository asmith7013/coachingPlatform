'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { captureError, createErrorContext } from '@/lib/error';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorComponent?: React.ComponentType<{ error: Error; reset: () => void }>;
  className?: string;
}

/**
 * Specialized error boundary for React Query operations
 * Integrates with React Query's reset mechanism and the application's error monitoring
 */
export function QueryErrorBoundary({
  children,
  fallback,
  errorComponent: ErrorComponent,
  className
}: QueryErrorBoundaryProps) {
  // Get React Query's reset function
  const { reset } = useQueryErrorResetBoundary();

  // Handle errors by capturing them in our monitoring system
  const handleError = (error: Error) => {
    captureError(error, createErrorContext('ReactQuery', 'boundary'));
  };

  // Default error component with retry functionality
  const DefaultErrorComponent = ({ error, reset }: { error: Error; reset: () => void }) => (
    <Alert intent="error" className={className}>
      <Alert.Title>Data Loading Error</Alert.Title>
      <Alert.Description>
        {error.message || 'An error occurred while loading data.'}
      </Alert.Description>
      <div className="mt-4">
        <Button 
          intent="primary" 
          appearance="solid"
          onClick={reset}
        >
          Try Again
        </Button>
      </div>
    </Alert>
  );

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={(error: Error, resetError: () => void) => {
        if (ErrorComponent) {
          return <ErrorComponent error={error} reset={() => { resetError(); reset(); }} />;
        }
        if (fallback) {
          return fallback;
        }
        return (
          <DefaultErrorComponent 
            error={error} 
            reset={() => { resetError(); reset(); }} 
          />
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 