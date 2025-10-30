import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// SKILL REFERENCE SCHEMA
// =====================================

export const SkillReferenceSchema = z.object({
  title: z.string(),
  skillNumber: z.string(),
});

// =====================================
// UNIT REFERENCE SCHEMA
// =====================================

export const UnitReferenceSchema = z.object({
  grade: z.string(),
  unitTitle: z.string(),
  unitNumber: z.number(),
});

// =====================================
// PRACTICE PROBLEM SCHEMA
// =====================================

export const PracticeProblemSchema = z.object({
  problemNumber: z.number(),
  screenshotUrl: z.string(),
  scrapedAt: z.string(),
});

// =====================================
// IMAGE WITH CONTEXT SCHEMA
// =====================================

export const ImageWithContextSchema = z.object({
  url: z.string(),
  altText: z.string().optional(),
  caption: z.string().optional(), // Text immediately before/after image
  section: z.string().optional(), // Which section (launch, models, etc.)
  orderInSection: z.number(), // Position within that section
});

// =====================================
// VOCABULARY TERM SCHEMA
// =====================================

export const VocabularyTermSchema = z.object({
  term: z.string(),
  definition: z.string(),
});

// =====================================
// ROADMAPS SKILL SCHEMA (Comprehensive)
// =====================================

/**
 * Core fields for a Roadmaps Skill
 * Combines unit-skill relationships with rich lesson content
 */
export const RoadmapsSkillFieldsSchema = z.object({
  // Core identification
  skillNumber: z.string(), // Unique identifier, e.g., "265"
  title: z.string(), // e.g., "Understand Exponents"
  url: z.string().url().optional(), // URL to the skill page

  // Prerequisites - structured with skillNumber and title
  essentialSkills: z.array(SkillReferenceSchema).default([]),
  helpfulSkills: z.array(SkillReferenceSchema).default([]),

  // Which units contain this skill
  units: z.array(UnitReferenceSchema).default([]),

  // IM Lesson fields (optional for skills from IM lessons)
  section: z.string().optional(), // A, B, C, D
  lesson: z.number().optional(), // Lesson number (deprecated: use imLessons for multiple)
  lessonName: z.string().optional(), // e.g., "Naming the Moves"
  grade: z.string().optional(), // e.g., "Grade 8"
  unit: z.string().optional(), // e.g., "Unit 1"
  learningTargets: z.string().optional(), // Learning objectives text
  suggestedTargetSkills: z.array(z.string()).default([]), // Array of skill descriptions with IDs

  // IM Lesson mappings - skills can appear in multiple lessons
  imLessons: z.array(z.object({
    grade: z.string().optional(), // e.g., "Grade 7", "Grade 8"
    unitNumber: z.number(),
    lessonNumber: z.number(),
    lessonName: z.string().optional(),
  })).default([]),

  // Content sections
  description: z.string().default(''),
  skillChallengeCriteria: z.string().default(''),
  essentialQuestion: z.string().default(''),

  // Teaching strategies and resources
  primerHtml: z.string().default(''), // Complete primer section HTML with column layout preserved
  launch: z.string().default(''),
  teacherStudentStrategies: z.string().default(''),
  modelsAndManipulatives: z.string().default(''),
  questionsToHelp: z.string().default(''),
  discussionQuestions: z.string().default(''),
  commonMisconceptions: z.string().default(''),
  additionalResources: z.string().default(''),

  // Standards and vocabulary
  standards: z.string().default(''),
  vocabulary: z.array(VocabularyTermSchema).default([]),

  // Media and resources
  images: z.array(z.string()).default([]), // Deprecated: Use imagesWithContext instead
  imagesWithContext: z.array(ImageWithContextSchema).default([]),
  videoUrl: z.string().optional(),
  practiceProblems: z.array(PracticeProblemSchema).default([]),

  // Organization
  tags: z.array(z.string()).default([]),

  // Metadata
  scrapedAt: z.string(),
  success: z.boolean().default(true),
  error: z.string().optional(),
});

// Full Roadmaps Skill Schema
export const RoadmapsSkillZodSchema = BaseDocumentSchema.merge(RoadmapsSkillFieldsSchema);

// Input Schema (for creation)
export const RoadmapsSkillInputZodSchema = toInputSchema(RoadmapsSkillZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type RoadmapsSkill = z.infer<typeof RoadmapsSkillZodSchema>;
export type RoadmapsSkillInput = z.infer<typeof RoadmapsSkillInputZodSchema>;
export type SkillReference = z.infer<typeof SkillReferenceSchema>;
export type UnitReference = z.infer<typeof UnitReferenceSchema>;
export type PracticeProblem = z.infer<typeof PracticeProblemSchema>;
export type ImageWithContext = z.infer<typeof ImageWithContextSchema>;
