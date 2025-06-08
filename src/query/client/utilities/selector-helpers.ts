import { isEntityResponse } from "@/lib/transformers/utils/response-utils";
import { isCollectionResponse } from "@/lib/transformers/utils/response-utils";
import { EntityResponse } from "@/lib/types/core/response";
import { CollectionResponse } from "@/lib/types/core/response";
import { ZodSchema } from "zod";

/**
 * Helper function to get a label for an entity
 * Used for reference selectors when no custom label function is provided
 */
export function getEntityLabel<T extends Record<string, unknown>>(item: T): string {
    if (!item) return '';
    
    // Try common label fields
    for (const field of ['name', 'title', 'label', 'staffName', 'schoolName', 'topic']) {
      if (typeof item[field] === 'string' && item[field]) {
        return item[field] as string;
      }
    }
    
    // Fallback to string representation of ID
    return String(item._id || '');
  }
  
  /**
   * Helper function to create searchable text from an entity
   * Used for the searchable selector variant
   */
  export function getSearchableText<T extends Record<string, unknown>>(item: T): string {
    if (!item) return '';
    
    // Common text fields to include in search
    const searchableFields = [
      'name', 'title', 'label', 'description', 'schoolName', 
      'staffName', 'text', 'topic', 'district', 'primaryStrategy'
    ];
    
    return searchableFields
      .map(field => item[field])
      .filter(value => typeof value === 'string')
      .join(' ')
      .toLowerCase();
  }
  


/**
 * Extracts items from various response formats
 * Handles collection responses, arrays, entity responses, and single items
 * 
 * @param data The data to extract items from (unknown format)
 * @returns An array of items
 */
export function normalizeToArray<T>(data: unknown): T[] {
  if (!data) return [];
  
  if (isCollectionResponse(data)) {
    // Type assertion to inform TypeScript about the structure
    const typedResponse = data as CollectionResponse<T>;
    return typedResponse.items || [];
  }
  
  if (Array.isArray(data)) {
    // Type assertion with type checking
    return data as T[];
  }
  
  if (isEntityResponse(data)) {
    // Type assertion to inform TypeScript about the structure
    const typedResponse = data as EntityResponse<T>;
    return [typedResponse.data];
  }
  
  // For other cases, try to handle single items
  // This is still potentially unsafe, but that's the nature of this function
  return [data as T];
}

export function validateWithSchema<T>(data: unknown[], schema: ZodSchema<T>): T[] {
  return data.map(item => {
    const result = schema.safeParse(item);
    return result.success ? result.data : item as T;
  }).filter(Boolean);
}
