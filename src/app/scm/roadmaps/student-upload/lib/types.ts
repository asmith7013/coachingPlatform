import { z } from "zod";

// =====================================
// ROADMAP SPREADSHEET TYPES
// =====================================

export const RoadmapSheetMetadataSchema = z.object({
  section: z.string(),
  teacher: z.string(),
  roadmap: z.string(),
  date: z.string(),
});

export type RoadmapSheetMetadata = z.infer<typeof RoadmapSheetMetadataSchema>;

export const StudentSkillDataSchema = z.object({
  studentName: z.string(),
  masteredSkills: z.array(z.string()),
});

export type StudentSkillData = z.infer<typeof StudentSkillDataSchema>;

export const RoadmapSheetDataSchema = z.object({
  metadata: RoadmapSheetMetadataSchema,
  students: z.array(StudentSkillDataSchema),
  totalSkillsFound: z.number(),
  totalStudentsFound: z.number(),
});

export type RoadmapSheetData = z.infer<typeof RoadmapSheetDataSchema>;

// =====================================
// IMPORT RESPONSE TYPES
// =====================================

export const StudentUpdateResultSchema = z.object({
  studentName: z.string(),
  success: z.boolean(),
  skillsAdded: z.number(),
  totalMasteredSkills: z.number(),
  error: z.string().optional(),
});

export type StudentUpdateResult = z.infer<typeof StudentUpdateResultSchema>;

export const ImportResponseSchema = z.object({
  success: z.boolean(),
  metadata: RoadmapSheetMetadataSchema.optional(),
  totalStudentsProcessed: z.number(),
  successfulUpdates: z.number(),
  failedUpdates: z.number(),
  studentResults: z.array(StudentUpdateResultSchema),
  errors: z.array(z.string()),
});

export type ImportResponse = z.infer<typeof ImportResponseSchema>;
