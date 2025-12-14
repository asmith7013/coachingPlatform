import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// ROADMAP UNIT SCHEMA (Simplified to skill number references)
// =====================================

/**
 * Core fields for a Roadmap Unit
 * Note: Skills are now stored separately in roadmap-skills collection
 * Units only store arrays of skill numbers (strings)
 */
export const RoadmapUnitFieldsSchema = z.object({
  // Metadata
  grade: z.string(), // e.g., "Illustrative Math New York - 7th Grade"
  unitTitle: z.string(), // e.g., "01 - Area and Surface Area"
  unitNumber: z.number().optional(), // extracted from title: 1, 2, 3... (optional, auto-extracted if not provided)
  url: z.url(),

  // Counts (summary stats)
  targetCount: z.number(),
  supportCount: z.number(),
  extensionCount: z.number(),

  // Skill references (arrays of skill numbers as strings)
  targetSkills: z.array(z.string()).default([]), // e.g., ["265", "312", "45"]
  additionalSupportSkills: z.array(z.string()).default([]), // e.g., ["123", "456"]
  extensionSkills: z.array(z.string()).default([]), // e.g., ["789", "101"]

  // Metadata
  scrapedAt: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

// Full Roadmap Unit Schema
export const RoadmapUnitZodSchema = BaseDocumentSchema.merge(RoadmapUnitFieldsSchema);

// Input Schema (for creation)
export const RoadmapUnitInputZodSchema = toInputSchema(RoadmapUnitZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type RoadmapUnit = z.infer<typeof RoadmapUnitZodSchema>;
export type RoadmapUnitInput = z.infer<typeof RoadmapUnitInputZodSchema>;
