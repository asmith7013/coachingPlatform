import { AppError, ErrorContext } from "@error-types";
import * as Sentry from "@sentry/nextjs";
import { classifyError } from "@error/core/classification";

/**
 * Unified error logging and monitoring function
 */
export function logError(
  error: unknown,
  context: ErrorContext | string = {}
): string {
  // Create a unique error ID for reference
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Convert string context to object if needed
  let errorContext: ErrorContext = typeof context === 'string' 
    ? { component: context } 
    : context;
  
  // If error is already an AppError with context, merge contexts
  if (error instanceof AppError && error.context) {
    errorContext = {
      ...error.context,
      ...errorContext
    };
  }
  
  // Classify error if severity or category not provided
  const classification = classifyError(error);
  
  // Use classification if not explicitly provided in context
  const severity = errorContext.severity || classification.severity;
  const category = errorContext.category || classification.category;
  const errorMessage = classification.message;
  
  // Extract error details
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
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
    statusCode: classification.statusCode,
    ...errorContext,
  };
  
  // Console logging based on severity and environment
  if (process.env.NODE_ENV === "development") {
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
  }
  
  // Send to Sentry
  Sentry.captureException(error, { 
    extra: errorContext.metadata,
    tags: { 
      ...errorContext.tags,
      severity,
      category,
      statusCode: classification.statusCode
    }
  });
  
  return errorMessage;
}

/**
 * Simple alias for logError to maintain backward compatibility
 */
export function captureError(
  error: unknown,
  context: ErrorContext | string = {}
): string {
  return logError(error, context);
}