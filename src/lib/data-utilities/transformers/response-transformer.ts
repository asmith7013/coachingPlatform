// src/lib/data-utilities/transformers/response-transformer.ts
import {  CollectionResponse, EntityResponse, PaginatedResponse } from '@core-types/response';
import { PaginationQueryParams } from '@query/factories/entity-hooks';
// import { getEntitySelector, safelyApplySelector } from '@/lib/query/selectors/registry';
import { handleClientError } from '@error/handle-client-error';
import {  } from '@core-types/document';

/**
 * Interface for server actions with generic types
 */
export interface ServerActions<T extends BaseDocument, TInput extends Record<string, unknown> = Record<string, unknown>> {
  fetch: (params: PaginationQueryParams) => Promise<PaginatedResponse<T>>;
  fetchById?: (id: string) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  create?: (data: TInput) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  update?: (id: string, data: Partial<TInput>) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  delete?: (id: string) => Promise<CollectionResponse<T> | EntityResponse<T>>;
}

/**
 * Transforms items in a collection response using the provided transformer function
 */
export function transformResponse<T extends BaseDocument, U>(
  response: CollectionResponse<T>,
  transformer: (items: T[]) => U[]
): CollectionResponse<U> {
  if (!response) return response as unknown as CollectionResponse<U>;
  
  try {
    return {
      ...response,
      items: transformer(response.items || []) as U[]
    };
  } catch (error) {
    handleClientError(error, 'transformResponse');
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Transforms a paginated response using the provided transformer function
 */
export function transformPaginatedResponse<T extends BaseDocument, U>(
  response: PaginatedResponse<T>,
  transformer: (items: T[]) => U[]
): PaginatedResponse<U> {
  if (!response) return response as unknown as PaginatedResponse<U>;
  
  try {
    return {
      ...response,
      items: transformer(response.items || []) as U[]
    };
  } catch (error) {
    handleClientError(error, 'transformPaginatedResponse');
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Transforms an entity response using the provided transformer function
 */
export function transformEntityResponse<T extends BaseDocument, U>(
  response: EntityResponse<T>,
  transformer: (data: T) => U
): EntityResponse<U> {
  if (!response) return response as unknown as EntityResponse<U>;
  
  try {
    return {
      ...response,
      data: transformer(response.data) as U
    };
  } catch (error) {
    handleClientError(error, 'transformEntityResponse');
    return {
      ...response,
      data: {} as U
    };
  }
}

/**
 * Wraps a server action that returns a collection response 
 * to transform response items
 */
export function wrapCollectionAction<T, U = T>(
  action: (...args: any[]) => Promise<CollectionResponse<T>>,
  transformer: (items: T[]) => U[]
) {
  return async (...args: Parameters<typeof action>): Promise<CollectionResponse<U>> => {
    const result = await action(...args);
    
    if (!result.success) {
      return {
        success: false,
        items: [],
        total: 0,
        error: result.error,
        errors: result.errors
      };
    }
    
    return {
      ...result,
      items: transformer(result.items || []) as U[]
    };
  };
}

/**
 * Wraps a server action that returns an entity response
 * to transform response data
 */
export function wrapEntityAction<T, U = T>(
  action: (...args: any[]) => Promise<EntityResponse<T>>,
  transformer: (data: T) => U
) {
  return async (...args: Parameters<typeof action>): Promise<EntityResponse<U>> => {
    const result = await action(...args);
    
    if (!result.success) {
      return {
        success: false,
        data: {} as U,
        error: result.error,
        errors: result.errors
      };
    }
    
    return {
      ...result,
      data: transformer(result.data) as U
    };
  };
}

/**
 * Wraps server actions to apply a transformation to all responses
 */
export function wrapServerActions<T extends BaseDocument, U extends BaseDocument, TInput extends Record<string, unknown> = Record<string, unknown>>(
  actions: ServerActions<T, TInput>,
  transformer: (items: T[]) => U[]
): ServerActions<U, TInput> {
  return {
    fetch: async (params) => {
      const response = await actions.fetch(params);
      return transformPaginatedResponse(response, transformer);
    },
    
    fetchById: actions.fetchById 
      ? async (id) => {
          const response = await actions.fetchById!(id);
          if ('data' in response) {
            // Handle EntityResponse type
            return {
              ...response,
              data: transformer([response.data])[0]
            } as EntityResponse<U>;
          }
          // Handle CollectionResponse type
          return transformResponse(response, transformer);
        }
      : undefined,
    
    create: actions.create
      ? async (data) => {
          const response = await actions.create!(data);
          if ('data' in response) {
            // Handle EntityResponse type
            return {
              ...response,
              data: transformer([response.data])[0]
            } as EntityResponse<U>;
          }
          // Handle CollectionResponse type
          return transformResponse(response, transformer);
        }
      : undefined,
    
    update: actions.update
      ? async (id, data) => {
          const response = await actions.update!(id, data);
          if ('data' in response) {
            // Handle EntityResponse type
            return {
              ...response,
              data: transformer([response.data])[0]
            } as EntityResponse<U>;
          }
          // Handle CollectionResponse type
          return transformResponse(response, transformer);
        }
      : undefined,
    
    delete: actions.delete
      ? async (id) => {
          const response = await actions.delete!(id);
          if ('data' in response) {
            // Handle EntityResponse type
            return {
              ...response,
              data: transformer([response.data])[0]
            } as EntityResponse<U>;
          }
          // Handle CollectionResponse type
          return transformResponse(response, transformer);
        }
      : undefined
  };
}