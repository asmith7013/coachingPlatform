// Code for SentryErrorBoundary component
// This component is a class component that uses Sentry to catch errors and report them to Sentry

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureError } from '@/lib/error';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  className?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree
 * and integrates with the application's error monitoring system
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Get component name from errorInfo
    const componentMatch = errorInfo.componentStack?.match(/\n\s+in\s+([^\s]+)/);
    const component = componentMatch ? componentMatch[1] : 'Unknown';
    
    // Capture error with our monitoring system
    captureError(error, {
      component,
      operation: 'render',
      category: 'system',
      severity: 'error',
      metadata: {
        componentStack: errorInfo.componentStack,
        reactError: true
      }
    });
    
    // Call custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className={cn('p-4 bg-red-50 border border-red-200 rounded-md', className)}>
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-700">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={this.resetError}
            className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;