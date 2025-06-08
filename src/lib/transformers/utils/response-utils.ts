import { CollectionResponse, EntityResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/response';
import { BaseDocument } from '@/lib/schema/zod-schema/base-schemas';
import { ZodSchema } from 'zod';

/**
 * Extracts items from a response
 */
export function extractItems<T>(response: CollectionResponse<T> | null | undefined): T[] {
  return response?.items || [];
}

/**
 * Type helper that ensures compatibility between Zod schemas and BaseDocument
 * This acts as a bridge without changing the core BaseDocument constraint
 */
export function ensureBaseDocumentCompatibility<T extends BaseDocument>(
  schema: ZodSchema<unknown>
): ZodSchema<T> {
  // This is just a type assertion function - no runtime changes
  return schema as ZodSchema<T>;
}

/**
 * Extracts pagination information from a response
 */
export function extractPagination<T>(response: PaginatedResponse<T> | null | undefined): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  empty: boolean;
} {
  return {
    total: response?.total || 0,
    page: response?.page || 1,
    limit: response?.limit || 10,
    totalPages: response?.totalPages || 1,
    hasMore: response?.hasMore || false,
    empty: response?.empty || (response?.items?.length === 0)
  };
}

/**
 * Extracts data from an entity response
 */
export function extractData<T>(response: EntityResponse<T> | null | undefined): T | null {
  return response?.data || null;
}

/**
 * Type guard for collection responses
 */
export function isCollectionResponse<T>(response: unknown): response is CollectionResponse<T> {
  return Boolean(
    typeof response === 'object' &&
    response !== null &&
    'items' in response &&
    'success' in response &&
    Array.isArray((response as CollectionResponse<T>).items)
  );
}

/**
 * Type guard for paginated responses
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return Boolean(
    isCollectionResponse<T>(response) &&
    'page' in response &&
    'limit' in response &&
    'totalPages' in response
  );
}

/**
 * Type guard for entity responses
 */
export function isEntityResponse<T>(response: unknown): response is EntityResponse<T> {
  return Boolean(
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  );
}

/**
 * Processes dates in an entity according to options
 * Extracted for better separation of concerns
 */
interface SimpleDateOptions {
  handleDates?: boolean;
  dateFields?: string[];
}

export function processDateFields<T extends BaseDocument>(
  entity: T, 
  options: SimpleDateOptions
): T {
  if (!options.handleDates) return entity;
  
  const dateFields = options.dateFields || ['createdAt', 'updatedAt'];
  const result = { ...entity } as T;
  
  for (const field of dateFields) {
    const value = entity[field as keyof T];
    if (value !== undefined && typeof value === 'string') {
      (result as Record<string, unknown>)[field] = new Date(value);
    } else if (value !== undefined && value instanceof Date) {
      (result as Record<string, unknown>)[field] = value;
    }
  }
  
  return result;
}

/**
 * Validates and standardizes server response format
 * Extends existing response utilities with validation
 */
export function validateServerResponse<T>(
  response: unknown
): { success: true; data: T[]; items?: T[] } | { success: false; error: string } {
  try {
    if (!response || typeof response !== 'object') {
      return { success: false, error: 'Invalid server response format' };
    }
    
    const responseObj = response as { 
      success?: boolean; 
      items?: T[]; 
      data?: T; 
      error?: string;
      _id?: string;
    };
    
    if (!responseObj.success) {
      return { success: false, error: responseObj.error || 'Server operation failed' };
    }
    
    // Handle different response formats using existing patterns
    let items: T[] = [];
    if (responseObj.items && Array.isArray(responseObj.items)) {
      items = responseObj.items;
    } else if (responseObj.data) {
      items = [responseObj.data];
    } else if (responseObj._id) {
      items = [responseObj as unknown as T];
    }
    
    return { success: true, data: items, items };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server response validation failed';
    return { success: false, error: errorMessage };
  }
}
