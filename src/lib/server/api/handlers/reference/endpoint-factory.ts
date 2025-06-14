// src/lib/server/api/handlers/reference/endpoint-factory.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { BaseDocument } from "@core-types/document";
import { BaseReference } from "@core-types/reference";
import { QueryParams } from "@core-types/query";
import { CollectionResponse } from "@core-types/response";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";
import { withQueryValidation } from "@/lib/server/api/validation/api-validation";
import { createMonitoredErrorResponse } from "@error/core/responses";
import { createMongoDBFilter } from "@server/db/mongodb-query-utils";
import { z } from "zod";

/**
 * Configuration for creating reference endpoints with simple data operations
 */
export interface ReferenceEndpointConfig<T extends BaseDocument, R extends BaseReference> {
  /** Function to fetch raw data from database */
  fetchFunction: (params: QueryParams) => Promise<CollectionResponse<unknown>>;
  
  /** Schema for validating fetched documents */
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
 * Simple reference transformer function
 */
function transformToReference<T extends BaseDocument, R extends BaseReference>(
  entity: T,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
): R {
  const baseRef = {
    _id: entity._id,
    value: entity._id,
    label: getLabelFn(entity)
  };

  const additionalFields = getAdditionalFields ? getAdditionalFields(entity) : {};
  
  return { ...baseRef, ...additionalFields } as R;
}

/**
 * Creates a standardized GET handler for reference data endpoints
 * Uses simple data operations instead of complex transformations
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
    strictValidation = false
  } = config;

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

        // Simple data transformation pipeline:
        // 1. Use items as returned (should already be transformed by toJSON)
        const sanitizedItems = (rawResponse.items || []) as T[];
        
        // 2. Validate with schema if strict validation enabled
        let validatedItems = sanitizedItems;
        if (strictValidation && schema) {
          validatedItems = sanitizedItems.map(item => {
            const result = schema.safeParse(item);
            return result.success ? result.data : item;
          }).filter(Boolean) as T[];
        }

        // 3. Transform to reference format
        const referenceItems = validatedItems.map(item => 
          transformToReference<T, R>(item, getLabelFn, getAdditionalFields)
        );

        // 4. Validate reference format if schema provided
        let finalItems = referenceItems;
        if (referenceSchema) {
          finalItems = referenceItems.map(item => {
            const result = referenceSchema.safeParse(item);
            return result.success ? result.data : item;
          }).filter(Boolean) as R[];
        }

        const transformedResponse: CollectionResponse<R> = {
          items: finalItems,
          total: finalItems.length,
          success: true
        };

        logResponse(logPrefix, endpoint, transformedResponse.items.length);

        // Return the properly formatted response
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
