// src/lib/query/utilities/errorHandling.ts
import { useEffect } from 'react';
import { 
    handleClientError, 
    captureError, 
    createErrorContext, 
} from '@error';
import { ErrorContext } from '@core-types/error';
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

/**
 * Default error handler for React Query
 * Integrates with the application's error handling system
 */
export function defaultQueryErrorHandler(
  error: unknown, 
  context: string | ErrorContext = 'QueryError'
): Error {
  // Format the error message using the application's error handling
  const errorMessage = handleClientError(error, typeof context === 'string' ? context : context.operation || 'QueryError');
  
  // Return a new error with the formatted message
  return error instanceof Error 
    ? error 
    : new Error(errorMessage);
}

/**
 * Configure global error handling for a QueryClient
 * In v5, onError has been removed from queries and must be handled via QueryCache/MutationCache
 */
export function configureQueryErrorHandling(queryClient: QueryClient): void {
  // QueryCache and MutationCache need to be configured when creating the QueryClient
  // This function can no longer modify the QueryClient after creation
  console.warn('In React Query v5, error handling should be configured when creating the QueryClient');
}

/**
 * Create a pre-configured QueryClient with error handling
 * This is the v5 way to handle global errors
 */
export function createQueryClientWithErrorHandling(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      // Called once per query
      onError: (error) => {
        captureError(error, createErrorContext('ReactQuery', 'query'));
      },
    }),
    mutationCache: new MutationCache({
      // Called once per mutation
      onError: (error) => {
        captureError(error, createErrorContext('ReactQuery', 'mutation'));
      },
    }),
    defaultOptions: {
      queries: {
        // v5 no longer has onError here
        retry: (failureCount, error) => {
          // Custom retry logic with error handling
          captureError(error, createErrorContext('ReactQuery', 'query-retry', { 
            metadata: { failureCount } 
          }));
          return failureCount < 3;
        },
      },
      mutations: {
        // Mutations still support onError in v5
        onError: (error) => {
          captureError(error, createErrorContext('ReactQuery', 'mutation'));
        },
      },
    },
  });
}

/**
 * Type-safe wrapper for error handling in React Query hooks
 */
export async function handleQueryError<T>(
  promise: Promise<T>, 
  context: string | ErrorContext
): Promise<T> {
  return promise.catch(error => {
    const errorContext = typeof context === 'string' 
      ? createErrorContext('ReactQuery', context)
      : { ...createErrorContext('ReactQuery', context.operation || 'query'), ...context };
    
    captureError(error, errorContext);
    throw defaultQueryErrorHandler(error, context);
  });
}

/**
 * Hook to handle query errors in components
 * Replaces the removed onError callback pattern
 */
export function useQueryErrorHandler(
  error: Error | null,
  isError: boolean,
  context: string | ErrorContext
): void {
  useEffect(() => {
    if (isError && error) {
      const errorContext = typeof context === 'string' 
        ? createErrorContext('ReactQuery', context)
        : { ...createErrorContext('ReactQuery', context.operation || 'query'), ...context };
      
      captureError(error, errorContext);
    }
  }, [isError, error, context]);
}