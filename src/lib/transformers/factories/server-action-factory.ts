// src/lib/transformers/factories/server-action-factory.ts

import { isPaginatedResponse } from '@transformers/utils/response-utils';

import { handleClientError } from '@error/handlers/client';

import { ServerActions } from '@core-types/query-factory';
import { BaseDocument, DocumentInput } from '@core-types/document';
import { CollectionResponse, EntityResponse, PaginatedResponse } from '@core-types/response';
import type { QueryParams } from '@core-types/query';

/**
 * Wraps server actions to apply a transformation to all responses
 * with improved type compatibility for DocumentInput constraints
 * 
 * @param actions - Original server actions
 * @param transformer - Function to transform items
 * @returns Server actions with transformed responses
 */
export function wrapServerActions<
  T extends BaseDocument, 
  U extends BaseDocument, 
  TOriginalInput extends Record<string, unknown> = Record<string, unknown>,
  TInput extends DocumentInput<U> = DocumentInput<U>
>(
  actions: ServerActions<T, TOriginalInput>,
  transformer: (items: T[]) => U[]
): ServerActions<U, TInput> {
  return {
    fetch: async (params: QueryParams) => {
      const response = await actions.fetch(params);
      
      // Apply appropriate transformation based on response type
      if (isPaginatedResponse<T>(response)) {
        return transformPaginatedItems(response, transformer);
      }
      return transformResponseItems(response, transformer);
    },
    
    fetchById: actions.fetchById ? async (id: string) => {
      if (!actions.fetchById) throw new Error('FetchById action not implemented');
      const response = await actions.fetchById(id);
      
      // Apply appropriate transformation based on response type
      if ('data' in response) {
        return transformEntityItem(response as EntityResponse<T>, transformer);
      }
      return transformResponseItems(response as CollectionResponse<T>, transformer);
    } : undefined,
    
    create: actions.create ? async (data: TInput) => {
      if (!actions.create) throw new Error('Create action not implemented');
      // Type assertion to convert between input types
      const response = await actions.create(data as unknown as TOriginalInput);
      
      // Apply appropriate transformation based on response type
      if ('data' in response) {
        return transformEntityItem(response as EntityResponse<T>, transformer);
      }
      return transformResponseItems(response as CollectionResponse<T>, transformer);
    } : undefined,
    
    update: actions.update ? async (id: string, data: Partial<TInput>) => {
      if (!actions.update) throw new Error('Update action not implemented');
      // Type assertion to convert between input types
      const response = await actions.update(id, data as unknown as Partial<TOriginalInput>);
      
      // Apply appropriate transformation based on response type
      if ('data' in response) {
        return transformEntityItem(response as EntityResponse<T>, transformer);
      }
      return transformResponseItems(response as CollectionResponse<T>, transformer);
    } : undefined,
    
    delete: actions.delete ? async (id: string) => {
      if (!actions.delete) throw new Error('Delete action not implemented');
      const response = await actions.delete(id);
      
      // Apply appropriate transformation based on response type
      if ('data' in response) {
        return transformEntityItem(response as EntityResponse<T>, transformer);
      }
      return transformResponseItems(response as CollectionResponse<T>, transformer);
    } : undefined
  };
}

/**
 * Applies a transformation function to a collection response
 */
function transformResponseItems<T extends BaseDocument, U extends BaseDocument>(
  response: CollectionResponse<T>,
  transformer: (items: T[]) => U[]
): CollectionResponse<U> {
  try {
    // Transform items while preserving response structure
    return {
      ...response,
      items: transformer(response.items || []),
      total: response.total || 0
    };
  } catch (error) {
    handleClientError(error, 'transformResponseItems');
    return {
      ...response,
      items: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as CollectionResponse<U>;
  }
}

/**
 * Applies a transformation function to a paginated response
 */
function transformPaginatedItems<T extends BaseDocument, U extends BaseDocument>(
  response: PaginatedResponse<T>,
  transformer: (items: T[]) => U[]
): PaginatedResponse<U> {
  try {
    // Transform items while preserving pagination metadata
    const transformedItems = transformer(response.items || []);
    
    return {
      ...response,
      items: transformedItems,
      total: response.total || transformedItems.length,
      empty: transformedItems.length === 0
    };
  } catch (error) {
    handleClientError(error, 'transformPaginatedItems');
    return {
      ...response,
      items: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as PaginatedResponse<U>;
  }
}

/**
 * Applies a transformation function to an entity response
 */
function transformEntityItem<T extends BaseDocument, U extends BaseDocument>(
  response: EntityResponse<T>,
  transformer: (items: T[]) => U[]
): EntityResponse<U> {
  try {
    if (!response.data) {
      return {
        ...response,
        data: undefined as unknown as U,
        success: false
      };
    }
    
    // Transform the single entity
    const transformedItems = transformer([response.data]);
    
    return {
      ...response,
      data: transformedItems[0],
      success: Boolean(transformedItems.length > 0)
    };
  } catch (error) {
    handleClientError(error, 'transformEntityItem');
    return {
      success: false,
      data: undefined as unknown as U,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
