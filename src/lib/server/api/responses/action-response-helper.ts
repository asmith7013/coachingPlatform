// src/lib/api/responses/response-helpers.ts
import { 
    BaseResponse, 
    CollectionResponse,
    EntityResponse 
  } from '@core-types/response';
  import { createErrorResponse } from '@error/core/responses';
  import { captureError, createErrorContext, handleServerError } from '@error';
  
  /**
   * Creates a success response for a collection
   */
  export function createCollectionResponse<T>(
    items: T[], 
    message?: string
  ): CollectionResponse<T> {
    return {
      success: true,
      items,
      total: items.length,
      empty: items.length === 0,
      message
    };
  }
  
  /**
   * Creates a success response for a single entity
   */
  export function createEntityResponse<T>(
    data: T, 
    message?: string
  ): EntityResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }
  
  /**
   * Creates an error response with error monitoring integration
   * 
   * @param error - The error to format
   * @param context - Optional context information (component/operation)
   * @param status - HTTP status code (defaults to 500)
   */
  export function createMonitoredErrorResponse(
    error: unknown,
    context?: string | { component?: string; operation?: string },
  ): BaseResponse {
    // Format the context properly
    const errorContext = typeof context === 'string' 
      ? createErrorContext(context, 'api-response') 
      : createErrorContext(
          context?.component || 'api-response',
          context?.operation || 'create-response'
        );
    
    // Capture the error with monitoring
    captureError(error, errorContext);
    
    // Process the error message with standardized handler
    const errorMessage = handleServerError(error);
    
    // Create the standardized error response
    return createErrorResponse(errorMessage);
  }
  