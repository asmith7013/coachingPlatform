// src/lib/types/core/response.ts

import { z } from 'zod';
import { 
  BaseResponseZodSchema, 
  CollectionResponseZodSchema, 
  EntityResponseZodSchema 
} from '@zod-schema/core-types/response';
import { PaginatedResponseZodSchema } from '@zod-schema/core-types/query';

/**
 * Base response interface for all API responses
 */
export type BaseResponse = z.infer<typeof BaseResponseZodSchema>;

/**
 * Response interface for collections of resources
 */
export type CollectionResponse<T = unknown> = Omit<z.infer<typeof CollectionResponseZodSchema>, 'items'> & {
  items: T[];
  total: number;
};

/**
 * Response interface for single resource operations
 */
export type EntityResponse<T = unknown> = Omit<z.infer<typeof EntityResponseZodSchema>, 'data'> & {
  data: T;
};

/**
 * Response type for paginated data
 */
export type PaginatedResponse<T = unknown> = Omit<z.infer<typeof PaginatedResponseZodSchema>, 'items'> & {
  items: T[];
};

