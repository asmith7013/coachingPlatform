import { NextResponse } from "next/server";
import { handleServerError } from "@/lib/core/error/handleServerError";
import { standardizeResponse } from "@/lib/utils/general/server/standardizeResponse";
import { FetchParams } from "@/lib/utils/general/server/fetchPaginatedResource";

/**
 * Generic type for any fetch function that returns items and total
 */
export type FetchFunction<T> = (params: FetchParams) => Promise<{
  items: T[];
  total: number;
  empty: boolean;
}>;

/**
 * Type for mapping functions to transform data items
 */
export type ItemMapFunction<T, R> = (item: T) => R;

/**
 * Options for the reference endpoint factory
 */
export interface ReferenceEndpointOptions<T, R = T> {
  /**
   * The fetch function that retrieves the data
   */
  fetchFunction: FetchFunction<T>;
  
  /**
   * Optional function to map each item before returning
   */
  mapItem?: ItemMapFunction<T, R>;
  
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
}

/**
 * Creates a standardized GET handler for reference data endpoints
 */
export function createReferenceEndpoint<T, R = T>(options: ReferenceEndpointOptions<T, R>) {
  const {
    fetchFunction,
    mapItem,
    logPrefix = "API",
    defaultSearchField,
    defaultLimit = 20
  } = options;

  return async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const endpoint = req.url.split("?")[0].split("/api/")[1];

      // Extract common query parameters
      const search = searchParams.get("search") ?? undefined;
      const limit = Number(searchParams.get("limit") ?? defaultLimit);
      const page = Number(searchParams.get("page") ?? 1);
      const sortBy = searchParams.get("sortBy") ?? undefined;
      const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | undefined;

      // Build filters object
      const filters: Record<string, unknown> = {};
      
      // Add search filter if provided and defaultSearchField is set
      if (search && defaultSearchField) {
        filters[defaultSearchField] = search;
      }
      
      // Add any additional filters from query params
      searchParams.forEach((value, key) => {
        // Skip standard pagination/sorting params
        if (!["search", "limit", "page", "sortBy", "sortOrder"].includes(key)) {
          filters[key] = value;
        }
      });

      console.log(`📥 ${logPrefix} /${endpoint} request received with search: "${search}", limit: ${limit}, filters:`, filters);

      // Fetch data using the provided function
      const data = await fetchFunction({ 
        limit, 
        page,
        filters,
        sortBy,
        sortOrder
      });

      // Map items if mapping function is provided
      const items = mapItem 
        ? data.items.map(mapItem)
        : data.items;
      
      console.log(`📤 ${logPrefix} /${endpoint} response: ${items.length} items found`);

      // Return standardized response
      return NextResponse.json(standardizeResponse({
        items,
        total: data.total,
        page,
        limit,
        success: true
      }));
    } catch (error) {
      const errorMessage = handleServerError(error);
      console.error(`❌ Error in /${req.url.split("/api/")[1]}: ${errorMessage}`);
      
      return NextResponse.json(
        standardizeResponse({
          items: [],
          success: false,
          message: errorMessage
        }),
        { status: 500 }
      );
    }
  };
} 