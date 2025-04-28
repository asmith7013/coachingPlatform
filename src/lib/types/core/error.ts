/**
 * Centralized error type definitions for the application
 */

/**
 * Base error response interface for standardized error handling
 */
export interface ErrorResponse {
  success: false;
  message: string;  // Human-readable error message
  error?: string;   // For backward compatibility
  errors?: Array<{  // Detailed errors (especially for bulk operations)
    item?: unknown;
    error: string;
  }>;
}

/**
 * Detailed API error
 */
export interface ApiError {
  /** The item that caused the error */
  item?: unknown;
  /** Error message */
  error: string;
  /** Optional error code */
  code?: string;
  /** Field that caused the error */
  field?: string;
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Error category types
 */
export type ErrorCategory = 'validation' | 'network' | 'permission' | 'business' | 'system' | 'unknown';

/**
 * Error context with additional metadata
 */
export interface ErrorContext {
  /** Component where the error occurred */
  component?: string;
  /** Operation that was being performed */
  operation?: string;
  /** User ID if available */
  userId?: string;
  /** Additional contextual data */
  metadata?: Record<string, unknown>;
  /** Error severity */
  severity?: ErrorSeverity;
  /** Error category */
  category?: ErrorCategory;
  /** Categorization tags */
  tags?: Record<string, string>;
}

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
 * Options for error handling hooks
 */
export interface ErrorHandlingOptions {
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
 * Business error class for domain-specific errors
 */
export class BusinessError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
  }
}

/**
 * Create a standardized error response object
 * 
 * @param message Error message
 * @param item Optional item that caused the error
 * @returns Standardized error response
 */
export function createErrorResponse(message: string, item?: unknown): ErrorResponse {
  return {
    success: false,
    message,
    error: message, // For backward compatibility
    errors: item ? [{ item, error: message }] : [{ error: message }]
  };
}

/**
 * Extract a human-readable error message from an error response
 * 
 * @param result Error response object
 * @returns Consolidated error message
 */
export function getErrorMessage(result: { 
  error?: string;
  message?: string;
  errors?: Array<{ error: string; item?: unknown }>; 
}): string {
  // First try to get from message property
  if (result.message) {
    return result.message;
  }
  
  // Then try to get from errors array
  if (result.errors && result.errors.length > 0) {
    return result.errors.map(e => e.error).join(', ');
  }
  
  // Fall back to error property
  return result.error || "Unknown error occurred";
}