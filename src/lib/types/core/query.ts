import { z } from 'zod';
import { 
  PaginationParamsZodSchema, 
  QueryParamsZodSchema, 
  PaginatedResponseZodSchema 
} from '@zod-schema/core-types/query';

/**
 * Basic pagination parameters
 */
export type PaginationParams = z.infer<typeof PaginationParamsZodSchema>;

/**
 * Complete query parameters with filtering, sorting, and search
 */
export type QueryParams = z.infer<typeof QueryParamsZodSchema>;

export const DEFAULT_QUERY_PARAMS: QueryParams = QueryParamsZodSchema.parse({});

/**
 * Response type for paginated data
 */
export type PaginatedResponse<T = unknown> = Omit<z.infer<typeof PaginatedResponseZodSchema>, 'items'> & {
  items: T[];
};

/**
 * Metadata for pagination
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isEmpty: boolean;
}
