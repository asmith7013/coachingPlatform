import { ZodSchema } from "zod";
import { UseQueryOptions } from "@tanstack/react-query";
import {
  ResponseTransformer,
  usePagination,
} from "@query/client/hooks/pagination/usePagination";

import { BaseDocument } from "@core-types/document";
import { QueryParams } from "@core-types/query";
import { PaginatedResponse, CollectionResponse } from "@core-types/response";

import {
  extractItems,
  isPaginatedResponse,
} from "@data-processing/transformers/utils/response-utils";
import { validateArraySafe } from "@data-processing/validation/zod-validation";

/**
 * Configuration for useEntityList hook
 */
export interface UseEntityListConfig<T extends BaseDocument> {
  /** Entity type for query key generation */
  entityType: string;

  /** Function to fetch entities */
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T>>;

  /** Zod schema for validation */
  schema: ZodSchema<T>;

  /** Whether to use the selector system instead of direct schema validation */
  useSelector?: boolean;

  /** Default parameters for the query */
  defaultParams?: Partial<QueryParams>;

  /** Valid fields for sorting */
  validSortFields?: string[];

  /** Whether to persist filters in storage */
  persistFilters?: boolean;

  /** Storage key for persisted filters */
  storageKey?: string;

  /** Stale time for cache in milliseconds */
  staleTime?: number;

  /** Error context prefix */
  errorContextPrefix?: string;

  /** Additional query options */
  queryOptions?: Omit<
    UseQueryOptions<PaginatedResponse<T>, Error, PaginatedResponse<T>>,
    "queryKey" | "queryFn" | "select"
  >;
}

/**
 * Hook for fetching and managing lists of entities with schema validation
 */
export function useEntityList<T extends BaseDocument>({
  entityType,
  fetcher,
  schema,
  useSelector: _useSelector = false,
  defaultParams = {},
  staleTime,
  queryOptions = {},
  errorContextPrefix: _errorContextPrefix,
}: UseEntityListConfig<T>): ReturnType<typeof usePagination<T, T>> {
  // Create a transformation function using our unified utilities
  const transformer: ResponseTransformer<T, T> = (
    data: PaginatedResponse<T> | undefined,
  ): PaginatedResponse<T> => {
    if (!data) {
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false,
        success: false,
      };
    }

    // Use existing type guard
    if (!isPaginatedResponse<T>(data)) {
      // Convert non-paginated to paginated format
      const items = Array.isArray(data)
        ? data
        : extractItems(data as CollectionResponse<T>);
      const validatedItems = validateArraySafe(schema, items);
      return {
        items: validatedItems,
        total: validatedItems.length,
        page: 1,
        limit: validatedItems.length || 10,
        totalPages: 1,
        hasMore: false,
        success: true,
      };
    }

    // Transform paginated response
    const items = extractItems(data);
    const validatedItems = validateArraySafe(schema, items);

    return {
      ...data,
      items: validatedItems,
    };
  };

  // Delegate to the base paginated data hook
  return usePagination<T, T>({
    entityType,
    initialParams: defaultParams,
    queryFn: fetcher,
    queryOptions,
    transformFn: transformer,
    staleTime,
  });
}
