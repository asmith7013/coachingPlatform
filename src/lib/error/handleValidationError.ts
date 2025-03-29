import { ZodError } from "zod";
import * as Sentry from "@sentry/nextjs";

/**
 * Handles Zod validation errors with proper logging and formatting
 * - Logs validation errors to Sentry
 * - Returns a structured error message
 * - Includes field paths for debugging
 */
export function handleValidationError(error: ZodError): string {
  // Log validation errors to Sentry
  Sentry.captureException(error);

  // Format error messages with field paths
  const errorMessages = error.errors.map(err => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });

  // Log detailed validation errors
  console.error("❌ Validation Error:", {
    errors: error.errors,
    messages: errorMessages
  });

  // Return formatted error message
  return `[422] Validation failed: ${errorMessages.join(", ")}`;
} 