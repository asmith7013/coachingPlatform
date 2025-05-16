import { StandardResponse, PaginatedResponse } from '@core-types/response';
import { PaginationQueryParams } from '@pattern-hooks/useEntityHooks';
import { getEntitySelector, safelyApplySelector } from '@/lib/query/selectors/registry';
import { handleClientError } from '@/lib/error/handle-client-error';
import { BaseDocument } from '@/lib/types/core/document';

/**
 * Interface for server actions with generic types
 */
export interface ServerActions<T extends BaseDocument, TInput extends Record<string, unknown> = Record<string, unknown>> {
  fetch: (params: PaginationQueryParams) => Promise<PaginatedResponse<T>>;
  fetchById?: (id: string) => Promise<StandardResponse<T>>;
  create?: (data: TInput) => Promise<StandardResponse<T>>;
  update?: (id: string, data: Partial<TInput>) => Promise<StandardResponse<T>>;
  delete?: (id: string) => Promise<StandardResponse<T>>;
}

/**
 * Transforms items in a standard response using the provided transformer function
 * 
 * @param response The original API response
 * @param transformer Function to transform each item in the response
 * @returns Transformed response with the same structure
 * 
 * @example
 * // Transform dates in a response
 * const transformedResponse = transformResponse(
 *   response,
 *   items => transformDateFieldsArray(items)
 * );
 */
export function transformResponse<T extends BaseDocument, U>(
  response: StandardResponse<T>,
  transformer: (items: T[]) => U[]
): StandardResponse<U> {
  if (!response) return response as unknown as StandardResponse<U>;
  
  try {
    return {
      ...response,
      items: transformer(response.items || []) as U[]
    };
  } catch (error) {
    handleClientError(error, 'transformResponse');
    // Return original response with empty items as fallback
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Transforms a paginated response using the provided transformer function
 * 
 * @param response The original paginated API response
 * @param transformer Function to transform each item in the response
 * @returns Transformed paginated response with the same structure
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
    // Return original response with empty items as fallback
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Transforms a response using a selector from the registry
 * 
 * @param response The original API response
 * @param entityType The entity type to get selector for
 * @returns Transformed response with the same structure
 */
export function transformResponseWithSelector<T extends BaseDocument, U>(
  response: StandardResponse<T>,
  entityType: string
): StandardResponse<U> {
  if (!response) return response as unknown as StandardResponse<U>;
  
  try {
    return {
      ...response,
      items: safelyApplySelector(response, getEntitySelector<T, U[]>(entityType), entityType)
    };
  } catch (error) {
    handleClientError(error, `transformResponseWithSelector:${entityType}`);
    // Return original response with empty items as fallback
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Transforms a paginated response using a selector from the registry
 * 
 * @param response The original paginated API response
 * @param entityType The entity type to get selector for
 * @returns Transformed paginated response with the same structure
 */
export function transformPaginatedResponseWithSelector<T extends BaseDocument, U>(
  response: PaginatedResponse<T>,
  entityType: string
): PaginatedResponse<U> {
  if (!response) return response as unknown as PaginatedResponse<U>;
  
  try {
    return {
      ...response,
      items: safelyApplySelector(response, getEntitySelector<T, U[]>(entityType), entityType)
    };
  } catch (error) {
    handleClientError(error, `transformPaginatedResponseWithSelector:${entityType}`);
    // Return original response with empty items as fallback
    return {
      ...response,
      items: [] as unknown as U[]
    };
  }
}

/**
 * Wraps server actions to apply a transformation to all responses
 * 
 * @param actions Original server actions object
 * @param transformer Function to transform the items in each response
 * @returns Wrapped server actions that apply the transformation
 * 
 * @example
 * // Wrap all server actions to transform string dates to Date objects
 * const wrappedActions = wrapServerActions(
 *   { fetch: fetchSchools, fetchById: fetchSchoolById, ... },
 *   items => transformDateFieldsArray(items)
 * );
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
          return transformResponse(response, transformer);
        }
      : undefined,
    
    create: actions.create
      ? async (data) => {
          const response = await actions.create!(data);
          return transformResponse(response, transformer);
        }
      : undefined,
    
    update: actions.update
      ? async (id, data) => {
          const response = await actions.update!(id, data);
          return transformResponse(response, transformer);
        }
      : undefined,
    
    delete: actions.delete
      ? async (id) => {
          const response = await actions.delete!(id);
          return transformResponse(response, transformer);
        }
      : undefined
  };
}

/**
 * Wraps server actions to apply a selector from the registry to all responses
 * 
 * @param actions Original server actions object
 * @param entityType The entity type to get selector for
 * @returns Wrapped server actions that apply the selector
 * 
 * @example
 * // Wrap all server actions to use the 'schools' selector
 * const wrappedActions = wrapServerActionsWithSelector(
 *   { fetch: fetchSchools, fetchById: fetchSchoolById, ... },
 *   'schools'
 * );
 */
export function wrapServerActionsWithSelector<T extends BaseDocument, U extends BaseDocument, TInput extends Record<string, unknown> = Record<string, unknown>>(
  actions: ServerActions<T, TInput>,
  entityType: string
): ServerActions<U, TInput> {
  return {
    fetch: async (params) => {
      const response = await actions.fetch(params);
      return transformPaginatedResponseWithSelector<T, U>(response, entityType);
    },
    
    fetchById: actions.fetchById 
      ? async (id) => {
          const response = await actions.fetchById!(id);
          return transformResponseWithSelector<T, U>(response, entityType);
        }
      : undefined,
    
    create: actions.create
      ? async (data) => {
          const response = await actions.create!(data);
          return transformResponseWithSelector<T, U>(response, entityType);
        }
      : undefined,
    
    update: actions.update
      ? async (id, data) => {
          const response = await actions.update!(id, data);
          return transformResponseWithSelector<T, U>(response, entityType);
        }
      : undefined,
    
    delete: actions.delete
      ? async (id) => {
          const response = await actions.delete!(id);
          return transformResponseWithSelector<T, U>(response, entityType);
        }
      : undefined
  };
}