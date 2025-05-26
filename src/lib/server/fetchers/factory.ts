// src/lib/data-server/api-adapters.ts
import { ZodSchema } from "zod";

import { Model, FilterQuery, Document } from "mongoose";
import { connectToDB } from "@server/db/connection";

import { transformData } from "@transformers/core/unified-transformer";

import { QueryParams } from "@core-types/query";


interface ValidationError {
  id: string;
  item: Record<string, unknown>;
}

/**
 * Creates an API-safe version of a data fetching function
 * This avoids the "use server" directive issues when importing into API routes
 * 
 * @param model The Mongoose model to query
 * @param schema The Zod schema for validation
 * @param defaultSearchField The field to search by default (e.g., "name", "title")
 * @returns A function that can be used in API routes
 */
export function createApiSafeFetcher<T, M extends Document>(
  model: Model<M>,
  schema: ZodSchema<T>,
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
      
      // Transform and validate MongoDB documents using unified transformer
      const validItems = transformData(items, {
        schema: schema as any,
        handleDates: true,
        errorContext: 'fetcherFactory'
      }) as T[];
      
      // For backward compatibility, we'll assume no validation errors
      // since the unified transformer handles validation internally
      const validationErrors: ValidationError[] = [];
      
      // Log validation errors in development
      if (process.env.NODE_ENV === 'development' && validationErrors.length > 0) {
        console.warn(`Validation errors in ${model.modelName} fetcher:`, 
          validationErrors.length
        );
      }
      
      // Return the response with validated items
      return {
        items: validItems,
        total, // Keep the total count including invalid items
        success: true,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: (page * limit) < total,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
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