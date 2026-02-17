// src/lib/data-server/query-utils.ts

import { QueryParams } from "@core-types/query";
// import { validateStrict } from '@/lib/data-processing/validation/zod-validation';
// import { z } from 'zod';

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
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
    filter: filters || {},
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
  defaultSearchField?: string,
): Record<string, unknown> {
  const { search, searchFields, filters } = params;

  // Start with existing filters
  const updatedFilters = { ...filters };

  // Add text search if provided
  if (search && search.trim()) {
    if (searchFields && searchFields.length > 0) {
      // Search in specified fields
      updatedFilters.$or = searchFields.map((field: string) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    } else if (defaultSearchField) {
      // Search in default field
      updatedFilters[defaultSearchField] = { $regex: search, $options: "i" };
    }
  }

  return updatedFilters;
}
