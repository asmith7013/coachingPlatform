import { z } from 'zod';
import { GradeZod } from '@zod-schema/scm/scope-and-sequence/scope-and-sequence';

// HTML Slide script schema
const HtmlSlideScriptSchema = z.object({
  type: z.enum(['cdn', 'inline']),
  content: z.string(),
});

// HTML Slide schema
const HtmlSlideSchema = z.object({
  slideNumber: z.number().min(1),
  htmlContent: z.string(), // Full HTML for the slide
  visualType: z.enum(['html', 'p5', 'd3']).default('html'),
  scripts: z.array(HtmlSlideScriptSchema).optional(),
  customCSS: z.string().optional(),
});

// Files reference
const FilesSchema = z.object({
  pageComponent: z.string(),
  dataFile: z.string(),
});

// Main deck schema (HTML-only)
export const WorkedExampleDeckSchema = z.object({
  // Basic Info
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),

  // Educational Context
  mathConcept: z.string(),
  mathStandard: z.string(),
  gradeLevel: GradeZod, // "6", "7", "8", "Algebra 1"
  unitNumber: z.number().int().positive().optional(), // Unit number (matches scope-and-sequence)
  lessonNumber: z.number().int().optional(), // Lesson number (matches scope-and-sequence, can be 0 or negative for ramp-ups)
  scopeAndSequenceId: z.string().optional(), // Link to scope-and-sequence collection

  // HTML Slides (required)
  htmlSlides: z.array(HtmlSlideSchema).min(1),

  // Learning Goals
  learningGoals: z.array(z.string()).optional(),

  // Generation Info
  generatedBy: z.enum(['ai', 'manual']),
  sourceImage: z.string().optional(),

  // Ownership
  createdBy: z.string(),
  isPublic: z.boolean().default(false),

  // Files
  files: FilesSchema,

  // Timestamps (optional for input, set by server)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Input schema (for creating new decks - no timestamps)
export const CreateWorkedExampleDeckSchema = WorkedExampleDeckSchema.omit({
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type WorkedExampleDeck = z.infer<typeof WorkedExampleDeckSchema>;
export type CreateWorkedExampleDeckInput = z.infer<typeof CreateWorkedExampleDeckSchema>;
export type HtmlSlide = z.infer<typeof HtmlSlideSchema>;
export type HtmlSlideScript = z.infer<typeof HtmlSlideScriptSchema>;
