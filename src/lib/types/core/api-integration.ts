// src/lib/types/core/api-integration.ts
import { z } from 'zod';
import { 
  ApiRequestConfigZodSchema,
  IntegrationEndpointConfigZodSchema,
  IntegrationResponseMetaZodSchema,
  IntegrationResponseZodSchema
} from '@zod-schema/core-types/api-integration';
import { BaseResponse, CollectionResponse, EntityResponse } from '@core-types/response';

// Derive types from schemas instead of defining interfaces
export type ApiRequestConfig = z.infer<typeof ApiRequestConfigZodSchema>;
export type IntegrationEndpointConfig<TParams = Record<string, unknown>> = 
  z.infer<typeof IntegrationEndpointConfigZodSchema> & {
    defaultParams?: Partial<TParams>;
  };
export type IntegrationResponseMeta = z.infer<typeof IntegrationResponseMetaZodSchema>;
export type IntegrationResponse = z.infer<typeof IntegrationResponseZodSchema>;

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

