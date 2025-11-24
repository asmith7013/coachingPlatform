import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

// =====================================
// RAMP-UP QUESTION SCHEMA
// =====================================

/**
 * Individual question completion status
 */
export const RampUpQuestionSchema = z.object({
  questionNumber: z.number().int().positive().describe("Question number (1-based)"),
  completed: z.boolean().default(false).describe("Whether the question was answered correctly"),
  completedAt: z.string().optional().describe("When the question was completed (ISO format)"),
  score: z.number().min(0).max(100).optional().describe("Score percentage for this question"),
});

// =====================================
// RAMP-UP PROGRESS SCHEMA
// =====================================

/**
 * Ramp-up progress fields - tracks student progress on ramp-up assessments
 */
export const RampUpProgressFieldsSchema = z.object({
  // Student reference
  studentId: z.string().describe("Reference to student document _id"),
  studentName: z.string().describe("Student full name for display (cached)"),

  // Ramp-up identification
  unitCode: z.string().describe("Unit code (e.g., '8.4', '8.3', '7.2')"),
  rampUpName: z.string().optional().describe("Human-readable ramp-up name"),

  // Question-level progress
  questions: z.array(RampUpQuestionSchema).default([]).describe("Array of question completion statuses"),
  totalQuestions: z.number().int().positive().describe("Total number of questions in this ramp-up"),

  // Summary fields
  completedCount: z.number().int().default(0).describe("Number of questions completed correctly"),
  percentComplete: z.number().min(0).max(100).default(0).describe("Percentage of questions completed"),
  isFullyComplete: z.boolean().default(false).describe("Whether all questions are completed"),

  // Timestamps
  lastUpdated: z.string().optional().describe("When progress was last synced from Podsy"),
  firstAttemptDate: z.string().optional().describe("When student first attempted this ramp-up"),
  completionDate: z.string().optional().describe("When student completed all questions"),
});

/**
 * Full ramp-up progress schema with base document fields
 */
export const RampUpProgressZodSchema = BaseDocumentSchema.merge(RampUpProgressFieldsSchema);

/**
 * Input schema for creating/updating ramp-up progress
 */
export const RampUpProgressInputZodSchema = toInputSchema(RampUpProgressZodSchema);

// =====================================
// API RESPONSE SCHEMAS
// =====================================

/**
 * Schema for Podsy API response (will be refined based on actual API)
 */
export const PodsyRampUpResponseSchema = z.object({
  studentId: z.string(),
  unitCode: z.string(),
  questions: z.array(
    z.object({
      questionNumber: z.number(),
      correct: z.boolean(),
      timestamp: z.string().optional(),
    })
  ),
});

/**
 * Batch response for multiple students
 */
export const PodsyBatchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PodsyRampUpResponseSchema),
  error: z.string().optional(),
});

// =====================================
// TYPE EXPORTS
// =====================================

export type RampUpQuestion = z.infer<typeof RampUpQuestionSchema>;
export type RampUpProgress = z.infer<typeof RampUpProgressZodSchema>;
export type RampUpProgressInput = z.infer<typeof RampUpProgressInputZodSchema>;
export type PodsyRampUpResponse = z.infer<typeof PodsyRampUpResponseSchema>;
export type PodsyBatchResponse = z.infer<typeof PodsyBatchResponseSchema>;

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Create default ramp-up progress for a student
 */
export function createRampUpProgressDefaults(
  studentId: string,
  studentName: string,
  unitCode: string,
  totalQuestions: number,
  overrides: Partial<RampUpProgressInput> = {}
): RampUpProgressInput {
  // Initialize all questions as incomplete
  const questions: RampUpQuestion[] = Array.from({ length: totalQuestions }, (_, i) => ({
    questionNumber: i + 1,
    completed: false,
  }));

  return {
    studentId,
    studentName,
    unitCode,
    totalQuestions,
    questions,
    completedCount: 0,
    percentComplete: 0,
    isFullyComplete: false,
    ownerIds: [],
    ...overrides,
  };
}

/**
 * Calculate summary fields from questions array
 */
export function calculateRampUpSummary(questions: RampUpQuestion[]) {
  const completedCount = questions.filter((q) => q.completed).length;
  const totalQuestions = questions.length;
  const percentComplete = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  const isFullyComplete = completedCount === totalQuestions && totalQuestions > 0;

  return {
    completedCount,
    percentComplete,
    isFullyComplete,
  };
}
