// src/lib/query/utilities/error-handling.ts
import { useEffect } from 'react';
import { logError, createErrorContext } from '@error';
import { createQueryClient } from '@query/core/client';

/**
 * Hook for handling query errors in components
 */
export function useQueryErrorHandler(
  error: Error | null | undefined,
  isError: boolean,
  context: string
): void {
  useEffect(() => {
    if (isError && error) {
      logError(error, createErrorContext('ReactQuery', context));
    }
  }, [isError, error, context]);
}

// Re-export the query client for backward compatibility
export { createQueryClient } from '@query/core/client';
export { createQueryClient as createQueryClientWithErrorHandling };