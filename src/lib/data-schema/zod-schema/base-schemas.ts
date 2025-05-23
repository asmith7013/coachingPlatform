// src/lib/data-schema/zod-schema/shared/base-schemas.ts
import { z } from 'zod';
import { zDateField } from '@zod-schema/shared/dateHelpers';

// === SIMPLE BASE BUILDING BLOCKS ===
/**
 * Common document fields that most entities share
 * Keep this minimal and focused
 */
export const BaseDocumentSchema = z.object({
  _id: z.string().describe("Unique document identifier"),
  id: z.string().optional().describe("Client-side ID (mirrors _id)"),
  owners: z.array(z.string()).default([]).describe("User IDs who own this document"),
  createdAt: zDateField.optional().describe("When document was created"),
  updatedAt: zDateField.optional().describe("When document was last updated"),
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
export function toInputSchema<T extends z.ZodObject<z.ZodRawShape>>(fullSchema: T) {
  return fullSchema.omit({
    _id: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  });
}


// === LEGACY SUPPORT ===
/**
 * @deprecated Use toInputSchema instead
 */
export const createInputFromFull = toInputSchema;

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
