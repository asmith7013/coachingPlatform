// src/lib/transformers/factories/server-action-factory.ts
// ULTRA-SIMPLIFIED VERSION - No response format conversion needed!

import { ServerActions } from '@core-types/query-factory';
import { BaseDocument, DocumentInput } from '@core-types/document';
import { EntityResponse } from '@core-types/response';
import type { QueryParams } from '@core-types/query';

/**
 * Wraps server actions to apply data transformation only
 * MASSIVELY SIMPLIFIED - CRUD factory returns correct response types!
 * 
 * @param actions - Original server actions (already return correct response types)
 * @param transformer - Function to transform individual data items
 * @returns Server actions with transformed data
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
    // Collection operations - transform items array
    fetch: async (params: QueryParams) => {
      const response = await actions.fetch(params);
      return {
        ...response,
        items: transformer(response.items || [])
      };
    },
    
    // Single entity operations - transform the data field
    fetchById: actions.fetchById ? async (id: string) => {
      const response = await actions.fetchById!(id);
      
      if (!response.success || !response.data) {
        return response as unknown as EntityResponse<U>; // Pass through errors unchanged
      }
      
      const transformedItems = transformer([response.data]);
      return {
        ...response,
        data: transformedItems[0]
      };
    } : undefined,
    
    create: actions.create ? async (data: TInput) => {
      const response = await actions.create!(data as unknown as TOriginalInput);
      
      if (!response.success || !response.data) {
        return response as unknown as EntityResponse<U>; // Pass through errors unchanged
      }
      
      const transformedItems = transformer([response.data]);
      return {
        ...response,
        data: transformedItems[0]
      };
    } : undefined,
    
    update: actions.update ? async (id: string, data: Partial<TInput>) => {
      const response = await actions.update!(id, data as unknown as Partial<TOriginalInput>);
      
      if (!response.success || !response.data) {
        return response as unknown as EntityResponse<U>; // Pass through errors unchanged
      }
      
      const transformedItems = transformer([response.data]);
      return {
        ...response,
        data: transformedItems[0]
      };
    } : undefined,
    
    // Delete operations - no transformation needed
    delete: actions.delete ? async (id: string) => {
      return actions.delete!(id); // BaseResponse - pass through unchanged
    } : undefined
  };
}

/**
 * Helper for when no transformation is needed (just type conversion)
 */
export function wrapServerActionsNoTransform<
  T extends BaseDocument,
  TInput extends DocumentInput<T> = DocumentInput<T>
>(
  actions: ServerActions<T, Record<string, unknown>>
): ServerActions<T, TInput> {
  return wrapServerActions(actions, (items) => items);
}
