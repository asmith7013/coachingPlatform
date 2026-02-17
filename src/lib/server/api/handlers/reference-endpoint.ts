import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { BaseReference } from "@core-types/reference";
import { PaginatedResponse } from "@core-types/response";
import { withQueryValidation } from "@server/api/validation/api-validation";
import {
  createCollectionResponse,
  createMonitoredErrorResponse,
} from "@api-responses/action-response-helper";

/**
 * Generic type for any fetch function that returns items and total
 */
export type FetchFunction<T extends Record<string, unknown>> = (
  params: z.infer<typeof QueryParamsZodSchema>,
) => Promise<PaginatedResponse<T>>;

/**
 * Type for mapping functions to transform data items
 */
export type ItemMapFunction<T, R extends BaseReference> = (item: T) => R;

/**
 * Options for the reference endpoint factory
 */
export interface ReferenceEndpointOptions<
  T extends Record<string, unknown>,
  R extends BaseReference,
> {
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
 * Now uses direct collection response creation instead of collectionizeResponse
 */
export function createReferenceEndpoint<
  T extends Record<string, unknown>,
  R extends BaseReference,
>(options: ReferenceEndpointOptions<T, R>) {
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
        page:
          typeof data.page === "string"
            ? parseInt(data.page, 10) || 1
            : data.page || 1,
        limit:
          typeof data.limit === "string"
            ? parseInt(data.limit, 10) || defaultLimit
            : data.limit || defaultLimit,
        // Handle boolean conversions
        ...Object.fromEntries(
          Object.entries(data)
            .filter(
              ([key]) =>
                !["page", "limit", "sortBy", "sortOrder"].includes(key),
            )
            .map(([key, value]) => {
              if (value === "true") return [key, true];
              if (value === "false") return [key, false];
              return [key, value];
            }),
        ),
      };
    }),
  } = options;

  // Define the base handler that processes validated parameters
  const baseHandler = async function (
    validatedParams: z.input<typeof querySchema>,
    req: NextRequest,
  ) {
    const endpoint = req.url.split("?")[0].split("/api/")[1];
    const component = `${logPrefix}/${endpoint}`;

    try {
      // Extract parameters from validated object and convert types
      const params = validatedParams as Record<string, unknown>;
      const {
        page: rawPage = 1,
        limit: rawLimit = defaultLimit,
        sortBy,
        sortOrder = "desc",
        search,
        filters = {},
        ...rest
      } = params;

      // Convert string values to numbers
      const page =
        typeof rawPage === "string" ? parseInt(rawPage, 10) || 1 : rawPage;
      const limit =
        typeof rawLimit === "string"
          ? parseInt(rawLimit, 10) || defaultLimit
          : rawLimit;

      // Combine explicit filters and additional query parameters
      const combinedFilters = {
        ...(filters as Record<string, unknown>),
        // Include other params that aren't standard pagination/sorting
        ...Object.fromEntries(
          Object.entries(rest).filter(
            ([key]) => !["search", "searchFields", "options"].includes(key),
          ),
        ),
      };

      // Special handling for search parameter with defaultSearchField
      if (
        search &&
        defaultSearchField &&
        !combinedFilters[defaultSearchField]
      ) {
        combinedFilters[defaultSearchField] = { $regex: search, $options: "i" };
      }

      console.log(`📥 ${logPrefix} /${endpoint} request:`, {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        filters: combinedFilters,
      });

      // Fetch data using the provided function
      const data = await fetchFunction({
        page: Number(page),
        limit: Number(limit),
        sortBy: (sortBy as string) || "createdAt",
        sortOrder: sortOrder as "asc" | "desc",
        search: search as string | undefined,
        filters: combinedFilters,
        // Include all params for maximum flexibility
        ...rest,
      });

      // Check for fetch errors
      if (!data.success) {
        return NextResponse.json(
          createCollectionResponse(
            [],
            data.error || `Failed to fetch ${endpoint} data`,
          ),
          { status: 400 },
        );
      }

      // Map items to reference format
      const references = data.items.map((item) => mapItem(item as T));

      console.log(
        `📤 ${logPrefix} /${endpoint} response: ${references.length} items found`,
      );

      // Type the data object for safe property access
      const typedData = data as {
        page?: number;
        limit?: number;
        total: number;
        totalPages?: number;
        hasMore?: boolean;
      };

      // Use the response helper to create a consistent collection response
      // Add pagination metadata
      const finalPage = typedData.page || (page as number);
      const finalLimit = typedData.limit || (limit as number);

      const response = {
        ...createCollectionResponse(references),
        page: finalPage,
        limit: finalLimit,
        totalPages:
          typedData.totalPages || Math.ceil(typedData.total / finalLimit),
        hasMore: typedData.hasMore || finalPage * finalLimit < typedData.total,
      };

      return NextResponse.json(response);
    } catch (error) {
      // Use the monitored error response helper
      const errorResponse = createMonitoredErrorResponse(error, {
        component,
        operation: "getReferenceData",
      });

      console.error(`❌ Error in /${endpoint}: ${errorResponse.error}`);

      return NextResponse.json(errorResponse, { status: 500 });
    }
  };

  // Apply query validation to the handler
  return withQueryValidation(querySchema)(baseHandler);
}
