import type { BaseDocument } from '@core-types/document';

/**
 * Core MongoDB document transformation - PRESERVES all original fields
 * Converts ObjectIds to strings, adds `id` field, and handles dates
 * DOES NOT perform schema validation
 */
export function transformMongoDocument<T = Record<string, unknown>>(value: unknown): T {
  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(item => transformMongoDocument<T>(item)) as unknown as T;
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value as unknown as T;
  }
  
  // Handle Object IDs and other objects
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    
    for (const [k, v] of Object.entries(value)) {
      if (k === '_id') {
        // Ensure ObjectIds are converted to strings
        out[k] = v?.toString ? v.toString() : v;
        // Add id field at the same level as _id
        if (!('id' in value) && v) {
          out['id'] = v?.toString ? v.toString() : v;
        }
      } else if (k === 'createdAt' || k === 'updatedAt') {
        // Convert date strings or objects to Date objects
        if (v instanceof Date) {
          out[k] = v;
        } else if (v && typeof v === 'object' && 'hasOwnProperty' in v && v.hasOwnProperty('$date')) {
          // Handle MongoDB extended JSON format
          out[k] = new Date((v as { $date: string }).$date);
        } else if (typeof v === 'string') {
          out[k] = new Date(v);
        } else {
          out[k] = v;
        }
      } else {
        // KEY FIX: Recursively process ALL fields, not just BaseDocument fields
        out[k] = Array.isArray(v) || (v && typeof v === 'object') 
          ? transformMongoDocument(v) 
          : v;
      }
    }
    
    return out as T; // Return the full type, not just BaseDocument
  }
  
  // Return all other types as-is
  return value as unknown as T;
}


/**
 * Verifies if an object is a MongoDB document
 */
export function isMongoDocument(value: unknown): value is Partial<BaseDocument> {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in (value as object)
  );
}

