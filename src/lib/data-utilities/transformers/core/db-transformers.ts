import type { HydratedDocument, Document } from "mongoose";
import type { BaseDocument, DocumentInput } from '@core-types/document';

/**
 * Core MongoDB document transformation
 * Converts ObjectIds to strings, adds `id` field, and handles dates
 * DOES NOT perform schema validation
 */
export function transformDocument(value: unknown): Partial<BaseDocument> {
  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(transformDocument) as unknown as Partial<BaseDocument>;
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value as unknown as Partial<BaseDocument>;
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
        out[k] = transformDocument(v);
      }
    }
    
    return out as Partial<BaseDocument>;
  }
  
  // Return all other types as-is
  return value as unknown as Partial<BaseDocument>;
}

/**
 * Transforms MongoDB document to plain object
 * Handles both Mongoose documents and plain objects
 */
export function toPlainObject(doc: unknown): Record<string, unknown> {
  if (!doc) return {};
  
  // Handle Mongoose documents
  if (doc && typeof (doc as { toObject: () => Record<string, unknown> }).toObject === "function") {
    return (doc as { toObject: () => Record<string, unknown> }).toObject();
  }
  
  // Handle lean query results (already plain objects)
  if (doc && typeof doc === "object") {
    return doc as Record<string, unknown>;
  }
  
  // Fallback for non-objects
  return {};
}

/**
 * Transform an array of documents
 * Applies ONLY MongoDB-specific transformations, WITHOUT schema validation
 */
export function transformDocuments<T extends Partial<BaseDocument> = Partial<BaseDocument>>(
  docs: unknown[]
): T[] {
  if (!Array.isArray(docs)) return [] as T[];
  return docs.map(doc => transformDocument(doc) as T);
}

/**
 * Complete document transformation pipeline: 
 * Converts from Mongoose document to transformed plain object
 * DOES NOT perform schema validation
 */
export function processDocument(
  doc: HydratedDocument<Document> | Document | Record<string, unknown> | null | undefined
): Partial<BaseDocument> | null {
  if (!doc) return null;
  
  const plainObj = toPlainObject(doc);
  return transformDocument(plainObj);
}

/**
 * Removes timestamp fields (_id, createdAt, updatedAt) for document creation
 */
export function prepareForCreate<T extends Partial<BaseDocument>>(
  data: T
): DocumentInput<T & BaseDocument> {
  if (data === null || data === undefined) {
    return {} as DocumentInput<T & BaseDocument>;
  }
  
  // Handle arrays - recursively process each item
  if (Array.isArray(data)) {
    return data.map(item => prepareForCreate(item)) as unknown as DocumentInput<T & BaseDocument>;
  }
  
  // Handle objects - remove timestamp fields and process nested objects
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    
    // Process each property in the object
    for (const [key, value] of Object.entries(data)) {
      // Skip MongoDB timestamp and ID fields
      if (['_id', 'id', 'createdAt', 'updatedAt'].includes(key)) {
        continue;
      }
      
      // Recursively process nested objects and arrays
      if (value !== null && typeof value === 'object') {
        result[key] = prepareForCreate(value as Partial<BaseDocument>);
      } else {
        // Keep primitive values as is
        result[key] = value;
      }
    }
    
    return result as DocumentInput<T & BaseDocument>;
  }
  
  // Return primitive values as is
  return data as unknown as DocumentInput<T & BaseDocument>;
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

