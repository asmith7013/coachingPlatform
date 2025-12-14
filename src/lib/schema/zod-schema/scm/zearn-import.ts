import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// Use Zearn's native lesson format - no conversion needed
export const ZearnLessonFormatZod = z.string().regex(/^G\d+\s+M\d+\s+L\d+$/, "Must be in format 'G6 M2 L2'");

export const ZearnImportRecordFieldsSchema = z.object({
  // Standard spreadsheet fields (match existing pattern from 313/core.ts)
  date: z.string().describe("Import date"),
  section: z.string().describe("Class section"),
  teacher: z.string().describe("Teacher name"),
  studentID: z.number().int().positive().describe("Student ID"),
  firstName: z.string().describe("Student first name"),
  lastName: z.string().describe("Student last name"),
  
  // Zearn-specific fields (optional with defaults for zero lessons cases)
  lessonTitle: z.string().optional().default('').describe("Lesson title from Zearn"),
  lessonCompletionDate: z.string().optional().default('').describe("Completion timestamp"),
  
  // Optional weekly summary fields
  weekRange: z.string().optional().describe("Week range (e.g., 'Jul 14 – Jul 20')"),
  weeklyMinutes: z.string().optional().describe("Weekly time spent"),
  
  // Import metadata
  importedAt: z.string().optional().describe("When this record was imported"),
  importedBy: z.string().optional().describe("Who imported this record"),
});

export const ZearnImportRecordZodSchema = BaseDocumentSchema.merge(ZearnImportRecordFieldsSchema);
export const ZearnImportRecordInputZodSchema = toInputSchema(ZearnImportRecordZodSchema);

export type ZearnImportRecord = z.infer<typeof ZearnImportRecordZodSchema>;
export type ZearnImportRecordInput = z.infer<typeof ZearnImportRecordInputZodSchema>;

// Default value creator following existing pattern
export function createZearnImportRecordDefaults(overrides: Partial<ZearnImportRecordInput> = {}): ZearnImportRecordInput {
  return {
    date: new Date().toLocaleDateString(),
    section: "",
    teacher: "",
    studentID: 0,
    firstName: "",
    lastName: "",
    lessonTitle: "",
    lessonCompletionDate: "",
    ownerIds: [],
    ...overrides
  };
} 