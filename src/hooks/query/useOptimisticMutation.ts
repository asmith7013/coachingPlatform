/**
 * Generic hook for optimistic mutations with React Query
 * 
 * This hook provides a standardized approach to handling optimistic updates
 * with proper error handling and cache invalidation.
 */
import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { handleClientError } from '@error/handlers/client';

/**
 * Options for optimistic mutation behavior
 */
export interface OptimisticMutationOptions<TData, TError, TContext, TResult> {
  /** Query keys to invalidate on success */
  invalidateQueries?: QueryKey[];
  
  /** Function to update cache optimistically before mutation completes */
  onMutate?: (newData: TData) => Promise<TContext>;
  
  /** Function to roll back optimistic update on error */
  onError?: (err: TError, newData: TData, context: TContext | undefined) => void;
  
  /** Additional actions on success */
  onSuccess?: (data: TResult, variables: TData, context: TContext | undefined) => void;
  
  /** Error handler context for debugging */
  errorContext?: string;
  
  /** Whether to retry on failure */
  retry?: boolean | number;
}

/**
 * Hook for handling mutations with optimistic updates
 * 
 * @param mutationFn - The function to call for the mutation
 * @param options - Configuration options for the mutation
 */
export function useOptimisticMutation<TData, TResult, TError, TContext>(
  mutationFn: (data: TData) => Promise<TResult>,
  options?: OptimisticMutationOptions<TData, TError, TContext, TResult>
) {
  const queryClient = useQueryClient();
  const { 
    invalidateQueries, 
    onMutate, 
    onError, 
    onSuccess,
    errorContext = 'Mutation',
    retry = 1
  } = options || {};

  return useMutation({
    mutationFn: async (data: TData) => {
      try {
        return await mutationFn(data);
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, errorContext));
      }
    },
    
    // Optimistic update handling
    onMutate: async (newData: TData) => {
      if (onMutate) {
        // If invalidation queries are provided, cancel related queries
        if (invalidateQueries?.length) {
          await Promise.all(
            invalidateQueries.map(queryKey => 
              queryClient.cancelQueries({ queryKey })
            )
          );
        }
        
        // Run the optimistic update function
        return await onMutate(newData);
      }
      return undefined;
    },
    
    // Error handling with rollback
    onError: (err, newData, context) => {
      // Handle errors and rollback optimistic updates
      if (onError) {
        onError(err as TError, newData, context as TContext);
      }
    },
    
    // Success handling with cache invalidation
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries on success
      if (invalidateQueries?.length) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Run additional success callback if provided
      if (onSuccess) {
        onSuccess(data, variables, context as TContext);
      }
    },
    
    // Retry configuration
    retry,
  });
}
