import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

// =====================================
// STUDENT GOAL SCHEMA
// =====================================

/**
 * Per-unit multiplier entry
 * Stored as part of a student's goal to track bonus point multipliers per module
 */
export const UnitMultiplierEntrySchema = z.object({
  podsieModuleId: z.number().int().describe("Podsie module ID"),
  multiplierPercent: z
    .number()
    .min(0)
    .max(200)
    .describe("Multiplier percentage (e.g., 10 = 10% bonus)"),
});

/**
 * Student goal fields
 * Per-student per-group goal with prize info and per-unit multipliers
 */
export const StudentGoalFieldsSchema = z.object({
  podsieGroupId: z.number().int().describe("Podsie group ID"),
  podsieStudentProfileId: z.string().describe("Podsie student profile UUID"),
  studentName: z.string().describe("Student display name"),
  studentEmail: z.string().email().describe("Student email"),
  goalName: z.string().min(1).max(200).describe("Name of the prize/goal"),
  goalCost: z.number().int().min(0).describe("Point cost to achieve the goal"),
  goalImageUrl: z
    .string()
    .url()
    .nullable()
    .optional()
    .describe("Vercel Blob URL of the goal image"),
  unitMultipliers: z
    .array(UnitMultiplierEntrySchema)
    .default([])
    .describe("Per-unit point multipliers"),
});

/**
 * Full student goal schema with base document fields
 */
export const StudentGoalZodSchema = BaseDocumentSchema.merge(
  StudentGoalFieldsSchema,
);

/**
 * Input schema for creating/updating student goals
 */
export const StudentGoalInputZodSchema = toInputSchema(StudentGoalZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type UnitMultiplierEntry = z.infer<typeof UnitMultiplierEntrySchema>;
export type StudentGoal = z.infer<typeof StudentGoalZodSchema>;
export type StudentGoalInput = z.infer<typeof StudentGoalInputZodSchema>;
