import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { handleQueryError } from '@error/handlers/query';
import { ErrorContext } from '@error-types';
import { createErrorContext } from '@error';

/**
 * A specialized mutation hook that provides consistent error handling with React Query
 * 
 * This is the React Query replacement for the legacy useErrorHandledMutation hook
 * 
 * @param mutationFn - The mutation function
 * @param options - Optional React Query mutation options
 * @param errorContext - Optional error context string or object
 */
export function useStandardMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
  errorContext?: string | ErrorContext
): UseMutationResult<TData, TError, TVariables, TContext> {
  // Process error context to ensure consistent format
  const processedErrorContext = typeof errorContext === 'string'
    ? createErrorContext('Mutation', errorContext)
    : errorContext || createErrorContext('Mutation', 'execute');

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
    onError: (error, variables, context) => {
      // Call original onError if provided
      if (options?.onError) {
        options.onError(error, variables, context);
      }
      
      // Extract entity type from mutation key if available
      const entityType = typeof options?.mutationKey?.[0] === 'string' 
        ? options.mutationKey[0] 
        : undefined;
      
      // Handle error with our error system
      handleQueryError(
        error,
        'mutation',
        entityType,
        {
          context: typeof processedErrorContext === 'object' 
            ? processedErrorContext.operation
            : processedErrorContext,
          // Add additional context
          variables: typeof variables === 'object' 
            ? '[Object]' 
            : String(variables)
        }
      );
    }
  });
}

// Export as default and named export
export default useStandardMutation; 