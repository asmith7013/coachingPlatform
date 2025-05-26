import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { BaseReference } from "@core-types/reference";
import { PaginatedResponse } from "@core-types/response";
import { withQueryValidation } from "@api-validation/integrated-validation";
import { createCollectionResponse, createMonitoredErrorResponse } from "@api-responses/action-response-helper";
import { collectionizeResponse } from "@api-responses/formatters";

/**
 * Generic type for any fetch function that returns items and total
 */
export type FetchFunction<T> = (params: z.infer<typeof QueryParamsZodSchema>) => 
  Promise<PaginatedResponse<T>>;

/**
 * Type for mapping functions to transform data items
 */
export type ItemMapFunction<T, R extends BaseReference> = (item: T) => R;

/**
 * Options for the reference endpoint factory
 */
export interface ReferenceEndpointOptions<T, R extends BaseReference> {
  /**
   * The fetch function that retrieves the data
   */
  fetchFunction: FetchFunction<T>;
  
  /**
   * Function to map each item to a reference format
   */
  mapItem: ItemMapFunction<T, R>;
  
  /**
   * Log prefix for consistent logging (defaults to "API")
   */
  logPrefix?: string;
  
  /**
   * Default search field (e.g., "schoolName", "staffName")
   */
  defaultSearchField?: string;
  
  /**
   * Default limit for pagination (defaults to 20)
   */
  defaultLimit?: number;

  /**
   * Custom schema for query parameters validation and transformation
   * Extends the base QueryParamsZodSchema
   */
  querySchema?: z.ZodType<z.infer<typeof QueryParamsZodSchema>>;
  
  /**
   * Custom schema for response validation
   * Defaults to a schema based on BaseReferenceZodSchema
   */
  responseSchema?: z.ZodType<PaginatedResponse<R>>;
}

/**
 * Creates a standardized GET handler for reference data endpoints with Zod schema validation
 */
export function createReferenceEndpoint<T, R extends BaseReference>(options: ReferenceEndpointOptions<T, R>) {
  const {
    fetchFunction,
    mapItem,
    logPrefix = "API",
    defaultSearchField,
    defaultLimit = 20,
    // Use provided schemas or create default ones
    querySchema = QueryParamsZodSchema.transform((data) => {
      // Handle type conversion for numeric values from URL parameters
      return {
        ...data,
        page: typeof data.page === 'string' ? parseInt(data.page, 10) || 1 : (data.page || 1),
        limit: typeof data.limit === 'string' ? parseInt(data.limit, 10) || defaultLimit : (data.limit || defaultLimit),
        // Handle boolean conversions
        ...Object.fromEntries(
          Object.entries(data)
            .filter(([key]) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key))
            .map(([key, value]) => {
              if (value === 'true') return [key, true];
              if (value === 'false') return [key, false];
              return [key, value];
            })
        )
      };
    })
  } = options;

  // Define the base handler that processes validated parameters
  const baseHandler = async function(validatedParams: z.infer<typeof querySchema>, req: NextRequest) {
    const endpoint = req.url.split("?")[0].split("/api/")[1];
    const component = `${logPrefix}/${endpoint}`;
    
    try {
      // Extract parameters from validated object
      const { 
        page = 1, 
        limit = defaultLimit, 
        sortBy, 
        sortOrder = 'desc', 
        search, 
        filter,
        filters = {},
        ...rest
      } = validatedParams;
      
      // Combine explicit filters and additional query parameters
      const combinedFilters = {
        ...filters,
        ...(filter || {}),
        // Include other params that aren't standard pagination/sorting
        ...Object.fromEntries(
          Object.entries(rest)
            .filter(([key]) => !['search', 'searchFields', 'options'].includes(key))
        )
      };
      
      // Special handling for search parameter with defaultSearchField
      if (search && defaultSearchField && !combinedFilters[defaultSearchField]) {
        combinedFilters[defaultSearchField] = { $regex: search, $options: 'i' };
      }

      console.log(`📥 ${logPrefix} /${endpoint} request:`, {
        page, limit, sortBy, sortOrder, search, filters: combinedFilters
      });

      // Fetch data using the provided function
      const data = await fetchFunction({
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        search,
        filters: combinedFilters,
        // Include all params for maximum flexibility
        ...rest
      });

      // Check for fetch errors
      if (!data.success) {
        return NextResponse.json(
          collectionizeResponse({
            items: [],
            success: false,
            message: data.error || `Failed to fetch ${endpoint} data`
          }),
          { status: 400 }
        );
      }

      // Map items to reference format
      const references = data.items.map((item) => mapItem(item as T));
      
      console.log(`📤 ${logPrefix} /${endpoint} response: ${references.length} items found`);

      // Use the response helper to create a consistent collection response
      // Add pagination metadata
      const response = {
        ...createCollectionResponse(references),
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil(data.total / (data.limit || limit)),
        hasMore: data.hasMore || ((data.page || page) * (data.limit || limit)) < data.total,
      };

      return NextResponse.json(response);
    } catch (error) {
      // Use the monitored error response helper
      const errorResponse = createMonitoredErrorResponse(
        error,
        { component, operation: 'getReferenceData' }
      );
      
      console.error(`❌ Error in /${endpoint}: ${errorResponse.error}`);
      
      return NextResponse.json(
        errorResponse,
        { status: 500 }
      );
    }
  };

  // Apply query validation to the handler
  return withQueryValidation(
    querySchema,
    baseHandler
  );
}

// /**
//  * Helper function to create a custom query schema for reference endpoints
//  * @param additionalFields Additional fields to add to the base query schema
//  * @returns A new Zod schema that includes standard query params and custom fields
//  */
// export function createReferenceQuerySchema<T extends z.ZodRawShape>(
//   additionalFields: T
// ): z.ZodType<z.infer<typeof QueryParamsZodSchema> & { [k in keyof T]: z.infer<T[k]> }> {
//   const baseSchema = QueryParamsZodSchema.extend(additionalFields);
//   return baseSchema.transform((data) => {
//     type TransformedType = {
//       page: number;
//       limit: number;
//       sortBy: string;
//       sortOrder: 'asc' | 'desc';
//       search?: string;
//       filter?: Record<string, unknown>;
//       filters: Record<string, unknown>;
//       searchFields?: string[];
//       options?: Record<string, unknown>;
//       [key: string]: unknown;
//     };

//     const transformed: TransformedType = {
//       page: Number(data.page) || 1,
//       limit: Number(data.limit) || 20,
//       sortBy: data.sortBy || '',
//       sortOrder: (data.sortOrder || 'desc') as 'asc' | 'desc',
//       search: data.search || undefined,
//       filter: data.filter || undefined,
//       filters: data.filters || {},
//       searchFields: data.searchFields || undefined,
//       options: data.options || undefined,
//     };

//     // Add any additional fields from the extended schema
//     Object.entries(data)
//       .filter(([key]) => !Object.keys(transformed).includes(key))
//       .forEach(([key, value]) => {
//         if (value === 'true') transformed[key] = true;
//         else if (value === 'false') transformed[key] = false;
//         else transformed[key] = value;
//       });

//     return transformed as z.infer<typeof QueryParamsZodSchema> & { [k in keyof T]: z.infer<T[k]> };
//   });
// }

// /**
//  * Helper function to create a custom reference response schema
//  * @param referenceSchema The schema for reference items
//  * @returns A paginated response schema with the specified reference items
//  */
// export function createReferenceResponseSchema<T extends z.ZodRawShape>(
//   referenceSchema: z.ZodObject<T>
// ) {
//   return z.object({
//     success: z.boolean(),
//     items: z.array(referenceSchema),
//     total: z.number(),
//     page: z.number(),
//     limit: z.number(),
//     totalPages: z.number(),
//     hasMore: z.boolean(),
//     message: z.string().optional(),
//     empty: z.boolean().optional()
//   });
// }