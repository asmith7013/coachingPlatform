import { z } from "zod";

/**
 * Creates a partial version of a Zod schema for CRUD update operations.
 * Makes all fields optional while preserving the schema structure.
 * 
 * @internal Used by CRUD action factory for update operations
 */
export function createPartialSchema(inputSchema: z.ZodTypeAny): z.ZodTypeAny {
  // For ZodObject schemas (most common case)
  if (inputSchema instanceof z.ZodObject) {
    return z.object(
      Object.fromEntries(
        Object.entries(inputSchema.shape).map(([key, value]) => [
          key,
          (value as z.ZodTypeAny).optional()
        ])
      )
    );
  }
  
  // For other schema types that support partial()
  if (typeof (inputSchema as unknown as { partial?: () => z.ZodTypeAny }).partial === 'function') {
    return (inputSchema as unknown as { partial(): z.ZodTypeAny }).partial();
  }
  
  // Fallback - return the original schema if partial isn't supported
  return inputSchema;
} 