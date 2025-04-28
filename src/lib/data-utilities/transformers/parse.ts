import { ZodSchema, z } from "zod";
import { handleServerError } from "@/lib/error/handle-server-error";
import { handleValidationError } from "@/lib/error/handle-validation-error";

// Define type aliases for inferred types
type InferSchema<T extends ZodSchema> = z.infer<T>;
type InferObjectSchema<T extends z.ZodObject<z.ZodRawShape>> = z.infer<T>;

/**
 * Safely parses data against a Zod schema with error logging
 */
export function safeParseAndLog<Schema extends ZodSchema>(
  schema: Schema,
  data: unknown
): InferSchema<Schema> | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(handleValidationError(result.error));
  }
  return result.data;
}

/**
 * Safely parses partial data against a Zod schema with error logging
 */
export function safeParsePartialAndLog<Schema extends z.ZodObject<z.ZodRawShape>>(
  schema: Schema,
  data: unknown
): Partial<InferObjectSchema<Schema>> | null {
  const result = schema.partial().safeParse(data);
  if (!result.success) {
    throw new Error(handleValidationError(result.error));
  }
  return result.data;
}

/**
 * Throws a formatted error if validation fails
 */
export function parseOrThrow<Schema extends ZodSchema>(
  schema: Schema,
  data: unknown
): InferSchema<Schema> {
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
export function parsePartialOrThrow<Schema extends ZodSchema>(
  schema: Schema,
  data: unknown
): Partial<InferSchema<Schema>> {
  try {
    // If it's a Zod object, use partial validation
    if (schema instanceof z.ZodObject) {
      const objectSchema = schema as z.ZodObject<z.ZodRawShape>;
      const result = objectSchema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(handleValidationError(result.error));
      }
      return result.data as Partial<InferSchema<Schema>>;
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