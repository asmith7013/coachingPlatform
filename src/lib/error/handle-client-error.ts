import { handleEnhancedClientError } from './error-monitor';

/**
 * Simplified client error handler that leverages enhanced monitoring
 * 
 * This function maintains compatibility with existing code while
 * adding enhanced error monitoring capabilities.
 */
export function handleClientError(err: unknown, context: string = "Unknown"): string {
  // Legacy behavior for development
  if (process.env.NODE_ENV === "development") {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err, null, 2);
    
    console.error(`❌ [${context}]`, message);
  }
  
  // Use enhanced error handling with monitoring
  return handleEnhancedClientError(err, context);
}