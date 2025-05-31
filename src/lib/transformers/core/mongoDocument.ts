import type { BaseDocument } from '@core-types/document';

/**
 * Core MongoDB document transformation - PRESERVES all original fields
 * Converts ObjectIds to strings, adds `id` field, and handles dates
 * DOES NOT perform schema validation
 */
export function transformMongoDocument<T = Record<string, unknown>>(
  value: unknown,
  pathStack: string[] = []
): T {
  // Handle primitives and null/undefined
  if (value === null || value === undefined || typeof value !== 'object') {
    return value as unknown as T;
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value as unknown as T;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item, index) => 
      transformMongoDocument<T>(item, [...pathStack, `[${index}]`])
    ) as unknown as T;
  }
  
  // For objects, check if we're in a potential circular reference by path
  const currentPath = pathStack.join('.');
  if (pathStack.length > 10) { // Reasonable depth limit
    console.warn(`Deep nesting detected at path: ${currentPath}`);
    return { _deepNesting: true, _path: currentPath } as unknown as T;
  }
  
  const out: Record<string, unknown> = {};
  
  for (const [k, v] of Object.entries(value)) {
    const newPath = [...pathStack, k];
    
    if (k === '_id') {
      // Handle ObjectId conversion
      const idStr = v?.toString?.() || String(v || '');
      out[k] = idStr;
      // Add id field if not present
      if (!('id' in value) && idStr) {
        out['id'] = idStr;
      }
    } else if (k === 'createdAt' || k === 'updatedAt') {
      // Handle timestamps
      if (v instanceof Date) {
        out[k] = v;
      } else if (typeof v === 'string') {
        out[k] = new Date(v);
      } else if (v && typeof v === 'object' && '$date' in v) {
        out[k] = new Date((v as { $date: string }).$date);
      } else {
        out[k] = v;
      }
    } else {
      // Recursively transform other fields
      out[k] = transformMongoDocument(v, newPath);
    }
  }
  
  return out as T;
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

