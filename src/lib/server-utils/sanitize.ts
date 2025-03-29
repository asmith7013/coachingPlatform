import { handleServerError } from "@/lib/error/handleServerError";
import type { Document, Types } from "mongoose";
import type { ZodSchema } from "zod";
import type { z } from "zod";

interface TimestampedDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sanitizes a single document by converting timestamps and _id to strings
 * Returns a sanitized object that matches the Zod schema type
 */
export function sanitizeDocument<T extends TimestampedDocument, S extends ZodSchema>(
  doc: T,
  schema: S
): z.infer<S> {
  try {
    const sanitized = doc.toObject();
    sanitized._id = doc._id.toString();
    sanitized.createdAt = doc.createdAt.toISOString();
    sanitized.updatedAt = doc.updatedAt.toISOString();
    
    // Validate against schema to ensure type safety
    return schema.parse(sanitized);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/**
 * Sanitizes an array of documents by converting timestamps and _id to strings
 * Returns an array of sanitized objects that match the Zod schema type
 */
export function sanitizeDocuments<T extends TimestampedDocument, S extends ZodSchema>(
  docs: T[],
  schema: S
): z.infer<S>[] {
  return docs.map(doc => sanitizeDocument(doc, schema));
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
        if (value.trim() !== "") {
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
 * Sanitizes a string by trimming whitespace and converting to lowercase
 */
export function sanitizeString(str: string): string {
  try {
    return str.trim().toLowerCase();
  } catch (error) {
    throw new Error(handleServerError(error));
  }
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