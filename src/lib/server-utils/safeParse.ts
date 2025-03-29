import { ZodSchema, z } from "zod";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";

/**
 * Safely parses data against a Zod schema with error logging
 */
export function safeParseAndLog<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(handleValidationError(result.error));
  }
  return result.data;
}

/**
 * Safely parses partial data against a Zod schema with error logging
 */
export function safeParsePartialAndLog<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  data: unknown
): Partial<z.infer<T>> | null {
  const result = schema.partial().safeParse(data);
  if (!result.success) {
    throw new Error(handleValidationError(result.error));
  }
  return result.data;
}

/**
 * Throws a formatted error if validation fails
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    const result = safeParseAndLog(schema, data);
    if (result === null) {
      throw new Error("Validation failed: result is null");
    }
    return result;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/**
 * Throws a formatted error if partial validation fails
 * Handles both object and non-object schemas
 */
export function parsePartialOrThrow<T, S extends ZodSchema<T>>(
  schema: S,
  data: unknown
): Partial<T> {
  try {
    // If it's a Zod object, use partial validation
    if (schema instanceof z.ZodObject) {
      const objectSchema = schema as z.ZodObject<z.ZodRawShape>;
      const result = objectSchema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(handleValidationError(result.error));
      }
      return result.data as Partial<T>;
    }
    
    // For non-object schemas, use regular validation
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(handleValidationError(result.error));
    }
    return result.data;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 