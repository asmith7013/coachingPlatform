import { z } from "zod";
import { GradeLevelsSupportedZod } from "../shared/shared-types";

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
  createdAt: z.date().optional(), // Match Mongoose timestamps
  updatedAt: z.date().optional(), // Match Mongoose timestamps
});

// ✅ School Schema (includes _id for returned documents)
export const SchoolZodSchema = SchoolInputZodSchema.extend({
  _id: z.string(), // Required for returned documents
});

// ✅ Auto-generate TypeScript types
export type SchoolInput = z.infer<typeof SchoolInputZodSchema>;
export type School = z.infer<typeof SchoolZodSchema>;