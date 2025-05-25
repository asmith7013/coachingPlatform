// src/lib/data-schema/zod-schema/core/school.ts
import { z } from "zod";
import { GradeLevelsSupportedZod } from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema, createBaseReference } from '@zod-schema/core-types/reference';

// School Fields Schema
export const SchoolFieldsSchema = z.object({
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  emoji: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod), // Array of supported grade levels
  staffList: z.array(z.string()), // Array of staff IDs
  schedules: z.array(z.string()), // Array of schedule IDs
  cycles: z.array(z.string()), // Array of cycle IDs
  owners: z.array(z.string()), // Owner IDs
});

// School Full Schema
export const SchoolZodSchema = BaseDocumentSchema.merge(SchoolFieldsSchema);

// School Input Schema
export const SchoolInputZodSchema = toInputSchema(SchoolZodSchema);

// Client-side schema that omits timestamps
export const SchoolClientZodSchema = SchoolZodSchema.omit({
  createdAt: true,
  updatedAt: true
});

// School Reference Schema using pick() for type safety
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

/**
 * Create a transformer function that converts a School entity to a SchoolReference
 * This provides a reusable way to transform schools to references
 */
export function schoolToReference(school: School): z.infer<typeof SchoolReferenceZodSchema> {

  const { schoolNumber, district } = school;
  
  return SchoolReferenceZodSchema.parse({
    // Base reference fields
    ...createBaseReference(school, 'schoolName'),
    
    // Picked fields - direct copy
    schoolNumber,
    district,
    
    // Extended fields - with explicit transformations
    gradeLevels: school.gradeLevelsSupported.slice(0, 3),
    staffCount: school.staffList?.length || 0,
  });
}

/**
 * Create a transformer function for arrays of schools
 */
export function schoolsToReferences(schools: School[]): z.infer<typeof SchoolReferenceZodSchema>[] {
  return schools.map(schoolToReference);
}

// Auto-generate TypeScript types
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolClient = z.infer<typeof SchoolClientZodSchema>;
export type SchoolReference = z.infer<typeof SchoolReferenceZodSchema>;

// Re-export for convenient access
export { BaseReferenceZodSchema };