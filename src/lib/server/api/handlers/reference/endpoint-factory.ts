// src/lib/api/handlers/reference/endpoint-factory.ts

import { NextRequest, NextResponse } from "next/server";
import { ReferenceEndpointOptions } from "@api-handlers/reference/types";
import { handleReferenceError, handleFetchError } from "@api-handlers/reference/error-handler";
import { BaseReference } from "@core-types/reference";
import { parseQueryParams } from "@api-validation/parse-query";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { createMongoDBFilter } from "@server/db/mongodb-query-utils";
import { QueryParams } from "@core-types/query";
import { formatSuccessResponse } from "@api-handlers/reference/response-factory";

/**
 * Creates a standardized GET handler for reference data endpoints
 * using Next.js's searchParams and Zod for validation
 */
export function createReferenceEndpoint<T extends Record<string, unknown>, R extends BaseReference>(
  options: ReferenceEndpointOptions<T, R>
) {
  const {
    fetchFunction,
    mapItem,
    logPrefix = "API",
    defaultSearchField,
    // defaultLimit = 20,
    querySchema = QueryParamsZodSchema // Use the base schema by default
  } = options;

  return async function(request: NextRequest) {
    const endpoint = request.url.split("?")[0].split("/api/")[1];
    const component = `${logPrefix}/${endpoint}`;
    
    try {
      // Extract search parameters from URL
      const url = new URL(request.url);
      const searchParams = Object.fromEntries(url.searchParams.entries());
      
      // Use parseQueryParams to validate and transform searchParams
      const validatedParams = parseQueryParams(searchParams, querySchema) as QueryParams;
      
      // Apply search filters if needed
      if (validatedParams.search && defaultSearchField) {
        validatedParams.filters = createMongoDBFilter(
          validatedParams as Required<QueryParams>, 
          defaultSearchField
        );
      }
      
      console.log(`📥 ${logPrefix} /${endpoint} request:`, {
        page: validatedParams.page,
        limit: validatedParams.limit,
        sortBy: validatedParams.sortBy,
        sortOrder: validatedParams.sortOrder,
        search: validatedParams.search,
        filters: Object.keys(validatedParams.filters || {})
      });

      // Fetch data using the provided function
      const data = await fetchFunction(validatedParams);

      // Check for fetch errors
      if (!data.success) {
        return handleFetchError(data.error, endpoint);
      }

      console.log(`📤 ${logPrefix} /${endpoint} response: ${data.items.length} items found`);

      // Format and return the response with proper type assertion
      return NextResponse.json(
        formatSuccessResponse(data, (item) => mapItem(item as unknown as T), validatedParams.page, validatedParams.limit)
      );
    } catch (error) {
      return handleReferenceError(error, component);
    }
  };
}