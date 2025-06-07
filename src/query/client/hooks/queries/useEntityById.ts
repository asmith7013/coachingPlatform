// src/hooks/data/useEntityById.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { EntityResponse } from '@core-types/response';
import { transformSingleItem } from '@query/client/utilities/hook-helpers';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';

/**
 * Configuration for useEntityById hook
 */
export interface UseEntityByIdConfig<T extends BaseDocument> {
  /** Entity type for query key generation */
  entityType: string;
  
  /** Entity ID to fetch */
  id: string | null | undefined;
  
  /** Function to fetch entity by ID - now expects EntityResponse */
  fetcher: (id: string) => Promise<EntityResponse<T>>;
  
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  
  /** Whether to use the selector system instead of direct schema validation */
  useSelector?: boolean;
  
  /** Error context for debugging */
  errorContext?: string;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<EntityResponse<T>, Error>, 'queryKey' | 'queryFn' | 'select' | 'enabled'>;
}

/**
 * ✅ FIXED: Hook for fetching a single entity by ID with EntityResponse support
 */
export function useEntityById<T extends BaseDocument>({
  entityType,
  id,
  fetcher,
  schema,
  useSelector = false,
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
    
    // ✅ SIMPLIFIED: Direct EntityResponse handling
    select: (response) => {
      // Handle EntityResponse format - extract and validate the single entity
      if (!response.success || !response.data) {
        throw new Error(response.error || `Failed to fetch ${entityType}`);
      }
      
      // ✅ FIXED: Transform the single entity directly (no format conversion needed)
      const transformed = transformSingleItem<T>(
        response.data, // Pass the raw data item
        ensureBaseDocumentCompatibility<T>(schema),
        {
          entityType,
          useSelector,
          errorContext: errorContext || `${entityType}.fetchById`
        }
      );
      
      if (!transformed) {
        throw new Error(`Failed to transform ${entityType} data`);
      }
      
      return transformed;
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