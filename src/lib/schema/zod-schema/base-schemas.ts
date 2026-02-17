// src/lib/data-schema/zod-schema/shared/base-schemas.ts
import { z, ZodSchema } from "zod";
// import { zDateField } from '@zod-schema/shared/dateHelpers';

// === SIMPLE BASE BUILDING BLOCKS ===
/**
 * Common document fields that most entities share
 * Keep this minimal and focused
 */
export const BaseDocumentSchema = z.object({
  _id: z.string().describe("Unique document identifier"),
  id: z.string().optional().describe("Client-side ID (mirrors _id)"),
  ownerIds: z
    .array(z.string())
    .default([])
    .describe("User IDs who own this document"),
  createdAt: z.string().optional().describe("When document was created"),
  updatedAt: z.string().optional().describe("When document was last updated"),
  // createdAt: zDateField.optional().describe("When document was created"),
  // updatedAt: zDateField.optional().describe("When document was last updated"),
});

/**
 * Type inference for base document
 */
export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

// === SIMPLE UTILITY FUNCTIONS ===
/**
 * Remove system fields from any schema to create input version
 * Improved naming and clarity
 */
export function toInputSchema<T extends z.ZodObject<z.ZodRawShape>>(
  fullSchema: T,
) {
  return fullSchema.omit({
    _id: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  });
}

// === DATE HANDLING UTILITIES ===
/**
 * Type utility that converts string dates to Date objects
 * This helps align TypeScript types with Zod's runtime behavior
 */
export type WithDateObjects<T> = {
  [K in keyof T]: K extends "createdAt" | "updatedAt"
    ? T[K] extends infer R
      ? R extends Date | undefined | null
        ? R
        : Date | undefined
      : Date | undefined
    : T[K];
};

/**
 * Type-safe schema converter for schemas with date fields
 * Allows using a schema in contexts where WithDateObjects<T> is expected
 *
 * @example
 * // In a domain hook:
 * schema: asDateObjectSchema(SchoolZodSchema)
 */
export function asDateObjectSchema<T>(
  schema: z.ZodType<T>,
): z.ZodType<WithDateObjects<T>> {
  // This type assertion bridges the gap between
  // Zod's runtime validation and TypeScript's type system
  return schema as unknown as z.ZodType<WithDateObjects<T>>;
}

/**
 * Type helper that ensures compatibility between Zod schemas and BaseDocument
 * This acts as a bridge without changing the core BaseDocument constraint
 */
export function ensureBaseDocumentCompatibility<T extends BaseDocument>(
  schema: ZodSchema<unknown>,
): ZodSchema<T> {
  // This is just a type assertion function - no runtime changes
  return schema as ZodSchema<T>;
}

// === EXAMPLE USAGE PATTERNS ===
/**
 * Example of how to use these building blocks
 *
 * // 1. Define your entity fields
 * const SchoolFieldsSchema = z.object({
 *   schoolName: z.string().describe("Name of the school"),
 *   district: z.string().describe("School district"),
 *   address: z.string().optional().describe("Physical address"),
 * });
 *
 * // 2. Create full schema using merge (recommended)
 * const SchoolSchema = BaseDocumentSchema.merge(SchoolFieldsSchema);
 *
 * // 3. Create input schema
 * const SchoolInputSchema = toInputSchema(SchoolSchema);
 *
 * // 4. Types are automatically inferred
 * type SchoolInput = z.infer<typeof SchoolInputSchema>;
 * type School = z.infer<typeof SchoolSchema>;
 */
