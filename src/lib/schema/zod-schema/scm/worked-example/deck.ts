import { z } from 'zod';
import { GradeZod } from '@zod-schema/scm/scope-and-sequence/scope-and-sequence';

/**
 * Deck-level visual type (determined during Phase 1 planning)
 * - text-only: No graphics needed (rare - pure text/equation problems)
 * - html-table: Simple data tables with highlighting
 * - svg-visual: ALL other graphics (graphs, diagrams, shapes, etc.)
 */
export const DeckVisualTypeSchema = z.enum(['text-only', 'html-table', 'svg-visual']);
export type DeckVisualType = z.infer<typeof DeckVisualTypeSchema>;

/**
 * SVG subtype (only applicable when visualType is 'svg-visual')
 */
export const SvgSubtypeSchema = z.enum([
  'coordinate-graph',
  'diagram',
  'shape',
  'number-line',
  'other',
]);
export type SvgSubtype = z.infer<typeof SvgSubtypeSchema>;

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

  // Visual type (determined during Phase 1 planning)
  deckVisualType: DeckVisualTypeSchema.optional(), // text-only | html-table | svg-visual
  svgSubtype: SvgSubtypeSchema.optional(), // Only if deckVisualType is 'svg-visual'

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

  // Soft delete
  deactivated: z.boolean().default(false),

  // Google Slides URL (set after export)
  googleSlidesUrl: z.string().url().optional(),

  // Files
  files: FilesSchema,

  // Timestamps (optional for input, set by server)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Input schema (for creating new decks - no timestamps, always active)
export const CreateWorkedExampleDeckSchema = WorkedExampleDeckSchema.omit({
  createdAt: true,
  updatedAt: true,
  deactivated: true, // New decks are always active
});

// Type exports
export type WorkedExampleDeck = z.infer<typeof WorkedExampleDeckSchema>;
export type CreateWorkedExampleDeckInput = z.infer<typeof CreateWorkedExampleDeckSchema>;
export type HtmlSlide = z.infer<typeof HtmlSlideSchema>;
export type HtmlSlideScript = z.infer<typeof HtmlSlideScriptSchema>;
