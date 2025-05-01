import { NextResponse } from "next/server";
import { handleServerError } from "@/lib/error/handle-server-error";
import { standardizeResponse } from "@api-responses/standardize";
import { FetchParams } from "@/lib/types/core/api";
import { BaseReference } from "@/lib/types/core/reference";

/**
 * Generic type for any fetch function that returns items and total
 */
// Modified type that's more flexible with dates:
export type FetchFunction<T> = (params: FetchParams) => Promise<{
  items: (T | Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt?: string | Date;
    updatedAt?: string | Date;
  })[];
  total: number;
  success: boolean;
  error?: string;
  page?: number;
  limit?: number;
}>;

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
   * Function to transform search terms before querying
   * Useful for case insensitivity, partial matching, etc.
   */
  transformSearchTerm?: (term: string) => string;
}

/**
 * Creates a standardized GET handler for reference data endpoints
 */
export function createReferenceEndpoint<T, R extends BaseReference>(options: ReferenceEndpointOptions<T, R>) {
  const {
    fetchFunction,
    mapItem,
    logPrefix = "API",
    defaultSearchField,
    defaultLimit = 20,
    transformSearchTerm = (term) => term
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
        filters[defaultSearchField] = transformSearchTerm(search);
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

      // Check for fetch errors
      if (!data.success) {
        return NextResponse.json(
          standardizeResponse({
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

      // Return standardized response
      return NextResponse.json(standardizeResponse({
        items: references,
        total: data.total,
        page: data.page || page,
        limit: data.limit || limit,
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