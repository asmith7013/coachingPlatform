import { z } from 'zod';
import { 
  PaginationParamsZodSchema, 
  QueryParamsZodSchema,  
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
