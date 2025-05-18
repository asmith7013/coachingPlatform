// src/lib/types/core/api-integration.ts
import { BaseResponse, CollectionResponse, EntityResponse } from './response';

/**
 * Common API request configuration
 */
export interface ApiRequestConfig {
  /** API endpoint URL */
  url: string;
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body (for POST/PUT/PATCH) */
  body?: unknown;
  /** URL parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Integration adapter interface for converting between external and internal data formats
 */
export interface ApiAdapter<TSource, TTarget> {
  /** Convert external API response to standard format */
  fromExternal(externalResponse: TSource): TTarget;
  /** Convert standard format to external API request */
  toExternal?(internalRequest: unknown): unknown;
}

/**
 * Collection adapter interface for adapting external collection responses to our standard format
 * @template TExternal The external API response type
 * @template TInternal The internal entity type
 */
export interface CollectionAdapter<TExternal, TInternal> extends ApiAdapter<TExternal, CollectionResponse<TInternal>> {
  /** Optional method to transform individual items in the collection */
  transformItem?: (item: unknown) => TInternal;
}

/**
 * Entity adapter interface for adapting external entity responses to our standard format
 * @template TExternal The external API response type
 * @template TInternal The internal entity type
 */
export interface EntityAdapter<TExternal, TInternal> extends ApiAdapter<TExternal, EntityResponse<TInternal>> {
  /** Optional method to validate the transformed entity */
  validate?: (entity: TInternal) => boolean;
}

/**
 * Error adapter interface for standardizing external error responses
 * @template TExternal The external API error type
 */
export interface ErrorAdapter<TExternal> extends ApiAdapter<TExternal, BaseResponse> {
  /** Maps external error codes to internal error messages */
  errorCodeMap?: Record<string, string>;
}

/**
 * Configuration for an integration endpoint
 */
export interface IntegrationEndpointConfig<TParams = Record<string, unknown>> {
  /** Base URL for the endpoint */
  baseUrl: string;
  /** Request headers to include with all requests */
  headers?: Record<string, string>;
  /** Default parameters to include with all requests */
  defaultParams?: Partial<TParams>;
  /** Authentication method */
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    tokenKey?: string;
    headerName?: string;
  };
  /** Timeout settings */
  timeout?: number;
}

/**
 * Integration response metadata
 */
export interface IntegrationResponseMeta {
  /** HTTP status code */
  statusCode?: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Request duration in milliseconds */
  duration?: number;
  /** Integration source identifier */
  source?: string;
  /** Raw response size in bytes */
  responseSize?: number;
}

/**
 * Extended base response with integration metadata
 */
export interface IntegrationResponse extends BaseResponse {
  /** Integration metadata */
  meta?: IntegrationResponseMeta;
}