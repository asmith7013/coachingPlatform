import { z } from "zod";
import { GradeLevelsSupportedZod } from "@schema/enum";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";

// School Fields Schema
export const SchoolFieldsSchema = z.object({
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  emoji: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).describe("Grade levels taught at this school (K-12, Pre-K, etc.)"),
  staffListIds: z.array(z.string()).describe("Array of Staff document _ids assigned to this school"),
  scheduleIds: z.array(z.string()).describe("Array of Schedule document _ids for this school's bell schedules"),
  cycleIds: z.array(z.string()).describe("Array of Cycle document _ids for coaching cycles at this school"),
});

// School Full Schema
export const SchoolZodSchema = BaseDocumentSchema.merge(SchoolFieldsSchema);

// School Input Schema
export const SchoolInputZodSchema = toInputSchema(SchoolZodSchema);

// Client-side schema with string timestamps (Next.js serialization)
export const SchoolClientZodSchema = SchoolZodSchema.extend({
  createdAt: z.string().optional().describe("ISO string from Next.js serialization"),
  updatedAt: z.string().optional().describe("ISO string from Next.js serialization"),
});

/**
 * School Reference Schema
 * 
 * Extends the base reference schema with school-specific fields
 * Uses pick() for type safety and selective field inclusion
 */
export const SchoolReferenceZodSchema = BaseReferenceZodSchema.merge(
  SchoolFieldsSchema
    .pick({
      schoolNumber: true,
      district: true,
    })
    .partial() // Make all picked fields optional
).extend({
  // Add derived fields
  gradeLevels: z.array(z.string()).optional().describe("Supported grade levels summary"),
  staffCount: z.number().optional().describe("Number of staff members"),
});

// Auto-generate TypeScript types
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolClient = z.infer<typeof SchoolClientZodSchema>;
export type SchoolReference = z.infer<typeof SchoolReferenceZodSchema>;

/**
 * Create a transformer function that converts a School entity to a SchoolReference
 * using the reference transformer utility
 * 
 * @example
 * const school = await fetchSchool(id);
 * const reference = schoolToReference(school);
 * // reference will have: _id, label, value, schoolNumber, district, etc.
 */
export const schoolToReference = createReferenceTransformer<School, SchoolReference>(
  // Label function: Extract display name
  (school: School) => school.schoolName,
  
  // Additional fields function: Add school-specific fields
  (school: School) => ({
    schoolNumber: school.schoolNumber,
    district: school.district,
    gradeLevels: school.gradeLevelsSupported,
    staffCount: school.staffListIds?.length || 0,
  }),
  
  // Validation schema
  SchoolReferenceZodSchema
);

/**
 * Create a transformer function for arrays of schools
 * 
 * @example
 * const schools = await fetchSchools();
 * const references = schoolsToReferences(schools);
 * // Use references in dropdown components
 */
export const schoolsToReferences = createArrayTransformer<School, SchoolReference>(
  schoolToReference
);

// Re-export for convenient access
export { BaseReferenceZodSchema };