// src/lib/types/data-access/react-query.ts
import { z } from 'zod';
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, EntityResponse, PaginatedResponse } from '@core-types/response';
import { ErrorContext } from '@core-types/error';
import { QueryParams } from '@core-types/pagination';

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
  fullSchema: z.ZodType<T>;
  
  /** Zod schema for input entity */
  inputSchema: z.ZodType<TInput>;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
}

/**
 * Result of list query hook
 * Standardizes naming with React Query's useQuery result
 */
export interface ListQueryResult<T> {
  /** Array of entities */
  items: T[];
  
  /** Total number of entities */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Items per page */
  pageSize: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether there are more pages */
  hasMore: boolean;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  isError: boolean;
  
  /** Error object if any */
  error: Error | null;
  
  /** Function to refetch data */
  refetch: () => Promise<unknown>;
  
  /** Current filters */
  filters: Record<string, unknown>;
  
  /** Current search term */
  search: string;
  
  /** Current sort field */
  sortBy: string;
  
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  
  /** Function to set page */
  setPage: (page: number) => void;
  
  /** Function to set page size */
  setPageSize: (pageSize: number) => void;
  
  /** Function to set search term */
  setSearch: (search: string) => void;
  
  /** Function to apply filters */
  applyFilters: (filters: Record<string, unknown>) => void;
  
  /** Function to change sorting */
  changeSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  
  /** Raw query parameters */
  queryParams: QueryParams;
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
 * Creates an error context object for query operations
 * 
 * @param entityType The entity type (e.g., 'schools')
 * @param operation The operation being performed
 * @param additionalContext Additional context information
 * @returns An error context object
 */
export function createQueryErrorContext(
  entityType: string,
  operation: string,
  additionalContext: Partial<ErrorContext> = {}
): ErrorContext {
  return {
    component: `${entityType}Query`,
    operation,
    ...additionalContext
  };
}


  // Instead of redefining PaginationQueryParams, use the existing type
export interface ReactQueryHookConfig {
  /** Entity type name for query key generation */
  entityType: string;
  
  /** Default sorting and filtering options */
  defaultParams?: Partial<QueryParams>;
}