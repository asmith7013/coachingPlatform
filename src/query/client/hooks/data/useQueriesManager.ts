import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { ZodSchema } from 'zod';
import { transformItemWithSchema, transformItemsWithSchema } from '@transformers/core/transform-helpers';

export interface QueryConfig<T> {
  /** Entity type name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** ✅ NOW REQUIRED: Zod schema for data validation */
  schema: ZodSchema<T>;
  
  /** Function to fetch a single entity */
  getEntity?: (id: string) => Promise<EntityResponse<T>>;
  
  /** Function to fetch a list of entities */
  getList?: () => Promise<CollectionResponse<T>>;
  
  /** Error context for error reporting */
  errorContext?: string;
}

/**
 * Transform response using 3-layer system
 */
function transformEntityResponse<T>(
  response: EntityResponse<T> | null | undefined,
  schema: ZodSchema<T>
): EntityResponse<T> {
  if (!response?.data) {
    return { success: false, data: undefined as unknown as T };
  }
  
  try {
    // Use the shared helper function for consistency
    const validated = transformItemWithSchema(response.data, schema);
    
    return {
      ...response,
      data: validated as T
    };
  } catch (error) {
    console.error('Error transforming entity response:', error);
    return response; // Fallback to original
  }
}

/**
 * Transform collection response using 3-layer system
 */
function transformCollectionResponse<T>(
  response: CollectionResponse<T> | null | undefined,
  schema: ZodSchema<T>
): CollectionResponse<T> {
  if (!response?.items) {
    return { success: false, items: [], total: 0 };
  }
  
  try {
    // Use the shared helper function for consistency
    const transformedItems = transformItemsWithSchema(response.items, schema);
    
    return {
      ...response,
      items: transformedItems,
      total: transformedItems.length
    };
  } catch (error) {
    console.error('Error transforming collection response:', error);
    return response; // Fallback to original
  }
}

/**
 * Hook for managing multiple queries with React Query and REQUIRED schema validation
 */
export function useQueriesManager<T>({
  entityType,
  schema, // ✅ NOW REQUIRED
  getEntity,
  getList,
  errorContext = entityType
}: QueryConfig<T>) {
  // Always create queries, but only use them if the corresponding function is provided
  const entityQuery = useQuery({
    queryKey: queryKeys.entities.detail(entityType, entityType), // Use entityType as ID for now
    queryFn: async () => {
      if (!getEntity) {
        throw new Error('Get entity function not provided');
      }
      try {
        return await getEntity(entityType);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Get entity ${errorContext}`));
      }
    },
    select: (response) => transformEntityResponse(response, schema),
    enabled: !!getEntity
  });
  
  const listQuery = useQuery({
    queryKey: queryKeys.entities.list(entityType),
    queryFn: async () => {
      if (!getList) {
        throw new Error('Get list function not provided');
      }
      try {
        return await getList();
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Get list ${errorContext}`));
      }
    },
    select: (response) => transformCollectionResponse(response, schema),
    enabled: !!getList
  });
  
  return {
    // Entity query operations
    entity: entityQuery.data?.data,
    isEntityLoading: entityQuery.isLoading,
    entityError: entityQuery.error,
    
    // List query operations
    list: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isListLoading: listQuery.isLoading,
    listError: listQuery.error,
    
    // Combined loading state
    isLoading: entityQuery.isLoading || listQuery.isLoading,
    
    // Refetch functions
    refetchEntity: getEntity ? () => entityQuery.refetch() : null,
    refetchList: getList ? () => listQuery.refetch() : null,
    refetchAll: () => {
      if (getEntity) entityQuery.refetch();
      if (getList) listQuery.refetch();
    }
  };
}