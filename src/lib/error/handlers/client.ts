import { logError } from "@error/core/logging";
import { formatErrorMessage } from "@error/core/transformation";
import { ErrorContext } from "@core-types/error";

/**
 * Simplified client error handler that leverages the core error system
 */
export function handleClientError(
  err: unknown, 
  context: string | ErrorContext = "Unknown"
): string {
  // Log error through unified system
  logError(err, context);
  
  // Return formatted message
  return formatErrorMessage(err, typeof context === 'string' ? context : undefined);
}

/**
 * Enhanced client error handler with better context
 * Now uses the core system
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
  
  // Use the core system to log and get message
  return logError(error, errorContext);
}