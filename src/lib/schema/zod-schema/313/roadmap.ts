import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// ROADMAPS LESSON SCHEMA
// =====================================

/**
 * Core fields for a Roadmaps skill lesson
 */
export const RoadmapsLessonFieldsSchema = z.object({
  // Core identification
  title: z.string(),
  url: z.string().url(),
  skillNumber: z.string().optional(),

  // IM Lesson fields (moved from im-lesson.ts) - optional for backwards compatibility
  section: z.string().optional(), // A, B, C, D
  lesson: z.number().optional(), // Lesson number
  lessonName: z.string().optional(), // e.g., "Naming the Moves"
  grade: z.string().optional(), // e.g., "Grade 8"
  unit: z.string().optional(), // e.g., "Unit 1"
  learningTargets: z.string().optional(), // Learning objectives text
  suggestedTargetSkills: z.array(z.string()).default([]), // Array of skill descriptions with IDs
  essentialSkills: z.array(z.string()).default([]), // Array of prerequisite skills
  helpfulSkills: z.array(z.string()).default([]), // Array of supporting skills

  // Content sections
  description: z.string().default(''),
  skillChallengeCriteria: z.string().default(''),
  essentialQuestion: z.string().default(''),

  // Teaching strategies and resources
  launch: z.string().default(''),
  teacherStudentStrategies: z.string().default(''),
  modelsAndManipulatives: z.string().default(''),
  questionsToHelp: z.string().default(''),
  discussionQuestions: z.string().default(''),
  commonMisconceptions: z.string().default(''),
  additionalResources: z.string().default(''),

  // Standards and vocabulary
  standards: z.string().default(''),
  vocabulary: z.array(z.string()).default([]),

  // Media and resources
  images: z.array(z.string()).default([]),
  videoUrl: z.string(),

  // Metadata
  scrapedAt: z.string(),
  success: z.boolean(),
  error: z.string().optional(),

  // Organization
  tags: z.array(z.string()).default([]),
});

// Full Roadmaps Lesson Schema
export const RoadmapsLessonZodSchema = BaseDocumentSchema.merge(RoadmapsLessonFieldsSchema);

// Input Schema (for creation)
export const RoadmapsLessonInputZodSchema = toInputSchema(RoadmapsLessonZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type RoadmapsLesson = z.infer<typeof RoadmapsLessonZodSchema>;
export type RoadmapsLessonInput = z.infer<typeof RoadmapsLessonInputZodSchema>;