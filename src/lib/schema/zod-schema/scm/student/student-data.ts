import { z } from "zod";
import { GradeLevelZod, AllLessonsZod } from "@/lib/schema/enum/scope-sequence";
import { type SectionType } from "@/lib/schema/enum/snorkl-links";

export const StudentAttendanceZodSchema = z.object({
  date: z.string(),
  status: z.enum(["✅", "🟡", "❌"]),
  classLength: z.number().optional(),
  classMissed: z.number().optional(),
});

export const StudentZearnProgressZodSchema = z.object({
  lesson: AllLessonsZod, // Now validates against known lessons
  completedDate: z.string().optional(),
  mastered: z.boolean(),
});

export const StudentPreAssessmentZodSchema = z.object({
  question1: z.number(),
  question2: z.number(),
  question3: z.number(),
  totalCorrect: z.string(), // Format: "2/3"
});

// Add new schema for scope sequence progress
export const ScopeSequenceProgressZodSchema = z.object({
  grade: GradeLevelZod,
  completed: z.number(),
  total: z.number(),
  percentage: z.number(),
  remaining: z.array(z.string()),
  completedLessons: z.array(AllLessonsZod),
});

export const StudentDataZodSchema = z.object({
  studentId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  section: z.string(),
  grade: GradeLevelZod, // Add grade field
  attendance: z.array(StudentAttendanceZodSchema),
  zearnProgress: z.array(StudentZearnProgressZodSchema),
  scopeSequenceProgress: ScopeSequenceProgressZodSchema, // Add progress tracking
  preAssessment: StudentPreAssessmentZodSchema,
  weeklyZearnMinutes: z.record(z.string(), z.string()), // Week1: "1h 53m"
});

export type StudentData = z.infer<typeof StudentDataZodSchema>;
export type StudentAttendance = z.infer<typeof StudentAttendanceZodSchema>;
export type StudentZearnProgress = z.infer<
  typeof StudentZearnProgressZodSchema
>;
export type StudentPreAssessment = z.infer<
  typeof StudentPreAssessmentZodSchema
>;
export type ScopeSequenceProgress = z.infer<
  typeof ScopeSequenceProgressZodSchema
>;

/**
 * Helper function to convert section string to SectionType
 */
export function getSectionType(section: string): SectionType {
  const normalized = section.toUpperCase();
  if (normalized.includes("SRF")) return "SRF";
  if (normalized.includes("SR6")) return "SR6";
  if (normalized.includes("SR7")) return "SR7";
  if (normalized.includes("SR8")) return "SR8";
  return "SRF"; // Default fallback
}
