import { classifyError } from "@error/core/classification";

/**
 * Format error message with optional prefix
 */
export function formatErrorMessage(error: unknown, prefix?: string): string {
  const classification = classifyError(error);
  let message = classification.message;

  // Add status code prefix if available and not already present
  if (
    classification.statusCode &&
    !message.includes(`[${classification.statusCode}]`)
  ) {
    message = `[${classification.statusCode}] ${message}`;
  }

  // Add context prefix if provided
  if (prefix) {
    message = `[${prefix}] ${message}`;
  }

  return message;
}

/**
 * Extract error details from various error types
 */
export function extractErrorDetails(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message:
      typeof error === "string"
        ? error
        : error && typeof error === "object"
          ? JSON.stringify(error)
          : String(error),
  };
}
