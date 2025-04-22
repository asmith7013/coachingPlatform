/**
 * Error monitoring service with enhanced context and severity tracking
 */

// Error severity levels
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error context with additional metadata
export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  severity?: ErrorSeverity;
  tags?: Record<string, string>;
}

/**
 * Enriched error class with context information
 */
export class AppError extends Error {
  public context: ErrorContext;
  
  constructor(message: string, context: ErrorContext = {}) {
    super(message);
    this.name = 'AppError';
    this.context = context;
  }
}

/**
 * Log and capture an error with detailed context
 */
export function captureError(
  error: unknown,
  context: ErrorContext = {}
): string {
  // Create a unique error ID for reference
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Get error context
  const errorContext = error instanceof AppError 
    ? { ...error.context, ...context }
    : context;
    
  // Determine severity level (default to 'error')
  const severity = errorContext.severity || 'error';
  
  // Add timestamp
  const timestamp = new Date().toISOString();
  
  // Prepare error data for logging
  const errorData = {
    errorId,
    errorName,
    errorMessage,
    errorStack,
    timestamp,
    ...errorContext,
  };
  
  // Console logging based on severity
  switch (severity) {
    case 'fatal':
      console.error('🔥 FATAL ERROR:', errorData);
      break;
    case 'error':
      console.error('❌ ERROR:', errorData);
      break;
    case 'warning':
      console.warn('⚠️ WARNING:', errorData);
      break;
    case 'info':
      console.info('ℹ️ INFO:', errorData);
      break;
    case 'debug':
      console.debug('🔍 DEBUG:', errorData);
      break;
  }
  
  // Here you would typically integrate with external monitoring services 
  // like Sentry, LogRocket, or Application Insights
  
  return errorId;
}

/**
 * Enhanced client error handler with better context
 */
export function handleEnhancedClientError(
  error: unknown,
  context: string | ErrorContext = {}
): string {
  // Convert string context to object
  const errorContext: ErrorContext = typeof context === 'string' 
    ? { component: context } 
    : context;
    
  // Add operation if not present
  if (!errorContext.operation) {
    const stack = new Error().stack || '';
    const callerMatch = stack.match(/at\s+(\w+)\s+\(/);
    if (callerMatch && callerMatch[1]) {
      errorContext.operation = callerMatch[1];
    }
  }
  
  // Set reasonable default severity
  if (!errorContext.severity) {
    // Network errors are often not the application's fault
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorContext.severity = 'warning';
    } else {
      errorContext.severity = 'error';
    }
  }
  
  // Capture and return the error ID
  return captureError(error, errorContext);
}

/**
 * Create a monitored function that automatically captures errors
 */
export function withErrorMonitoring<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: ErrorContext = {}
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args) as ReturnType<T>;
    } catch (error) {
      captureError(error, {
        ...context,
        metadata: {
          ...context.metadata,
          arguments: args,
        },
      });
      throw error;
    }
  };
}

/**
 * Create a monitored async function that automatically captures errors
 */
export function withAsyncErrorMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: ErrorContext = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args) as Awaited<ReturnType<T>>;
    } catch (error) {
      captureError(error, {
        ...context,
        metadata: {
          ...context.metadata,
          arguments: args,
        },
      });
      throw error;
    }
  };
} 