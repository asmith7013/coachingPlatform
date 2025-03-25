import { z } from "zod";
import { GradeLevelsSupportedZod } from "../shared/shared-types";

// ✅ School Schema
export const SchoolZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
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

// ✅ Auto-generate TypeScript type
export type School = z.infer<typeof SchoolZodSchema>;