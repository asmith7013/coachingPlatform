import { z, ZodError } from "zod";
import { logError } from "@error/core/logging";
import { ErrorContext } from "@error-types";

/**
 * Handles Zod validation errors with proper logging and formatting
 * - Logs validation errors to Sentry
 * - Returns a structured error message
 * - Includes field paths for debugging
 */
export function handleValidationError(
  error: ZodError,
  context: ErrorContext | string = {}
): string {
  // Format error messages with field paths
  const errorMessages = error.issues.map((err: z.core.$ZodIssue) => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });

  const formattedMessage = `[422] Validation failed: ${errorMessages.join(", ")}`;
  
  // Create context if string provided
  const errorContext: ErrorContext = typeof context === 'string'
    ? { component: "Validation", operation: context }
    : { component: "Validation", ...context };
  
  // Add validation-specific context
  const enhancedContext: ErrorContext = {
    ...errorContext,
    category: "validation", 
    severity: "warning",
    metadata: {
      ...errorContext.metadata,
      validationErrors: error.issues
    }
  };
  
  // Log validation error through unified system
  logError(error, enhancedContext);

  return formattedMessage;
}