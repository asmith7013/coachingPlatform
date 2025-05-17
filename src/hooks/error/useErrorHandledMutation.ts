import { useState, useCallback } from 'react';
import { handleClientError, logError, createErrorContext } from '@/lib/error';
import { ErrorContext } from '@core-types/error';
import { BaseResponse } from '@core-types/response';

// import { ErrorResponse } from '@core-types/error';

/**
 * Response from a server action or API call
 */
export interface ServerResponse<T = unknown> extends BaseResponse {
  data?: T;
}

/**
 * Options for useErrorHandledMutation
 * @deprecated Use ErrorHandlingOptions from @core-types/error instead
 */
export interface MutationOptions {
  /**
   * Automatically reset error state after a specified time (in ms)
   */
  errorResetTime?: number;
  
  /**
   * Context to include in error logs
   * @deprecated Use ErrorContext type for more structured context
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
 * Enhanced options for error-handled mutations
 */
export interface ErrorHandlingOptions extends MutationOptions {
  /**
   * Structured error context object
   */
  context?: ErrorContext;
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
 * Extract error message from response
 */
function extractErrorMessage(
  response: BaseResponse & { data?: unknown },
  defaultMessage: string
): string {
  // First try to get from message property
  if (response.message) {
    return response.message;
  }
  
  // Then try to get from errors array
  if (response.errors && response.errors.length > 0) {
    return response.errors.map(e => e.error).join(', ');
  }
  
  // Fall back to error property
  return response.error || defaultMessage;
}

/**
 * A hook for handling server mutations with proper error handling
 * 
 * @param mutationFn The async function to execute
 * @param options Configuration options
 * @returns MutationResult object with state and execute function
 */
export function useErrorHandledMutation<T = unknown, A extends unknown[] = unknown[]>(
  mutationFn: (...args: A) => Promise<BaseResponse & { data?: T }>,
  options: ErrorHandlingOptions = {}
): MutationResult<T, A> {
  const {
    errorResetTime,
    errorContext,
    context,
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

  const mutate = useCallback(async (...args: A): Promise<ServerResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mutationFn(...args);
      
      if (!response.success) {
        const errorMsg = extractErrorMessage(response, defaultErrorMessage);
        
        // Create error context - prefer structured context if available
        const errorCtx: ErrorContext = context || (
          typeof errorContext === 'string' 
            ? createErrorContext('Mutation', errorContext)
            : createErrorContext('Mutation', 'execute')
        );
        
        // Log error through unified error system
        logError(new Error(errorMsg), {
          ...errorCtx,
          metadata: {
            ...errorCtx.metadata,
            responseData: response,
            args: args.map(arg => 
              typeof arg === 'object' ? '[Object]' : String(arg)
            ),
          }
        });
        
        setError(errorMsg);
        setIsSuccess(false);
        
        if (errorResetTime) {
          setTimeout(() => setError(null), errorResetTime);
        }
        
        if (throwErrors) {
          throw new Error(errorMsg);
        }
        
        return response as ServerResponse<T>;
      }
      
      setData(response.data || null);
      setIsSuccess(true);
      return response as ServerResponse<T>;
    } catch (e) {
      // Create error context - prefer structured context if available
      const errorCtx: ErrorContext = context || (
        typeof errorContext === 'string' 
          ? { component: 'Mutation', operation: errorContext }
          : { component: 'Mutation', operation: 'execute' }
      );
      
      // Use handleClientError which now integrates with the core error system
      const errorMsg = handleClientError(e, errorCtx.component || 'Mutation');
      
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
      } as ServerResponse<T>;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, errorContext, context, errorResetTime, throwErrors, defaultErrorMessage]);

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
  options: ErrorHandlingOptions = {}
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