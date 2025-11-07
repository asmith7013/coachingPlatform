import { z } from "zod";
import { GradeLevels } from '@/lib/schema/enum/shared-enums';

// Create Zod enum from GradeLevels
const GradeLevelZod = z.enum([
  GradeLevels.KINDERGARTEN,
  GradeLevels.GRADE_1,
  GradeLevels.GRADE_2,
  GradeLevels.GRADE_3,
  GradeLevels.GRADE_4,
  GradeLevels.GRADE_5,
  GradeLevels.GRADE_6,
  GradeLevels.GRADE_7,
  GradeLevels.GRADE_8,
  GradeLevels.GRADE_9,
  GradeLevels.GRADE_10,
  GradeLevels.GRADE_11,
  GradeLevels.GRADE_12,
  GradeLevels.ALGEBRA_I,
  GradeLevels.ALGEBRA_II,
  GradeLevels.GEOMETRY,
]);

/**
 * Configuration for assessment history scraping
 */
export const AssessmentScraperConfigZod = z.object({
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  filters: z.object({
    classes: z.array(z.string()).min(1), // e.g., ["804"]
    roadmap: z.string(), // e.g., "Illustrative Math New York - 8th Grade"
    studentGrade: GradeLevelZod, // e.g., "8th Grade" (with capital G)
    skillGrade: GradeLevelZod // e.g., "8th Grade" (with capital G)
  }),
  schoolId: z.string(), // School ID for data association
  delayBetweenActions: z.number().default(1000)
});

/**
 * Single CSV row from assessment export
 */
export const AssessmentRowZod = z.object({
  name: z.string(),
  skillName: z.string(),
  skillNumber: z.string(),
  attempt: z.number(),
  dateCompleted: z.string(),
  result: z.string() // percentage like "80%"
});

/**
 * Response from assessment scraping
 */
export const AssessmentScraperResponseZod = z.object({
  success: z.boolean(),
  totalRows: z.number(),
  studentsProcessed: z.number(),
  skillsProcessed: z.number(),
  assessmentData: z.array(AssessmentRowZod),
  errors: z.array(z.string()).default([]),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string()
});

// Export types
export type AssessmentScraperConfig = z.infer<typeof AssessmentScraperConfigZod>;
export type AssessmentRow = z.infer<typeof AssessmentRowZod>;
export type AssessmentScraperResponse = z.infer<typeof AssessmentScraperResponseZod>;
