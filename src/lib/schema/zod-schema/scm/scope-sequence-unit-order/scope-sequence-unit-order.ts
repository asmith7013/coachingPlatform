import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { ScopeSequenceTagZod, GradeZod } from '@zod-schema/scm/scope-and-sequence/scope-and-sequence';

// =====================================
// UNIT ORDER ITEM SCHEMA
// =====================================

/**
 * Individual unit in the ordered sequence
 */
export const UnitOrderItemZod = z.object({
  order: z.number().int().positive().describe("Display order (1, 2, 3...)"),
  unitNumber: z.number().int().positive().describe("The unitNumber in scope-and-sequence collection"),
  unitName: z.string().describe("Full unit name for display"),
  grade: GradeZod.describe("Grade field from scope-and-sequence (for Algebra 1: '8' or 'Algebra 1')"),
});

export type UnitOrderItem = z.infer<typeof UnitOrderItemZod>;

// =====================================
// SCOPE SEQUENCE UNIT ORDER SCHEMA
// =====================================

/**
 * Core fields for Scope Sequence Unit Order
 * One document per scopeSequenceTag defining the ordered sequence of units
 */
export const ScopeSequenceUnitOrderFieldsSchema = z.object({
  scopeSequenceTag: ScopeSequenceTagZod.describe("Curriculum identifier (Grade 6, Grade 7, Grade 8, or Algebra 1)"),
  units: z.array(UnitOrderItemZod).describe("Ordered array of units for this curriculum"),
});

// Full Schema with base document fields
export const ScopeSequenceUnitOrderZodSchema = BaseDocumentSchema.merge(ScopeSequenceUnitOrderFieldsSchema);

// Input Schema (for creation)
export const ScopeSequenceUnitOrderInputZodSchema = toInputSchema(ScopeSequenceUnitOrderZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type ScopeSequenceUnitOrder = z.infer<typeof ScopeSequenceUnitOrderZodSchema>;
export type ScopeSequenceUnitOrderInput = z.infer<typeof ScopeSequenceUnitOrderInputZodSchema>;
