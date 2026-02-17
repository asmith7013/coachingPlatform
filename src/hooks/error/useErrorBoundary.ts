import { useState, useCallback } from "react";
import { ErrorContext } from "@error-types";
import { logError, createErrorContext } from "@error";

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  hasError: boolean;
}

interface ErrorBoundaryHookOptions {
  fallback?: React.ReactNode;
  context?: ErrorContext | string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  reportToSentry?: boolean;
}

/**
 * Hook for component-level error boundary functionality
 * Provides state management and error reporting capabilities
 *
 * @param options Configuration options
 * @returns Error handling methods and state
 */
export function useErrorBoundary(options: ErrorBoundaryHookOptions = {}) {
  const [state, setState] = useState<ErrorBoundaryState>({
    error: null,
    errorInfo: null,
    hasError: false,
  });

  // Create error context - prefer structured context if available
  const getErrorContext = useCallback(
    (errorInfo: React.ErrorInfo): ErrorContext => {
      if (typeof options.context === "object") {
        return {
          ...options.context,
          metadata: {
            ...options.context.metadata,
            componentStack: errorInfo.componentStack,
          },
        };
      }

      if (typeof options.context === "string") {
        return createErrorContext("ErrorBoundary", options.context, {
          metadata: { componentStack: errorInfo.componentStack },
        });
      }

      return createErrorContext("ErrorBoundary", "componentDidCatch", {
        metadata: { componentStack: errorInfo.componentStack },
      });
    },
    [options.context],
  );

  // Handle error with context reporting
  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo) => {
      // Set local error state
      setState({
        error,
        errorInfo,
        hasError: true,
      });

      // Get context for error logging
      const errorContext = getErrorContext(errorInfo);

      // Log error using core system
      logError(error, errorContext);

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error, errorInfo);
      }
    },
    [getErrorContext, options],
  );

  // Reset error state
  const resetError = useCallback(() => {
    setState({
      error: null,
      errorInfo: null,
      hasError: false,
    });
  }, []);

  return {
    ...state,
    handleError,
    resetError,
    fallback: options.fallback,
  };
}

export default useErrorBoundary;
