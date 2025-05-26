// src/query/client/hooks/data/useQueriesManager.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { 
  transformEntityResponse,
  transformCollectionResponse
} from '@query/client/utilities/hook-helpers';

export interface QueryConfig<T extends BaseDocument> {
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
  
  /** Whether to use the selector system */
  useSelector?: boolean;
}

/**
 * Hook for managing multiple queries with React Query and schema validation
 */
export function useResourceQueries<T extends BaseDocument, R extends Record<string, unknown> = T>({
  entityType,
  schema, // ✅ NOW REQUIRED
  getEntity,
  getList,
  errorContext = entityType,
  useSelector = false
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
    select: (response) => transformEntityResponse<T, R>(
      response, 
      schema,
      { entityType, useSelector, errorContext: `${errorContext}.entity` }
    ),
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
    select: (response) => transformCollectionResponse<T, R>(
      response, 
      schema,
      { entityType, useSelector, errorContext: `${errorContext}.list` }
    ),
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