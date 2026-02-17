import { z } from "zod";

/**
 * Response type enum for state test questions
 */
export const ResponseTypeEnum = z.enum([
  "multipleChoice",
  "constructedResponse",
]);

/**
 * State test question schema
 * Questions scraped from Problem-Attic for NY state exams
 */
export const StateTestQuestionZod = z.object({
  questionId: z.string(), // Unique ID from Problem-Attic
  standard: z.string(), // Primary standard (e.g., "CC 6.NS.6c")
  secondaryStandard: z.string().optional(), // Optional secondary standard
  examYear: z.string(), // Year of the exam (e.g., "2023")
  examTitle: z.string(), // Title of the exam (e.g., "Spring 2023")
  grade: z.string(), // Grade level ("6", "7", "8")
  screenshotUrl: z.string().url(), // URL to the question screenshot
  questionType: z.string(), // Raw type from scraper (e.g., "multiple choice")
  responseType: ResponseTypeEnum.optional(), // Normalized response type
  points: z.number().int().positive().optional(), // Point value
  answer: z.string().optional(), // Correct answer (e.g., "A", "B", "C", "D")
  questionNumber: z.number().int().positive().optional(), // Actual Q# from the exam
  sourceUrl: z.string().url(), // Original Problem-Attic URL
  scrapedAt: z.string().datetime(), // ISO timestamp when scraped
  pageIndex: z.number().int().positive(), // 1-based position on source page
});

/**
 * Schema for updating a state test question
 */
export const StateTestQuestionUpdateZod = z.object({
  secondaryStandard: z.string().optional(),
  responseType: ResponseTypeEnum.optional(),
  points: z.number().int().positive().optional(),
  answer: z.string().optional(),
  questionNumber: z.number().int().positive().optional(),
});

/**
 * Schema for bulk updates
 */
export const StateTestQuestionBulkUpdateZod = z.object({
  questionId: z.string(),
  secondaryStandard: z.string().optional(),
  responseType: ResponseTypeEnum.optional(),
  points: z.number().int().positive().optional(),
  answer: z.string().optional(),
  questionNumber: z.number().int().positive().optional(),
});

// Export types
export type StateTestQuestion = z.infer<typeof StateTestQuestionZod>;
export type StateTestQuestionUpdate = z.infer<
  typeof StateTestQuestionUpdateZod
>;
export type StateTestQuestionBulkUpdate = z.infer<
  typeof StateTestQuestionBulkUpdateZod
>;
export type ResponseType = z.infer<typeof ResponseTypeEnum>;
