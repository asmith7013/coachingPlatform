import { useCallback } from 'react';
import { captureError } from '@/lib/error';

/**
 * Hook for React Error Boundary components to integrate with 
 * the application's error monitoring system
 */
export function useErrorBoundary() {
  return {
    onError: useCallback((error: Error, errorInfo: React.ErrorInfo) => {
      // Extract component name from the stack trace
      const componentStack = errorInfo.componentStack || '';
      const componentMatch = componentStack.match(/\n\s+in\s+([^\s]+)/);
      const component = componentMatch ? componentMatch[1] : 'Unknown';
      
      // Capture the error with component context
      captureError(error, {
        component,
        category: 'system',
        severity: 'error',
        metadata: { 
          componentStack: errorInfo.componentStack,
          reactError: true
        }
      });
    }, [])
  };
}

export default useErrorBoundary; 