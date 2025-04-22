import { handleServerError } from "@/lib/error/handleServerError";
import type { HydratedDocument, Types } from "mongoose";
import type { ZodSchema } from "zod";
import type { z } from "zod";

// Define type for document with timestamps
interface TimestampedDoc {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

/**
 * Deep‑clone an object while string‑ifying every key named "_id".
 * Works for arbitrarily nested objects + arrays.
 */
function deepSanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === '_id'
        ? (typeof v === 'string' ? v : (v as object)?.toString?.() ?? v)
        : deepSanitize(v);
    }
    return out;
  }
  return value;
}

/**
 * Sanitizes a single document by converting timestamps and _id to strings
 * Returns a sanitized object that matches the Zod schema type
 */
export function sanitizeDocument<T extends TimestampedDoc, S extends ZodSchema>(
  doc: HydratedDocument<T> | T, // <-- allow lean or full doc
  schema: S
): z.infer<S> {
  try {
    if (!doc) {
      throw new Error('Document is null or undefined');
    }
    
    // Handle plain object vs. Mongoose doc
    const obj = typeof (doc as HydratedDocument<T> | T & { toObject?: () => T }).toObject === "function"
      ? (doc as HydratedDocument<T>).toObject()
      : doc;
    
    const typedObj = obj as TimestampedDoc;
    
    // Validate essential fields exist
    if (!typedObj._id) {
      throw new Error('Document missing _id field');
    }
    
    if (!typedObj.createdAt) {
      throw new Error('Document missing createdAt field');
    }
    
    if (!typedObj.updatedAt) {
      throw new Error('Document missing updatedAt field');
    }
    
    const { _id, createdAt, updatedAt, ...rest } = typedObj;
    
    // Create sanitized object with proper type handling
    // Include both _id and id to satisfy Zod schema requirements
    const sanitized = {
      ...rest,
      _id: _id.toString(),
      id: _id.toString(), // Add id field with same value as _id
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt)
    };
    
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
export function sanitizeFilters<T extends Record<string, unknown>>(filters: T): Partial<T> {
  try {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          acc[key as keyof T] = value as T[keyof T];
        }
      } else if (typeof value === "string") {
        if (value.trim().length > 0) {
          acc[key as keyof T] = value as T[keyof T];
        }
      } else if (value !== null && value !== undefined) {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    }, {} as Partial<T>);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
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