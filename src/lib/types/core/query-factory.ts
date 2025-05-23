// src/lib/types/data-access/react-query.ts
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/pagination';
import { ErrorContext } from '@error-types';
import { QueryParams } from '@core-types/query';
import { ZodSchema } from 'zod';

/**
 * Base configuration for React Query hooks
 */
export interface ReactQueryHookConfig {
  /** Entity type name for query key generation */
  entityType: string;
  
  /** Default sorting and filtering options */
  defaultParams?: Partial<QueryParams>;
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Whether to persist filter state */
  persistFilters?: boolean;
  
  /** Storage key for persisting filters */
  storageKey?: string;
  
  /** Stale time for queries in ms */
  staleTime?: number;
  
  /** Related entity types to invalidate on mutations */
  relatedEntityTypes?: string[];
  
  /** Error context prefix for error reporting */
  errorContextPrefix?: string;
  
  /** Additional React Query options */
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;
  
  /** Additional mutation options */
  mutationOptions?: Omit<UseMutationOptions, 'mutationFn'>;
}

/**
 * Server actions for entity operations
 */
export interface ServerActions<T, TInput> {
  /** Function to fetch list of entities */
  fetch: (params: QueryParams) => Promise<CollectionResponse<T> | PaginatedResponse<T>>;
  
  /** Function to fetch single entity by ID */
  fetchById?: (id: string) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  
  /** Function to create a new entity */
  create?: (data: TInput) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  
  /** Function to update an existing entity */
  update?: (id: string, data: Partial<TInput>) => Promise<CollectionResponse<T> | EntityResponse<T>>;
  
  /** Function to delete an entity */
  delete?: (id: string) => Promise<CollectionResponse<unknown> | EntityResponse<unknown>>;
}

/**
 * Schema-validated hook configuration
 */
export interface SchemaHookConfig<T extends BaseDocument, TInput> extends ReactQueryHookConfig {
  /** Zod schema for full entity */
  fullSchema: ZodSchema<T>;
  
  /** Zod schema for input entity */
  inputSchema: ZodSchema<TInput>;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
}

/**
 * Enhanced ListQueryResult with proper typing
 */
export interface ListQueryResult<T> {
  // Data
  items: T[];
  
  // Pagination
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  
  // Filtering and sorting
  filters: Record<string, unknown>;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Query state
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: Record<string, unknown>) => void;
  changeSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  
  // Query parameters for debugging/advanced usage
  queryParams: Record<string, unknown>;
  
  // Raw query for advanced use cases
  query: {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

/**
 * Result of detail query hook
 */
export interface DetailQueryResult<T> {
  /** Entity data */
  data: T | undefined;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  isError: boolean;
  
  /** Error object if any */
  error: Error | null;
  
  /** Function to refetch data */
  refetch: () => Promise<unknown>;
}

/**
 * Result of mutations hook with consistent naming
 */
export interface MutationsResult<T, TInput> {
  /** Function to create entity */
  create: ((data: TInput) => void) | null;
  
  /** Async function to create entity */
  createAsync: ((data: TInput) => Promise<T | undefined>) | null;
  
  /** Function to update entity */
  update: ((id: string, data: Partial<TInput>) => void) | null;
  
  /** Async function to update entity */
  updateAsync: ((id: string, data: Partial<TInput>) => Promise<T | undefined>) | null;
  
  /** Function to delete entity */
  delete: ((id: string) => void) | null;
  
  /** Async function to delete entity */
  deleteAsync: ((id: string) => Promise<unknown>) | null;
  
  /** Whether create operation is in progress */
  isCreating: boolean;
  
  /** Whether update operation is in progress */
  isUpdating: boolean;
  
  /** Whether delete operation is in progress */
  isDeleting: boolean;
  
  /** Error from create operation */
  createError: Error | null;
  
  /** Error from update operation */
  updateError: Error | null;
  
  /** Error from delete operation */
  deleteError: Error | null;
}

/**
 * Combined result of entity hooks
 */
export interface EntityResult<T extends BaseDocument, TInput> extends 
  Omit<ListQueryResult<T>, 'refetch'>, 
  Omit<MutationsResult<T, TInput>, ''> {
  /** Function to refetch data */
  refetch: () => Promise<unknown>;
}

/**
 * Creates an error context for query operations
 */
export function createQueryErrorContext(
  component: string,
  operation: string,
  context: {
    metadata?: Record<string, unknown>;
    tags?: Record<string, string>;
  } = {}
): ErrorContext {
  return {
    component,
    operation,
    metadata: context.metadata,
    tags: context.tags
  };
}


  // Instead of redefining PaginationQueryParams, use the existing type
export interface ReactQueryHookConfig {
  /** Entity type name for query key generation */
  entityType: string;
  
  /** Default sorting and filtering options */
  defaultParams?: Partial<QueryParams>;
}