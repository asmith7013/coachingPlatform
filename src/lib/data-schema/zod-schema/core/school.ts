import { z } from "zod";
import { GradeLevelsSupportedZod } from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

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

// Auto-generate TypeScript types
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolClient = z.infer<typeof SchoolClientZodSchema>;