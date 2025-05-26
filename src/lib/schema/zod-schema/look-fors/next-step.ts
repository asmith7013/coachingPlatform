import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@transformers/factories/reference-factory";
import { formatNextStepDescription } from "@schema/reference/look-fors/next-step-helpers";

// NextStep Fields Schema
export const NextStepFieldsSchema = z.object({
  description: z.string(),
  lookFor: z.string(),
  teacher: z.string(),
  school: z.string(),
});

// NextStep Full Schema
export const NextStepZodSchema = BaseDocumentSchema.merge(NextStepFieldsSchema);

// NextStep Input Schema
export const NextStepInputZodSchema = toInputSchema(NextStepZodSchema);

// NextStep Reference Schema
export const NextStepReferenceZodSchema = BaseReferenceZodSchema.merge(
  NextStepFieldsSchema
    .pick({
      lookFor: true,
      teacher: true,
      school: true,
    })
    .partial()
).extend({
  descriptionSummary: z.string().optional(),
  lookForTopic: z.string().optional(),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
});

// NextStep Reference Transformer
export const nextStepToReference = createReferenceTransformer<NextStep, NextStepReference>(
  (nextStep) => nextStep.description,
  (nextStep) => ({
    lookFor: nextStep.lookFor,
    teacher: nextStep.teacher,
    school: nextStep.school,
    descriptionSummary: formatNextStepDescription(nextStep),
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