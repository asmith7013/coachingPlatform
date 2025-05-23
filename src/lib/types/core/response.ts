// src/lib/types/core/response.ts

import { z } from 'zod';
import { 
  BaseResponseZodSchema, 
  CollectionResponseZodSchema, 
  EntityResponseZodSchema 
} from '@/lib/data-schema/zod-schema/core-types/response';

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
 * @deprecated Use CollectionResponse instead
 * Maintained for backward compatibility
 */
export type StandardResponse<T = unknown> = CollectionResponse<T>;

/**
 * @deprecated Use EntityResponse instead
 * Maintained for backward compatibility
 */
export type SingleResourceResponse<T = unknown> = EntityResponse<T>;
