/**
 * @deprecated This file is deprecated. Use selector-based pagination from @/lib/query/utilities/pagination.ts instead.
 * 
 * Migration Guide:
 * 1. Replace executePaginatedQuery with executePaginatedQueryWithSelector
 * 2. Replace buildPaginatedQuery with the query building logic in executePaginatedQueryWithSelector
 * 3. Use the selector system for consistent data transformation
 */

import type { HydratedDocument, Model, FilterQuery } from "mongoose";
import { handleServerError } from "@error/handlers/server";
import { connectToDB } from "@data-server/db/connection";
import type { ZodSchema } from "zod";
import { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { DEFAULT_QUERY_PARAMS, QueryParams } from "@core-types/query";
import { PaginatedResponse } from "@core-types/pagination";
import { transformDocument } from "@data-utilities/transformers/core/db-transformers";

/**
 * @deprecated Use selector-based pagination from @/lib/query/utilities/pagination.ts instead.
 * Builds a paginated query for MongoDB
 */
export function buildPaginatedQuery<T extends BaseDocument>(
  model: Model<HydratedDocument<T>>,
  filters: FilterQuery<T>,
  { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }: QueryParams = DEFAULT_QUERY_PARAMS
) {
  const query = model.find(filters);
  
  // Apply sorting
  query.sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });
  
  // Apply pagination
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  
  return query;
}

/**
 * @deprecated Use selector-based pagination from @/lib/query/utilities/pagination.ts instead.
 * Executes a paginated query and returns results with metadata
 */
export async function executePaginatedQuery<T extends BaseDocument, S extends ZodSchema>(
  model: Model<HydratedDocument<T>>,
  filters: FilterQuery<T>,
  schema: S,
  options: QueryParams = DEFAULT_QUERY_PARAMS
): Promise<PaginatedResponse<z.infer<S>>> {
  try {
    if (!model) {
      throw new Error('Model is required');
    }
    
    if (!schema) {
      throw new Error('Schema is required');
    }
    
    const { page = 1, limit = 20, sortBy = 'createdAt' } = options;
    
    // Validate sortBy to prevent errors (use fallback if invalid)
    const validSortBy = sortBy || 'createdAt';
    const safeOptions = {
      ...options,
      page,
      limit,
      sortBy: validSortBy,
    };
    
    // Ensure database connection
    await connectToDB();
    
    // Build and execute query
    const query = buildPaginatedQuery(model, filters, safeOptions);
    
    // Add additional safety by applying lean() to avoid potential issues with document methods
    query.lean();
    
    const [items, totalItems] = await Promise.all([
      query.exec(),
      model.countDocuments(filters)
    ]);
    
    // Validate items before sanitizing
    if (!items) {
      throw new Error('Query returned null or undefined instead of items array');
    }
    
    // Ensure items is an array
    const itemsArray = Array.isArray(items) ? items : [];
    
    // Sanitize items for client
    const sanitizedItems = transformDocument(itemsArray as unknown as Record<string, unknown>[]);
    
    // Calculate metadata
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      success: true,
      items: sanitizedItems as z.infer<S>[],
      total: totalItems,
      empty: itemsArray.length === 0,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    };
  } catch (error) {
    // Add context to the error
    if (error instanceof Error) {
      throw new Error(`Error executing paginated query: ${error.message}`);
    }
    throw new Error(handleServerError(error));
  }
} 