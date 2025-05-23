// src/lib/data-utilities/transformers/utilities/selector-factories.ts

import { ZodSchema } from 'zod';
import { 
  transformResponse,
  transformPaginatedResponse,
  transformEntityResponse
} from '@data-utilities/transformers/core/transform-helpers';
import { 
  CollectionResponse,
  EntityResponse
} from '@core-types/response';
import { PaginatedResponse } from "@core-types/pagination";
import {
  extractPagination
} from '@data-utilities/transformers/utilities/response-utils';

/**
 * Creates a collection selector from a schema
 */
export function createSchemaCollectionSelector<T>(
  schema: ZodSchema<T>
): (data: CollectionResponse<unknown> | undefined) => T[] {
  return (data) => {
    if (!data) return [];
    const transformed = transformResponse(data, schema);
    return transformed.items;
  };
}

/**
 * Creates a paginated selector from a schema
 */
export function createSchemaPaginatedSelector<T>(
  schema: ZodSchema<T>
): (data: PaginatedResponse<unknown> | undefined) => { 
  items: T[], 
  pagination: ReturnType<typeof extractPagination<T>> 
} {
  return (data) => {
    if (!data) return { 
      items: [], 
      pagination: extractPagination(null) 
    };
    
    const transformed = transformPaginatedResponse(data, schema);
    
    return {
      items: transformed.items,
      pagination: extractPagination(transformed)
    };
  };
}

/**
 * Creates an entity selector from a schema
 */
export function createSchemaEntitySelector<T>(
  schema: ZodSchema<T>
): (data: EntityResponse<unknown> | undefined) => T | null {
  return (data) => {
    if (!data) return null;
    const transformed = transformEntityResponse(data, schema);
    return transformed.success ? transformed.data : null;
  };
} 