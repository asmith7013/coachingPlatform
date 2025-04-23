/**
 * Sanitizes a sortBy input value to ensure it's a valid field name for sorting
 * @param input The user-provided sortBy value
 * @param validFields Array of valid field names for the resource
 * @param fallback Default field to use if input is invalid
 * @returns A safe sortBy field name
 */
export function sanitizeSortBy(
  input: string | undefined,
  validFields: string[],
  fallback: string
): string {
  const invalidValues = ['asc', 'desc', 'ascending', 'descending'];
  if (!input || invalidValues.includes(input.toLowerCase()) || !validFields.includes(input)) {
    return fallback;
  }
  return input;
} 