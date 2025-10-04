import { z } from "zod";
import { CollectionResponseZodSchema } from "./response";

/**
 * Base pagination parameters schema
 */
export const PaginationParamsZodSchema = z.object({
  page: z.union([
    z.string().transform(val => parseInt(val, 10) || 1),
    z.number()
  ]).default(1).describe("Page number (1-based)"),
  
  limit: z.union([
    z.string().transform(val => parseInt(val, 10) || 20),
    z.number()
  ]).default(20).describe("Items per page")
});

/**
 * Complete query parameters schema with sorting, filtering, search
 */
export const QueryParamsZodSchema = PaginationParamsZodSchema.extend({
  // Sorting parameters
  sortBy: z.string().default('createdAt').describe("Field to sort by"),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe("Sort direction"),
  
  // Filtering parameters
  filters: z.record(z.string(), z.unknown()).default({}).describe("Query filters"),
  
  // Search parameters
  search: z.string().optional().describe("Search query"),
  searchFields: z.array(z.string()).optional().describe("Fields to search in"),
  
  // Additional options
  options: z.record(z.string(), z.unknown()).optional().describe("Additional query options")
}).catchall(
  // Handle boolean string values and other unknown properties
  z.union([
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
    z.unknown()
  ])
);

/**
 * Response schema for paginated results
 */
export const PaginatedResponseZodSchema = CollectionResponseZodSchema.extend({
  page: z.number().describe("Current page number"),
  limit: z.number().describe("Items per page"),
  totalPages: z.number().describe("Total number of pages"),
  hasMore: z.boolean().describe("Whether there are more pages")
});