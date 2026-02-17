import { ErrorContext } from "@error-types";
import { createErrorContext } from "@error/core/context";

/**
 * Create error context for schedule components feature operations
 * Following established patterns from schedulesUpdated
 */
export function createScheduleComponentsErrorContext(
  operation: string,
  metadata?: Record<string, unknown>,
): ErrorContext {
  return createErrorContext("ScheduleComponents", operation, {
    category: "business",
    metadata: {
      feature: "schedulesComponents",
      ...metadata,
    },
  });
}

/**
 * Create error context for schedule component data operations
 * Specialized for data-related errors with common context
 */
export function createScheduleComponentsDataErrorContext(
  operation: string,
  schoolId: string,
  date: string,
  additionalMetadata?: Record<string, unknown>,
): ErrorContext {
  return createScheduleComponentsErrorContext(operation, {
    schoolId,
    date,
    ...additionalMetadata,
  });
}

// Following YAGNI principles - only 2 essential error context creators
// Consistent with schedulesUpdated approach
