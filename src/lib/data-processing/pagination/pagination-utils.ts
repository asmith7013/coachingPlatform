import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { z } from "zod";

/**
 * Utility to sanitize sort fields
 */
export function sanitizeSortBy(
  sortBy: string | string[] | undefined,
  allowedSortFields: string[],
  defaultSortField: string
): string {
  // Handle array of sort fields (take the first valid one)
  if (Array.isArray(sortBy)) {
    for (const field of sortBy) {
      const cleanField = field.startsWith('-') ? field.substring(1) : field;
      if (allowedSortFields.includes(cleanField)) {
        return field;
      }
    }
    return defaultSortField;
  }
  
  // Handle single sort field
  if (typeof sortBy === 'string') {
    const cleanField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
    return allowedSortFields.includes(cleanField) ? sortBy : defaultSortField;
  }
  
  // Default case
  return defaultSortField;
} 


/**
 * Creates query parameters with defaults and safety features
 */
export function buildQueryParams(
  params: Partial<z.infer<typeof QueryParamsZodSchema>> = {}
): z.infer<typeof QueryParamsZodSchema> {
  // Parse with schema to apply defaults and transformations
  const parsed = QueryParamsZodSchema.parse(params);
  
  // Add safety feature for sortBy
  const invalidSortByValues = ['asc', 'desc', 'ascending', 'descending'];
  if (invalidSortByValues.includes(String(parsed.sortBy).toLowerCase())) {
    parsed.sortBy = 'createdAt';
  }
  
  return parsed;
}