// src/lib/server/api/handlers/reference/endpoint-factory.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { BaseDocument } from "@core-types/document";
import { BaseReference } from "@core-types/reference";
import { QueryParams } from "@core-types/query";
import { CollectionResponse } from "@core-types/response";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { withQueryValidation } from "@/lib/server/api/validation/api-validation";
import { createTransformer } from "@transformers/core/unified-transformer";
import { createReferenceTransformer } from "@transformers/factories/reference-factory";
import { createMonitoredErrorResponse } from "@error/core/responses";
import { createMongoDBFilter } from "@server/db/mongodb-query-utils";
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";
import { z } from "zod";

/**
 * Configuration for creating reference endpoints using unified transformation system
 */
export interface ReferenceEndpointConfig<T extends BaseDocument, R extends BaseReference> {
  /** Function to fetch raw data from database */
  fetchFunction: (params: QueryParams) => Promise<CollectionResponse<unknown>>;
  
  /** Schema for validating and transforming fetched documents */
  schema: ZodSchema<T>;
  
  /** Function to extract label from entity */
  getLabelFn: (entity: T) => string;
  
  /** Optional function to add additional reference fields */
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>;
  
  /** Reference schema for validation (optional) */
  referenceSchema?: ZodSchema<R>;
  
  /** Default field to search on */
  defaultSearchField?: string;
  
  /** Log prefix for debugging */
  logPrefix?: string;
  
  /** Custom query schema (defaults to QueryParamsZodSchema) */
  querySchema?: ZodSchema<QueryParams>;
  
  /** Whether to enable strict validation */
  strictValidation?: boolean;
  
  /** Whether to skip caching */
  skipCache?: boolean;
}

/**
 * Creates a standardized GET handler for reference data endpoints
 * Uses unified transformation system for consistent data processing
 */
export function createReferenceEndpoint<T extends BaseDocument, R extends BaseReference>(
  config: ReferenceEndpointConfig<T, R>
) {
  const {
    fetchFunction,
    schema,
    getLabelFn,
    getAdditionalFields,
    referenceSchema,
    defaultSearchField,
    logPrefix = "ReferenceAPI",
    querySchema = QueryParamsZodSchema,
    strictValidation = false,
    skipCache = false
  } = config;

  // Create reference transformer using the factory
  const referenceTransformer = createReferenceTransformer<T, R>(
    getLabelFn,
    getAdditionalFields,
    referenceSchema
  );

  // Create unified transformer with proper configuration
  const transformer = createTransformer<T, R>({
    schema: ensureBaseDocumentCompatibility<T>(schema),
    handleDates: true,
    domainTransform: referenceTransformer,
    strictValidation,
    skipCache,
    errorContext: logPrefix
  });

  return withQueryValidation(querySchema)(
    async (validatedParams: z.input<typeof querySchema>, request: NextRequest) => {
      const endpoint = extractEndpointName(request.url);
      const component = `${logPrefix}/${endpoint}`;
      
      try {
        // Apply search filters using centralized utility
        const enrichedParams = applySearchFilters(validatedParams as QueryParams, defaultSearchField);
        
        logRequest(logPrefix, endpoint, enrichedParams);

        // Fetch raw data
        const rawResponse = await fetchFunction(enrichedParams);

        if (!rawResponse.success) {
          return NextResponse.json(
            createMonitoredErrorResponse(
              rawResponse.error || 'Fetch failed',
              new Error(rawResponse.error || 'Fetch failed'),
              { component, operation: 'fetchData' }
            ),
            { status: 500 }
          );
        }

        // Transform data through unified pipeline
        // This handles the full transformation pipeline:
        // 1. MongoDB document transformation
        // 2. Schema validation
        // 3. Date field processing
        // 4. Reference format transformation
        const transformedResponse = transformer.transformResponse(rawResponse);

        if (!transformedResponse.success) {
          return NextResponse.json(
            createMonitoredErrorResponse(
              transformedResponse.error || 'Transformation failed',
              new Error(transformedResponse.error || 'Transformation failed'),
              { component, operation: 'transformData' }
            ),
            { status: 500 }
          );
        }

        logResponse(logPrefix, endpoint, transformedResponse.items.length);

        // Return the already properly formatted response
        return NextResponse.json(transformedResponse);

      } catch (error) {
        console.error(`❌ ${component} error:`, error);
        return NextResponse.json(
          createMonitoredErrorResponse(
            'Reference endpoint error',
            error,
            { component, operation: 'handleRequest' }
          ),
          { status: 500 }
        );
      }
    }
  );
}

/**
 * Utility functions for the reference endpoint
 */

function extractEndpointName(url: string): string {
  return url.split("?")[0].split("/api/")[1] || 'unknown';
}

function applySearchFilters(params: QueryParams, defaultSearchField?: string): QueryParams {
  if (!params.search || !defaultSearchField) {
    return params;
  }

  return {
    ...params,
    filters: {
      ...params.filters,
      ...createMongoDBFilter(params as Required<QueryParams>, defaultSearchField)
    }
  };
}

function logRequest(logPrefix: string, endpoint: string, params: QueryParams): void {
  console.log(`📥 ${logPrefix} /${endpoint} request:`, {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    search: params.search,
    filters: Object.keys(params.filters || {})
  });
}

function logResponse(logPrefix: string, endpoint: string, itemCount: number): void {
  console.log(`📤 ${logPrefix} /${endpoint} response: ${itemCount} items transformed`);
}
