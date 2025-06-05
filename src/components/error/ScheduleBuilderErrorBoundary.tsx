'use client'

import { ReactNode, useCallback } from 'react'
import type { ErrorInfo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { createErrorContext, logError } from '@error'
import { ErrorContext, ErrorCategory, ErrorSeverity } from '@error-types'
import { cn } from '@ui/utils/formatters'
import { Button } from '@components/core/Button'
import { Alert } from '@components/core/feedback/Alert'
import { backgroundColors, borderColors, textColors } from '@/lib/tokens/colors'
import { paddingX, paddingY } from '@/lib/tokens/spacing'
import { radii } from '@/lib/tokens/shape'

interface ScheduleBuilderErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
  fallback?: ReactNode
}

interface ScheduleBuilderErrorFallbackProps {
  error: Error
  resetError: () => void
  onReset?: () => void
}

/**
 * Create schedule builder specific error context
 */
function createScheduleBuilderErrorContext(
  operation: string = 'stateManagement',
  additionalContext: Record<string, unknown> = {}
): ErrorContext {
  return createErrorContext('ScheduleBuilder', operation, {
    category: 'business' as ErrorCategory,
    severity: 'error' as ErrorSeverity,
    metadata: {
      errorBoundary: 'ScheduleBuilder',
      hasErrorRecovery: true,
      ...additionalContext
    }
  })
}

/**
 * Schedule-specific error fallback component using design tokens
 */
function ScheduleBuilderErrorFallback({ 
  error, 
  resetError, 
  onReset 
}: ScheduleBuilderErrorFallbackProps) {
  const handleReset = () => {
    resetError()
    if (onReset) {
      onReset()
    }
  }

  const handlePageRefresh = () => {
    window.location.reload()
  }

  return (
    <div className={cn(
      paddingX.lg,
      paddingY.lg,
      backgroundColors.surface,
      radii.lg,
      borderColors.danger,
      'border'
    )}>
      <Alert intent="error" className="mb-4">
        <Alert.Title>Schedule Builder Error</Alert.Title>
        <Alert.Description>
          Something went wrong with the schedule builder. Your work may have been lost.
        </Alert.Description>
      </Alert>
      
      <div className="space-y-4">
        <div className={cn(textColors.muted, 'text-sm')}>
          <strong>Error:</strong> {error.message || 'Unknown error occurred'}
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleReset}
            intent="primary"
            appearance="solid"
          >
            Reset Schedule Builder
          </Button>
          
          <Button 
            onClick={handlePageRefresh}
            intent="primary"
            appearance="outline"
          >
            Refresh Page
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className={cn(textColors.default, 'text-sm font-medium cursor-pointer')}>
              Error Details (Development)
            </summary>
            <pre className={cn(
              'mt-2 text-xs p-3 rounded overflow-auto',
              backgroundColors.muted,
              textColors.default
            )}>
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Specialized error boundary for Schedule Builder components
 * 
 * Extends the base ErrorBoundary with schedule-specific error handling,
 * logging, and recovery options. Integrates with the unified error
 * classification and monitoring system.
 * 
 * @example
 * <ScheduleBuilderErrorBoundary onReset={handleReset}>
 *   <VisitScheduleBuilder />
 * </ScheduleBuilderErrorBoundary>
 */
export function ScheduleBuilderErrorBoundary({
  children,
  onReset,
  fallback
}: ScheduleBuilderErrorBoundaryProps) {
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Create schedule-specific error context
    const scheduleContext = createScheduleBuilderErrorContext('errorBoundary', {
      componentStack: errorInfo.componentStack,
      reactError: true,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })

    // Log with enhanced context - base ErrorBoundary will also log,
    // but this adds schedule-specific context
    logError(error, scheduleContext)
  }, [])

  const scheduleSpecificFallback = useCallback((error: Error, resetError: () => void) => {
    // Use custom fallback if provided
    if (fallback) {
      return fallback
    }

    // Use schedule-specific fallback
    return (
      <ScheduleBuilderErrorFallback
        error={error}
        resetError={resetError}
        onReset={onReset}
      />
    )
  }, [fallback, onReset])

  return (
    <ErrorBoundary
      context={createScheduleBuilderErrorContext()}
      fallback={scheduleSpecificFallback}
      onError={handleError}
      variant="default"
      showErrorId={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ScheduleBuilderErrorBoundary 