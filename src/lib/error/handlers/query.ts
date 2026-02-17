import { ErrorContext } from "@error-types";
import {
  QueryOperationType,
  QueryOperationTypeSchema,
} from "@zod-schema/error/operations";
import { createErrorContext } from "@error/core/context";
import { captureError } from "@error/core/logging";

/**
 * Handles errors from React Query operations with standardized context
 *
 * @param error - The error that occurred
 * @param operation - The specific query operation that failed
 * @param entityType - Optional entity type involved in the operation
 * @param additionalInfo - Optional query-specific information
 * @returns Formatted error message
 */
export function handleQueryError(
  error: unknown,
  operation: QueryOperationType,
  entityType?: string,
  additionalInfo?: Record<string, unknown>,
): string {
  // Validate operation type
  const validatedOperation = QueryOperationTypeSchema.parse(operation);

  // Create base context using the existing utility
  const baseContext = createErrorContext("ReactQuery", validatedOperation);

  // Build metadata object with query-specific information
  const metadata = {
    ...baseContext.metadata,
    ...(entityType && { entityType }),
    ...(additionalInfo && additionalInfo),
  };

  // Build tags for better categorization in monitoring tools
  const tags = {
    ...baseContext.tags,
    "query.operation": validatedOperation,
    ...(entityType && { "query.entityType": entityType }),
  };

  // Create enhanced context
  const queryContext: ErrorContext = {
    ...baseContext,
    metadata,
    tags,
  };

  // Use the core error logging system
  return captureError(error, queryContext);
}
