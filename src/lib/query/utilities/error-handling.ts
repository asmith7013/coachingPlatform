// src/lib/query/utilities/errorHandling.ts
import { useEffect } from 'react';
import { 
    logError, 
    createErrorContext,
    formatErrorMessage,
    classifyError
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
  // Create proper error context
  const errorContext: ErrorContext = typeof context === 'string'
    ? createErrorContext('ReactQuery', context)
    : { component: 'ReactQuery', ...(context || {}) };
  
  // Log through the central system
  logError(error, errorContext);
  
  // Format the error message
  const errorMessage = formatErrorMessage(
    error, 
    typeof context === 'string' ? context : context.operation
  );
  
  // Return a new error with the formatted message
  return error instanceof Error 
    ? Object.assign(error, { message: errorMessage })
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
        logError(error, {
          component: 'ReactQuery',
          operation: 'query',
          category: classifyError(error).category,
          metadata: { 
            queryKey: JSON.stringify(query.queryKey)
          }
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        logError(error, {
          component: 'ReactQuery',
          operation: 'mutation',
          category: classifyError(error).category,
          metadata: { 
            mutationKey: mutation.options.mutationKey 
              ? JSON.stringify(mutation.options.mutationKey)
              : undefined,
            variables: typeof variables === 'object' ? '[Object]' : String(variables)
          }
        });
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount === 0) {
            // Log only the first failure to avoid excessive logging
            logError(error, {
              component: 'ReactQuery',
              operation: 'query-retry',
              category: 'network',
              severity: 'warning',
              metadata: { failureCount }
            });
          }
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
    // Create proper error context
    const errorContext: ErrorContext = typeof context === 'string'
      ? createErrorContext('ReactQuery', context)
      : { component: 'ReactQuery', ...(context || {}) };
    
    // Log through the central system
    logError(error, errorContext);
    
    // Throw standardized error
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
      // Create proper error context
      const errorContext: ErrorContext = typeof context === 'string'
        ? createErrorContext('ReactQuery', context)
        : { component: 'ReactQuery', ...(context || {}) };
      
      // Log through the central system
      logError(error, errorContext);
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
      // Create proper error context
      const errorContext: ErrorContext = typeof context === 'string'
        ? createErrorContext('ReactQuery', context)
        : { component: 'ReactQuery', ...(context || {}) };
      
      // Add call parameters metadata for better debugging
      errorContext.metadata = {
        ...errorContext.metadata,
        callArgs: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
      };
      
      // Log through the central system
      logError(error, errorContext);
      
      // Throw standardized error
      throw defaultQueryErrorHandler(error, context);
    }
  };
}