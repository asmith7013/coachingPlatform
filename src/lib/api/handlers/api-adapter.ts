// src/lib/data-server/api-adapters.ts
import { connectToDB } from "@data-server/db/connection";
import { FetchParams } from "@core-types/api";
import { sanitizeDocuments } from "@data-utilities/transformers/sanitize";
import { ZodSchema } from "zod";
import { Model, FilterQuery } from "mongoose";

/**
 * Creates an API-safe version of a data fetching function
 * This avoids the "use server" directive issues when importing into API routes
 * 
 * @param model The Mongoose model to query
 * @param schema The Zod schema for validation
 * @param defaultSearchField The field to search by default (e.g., "name", "title")
 * @returns A function that can be used in API routes
 */
export function createApiSafeFetcher<T, M>(
  model: Model<M>,
  _schema: ZodSchema<T>,
  defaultSearchField?: string
) {
  return async function(params: FetchParams) {
    try {
      await connectToDB();
      
      const { page = 1, limit = 20, filters = {}, sortBy, sortOrder = "asc", search } = params;
      const skip = (page - 1) * limit;
      
      // Build query
      const query: Record<string, unknown> = {};
      
      // Add search filter if provided and defaultSearchField is set
      if (search && defaultSearchField) {
        query[defaultSearchField] = { $regex: search, $options: 'i' };
      }
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== defaultSearchField && value !== undefined && value !== null && value !== '') {
          query[key] = value;
        }
      });
      
      // Execute query
      const items = await model.find(query as FilterQuery<M>)
        .sort({ [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await model.countDocuments(query as FilterQuery<M>);
      
      // Sanitize and return
      return {
        items: sanitizeDocuments(items),
        total,
        success: true,
        page,
        limit
      };
    } catch (error) {
      console.error(`API fetch error:`, error);
      return {
        items: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };
}