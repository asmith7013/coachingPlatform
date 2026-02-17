import { z } from "zod";

// =====================================
// ROADMAPS STUDENT DATA ZOD SCHEMA
// =====================================

/**
 * Schema for individual attempts at a skill
 */
export const AttemptZodSchema = z.object({
  attemptNumber: z.number(),
  dateCompleted: z.string(),
  score: z.string(),
  passed: z.boolean(),
});

/**
 * Schema for skill performance tracking
 */
export const SkillPerformanceZodSchema = z.object({
  skillCode: z.string(),
  unit: z.string().optional(),
  skillName: z.string().optional(),
  skillGrade: z.string().optional(),
  standards: z.string().optional(),
  status: z.enum(["Mastered", "Attempted But Not Mastered", "Not Started"]),
  score: z.string().optional(), // Backward compatibility
  lastUpdated: z.string().optional(), // Backward compatibility

  // NEW: Track all attempts
  attempts: z.array(AttemptZodSchema).default([]),

  // NEW: Computed fields from attempts
  bestScore: z.string().optional(),
  attemptCount: z.number().default(0),
  masteredDate: z.string().optional(),
  lastAttemptDate: z.string().optional(),
});

/**
 * Schema for roadmaps student data
 */
export const RoadmapsStudentDataZodSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  schoolId: z.string(),
  assessmentDate: z.string(),
  skillPerformances: z.array(SkillPerformanceZodSchema),
});

// Export types
export type Attempt = z.infer<typeof AttemptZodSchema>;
export type SkillPerformance = z.infer<typeof SkillPerformanceZodSchema>;
export type RoadmapsStudentData = z.infer<typeof RoadmapsStudentDataZodSchema>;
