import { handleClientError } from "@error/handlers/client";

/**
 * Creates clean data preview for user display
 * Follows transformer pattern for data formatting
 */
export function createDataPreview<T extends Record<string, unknown>>(
  data: T | T[],
  _type?: string,
): string {
  try {
    const dataArray = Array.isArray(data) ? data : [data];

    // Clean preview by removing undefined values (follows transformer cleaning patterns)
    const cleanedData = dataArray.map((item) => {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(item)) {
        if (value !== undefined && value !== null && value !== "") {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    return JSON.stringify(cleanedData, null, 2);
  } catch (error) {
    const errorMessage = handleClientError(error, "createDataPreview");
    return `Error creating preview: ${errorMessage}`;
  }
}

/**
 * Formats validation errors in user-friendly way
 * Consistent with transformer error handling patterns
 */
export function formatValidationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Validation failed. Please check your data format.";
}

/**
 * Creates validation summary for user feedback
 */
export function createValidationSummary(result: {
  validCount?: number;
  totalCount?: number;
  success: boolean;
  error?: string;
}): string {
  if (!result.success) {
    return `Validation failed: ${result.error}`;
  }

  if (result.validCount !== undefined && result.totalCount !== undefined) {
    if (result.validCount < result.totalCount) {
      return `${result.validCount} of ${result.totalCount} items validated successfully. ${result.totalCount - result.validCount} items were invalid and filtered out.`;
    }
    return `All ${result.totalCount} items validated successfully.`;
  }

  return "Validation completed successfully.";
}
