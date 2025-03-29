import type { Model } from "mongoose";
import { handleServerError } from "@/lib/error/handleServerError";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  empty: boolean;
}

/**
 * Builds a paginated query for MongoDB
 */
export function buildPaginatedQuery<T>(
  model: Model<T>,
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
export async function executePaginatedQuery<T>(
  model: Model<T>,
  filters: Record<string, unknown>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  try {
    const { page = 1, limit = 20 } = options;
    
    // Build and execute query
    const query = buildPaginatedQuery(model, filters, options);
    const [items, total] = await Promise.all([
      query.exec(),
      model.countDocuments(filters)
    ]);
    
    // Calculate metadata
    const totalPages = Math.ceil(total / limit);
    
    return {
      items,
      total,
      page,
      limit,
      totalPages,
      empty: items.length === 0
    };
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 