// src/hooks/data/useEntityById.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse } from '@core-types/response';
import { transformSingleItem } from '@query/client/utilities/hook-helpers';
import { ensureBaseDocumentCompatibility } from '@/lib/transformers/core/unified-transformer';

/**
 * Configuration for useEntityById hook
 */
export interface UseEntityByIdConfig<T extends BaseDocument> {
  /** Entity type for query key generation */
  entityType: string;
  
  /** Entity ID to fetch */
  id: string | null | undefined;
  
  /** Function to fetch entity by ID */
  fetcher: (id: string) => Promise<CollectionResponse<unknown>>;
  
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  
  /** Whether to use the selector system instead of direct schema validation */
  useSelector?: boolean;
  
  /** Error context for debugging */
  errorContext?: string;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<CollectionResponse<unknown>, Error>, 'queryKey' | 'queryFn' | 'select' | 'enabled'>;
}

/**
 * Hook for fetching a single entity by ID with schema validation
 */
export function useEntityById<T extends BaseDocument, R = T>({
  entityType,
  id,
  fetcher,
  schema,
  errorContext,
  queryOptions = {}
}: UseEntityByIdConfig<T>) {
  const query = useQuery({
    queryKey: [entityType, 'detail', id] as string[],
    queryFn: async () => {
      if (!id) {
        throw new Error(`Cannot fetch ${entityType} without an ID`);
      }
      return await fetcher(id);
    },
    
    select: (data) => {
      return transformSingleItem<T, T>(data, {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: errorContext || `${entityType}.fetchById`
      });
    },
    enabled: !!id,
    ...queryOptions
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query
  };
}