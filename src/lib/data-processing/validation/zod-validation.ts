import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { handleServerError } from '@error/handlers/server';
import { handleValidationError } from '@error/handlers/validation';

/**
 * PURE VALIDATION FUNCTIONS (no MongoDB transformations)
 * MongoDB transformations should be done in db-transformers.ts first
 */

/**
 * Safe validation - returns null on failure, logs warnings
 */
export function validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    const validationError = fromZodError(result.error);
    console.warn('Schema validation failed:', validationError.message);
    console.warn('Input data:', JSON.stringify(data, null, 2));
    return null;
  }
  return result.data;
}

/**
 * Strict validation - throws formatted error on failure
 */
export function validateStrict<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(handleValidationError(error));
    }
    throw new Error(handleServerError(error));
  }
}

/**
 * Partial validation for updates - safe version
 */
export function validatePartialSafe<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): Partial<z.infer<z.ZodObject<T>>> | null {
  const partialSchema = schema.partial();
  return validateSafe(partialSchema, data) as Partial<z.infer<z.ZodObject<T>>> | null;
}

/**
 * Partial validation for updates - strict version
 */
export function validatePartialStrict<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): Partial<z.infer<z.ZodObject<T>>> {
  const partialSchema = schema.partial();
  return validateStrict(partialSchema, data) as Partial<z.infer<z.ZodObject<T>>>;
}

/**
 * Array validation - safe version, filters out failed items
 */
export function validateArraySafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown[]
): T[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(item => validateSafe(schema, item))
    .filter((item): item is T => item !== null);
}

/**
 * Check if data matches schema without parsing (boolean check)
 */
export function matchesSchema<T>(schema: z.ZodSchema<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
}


// BACKWARD COMPATIBILITY - Only keep functions that are actually used
// Based on your grep results, these are the ones that have real usage:
