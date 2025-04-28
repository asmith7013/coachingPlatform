/**
 * Error monitoring service with enhanced context and severity tracking
 */

import { 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  createErrorResponse, 
  BusinessError 
} from "@core-types/error";

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
 * Automatically classify errors by type, message, and other properties
 */
export function classifyError(error: unknown): { 
  severity: ErrorSeverity; 
  category: ErrorCategory;
} {
  // Business errors
  if (error instanceof BusinessError) {
    return { severity: 'warning', category: 'business' };
  }

  // Network errors
  if (error instanceof TypeError && 
      (error.message.includes('fetch') || 
       error.message.includes('network') || 
       error.message.includes('connection'))) {
    return { severity: 'warning', category: 'network' };
  }
  
  // Permission errors
  if (error instanceof Error && 
     (error.message.includes('permission') || 
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden') ||
      error.message.includes('not allowed'))) {
    return { severity: 'error', category: 'permission' };
  }
  
  // Validation errors
  if (error instanceof Error && 
     (error.name.includes('Zod') ||
      error.name.includes('Validation') ||
      error.message.includes('validation') ||
      error.message.includes('invalid'))) {
    return { severity: 'warning', category: 'validation' };
  }
  
  // Default classification
  return { severity: 'error', category: 'unknown' };
}

/**
 * Create a context object for error reporting
 */
export function createErrorContext(
  component: string,
  operation: string,
  additionalContext: Partial<ErrorContext> = {}
): ErrorContext {
  // Try to get user ID from session if available
  let userId: string | undefined;
  try {
    // This is a placeholder - replace with your actual auth system
    interface SessionUser {
      user?: { id?: string };
    }
    const session = (window as unknown as { session?: SessionUser })?.session;
    userId = session?.user?.id;
  } catch {
    // Session not available or not on client
  }
  
  return {
    component,
    operation,
    userId,
    ...additionalContext
  };
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
    
  // Auto-classify error if severity or category not provided
  const classification = classifyError(error);
  
  // Use classification if not explicitly provided in context
  const severity = errorContext.severity || classification.severity;
  const category = errorContext.category || classification.category;
  
  // Add timestamp
  const timestamp = new Date().toISOString();
  
  // Prepare error data for logging
  const errorData = {
    errorId,
    errorName,
    errorMessage,
    errorStack,
    timestamp,
    severity,
    category,
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
  // Uncomment if you have Sentry configured:
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.captureException(error, { 
  //   extra: errorContext.metadata,
  //   tags: { 
  //     ...errorContext.tags,
  //     severity,
  //     category
  //   }
  // });
  
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
  
  // Auto-classify error and add to context
  const { severity, category } = classifyError(error);
  
  // Set severity and category if not already set
  if (!errorContext.severity) {
    errorContext.severity = severity;
  }
  
  if (!errorContext.category) {
    errorContext.category = category;
  }
  
  // Capture and return the error ID
  return captureError(error, errorContext);
}

/**
 * Report a business logic error
 */
export function reportBusinessError(
  errorCode: string,
  message: string,
  context: ErrorContext = {}
): string {
  const error = new BusinessError(message, errorCode);
  return captureError(error, {
    ...context,
    category: 'business',
    severity: context.severity || 'warning',
    tags: { 
      ...context.tags, 
      errorType: 'business', 
      errorCode 
    }
  });
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

/**
 * Creates an error response with monitoring
 */
export function createMonitoredErrorResponse(
  message: string, 
  error: unknown, 
  context: ErrorContext = {}
): ReturnType<typeof createErrorResponse> {
  // Capture the error with context
  captureError(error, context);
  
  // Create and return the standardized error response
  return createErrorResponse(message);
}