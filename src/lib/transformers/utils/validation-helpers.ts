import { ZodSchema } from 'zod';
import { validateSafe } from '@transformers/core/validation';
import { handleClientError } from '@error/handlers/client';

/**
 * Validates JSON string against schema with enhanced error handling
 * Reuses existing validateSafe from transformer core
 */
export function validateJsonString<T>(
  jsonString: string,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = validateSafe(schema, parsed);
    
    if (!validated) {
      return { 
        success: false, 
        error: 'Invalid data format. Please check required fields and data types.' 
      };
    }
    
    return { success: true, data: validated };
  } catch (error) {
    const errorMessage = handleClientError(error, 'validateJsonString');
    return { 
      success: false, 
      error: error instanceof SyntaxError ? 'Invalid JSON format' : errorMessage
    };
  }
}

/**
 * Validates array of items with partial success support
 * Uses existing validateSafe for individual items
 */
export function validateArrayWithPartialSuccess<T>(
  data: unknown[],
  schema: ZodSchema<T>
): { success: true; data: T[]; validCount: number; totalCount: number } | { success: false; error: string } {
  try {
    if (!Array.isArray(data)) {
      return { success: false, error: 'Data must be an array' };
    }
    
    // Use existing validateSafe for each item
    const validatedItems = data
      .map(item => validateSafe(schema, item))
      .filter((item): item is T => item !== null);
    
    if (validatedItems.length === 0) {
      return { 
        success: false, 
        error: 'No valid items found. Please check required fields and data types.' 
      };
    }
    
    return { 
      success: true, 
      data: validatedItems,
      validCount: validatedItems.length,
      totalCount: data.length
    };
  } catch (error) {
    const errorMessage = handleClientError(error, 'validateArrayWithPartialSuccess');
    return { success: false, error: errorMessage };
  }
}

/**
 * Factory function for creating type-specific validators
 * Follows transformer factory pattern
 */
export function createValidator<T>(schema: ZodSchema<T>, entityName: string) {
  return {
    validateSingle: (jsonString: string) => validateJsonString(jsonString, schema),
    validateArray: (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString);
        const dataArray = Array.isArray(parsed) ? parsed : [parsed];
        return validateArrayWithPartialSuccess(dataArray, schema);
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof SyntaxError ? 'Invalid JSON format' : `${entityName} validation failed`
        };
      }
    }
  };
} 