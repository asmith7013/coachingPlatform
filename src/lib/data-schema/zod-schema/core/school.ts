import { z } from "zod";
import { GradeLevelsSupportedZod } from "@zod-schema/shared/enums";
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Base schema for school input (create/update)
export const SchoolInputZodSchema = z.object({
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

// ✅ School Full Schema
export const SchoolZodSchema = SchoolInputZodSchema.extend({
  _id: z.string(), // Required for returned documents
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// Client-side schema that omits timestamps
export const SchoolClientZodSchema = SchoolZodSchema.omit({
  createdAt: true,
  updatedAt: true
});

// ✅ Auto-generate TypeScript types
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolClient = z.infer<typeof SchoolClientZodSchema>;