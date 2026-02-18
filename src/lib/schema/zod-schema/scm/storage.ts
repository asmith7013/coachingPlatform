// src/lib/zod-schema/integrations/snorkl.ts
import { z } from "zod";
// import { zDateField } from '../shared/dateHelpers';

// Individual student response schema
export const SnorklStudentResponseZodSchema = z.object({
  correct: z.enum(["Yes", "No"]),
  explanationScore: z.number().min(0).max(4),
  responseDate: z.string(), // ISO date string
});

// Student data schema (represents one row from spreadsheet)
export const SnorklStudentDataZodSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  bestResponseCorrect: z.enum(["Yes", "No"]),
  bestResponseExplanationScore: z.number().min(0).max(4),
  bestResponseDate: z.string(), // ISO date string
  responses: z.array(SnorklStudentResponseZodSchema),
});

// Main activity document schema
export const SnorklActivityInputZodSchema = z.object({
  activityTitle: z.string(),
  section: z.string(), // e.g., "D9_SR1 (6th)"
  district: z.string(), // e.g., "D9", "D11"
  teacher: z.string(),
  activityId: z.string(), // The UUID from Snorkl
  csvUrl: z.string().url(), // The generated CSV download URL
  data: z.array(SnorklStudentDataZodSchema),
  owners: z.array(z.string()),
});

// Full schema with system fields
export const SnorklActivityZodSchema = SnorklActivityInputZodSchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schema for scraping metadata
export const SnorklScrapingMetadataZodSchema = z.object({
  _id: z.string().optional(),
  scrapingDate: z.string(),
  totalClassesScraped: z.number(),
  totalActivitiesFound: z.number(),
  totalErrorsEncountered: z.number(),
  classesProcessed: z.array(
    z.object({
      className: z.string(),
      classId: z.string(),
      activitiesFound: z.number(),
      errors: z.array(z.string()),
    }),
  ),
  globalErrors: z.array(z.string()),
  csvUrlsGenerated: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Types
export type SnorklStudentResponse = z.infer<
  typeof SnorklStudentResponseZodSchema
>;
export type SnorklStudentData = z.infer<typeof SnorklStudentDataZodSchema>;
export type SnorklActivityInput = z.infer<typeof SnorklActivityInputZodSchema>;
export type SnorklActivity = z.infer<typeof SnorklActivityZodSchema>;
export type SnorklScrapingMetadata = z.infer<
  typeof SnorklScrapingMetadataZodSchema
>;

// CSV processing helper schema (for parsing downloaded CSV files)
export const SnorklCsvRowZodSchema = z
  .object({
    "First Name": z.string(),
    "Last Name": z.string(),
    "Best Response Correct - Yes or No": z.enum(["Yes", "No"]),
    "Best Response Explanation Score (0-4)": z
      .string()
      .transform((val) => parseInt(val)),
    "Best Response Date": z.string(),
    // Additional response columns will be dynamically added
  })
  .passthrough(); // Allow additional columns

export type SnorklCsvRow = z.infer<typeof SnorklCsvRowZodSchema>;
