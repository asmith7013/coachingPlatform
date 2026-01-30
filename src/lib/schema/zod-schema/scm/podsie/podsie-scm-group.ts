import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// PODSIE SCM GROUP SCHEMA
// =====================================

/**
 * Assignment pacing entry - tracks due date and grouping for a single assignment
 */
export const PacingEntrySchema = z.object({
  podsieAssignmentId: z.number().int().describe("Podsie assignment ID"),
  dueDate: z.string().nullable().optional().describe("Due date in YYYY-MM-DD format"),
  groupNumber: z.number().int().min(1).max(20).nullable().optional().describe("Group number (1-20), null = ungrouped"),
  groupLabel: z.string().nullable().optional().describe("Group label (e.g., 'Part 1', 'Week 1')"),
});

export type PacingEntry = z.infer<typeof PacingEntrySchema>;

/**
 * Podsie SCM Group - stores pacing configuration per group + module
 */
const PodsieScmGroupFieldsSchema = z.object({
  podsieGroupId: z.number().int().describe("Podsie group ID"),
  podsieModuleId: z.number().int().describe("Podsie module ID"),
  moduleStartDate: z.string().nullable().optional().describe("Module start date in YYYY-MM-DD format"),
  pointsRewardGoal: z.number().nullable().optional().describe("Points reward goal"),
  pointsRewardDescription: z.string().nullable().optional().describe("Points reward description"),
  assignments: z.array(PacingEntrySchema).default([]).describe("Assignment pacing entries"),
});

export const PodsieScmGroupZodSchema = BaseDocumentSchema.merge(PodsieScmGroupFieldsSchema);
export const PodsieScmGroupInputZodSchema = toInputSchema(PodsieScmGroupZodSchema);

export type PodsieScmGroup = z.infer<typeof PodsieScmGroupZodSchema>;
export type PodsieScmGroupInput = z.infer<typeof PodsieScmGroupInputZodSchema>;
