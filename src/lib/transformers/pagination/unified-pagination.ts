import { Model, Document } from "mongoose";
import { ZodSchema } from "zod";
import { connectToDB } from "@server/db/connection";
import { BaseDocument } from "@core-types/document";
import { QueryParams, PaginationMeta } from "@core-types/query";
import { PaginatedResponse } from "@core-types/response";
import { handleServerError } from "@error/handlers/server";

// Import the unified transformer
import { transformData, TransformOptions } from "@transformers/core/unified-transformer";

/**
 * Sanitizes the sort field to ensure it's a valid field
 */
function sanitizeSortField(
  sortBy: string | undefined,
  validSortFields: string[],
  defaultSortField: string
): string {
  if (!sortBy || !validSortFields.includes(sortBy)) {
    return defaultSortField;
  }
  return sortBy;
}

/**
 * Core pagination function that leverages the unified transformer system
 * Now supports domain type transformations
 */
export async function executePaginatedQuery<
  T extends BaseDocument,
  R extends Record<string, unknown> = T
>(
  model: Model<Document>,
  schema: ZodSchema<T>,
  params: QueryParams,
  config: {
    validSortFields?: string[];
    transformOptions?: Partial<TransformOptions<T, R>>;
  } = {}
): Promise<PaginatedResponse<R>> {
  try {
    // Extract configuration options with defaults
    const {
      validSortFields = ['createdAt', 'updatedAt'],
      transformOptions = {}
    } = config;
    
    // Extract query parameters
    const { 
      page, 
      limit, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      filters = {},
      // other params as needed
    } = params;
    
    // Connect to database
    await connectToDB();
    
    // Sanitize sort field
    const sortField = sanitizeSortField(sortBy, validSortFields, 'createdAt');
    const sortValue = sortOrder === 'asc' ? 1 : -1;
    
    // Build the query
    const query = model.find(filters)
      .sort({ [sortField]: sortValue })
      .skip(calculateSkip({ page, limit }))
      .limit(limit)
      .lean();
    
    // Execute query and count total
    const [rawItems, totalItems] = await Promise.all([
      query.exec(),
      model.countDocuments(filters)
    ]);
    
    // Ensure items is an array
    const itemsArray = Array.isArray(rawItems) ? rawItems : [];
    
    // Use the unified transformer with schema and domain transformation
    const validatedItems = transformData<T, R>(itemsArray, {
      schema,
      handleDates: true,
      errorContext: `Pagination:${model.modelName}`,
      ...transformOptions
    });
    
    // Calculate metadata
    const totalPages = calculatePaginationMeta(totalItems, { page, limit }).totalPages;
    
    // Return the complete paginated response
    return {
      success: true,
      items: validatedItems,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      empty: validatedItems.length === 0
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
      error: handleServerError(error)
    } as PaginatedResponse<R>;
  }
}

// src/lib/transformers/pagination/unified-pagination.ts (or wherever this function is defined)

// Update the function signature to accept a more generic model type
export async function fetchPaginatedResource<
  T extends BaseDocument,
  R extends Record<string, unknown> = T,
  DocType = unknown
>(
  model: Model<DocType>,  // Change this parameter type
  schema: ZodSchema<T>,
  params: QueryParams,
  config: {
    validSortFields?: string[];
    transformOptions?: Partial<TransformOptions<T, R>>;
  } = {}
): Promise<PaginatedResponse<R>> {  
  // The implementation remains the same
  return executePaginatedQuery<T, R>(
    model as unknown as Model<Document>,  // Cast here internally instead
    schema,
    params,
    config
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
  params: { page: number; limit: number }
): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    isEmpty: total === 0
  };
}