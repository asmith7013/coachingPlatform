import { useState, useCallback } from 'react';
import { handleClientError } from '@error/handle-client-error';
// import { ErrorResponse } from '@core-types/error';

/**
 * Response from a server action or API call
 */
export interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ error: string; item?: unknown }>;
}

/**
 * Options for useErrorHandledMutation
 */
export interface MutationOptions {
  /**
   * Automatically reset error state after a specified time (in ms)
   */
  errorResetTime?: number;
  
  /**
   * Context to include in error logs
   */
  errorContext?: string;
  
  /**
   * Default error message if none is provided
   */
  defaultErrorMessage?: string;
  
  /**
   * Whether to throw errors (false by default - errors are returned in state)
   */
  throwErrors?: boolean;
}

/**
 * Result returned by useErrorHandledMutation
 */
export interface MutationResult<T = unknown, A extends unknown[] = unknown[]> {
  /**
   * The function to call to perform the mutation
   */
  mutate: (...args: A) => Promise<ServerResponse<T>>;
  
  /**
   * Whether the mutation is currently in progress
   */
  isLoading: boolean;
  
  /**
   * The error message, if any
   */
  error: string | null;
  
  /**
   * The result data from a successful mutation
   */
  data: T | null;
  
  /**
   * Whether the last mutation was successful
   */
  isSuccess: boolean;
  
  /**
   * Reset the state (clear error, data, and set isSuccess to false)
   */
  reset: () => void;
}

/**
 * A hook for handling server mutations with proper error handling
 * 
 * @param mutationFn The async function to execute
 * @param options Configuration options
 * @returns MutationResult object with state and execute function
 */
export function useErrorHandledMutation<T = unknown, A extends unknown[] = unknown[]>(
  mutationFn: (...args: A) => Promise<ServerResponse<T>>,
  options: MutationOptions = {}
): MutationResult<T, A> {
  const {
    errorResetTime,
    errorContext = 'mutation',
    defaultErrorMessage = 'Operation failed',
    throwErrors = false
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state to initial values
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
    setIsSuccess(false);
  }, []);

  // Extract error message from response using your existing error handling pattern
  const getErrorMessage = (response: ServerResponse<T>): string => {
    // First try to get from message property
    if (response.message) {
      return response.message;
    }
    
    // Then try to get from errors array
    if (response.errors && response.errors.length > 0) {
      return response.errors.map(e => e.error).join(', ');
    }
    
    // Fall back to error property
    return response.error || defaultErrorMessage;
  };

  // Execute the mutation with error handling
  const mutate = useCallback(async (...args: A): Promise<ServerResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mutationFn(...args);
      
      if (!response.success) {
        const errorMsg = getErrorMessage(response);
        setError(errorMsg);
        setIsSuccess(false);
        
        if (errorResetTime) {
          setTimeout(() => setError(null), errorResetTime);
        }
        
        if (throwErrors) {
          throw new Error(errorMsg);
        }
        
        return response;
      }
      
      setData(response.data || null);
      setIsSuccess(true);
      return response;
    } catch (e) {
      const errorMsg = handleClientError(e, errorContext);
      setError(errorMsg);
      setIsSuccess(false);
      
      if (errorResetTime) {
        setTimeout(() => setError(null), errorResetTime);
      }
      
      if (throwErrors) {
        throw e;
      }
      
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, errorContext, defaultErrorMessage, errorResetTime, throwErrors]);

  return {
    mutate,
    isLoading,
    error,
    data,
    isSuccess,
    reset
  };
}

/**
 * A convenience wrapper for mutations that don't return data
 */
export function useVoidMutation(
  mutationFn: (...args: unknown[]) => Promise<ServerResponse<void>>,
  options: MutationOptions = {}
): Omit<MutationResult<void>, 'data'> {
  const result = useErrorHandledMutation(mutationFn, options);
  // Omit data from the result since it's always null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, ...rest } = result;
  return rest;
}

// Maintain backward compatibility with useErrorHandledErrorMutation
export const useErrorHandledErrorMutation = useErrorHandledMutation;

// Export as default
export default useErrorHandledMutation;