import { logError } from "@error/core/logging";
import { formatErrorMessage } from "@error/core/transformation";
import { ErrorContext } from "@error-types";

/**
 * Centralized error handler for Server Actions leveraging the core error system
 */
export function handleServerError(
  error: unknown,
  context: string | ErrorContext = "serverAction",
): string {
  // Create context if string provided
  const errorContext: ErrorContext =
    typeof context === "string"
      ? { component: "Server", operation: context }
      : { component: "Server", ...context };

  // Log error through unified system
  logError(error, errorContext);

  // Return formatted message
  return formatErrorMessage(error);
}
