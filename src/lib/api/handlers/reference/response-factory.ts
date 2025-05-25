// src/lib/api/handlers/reference/response-factory.ts

import { z } from "zod";
import { BaseReference } from "@core-types/reference";
import { PaginatedResponse } from "@core-types/pagination";
import { createCollectionResponse } from "@api-responses/action-response-helper";

/**
 * Formats a successful response for a reference endpoint
 * 
 * @param data Data response from the fetch function
 * @param mapItem Function to map items to reference format
 * @param page Current page number
 * @param limit Items per page
 * @returns Formatted response with mapped references and pagination metadata
 */
export function formatSuccessResponse<T, R extends BaseReference>(
  data: PaginatedResponse<T>,
  mapItem: (item: T) => R,
  page: number,
  limit: number
) {
  // Map items to reference format
  const references = data.items.map((item) => mapItem(item as T));
  
  // Create collection response with mapped references
  const baseResponse = createCollectionResponse(references);
  
  // Add pagination metadata
  return {
    ...baseResponse,
    page: data.page || page,
    limit: data.limit || limit,
    totalPages: data.totalPages || Math.ceil(data.total / (data.limit || limit)),
    hasMore: data.hasMore !== undefined 
      ? data.hasMore 
      : ((data.page || page) * (data.limit || limit)) < data.total,
  };
}

/**
 * Helper function to create a custom reference response schema
 * 
 * @param referenceSchema The schema for reference items
 * @returns A paginated response schema with the specified reference items
 */
export function createReferenceResponseSchema<T extends z.ZodRawShape>(
  referenceSchema: z.ZodObject<T>
) {
  return z.object({
    success: z.boolean(),
    items: z.array(referenceSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
    message: z.string().optional(),
    empty: z.boolean().optional()
  });
}