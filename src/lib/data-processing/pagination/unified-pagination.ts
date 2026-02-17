import { Model, Document } from "mongoose";
import { ZodSchema } from "zod";
import { connectToDB } from "@server/db/connection";
import { BaseDocument } from "@core-types/document";
import { QueryParams, PaginationMeta } from "@core-types/query";
import { PaginatedResponse } from "@core-types/response";
import { handleServerError } from "@error/handlers/server";
import { validateWithSchema } from "@query/client/utilities/selector-helpers";

/**
 * Cleans up empty, null, or undefined filter values that would cause unwanted filtering
 * This prevents issues where empty string searches filter out all results
 */
function cleanFilters(
  filters: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    // Skip empty strings, null, undefined, and empty arrays
    if (
      value !== "" &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Sanitizes the sort field to ensure it's a valid field
 */
function sanitizeSortField(
  sortBy: string | undefined,
  validSortFields: string[],
  defaultSortField: string,
): string {
  if (!sortBy || !validSortFields.includes(sortBy)) {
    return defaultSortField;
  }
  return sortBy;
}

/**
 * Core pagination function with simple data operations
 */
export async function executePaginatedQuery<T extends BaseDocument>(
  model: Model<Document>,
  schema: ZodSchema<T>,
  params: QueryParams,
  config: {
    validSortFields?: string[];
    validateSchema?: boolean;
  } = {},
): Promise<PaginatedResponse<T>> {
  try {
    // Extract configuration options with defaults
    const {
      validSortFields = ["createdAt", "updatedAt"],
      validateSchema = false,
    } = config;

    // Extract query parameters
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params;

    // Connect to database
    await connectToDB();

    // Clean filters - this is the key fix!
    const cleanedFilters = cleanFilters(filters);

    // Sanitize sort field
    const sortField = sanitizeSortField(sortBy, validSortFields, "createdAt");
    const sortValue = sortOrder === "asc" ? 1 : -1;

    // Build the query using CLEANED filters
    const query = model
      .find(cleanedFilters)
      .sort({ [sortField]: sortValue })
      .skip(calculateSkip({ page, limit }))
      .limit(limit);

    // Execute query and count total using CLEANED filters
    const [documents, totalItems] = await Promise.all([
      query.exec(),
      model.countDocuments(cleanedFilters),
    ]);

    // Apply toJSON() to each document to trigger transforms
    const transformedItems = documents.map((doc) => doc.toJSON());

    // Ensure items is an array
    const itemsArray = Array.isArray(transformedItems) ? transformedItems : [];

    // Simple data processing:
    let processedItems = itemsArray as T[];

    // 2. Optional schema validation
    if (validateSchema) {
      processedItems = validateWithSchema(processedItems, schema);
    }

    // Calculate metadata
    const totalPages = calculatePaginationMeta(totalItems, {
      page,
      limit,
    }).totalPages;

    // Return the complete paginated response
    return {
      success: true,
      items: processedItems,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      empty: processedItems.length === 0,
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
      page: params.page,
      limit: params.limit,
      totalPages: 0,
      hasMore: false,
      empty: true,
      error: handleServerError(error),
    } as PaginatedResponse<T>;
  }
}

/**
 * Wrapper function for backward compatibility
 */
export async function fetchPaginatedResource<T extends BaseDocument>(
  model: Model<unknown>,
  schema: ZodSchema<T>,
  params: QueryParams,
  config: {
    validSortFields?: string[];
    validateSchema?: boolean;
  } = {},
): Promise<PaginatedResponse<T>> {
  return executePaginatedQuery<T>(
    model as unknown as Model<Document>,
    schema,
    params,
    config,
  );
}

/**
 * Calculate skip value for pagination
 */
export function calculateSkip(params: { page: number; limit: number }): number {
  return Math.max(0, (params.page - 1) * params.limit);
}

/**
 * Calculate total pages and other pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  params: { page: number; limit: number },
): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    isEmpty: total === 0,
  };
}
