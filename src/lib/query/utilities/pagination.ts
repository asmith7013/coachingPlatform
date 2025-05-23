import { Model, FilterQuery, Document } from "mongoose";
import { ZodSchema } from "zod";
import { useQuery } from "@tanstack/react-query";
import { connectToDB } from "@data-server/db/connection";
import { getSelector } from "@query/selectors/selector-registry";
import { BaseDocument } from "@core-types/document";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { PaginatedResponse } from "@core-types/pagination";
import { CollectionResponse } from "@core-types/response";
import { handleServerError } from "@error/handlers/server";
import { transformDocument } from "@data-utilities/transformers/core/db-transformers";
import { sanitizeSortBy } from "@data-utilities/pagination/sort-utils";

/**
 * Schema-aware paginated query executor that leverages the selector system
 */
export async function executePaginatedQueryWithSelector<T extends BaseDocument>(
  model: Model<Document>,
  filters: FilterQuery<Document>,
  schema: ZodSchema<T>,
  entityType: string,
  options: QueryParams = DEFAULT_QUERY_PARAMS,
  validSortFields: string[] = ['createdAt', 'updatedAt']
): Promise<PaginatedResponse<T>> {
  try {
    // Get the appropriate selector for this entity
    const selector = getSelector<T>(entityType, schema);
    
    // Connect to database
    await connectToDB();
    
    // Apply pagination parameters
    const { page = 1, limit = 20, sortBy: rawSortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    // Sanitize sort field
    const sortBy = sanitizeSortBy(rawSortBy, validSortFields, 'createdAt');
    
    // Build the query
    const query = model.find(filters)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Execute query and count total
    const [rawItems, totalItems] = await Promise.all([
      query.exec(),
      model.countDocuments(filters)
    ]);
    
    // Ensure items is an array
    const itemsArray = Array.isArray(rawItems) ? rawItems : [];
    
    // Perform the base MongoDB document transformation for consistency
    const transformedItems = transformDocument(itemsArray) as unknown[];
    
    // Create a base response
    const baseResponse: CollectionResponse<unknown> = {
      success: true,
      items: transformedItems,
      total: totalItems
    };
    
    // Use the selector to transform the response (applying schema validation and domain transformation)
    const transformResult = selector.paginated(baseResponse);
    
    // Add pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    
    // Return the complete paginated response
    return {
      success: true,
      items: transformResult.items,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      empty: transformResult.items.length === 0
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 20,
      totalPages: 0,
      hasMore: false,
      empty: true,
      error: handleServerError(error)
    };
  }
}

/**
 * Helper function for CRUD operations to fetch paginated resources
 * using the selector-based transformation
 */
export async function fetchPaginatedResourceWithSelector<T extends BaseDocument>(
  model: Model<Document>,
  schema: ZodSchema<T>,
  entityType: string,
  params: QueryParams = DEFAULT_QUERY_PARAMS,
  validSortFields: string[] = ['createdAt', 'updatedAt']
): Promise<PaginatedResponse<T>> {
  const { page = 1, limit = 20, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  return executePaginatedQueryWithSelector(
    model,
    filters,
    schema,
    entityType,
    {
      page,
      limit,
      sortBy,
      sortOrder
    },
    validSortFields
  );
}

/**
 * Helper hook for using paginated queries with React Query
 */
export function createPaginatedQueryHook<T extends BaseDocument>(
  entityType: string,
  schema: ZodSchema<T>,
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T>>,
  defaultParams: Partial<QueryParams> = {}
) {
  return function usePaginatedQuery(customParams: Partial<QueryParams> = {}) {
    const selector = getSelector<T>(entityType, schema);
    const queryParams = { ...DEFAULT_QUERY_PARAMS, ...defaultParams, ...customParams };
    
    const query = useQuery({
      queryKey: [entityType, 'list', queryParams],
      queryFn: () => fetcher(queryParams),
      select: (data: PaginatedResponse<T>) => {
        // Use the selector to ensure consistent transformation
        const transformedData = selector.paginated(data);
        return {
          items: transformedData.items,
          pagination: {
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 10,
            totalPages: data.totalPages || 1,
            hasMore: data.hasMore || false,
            empty: data.empty || false
          }
        };
      }
    });
    
    return {
      data: query.data?.items || [],
      pagination: query.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false,
        empty: true
      },
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch
    };
  };
} 