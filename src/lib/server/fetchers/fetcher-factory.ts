// src/lib/data-server/api-adapters.ts
import { ZodSchema } from "zod";

import { Model, FilterQuery, Document } from "mongoose";
import { connectToDB } from "@server/db/connection";

import { sanitizeDocuments } from "@/lib/server/api/responses/formatters";
import { BaseDocument } from "@core-types/document";
import { QueryParams } from "@core-types/query";
import { handleServerError } from "@error/handlers/server";

interface ValidationError {
  id: string;
  item: Record<string, unknown>;
}

/**
 * Creates an API-safe version of a data fetching function
 * Uses simple data operations instead of complex transformations
 * Avoids "use server" directive issues when importing into API routes
 * 
 * @param model The Mongoose model to query
 * @param schema The Zod schema for validation (optional)
 * @param defaultSearchField The field to search by default (e.g., "name", "title")
 * @returns A function that can be used in API routes
 */
export function createApiSafeFetcher<T extends BaseDocument, M extends Document>(
  model: Model<M>,
  schema?: ZodSchema<T>,
  defaultSearchField?: string
) {
  return async function(params: QueryParams) {
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
      
      // Simple data processing:
      // 1. Sanitize MongoDB documents
      let processedItems = sanitizeDocuments<T>(items);
      
      // 2. Optional schema validation
      const validationErrors: ValidationError[] = [];
      if (schema) {
        const originalCount = processedItems.length;
        processedItems = processedItems.map(item => {
          const result = schema.safeParse(item);
          return result.success ? result.data : item;
        }).filter(Boolean) as T[];
        
        const failedCount = originalCount - processedItems.length;
        if (failedCount > 0) {
          validationErrors.push({
            id: 'validation_summary',
            item: { failedCount, modelName: model.modelName }
          });
        }
      }
      
      // Log validation errors in development
      if (process.env.NODE_ENV === 'development' && validationErrors.length > 0) {
        console.warn(`Validation errors in ${model.modelName} fetcher:`, 
          validationErrors.length, 'failed items'
        );
      }
      
      // Return the response with processed items
      return {
        items: processedItems,
        total, // Keep the total count including invalid items for pagination
        success: true,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: (page * limit) < total,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      };
    } catch (error) {
      console.error(`API fetch error for ${model.modelName}:`, error);
      return {
        items: [],
        total: 0,
        success: false,
        error: handleServerError(error, `ApiFetcher:${model.modelName}`),
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
        hasMore: false
      };
    }
  };
}
