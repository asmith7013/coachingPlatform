import type { HydratedDocument, Model } from "mongoose";
import { handleServerError } from "@error/handle-server-error";
import { connectToDB } from "@data-server/db/connection";
import { sanitizeDocuments } from "@data-utilities/transformers/sanitize";
import type { ZodSchema } from "zod";
import { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { PaginationOptions } from "@core-types/pagination";
import { LegacyPaginatedResult } from "@core-types/response";

// Use TimestampedDoc from the centralized location
// Other pagination-specific interfaces stay here
/**
 * Builds a paginated query for MongoDB
 */
export function buildPaginatedQuery<T extends BaseDocument>(
  model: Model<HydratedDocument<T>>,
  filters: Record<string, unknown>,
  { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }: PaginationOptions = {}
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
 * Executes a paginated query and returns results with metadata
 */
export async function executePaginatedQuery<T extends BaseDocument, S extends ZodSchema>(
  model: Model<HydratedDocument<T>>,
  filters: Record<string, unknown>,
  schema: S,
  options: PaginationOptions = {}
): Promise<LegacyPaginatedResult<z.infer<S>>> {
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
    
    const [items, total] = await Promise.all([
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
    const sanitizedItems = sanitizeDocuments(itemsArray);
    
    // Calculate metadata
    const totalPages = Math.ceil(total / limit);
    
    return {
      items: sanitizedItems,
      total,
      page,
      limit,
      totalPages,
      empty: itemsArray.length === 0
    };
  } catch (error) {
    // Add context to the error
    if (error instanceof Error) {
      throw new Error(`Error executing paginated query: ${error.message}`);
    }
    throw new Error(handleServerError(error));
  }
} 