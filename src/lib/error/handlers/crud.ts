import { z } from "zod";
import {
  ErrorResponse,
  ErrorContext,
  CollectionErrorResponse,
  EntityErrorResponse,
} from "@error-types";
import { handleValidationError } from "@error/handlers/validation";
import { createMonitoredResponse } from "@error/core/responses";

/**
 * Standardized error handler for CRUD operations using the core error system
 */
export function handleCrudError<T>(
  error: unknown,
  context?: string | ErrorContext,
  isCollection: boolean = true,
): ErrorResponse | CollectionErrorResponse<T> | EntityErrorResponse<T> {
  // Convert string context to object if needed
  const errorContext: ErrorContext =
    typeof context === "string"
      ? { component: "CRUD", operation: context }
      : { component: "CRUD", ...(context || {}) };

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const message = handleValidationError(error, errorContext);

    // Return the appropriate response type based on the operation
    return createMonitoredResponse<T>(error, errorContext, {
      responseType: isCollection ? "collection" : "entity",
      defaultMessage: message,
    });
  }

  // Handle all other errors
  return createMonitoredResponse<T>(error, errorContext, {
    responseType: isCollection ? "collection" : "entity",
  });
}

/**
 * Helper function for collection-specific error handling
 */
export function handleCollectionError<T>(
  error: unknown,
  context?: string | ErrorContext,
): CollectionErrorResponse<T> {
  return handleCrudError<T>(error, context, true) as CollectionErrorResponse<T>;
}

/**
 * Helper function for entity-specific error handling
 */
export function handleEntityError<T>(
  error: unknown,
  context?: string | ErrorContext,
): EntityErrorResponse<T> {
  return handleCrudError<T>(error, context, false) as EntityErrorResponse<T>;
}

/**
 * Extract a human-readable error message from an error response
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
    return result.errors.map((e) => e.error).join(", ");
  }

  // Fall back to error property
  return result.error || "Unknown error occurred";
}
