// Fix for src/lib/server/fetchers/fetcher-factory.ts

import { Model, FilterQuery, Document } from "mongoose";
import { connectToDB } from "@server/db/connection";

import { BaseDocument } from "@core-types/document";
import { QueryParams } from "@core-types/query";

import { handleServerError } from "@error/handlers/server";
import { sanitizeDocuments } from "@server/api/responses/formatters";

/**
 * Creates an API-safe version of a data fetching function
 * Uses simple data operations instead of complex transformations
 * Avoids "use server" directive issues when importing into API routes
 * 
 * @param model The Mongoose model to query
 * @param defaultSearchField The field to search by default (e.g., "name", "title")
 * @returns A function that can be used in API routes
 */
export function createApiSafeFetcher<M extends Document>(
  model: Model<M>,
  defaultSearchField?: string
) {
  return async function(params: QueryParams) {
    try {
      await connectToDB();
      const { page = 1, limit = 20, filters = {}, sortBy, sortOrder = "asc", search } = params;
      const skip = (page - 1) * limit;
      const query: Record<string, unknown> = {};

      if (search && defaultSearchField) {
        query[defaultSearchField] = { $regex: search, $options: 'i' };
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== defaultSearchField && value !== undefined && value !== null && value !== '') {
          query[key] = value;
        }
      });

      const items = await model.find(query as FilterQuery<M>)
        .sort({ [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);

      const total = await model.countDocuments(query as FilterQuery<M>);

      // Let Mongoose transforms handle the type conversion
      // The returned items will have the correct schema based on the model
      const processedItems = sanitizeDocuments(items);

      return {
        items: processedItems,
        total,
        success: true,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: (page * limit) < total
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
