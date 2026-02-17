import { ErrorContext } from "@error-types";

/**
 * Create a context object for error reporting
 */
export function createErrorContext(
  component: string,
  operation: string,
  additionalContext: Partial<ErrorContext> = {},
): ErrorContext {
  // Try to get user ID from session if available
  let userId: string | undefined;
  try {
    // This is a placeholder - replace with your actual auth system
    interface SessionUser {
      user?: { id?: string };
    }
    const session = (window as unknown as { session?: SessionUser })?.session;
    userId = session?.user?.id;
  } catch {
    // Session not available or not on client
  }

  return {
    component,
    operation,
    userId,
    ...additionalContext,
  };
}

/**
 * Enriches an existing error context with additional information
 */
export function enrichErrorContext(
  baseContext: ErrorContext,
  additionalContext: Partial<ErrorContext>,
): ErrorContext {
  return {
    ...baseContext,
    ...additionalContext,
    metadata: {
      ...(baseContext.metadata || {}),
      ...(additionalContext.metadata || {}),
    },
    tags: {
      ...(baseContext.tags || {}),
      ...(additionalContext.tags || {}),
    },
  };
}
