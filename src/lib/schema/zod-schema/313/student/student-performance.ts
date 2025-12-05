import { z } from "zod";

// =====================================
// SKILL PERFORMANCE ITEM SCHEMA
// =====================================

/**
 * Schema for individual skill performance within a student assessment
 */
export const SkillPerformanceItemZodSchema = z.object({
  skillCode: z.string(),
  unit: z.string(),
  skillName: z.string(),
  skillGrade: z.string(),
  standards: z.string(),
  status: z.enum(["Mastered", "Attempted But Not Mastered", "Not Started"]),
  score: z.string().optional(),
  lastUpdated: z.string().optional()
});

// =====================================
// STUDENT PERFORMANCE SCHEMA
// =====================================

/**
 * Input schema for creating student performance records
 */
export const StudentPerformanceInputZodSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  schoolId: z.string(),
  assessmentDate: z.string(),
  skillPerformances: z.array(SkillPerformanceItemZodSchema),
});

/**
 * Complete schema including MongoDB fields
 */
export const StudentPerformanceZodSchema = StudentPerformanceInputZodSchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// =====================================
// TYPE EXPORTS
// =====================================

export type SkillPerformanceItem = z.infer<typeof SkillPerformanceItemZodSchema>;
export type StudentPerformanceInput = z.infer<typeof StudentPerformanceInputZodSchema>;
export type StudentPerformance = z.infer<typeof StudentPerformanceZodSchema>;
