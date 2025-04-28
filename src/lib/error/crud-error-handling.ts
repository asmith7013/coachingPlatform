import { z } from "zod";
import { handleServerError } from "@/lib/error/handle-server-error";
import { handleValidationError } from "@/lib/error/handle-validation-error";
import { 
  ErrorResponse, 
  ErrorContext,
  createErrorResponse, 
  getErrorMessage as getErrorMessageFn 
} from "@core-types/error";
import { captureError } from "./error-monitor";

/**
 * Standardized error handler for CRUD operations
 * - Handles Zod validation errors
 * - Handles server errors
 * - Returns a consistent error response format
 * - Logs errors to monitoring system
 * 
 * @param error The error to handle
 * @param context Optional context information (string or object)
 * @returns Standardized error response
 */
export function handleCrudError(
  error: unknown, 
  context?: string | ErrorContext
): ErrorResponse {
  // Convert string context to object if needed
  const errorContext: ErrorContext = typeof context === 'string' 
    ? { component: "CRUD", operation: context }
    : { component: "CRUD", ...(context || {}) };
  
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const message = handleValidationError(error);
    
    // Log validation error with context
    captureError(error, {
      ...errorContext,
      severity: "warning",
      category: "validation",
      tags: { errorType: "validation" }
    });
    
    return createErrorResponse(message);
  }
  
  // Handle all other errors
  const message = handleServerError(error);
  const contextPrefix = typeof context === 'string' && context ? `[${context}] ` : '';
  const errorMessage = `${contextPrefix}${message}`;
  
  // Extract status code if available
  const statusMatch = message.match(/\[(\d+)\]/);
  const statusCode = statusMatch ? statusMatch[1] : "500";
  
  // Determine severity based on status code
  const isClientError = statusCode.startsWith("4");
  
  // Log other errors with context
  captureError(error, {
    ...errorContext,
    severity: isClientError ? "warning" : "error",
    category: isClientError ? "validation" : "system",
    tags: { 
      errorType: "server",
      statusCode
    }
  });
  
  return createErrorResponse(errorMessage);
}

/**
 * Export getErrorMessage using the imported function
 */
export const getErrorMessage = getErrorMessageFn;