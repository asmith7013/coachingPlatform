// src/lib/data-server/query-utils.ts

import { QueryParams } from "@core-types/query";
import { validateStrict } from '@transformers/core/validation';


/**
 * Creates MongoDB query options from transformed query parameters
 * 
 * @param params Transformed query parameters
 * @returns MongoDB-compatible query options
 */
export function createMongoDBQueryOptions(params: QueryParams): {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  filter: Record<string, unknown>;
} {
  const { page, limit, sortBy, sortOrder, filters } = params;
  
  return {
    skip: (page - 1) * limit,
    limit,
    sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
    filter: filters || {}
  };
}

/**
 * Applies search term to filters using the specified field
 * 
 * @param params Transformed query parameters
 * @param defaultSearchField Field to search if not specified
 * @returns MongoDB-compatible query filter
 */
export function createMongoDBFilter(
  params: Required<QueryParams>,
  defaultSearchField?: string
): Record<string, unknown> {
  const { search, searchFields, filters } = params;
  
  // Start with existing filters
  const updatedFilters = { ...filters };
  
  // Add text search if provided
  if (search && search.trim()) {
    if (searchFields && searchFields.length > 0) {
      // Search in specified fields
      updatedFilters.$or = searchFields.map((field: string) => ({
        [field]: { $regex: search, $options: 'i' }
      }));
    } else if (defaultSearchField) {
      // Search in default field
      updatedFilters[defaultSearchField] = { $regex: search, $options: 'i' };
    }
  }
  
  return updatedFilters;
}


// src/lib/api/validation/parse-query.ts

import { z } from 'zod';

/**
 * Validates and transforms URL query parameters using a Zod schema
 * 
 * This utility handles the conversion from the standard Next.js searchParams object
 * to a properly typed and validated object that can be used in API routes and server actions.
 * 
 * @param searchParams - The URL search parameters (from Next.js)
 * @param schema - A Zod schema to validate and transform the parameters
 * @returns The validated and transformed parameters
 */
export const parseQueryParams = <T>(
  searchParams: { [key: string]: string | string[] },
  schema: z.ZodType<T>
): T => {
  // Convert string[] values to string by taking first value
  const normalizedParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => 
      [key, Array.isArray(value) ? value[0] : value]
    )
  );
  
  // Parse with Zod schema
  // return schema.parse(normalizedParams);
  return validateStrict(schema, normalizedParams);
};