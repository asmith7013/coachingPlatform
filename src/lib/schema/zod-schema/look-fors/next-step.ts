import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { formatNextStepDescription } from "@schema/reference/look-fors/next-step-helpers";

// NextStep Fields Schema
export const NextStepFieldsSchema = z.object({
  coachingActionPlanId: z.string().describe("Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE"),
  visitId: z.string().optional().describe("Reference to Visit document _id if step came from visit"),
  description: z.string().describe("Description of the next step"),
  lookForId: z.string().describe("Reference to LookFor document _id this next step relates to"),
  teacherId: z.string().describe("Reference to Teacher document _id who should implement this step"),
  schoolId: z.string().describe("Reference to School document _id where this step will be implemented"),
});

// NextStep Full Schema
export const NextStepZodSchema = BaseDocumentSchema.merge(NextStepFieldsSchema);

// NextStep Input Schema
export const NextStepInputZodSchema = toInputSchema(NextStepZodSchema);

// NextStep Reference Schema
export const NextStepReferenceZodSchema = BaseReferenceZodSchema.merge(
  NextStepFieldsSchema.pick({
    coachingActionPlanId: true,
    visitId: true,
    lookForId: true,
    teacherId: true,
    schoolId: true,
  }).partial()
).extend({
  descriptionSummary: z.string().optional(),
  lookForTopic: z.string().optional(),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
});

// NextStep Reference Transformer
export const nextStepToReference = createReferenceTransformer<NextStep, NextStepReference>(
  (step) => step.description || 'Untitled',
  (step) => ({
    coachingActionPlanId: step.coachingActionPlanId,
    visitId: step.visitId,
    lookForId: step.lookForId,
    teacherId: step.teacherId,
    schoolId: step.schoolId,
    descriptionSummary: formatNextStepDescription(step),
  }),
  NextStepReferenceZodSchema
);

// Array transformer
export const nextStepsToReferences = createArrayTransformer<NextStep, NextStepReference>(
  nextStepToReference
);

// Auto-generate TypeScript types
export type NextStepInput = z.infer<typeof NextStepInputZodSchema>;
export type NextStep = z.infer<typeof NextStepZodSchema>;
export type NextStepReference = z.infer<typeof NextStepReferenceZodSchema>;

// Add helper for schema-driven defaults
export function createNextStepDefaults(overrides: Partial<NextStepInput> = {}): NextStepInput {
  return {
    ...NextStepInputZodSchema.parse({}),
    ...overrides
  };
}