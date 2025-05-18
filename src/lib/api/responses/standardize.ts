import { CollectionResponse } from '@core-types/response';
import { CollectionResponseSchema } from '@zod-schema/validation/response';


// Updated - Option 1: Add new function with deprecation notice
/**
 * @deprecated Use collectionizeResponse instead
 */
export function standardizeResponse<T = Record<string, unknown>>(data: unknown): CollectionResponse<T> {
  return collectionizeResponse(data);
}

/**
 * Standardizes API responses to ensure consistent format
 * @param data - The data to standardize
 */

export function collectionizeResponse<T = Record<string, unknown>>(data: unknown): CollectionResponse<T> {
  // Handle undefined or null
  if (data === undefined || data === null) {
    return {
      items: [],
      total: 0,
      success: false,
      message: 'No data returned',
    };
  }

  // Handle array responses (convert to items array)
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      total: data.length,
      success: true,
    };
  }

  // Handle object responses
  if (typeof data === 'object') {
    const objectData = data as Record<string, unknown>;
    
    // If data already has 'items' property that's an array, return standardized version
    if (
      'items' in objectData && 
      Array.isArray(objectData.items)
    ) {
      return CollectionResponseSchema.parse(objectData) as CollectionResponse<T>;
    }
    
    // Check if there's any array property that could be items
    const arrayProps = Object.entries(objectData)
      .filter(([_, value]) => Array.isArray(value));
      
    if (arrayProps.length > 0) {
      // Use the first array property as items
      const [propName, propValue] = arrayProps[0];
      return {
        items: propValue as T[],
        total: (propValue as unknown[]).length,
        success: true,
        message: `Auto-converted "${propName}" to items array`,
      };
    }
    
    // If it's an object with no arrays, wrap it in an items array
    return {
      items: [objectData as unknown as T],
      total: 1,
      success: true,
    };
  }

  // Handle primitive responses
  return {
    items: [],
    total: 0,
    success: false,
    message: `Unsupported response type: ${typeof data}`,
  };
}

/**
 * Use this wrapper for API route handlers to ensure standardized responses
 */
export function withCollectionResponse<T, Args extends unknown[]>(
  handler: (...args: Args) => Promise<T | Response> | T | Response
) {
  return async (...args: Args) => {
    try {
      const result = await handler(...args);
      
      // If result is already a Response, return it directly
      if (result instanceof Response) {
        return result;
      }
      
      // Standardize the result
      const standardized = standardizeResponse(result);
      
      // Return as Response
      return Response.json(standardized);
    } catch (error) {
      console.error('API error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return standardized error response
      return Response.json({
        items: [],
        success: false,
        message: errorMessage,
      }, { status: 500 });
    }
  };
} 