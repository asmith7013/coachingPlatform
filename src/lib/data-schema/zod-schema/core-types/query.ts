import { z } from "zod";
import { CollectionResponseZodSchema } from "./response";

// Pagination parameters
export const PaginationParamsZodSchema = z.object({
  page: z.number().positive().default(1).describe("Page number (1-based)"),
  limit: z.number().positive().default(10).describe("Items per page")
});

// Extended query parameters
export const QueryParamsZodSchema = PaginationParamsZodSchema.extend({
  sortBy: z.string().default('createdAt').describe("Field to sort by"),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe("Sort direction"),
  filters: z.record(z.unknown()).optional().describe("Query filters"),
  filter: z.record(z.unknown()).optional().describe("Legacy filter support"),
  search: z.string().optional().describe("Search query"),
  searchFields: z.array(z.string()).optional().describe("Fields to search in"),
  options: z.record(z.unknown()).optional().describe("Additional query options")
});

// Paginated response
export const PaginatedResponseZodSchema = CollectionResponseZodSchema.extend({
  page: z.number().describe("Current page number"),
  limit: z.number().describe("Items per page"),
  totalPages: z.number().describe("Total number of pages"),
  hasMore: z.boolean().describe("Whether there are more pages")
});