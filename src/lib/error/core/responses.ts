// src/lib/error/core/responses.ts

import { 
    ErrorResponse, 
    ErrorContext,
    CollectionErrorResponse, 
    EntityErrorResponse, 
    ApiError
  } from "@error-types";
  import { 
    CollectionResponse, 
    EntityResponse 
  } from "@core-types/response";
  import { logError } from "@error/core/logging";
  import { formatErrorMessage } from "@error/core/transformation";
  
  /**
   * Creates a basic error response
   */
  export function createErrorResponse(message: string): ErrorResponse {
    return {
      success: false,
      error: message
    };
  }
  
  /**
   * Creates a collection error response
   * Uses type assertion to handle the special case of empty items array
   */
  export function createCollectionErrorResponse<T>(
    message: string,
    errors: ApiError[] = []
  ): CollectionErrorResponse<T> {
    // Create a response object that satisfies base structure
    const response: Omit<CollectionResponse<T>, 'items'> & {
      success: false;
      error: string;
      items: never[];
      total: 0;
    } = {
      success: false,
      error: message,
      errors: errors,
      items: [],
      total: 0
    };
  
    // Use type assertion to convert it to the required type
    return response as unknown as CollectionErrorResponse<T>;
  }
  
  /**
   * Creates an entity error response
   * Uses type assertion to handle the special case of null data
   */
  export function createEntityErrorResponse<T>(message: string): EntityErrorResponse<T> {
    // Create a response object that satisfies base structure
    const response: Omit<EntityResponse<T>, 'data'> & {
      success: false;
      error: string;
      data: null;
    } = {
      success: false,
      error: message,
      data: null
    };
  
    // Use type assertion to convert it to the required type
    return response as unknown as EntityErrorResponse<T>;
  }
  
  /**
   * Creates a standardized error response of the appropriate type with proper monitoring
   */
  export function createMonitoredResponse<T>(
    error: unknown,
    context: ErrorContext | string = {},
    options: {
      responseType?: 'entity' | 'collection' | 'base';
      defaultMessage?: string;
      errors?: ApiError[];
    } = {}
  ): ErrorResponse | CollectionErrorResponse<T> | EntityErrorResponse<T> {
    // Convert string context to object
    const errorContext: ErrorContext = typeof context === 'string' 
      ? { component: context } 
      : context;
    
    // Log the error through unified system
    logError(error, errorContext);
    
    // Format error message
    const message = formatErrorMessage(
      error, 
      typeof context === 'string' ? context : undefined
    ) || options.defaultMessage || 'An error occurred';
    
    // Create appropriate response based on type
    switch(options.responseType) {
      case 'collection':
        return createCollectionErrorResponse<T>(message, options.errors || []);
      case 'entity':
        return createEntityErrorResponse<T>(message);
      default:
        return createErrorResponse(message);
    }
  }
  
  // Monitored versions that use the new consolidated function
  export function createMonitoredErrorResponse(
    message: string, 
    error: unknown, 
    context: ErrorContext = {}
  ): ErrorResponse {
    return createMonitoredResponse(error, context, {
      responseType: 'base',
      defaultMessage: message
    });
  }
  
  export function createMonitoredCollectionResponse<T>(
    message: string, 
    error: unknown, 
    context: ErrorContext = {}
  ): CollectionErrorResponse<T> {
    return createMonitoredResponse<T>(error, context, {
      responseType: 'collection',
      defaultMessage: message
    }) as CollectionErrorResponse<T>;
  }
  
  export function createMonitoredEntityResponse<T>(
    message: string, 
    error: unknown, 
    context: ErrorContext = {}
  ): EntityErrorResponse<T> {
    return createMonitoredResponse<T>(error, context, {
      responseType: 'entity',
      defaultMessage: message
    }) as EntityErrorResponse<T>;
  }