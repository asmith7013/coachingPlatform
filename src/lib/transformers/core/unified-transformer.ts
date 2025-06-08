// Simple replacement for over-engineered transformer
// This maintains compatibility while transitioning to direct data usage

import { ZodType } from "zod";
import { sanitizeDocument, sanitizeDocuments } from "@/lib/api/responses/formatters";

export interface TransformOptions {
  schema?: ZodType<unknown>;
  handleDates?: boolean;
  errorContext?: string;
}

/**
 * Simple transform function that just sanitizes documents
 * Replaces the over-engineered transformation system
 */
export function transformData<T>(data: T[], _options?: TransformOptions): T[] {
  if (!Array.isArray(data)) return [];
  return sanitizeDocuments(data);
}

/**
 * Simple single item transform function
 */
export function transformSingleItem<T>(item: T, _options?: TransformOptions): T | null {
  if (!item) return null;
  return sanitizeDocument(item);
}

/**
 * Create a simple transformer (compatibility function)
 */
export function createTransformer<TInput, TOutput>(_options: {
  schema: ZodType<TOutput>;
  handleDates?: boolean;
  errorContext?: string;
}) {
  return {
    transform: (data: TInput[]): TOutput[] => {
      return sanitizeDocuments(data as unknown as TOutput[]);
    },
    transformResponse: (data: TOutput[]): TOutput[] => {
      return sanitizeDocuments(data);
    },
    transformEntity: (data: TOutput): TOutput => {
      return sanitizeDocument(data);
    },
    transformSingle: (data: TOutput): TOutput | null => {
      return sanitizeDocument(data);
    }
  };
}

// Additional compatibility exports
export function transformResponseData<T>(data: T[]): T[] {
  return sanitizeDocuments(data);
}

export function transformEntityData<T>(data: T[]): T[] {
  return sanitizeDocuments(data);
}

export function transformItemsWithSchema<T>(data: T[]): T[] {
  return sanitizeDocuments(data);
}

export function transformItemWithSchema<T>(data: T): T {
  return sanitizeDocument(data);
} 