import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { createScheduleErrorContext } from '../utils/schedule-error-utils';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';

interface ScheduleErrorBoundaryProps {
  children: ReactNode;
  schoolId?: string;
  date?: string;
  fallbackComponent?: ReactNode;
}

/**
 * Schedule-specific error boundary with contextual error handling
 */
export function ScheduleErrorBoundary({ 
  children, 
  schoolId, 
  date,
  fallbackComponent 
}: ScheduleErrorBoundaryProps) {
  
  const scheduleErrorFallback = (error: Error, resetError: () => void) => {
    if (fallbackComponent) {
      return fallbackComponent;
    }

    return (
      <Alert intent="error" className="w-full">
        <Alert.Title>Schedule Loading Error</Alert.Title>
        <Alert.Description>
          There was an error loading the schedule data. This has been reported to our team.
          {schoolId && date && (
            <div className="mt-2 text-xs text-gray-600">
              School: {schoolId} | Date: {date}
            </div>
          )}
        </Alert.Description>
        <div className="mt-4 space-x-2">
          <Button 
            intent="primary" 
            appearance="solid"
            onClick={resetError}
          >
            Retry
          </Button>
          <Button 
            intent="secondary" 
            appearance="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </Alert>
    );
  };

  return (
    <ErrorBoundary
      fallback={scheduleErrorFallback}
      context={createScheduleErrorContext('render', { schoolId, date })}
      variant="default"
      showErrorId={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
} 