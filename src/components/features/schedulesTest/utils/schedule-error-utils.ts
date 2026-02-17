import { ErrorContext } from "@error-types";
import { createErrorContext } from "@error/core/context";

/**
 * Create error context for schedule feature operations
 * Simplified approach following established patterns
 */
export function createScheduleErrorContext(
  operation: string,
  metadata?: Record<string, unknown>,
): ErrorContext {
  return createErrorContext("Schedule", operation, {
    category: "business",
    metadata: {
      feature: "schedulesUpdated",
      ...metadata,
    },
  });
}

/**
 * Create error context for schedule data operations
 * Specialized for data-related errors with common context
 */
export function createScheduleDataErrorContext(
  operation: string,
  schoolId: string,
  date: string,
  additionalMetadata?: Record<string, unknown>,
): ErrorContext {
  return createScheduleErrorContext(operation, {
    schoolId,
    date,
    ...additionalMetadata,
  });
}

// Simplified from 5 error context creators to 2 essential ones
// Following YAGNI principles and established error handling patterns
