import { handleServerError } from "@core/error/handle-server-error";
import type { HydratedDocument, Document } from "mongoose";
import type { ZodSchema } from "zod";
import type { z } from "zod";

/**
 * Deep‑clone an object while string‑ifying every key named "_id".
 * Works for arbitrarily nested objects + arrays.
 */
function deepSanitize(value: unknown): unknown {
  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value; // Return Date objects as-is
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
        } else if (v && typeof v === 'object' && v.hasOwnProperty('$date')) {
          // Handle MongoDB extended JSON format
          out[k] = new Date(v.$date);
        } else if (typeof v === 'string') {
          out[k] = new Date(v);
        } else {
          out[k] = v;
        }
      } else {
        out[k] = deepSanitize(v);
      }
    }
    
    return out;
  }
  
  // Return all other types as-is
  return value;
}

/**
 * Sanitizes a single document by converting timestamps and _id to strings
 * Returns a sanitized object that matches the Zod schema type
 */
export function sanitizeDocument<Doc extends Document, S extends ZodSchema>(
  doc: HydratedDocument<Doc> | Doc, 
  schema: S
): z.infer<S> {
  try {
    if (!doc) {
      throw new Error('Document is null or undefined');
    }
    
    // Handle plain object vs. Mongoose doc
    const obj = typeof (doc as HydratedDocument<Doc> | Doc & { toObject?: () => Doc }).toObject === "function"
      ? (doc as HydratedDocument<Doc>).toObject()
      : doc;
    
    // Deep sanitize to convert all _id fields to strings recursively
    const sanitized = deepSanitize(obj) as Record<string, unknown>;
    
    // Add id field at top level if not present
    if (obj._id && !sanitized.id) {
      sanitized.id = sanitized._id;
    }
    
    // Validate against schema to ensure type safety
    return schema.parse(sanitized);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error sanitizing document: ${error.message}`);
    }
    throw new Error(handleServerError(error));
  }
}

/**
 * Sanitizes an array of documents by converting timestamps and _id to strings
 * Returns an array of sanitized objects that match the Zod schema type
 */
export function sanitizeDocuments<T extends Record<string, unknown>>(docs: T[]): T[] {
  return docs.map((d) => deepSanitize(d)) as T[];
}

/**
 * Sanitizes filters by removing empty strings, whitespace-only strings, and empty arrays
 */
export function sanitizeFilters(filters: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
  
    for (const [key, value] of Object.entries(filters)) {
      // Skip empty values
      if (value === undefined || value === null) continue;
  
      // Handle strings
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) sanitized[key] = trimmed;
        continue;
      }
  
      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length > 0) sanitized[key] = value;
        continue;
      }
  
      // Handle objects (for nested queries)
      if (typeof value === "object") {
        const sanitizedNested = sanitizeFilters(value as Record<string, unknown>);
        if (Object.keys(sanitizedNested).length > 0) {
          sanitized[key] = sanitizedNested;
        }
        continue;
      }
  
      // Pass through other values
      sanitized[key] = value;
    }
  
    return sanitized;
  }

/**
 * Sanitizes a string by trimming whitespace and removing empty strings
 */
export function sanitizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Sanitizes an array of strings by trimming whitespace and converting to lowercase
 */
export function sanitizeStringArray(arr: string[]): string[] {
  try {
    return arr.map(str => str.trim().toLowerCase());
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 

interface DateRangeQuery {
    $gte?: Date;
    $lte?: Date;
  }
  
  interface MongoQuery {
    [key: string]: unknown | DateRangeQuery;
  }

/**
 * Builds a text search query for MongoDB
 */
export function buildTextSearchQuery(fields: string[], searchTerm: string): Record<string, unknown> {
  if (!searchTerm?.trim()) return {};

  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm.trim(), $options: "i" }
    }))
  };
}

/**
 * Builds a date range query for MongoDB
 */
export function buildDateRangeQuery(
  field: string,
  startDate?: string | Date,
  endDate?: string | Date
): MongoQuery {
  const query: MongoQuery = {};

  if (startDate) {
    query[field] = { $gte: new Date(startDate) };
  }

  if (endDate) {
    // Safely merge the date range query
    const existingQuery = query[field] as DateRangeQuery;
    query[field] = {
      ...(existingQuery || {}),
      $lte: new Date(endDate)
    };
  }

  return query;
}

/**
 * Recursively removes MongoDB timestamp and ID fields from an object and all its nested objects
 * This ensures MongoDB can generate these fields automatically without conflicts
 * 
 * @param data - The object or array to process
 * @returns A new object with all timestamp and ID fields removed at all levels
 */
export function removeTimestampFields<T>(data: T): T {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle arrays - recursively process each item
  if (Array.isArray(data)) {
    return data.map(item => removeTimestampFields(item)) as unknown as T;
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
        result[key] = removeTimestampFields(value);
      } else {
        // Keep primitive values as is
        result[key] = value;
      }
    }
    
    return result as T;
  }
  
  // Return primitive values as is
  return data;
} 