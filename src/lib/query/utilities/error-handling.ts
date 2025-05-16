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
 * Default error handler for React Query operations
 * Integrates with the application's error handling system
 * 
 * @param error The error that occurred
 * @param context Information about where the error occurred
 * @returns Standardized error object
 */
export function defaultQueryErrorHandler(
  error: unknown, 
  context: string | ErrorContext = 'QueryError'
): Error {
  // Format the error message using the application's error handling
  const errorMessage = handleClientError(
    error, 
    typeof context === 'string' ? context : context.operation || 'QueryError'
  );
  
  // Return a new error with the formatted message
  return error instanceof Error 
    ? error 
    : new Error(errorMessage);
}

/**
 * Create a pre-configured QueryClient with error handling
 * 
 * @returns QueryClient with error handling configured
 */
export function createQueryClientWithErrorHandling(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        captureError(error, createErrorContext('ReactQuery', 'query', {
          metadata: { 
            queryKey: JSON.stringify(query.queryKey)
          }
        }));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        captureError(error, createErrorContext('ReactQuery', 'mutation', {
          metadata: { 
            mutationKey: mutation.options.mutationKey 
              ? JSON.stringify(mutation.options.mutationKey)
              : undefined
          }
        }));
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          captureError(error, createErrorContext('ReactQuery', 'query-retry', { 
            metadata: { failureCount } 
          }));
          return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (match existing config)
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Type-safe wrapper for error handling in React Query operations
 * 
 * @param promise The async operation to perform
 * @param context Information about the operation for error reporting
 * @returns The promise result or throws a standardized error
 */
export async function handleQueryError<T>(
  promise: Promise<T>, 
  context: string | ErrorContext
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    const errorContext = typeof context === 'string' 
      ? createErrorContext('ReactQuery', context)
      : { ...createErrorContext('ReactQuery', context.operation || 'query'), ...context };
    
    captureError(error, errorContext);
    throw defaultQueryErrorHandler(error, context);
  }
}

/**
 * Hook to handle query errors in components
 * 
 * @param error The error object from useQuery
 * @param isError Whether an error occurred
 * @param context Information about the query for error reporting
 */
export function useQueryErrorHandler(
  error: Error | null | undefined,
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

/**
 * Wraps a query function with standardized error handling
 * 
 * @param queryFn The function to execute the query
 * @param context Information about the query for error reporting
 * @returns A new function with error handling
 */
export function withQueryErrorHandling<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  context: string | ErrorContext
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    try {
      return await queryFn(...args);
    } catch (error) {
      const errorContext = typeof context === 'string' 
        ? createErrorContext('ReactQuery', context)
        : { ...createErrorContext('ReactQuery', context.operation || 'query'), ...context };
      
      captureError(error, errorContext);
      throw defaultQueryErrorHandler(error, context);
    }
  };
}