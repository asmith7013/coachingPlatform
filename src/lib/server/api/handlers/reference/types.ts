// src/lib/api/handlers/reference/types.ts

import { z } from "zod";
import { PaginatedResponse, CollectionResponse } from "@core-types/response";
import { QueryParams } from "@core-types/query";
import { BaseReference } from "@core-types/reference";

/**
 * Generic type for any fetch function that returns items and total
 */
export type FetchFunction<T extends Record<string, unknown>> = (
  params: QueryParams
) => Promise<PaginatedResponse<T> | CollectionResponse<T>>;

/**
 * Type for mapping functions to transform data items
 */
export type ItemMapFunction<T, R extends BaseReference> = (item: T) => R;

/**
 * Options for the reference endpoint factory
 */
export interface ReferenceEndpointOptions<T extends Record<string, unknown>, R extends BaseReference> {
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
  querySchema?: z.ZodType<QueryParams>;
  
  /**
   * Custom schema for response validation
   * Defaults to a schema based on BaseReferenceZodSchema
   */
  responseSchema?: z.ZodType<PaginatedResponse<R>>;
}