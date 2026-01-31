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

// ============================================================
// Analysis Data Schemas - Stored for deck editing
// ============================================================

// Solution step schema
const SolutionStepSchema = z.object({
  step: z.number(),
  description: z.string(),
  reasoning: z.string(),
});

// Key element schema (shared between DiagramEvolution and deprecated DiagramPreview)
const KeyElementSchema = z.object({
  element: z.string(),
  represents: z.string(),
});

// Diagram evolution step schema
const DiagramEvolutionStepSchema = z.object({
  header: z.string(), // e.g., "STEP 1: IDENTIFY"
  ascii: z.string(),  // ASCII showing diagram state at this step
  changes: z.array(z.string()), // What changed from previous step
});

// Diagram evolution - shows how the visual develops step-by-step across slides
// This replaces the former DiagramPreview - it includes keyElements plus step-by-step evolution
const DiagramEvolutionSchema = z.object({
  initialState: z.string(), // ASCII showing Problem Setup slide
  keyElements: z.array(KeyElementSchema), // What each visual element represents
  steps: z.array(DiagramEvolutionStepSchema), // One entry per strategy move
});

// @deprecated Use DiagramEvolution instead - kept for backward compatibility
const DiagramPreviewSchema = z.object({
  ascii: z.string().optional(),
  keyElements: z.array(KeyElementSchema).optional(),
});

// Graph plan for coordinate graphs
const GraphPlanSchema = z.object({
  equations: z.array(z.object({
    label: z.string(),
    equation: z.string(),
    slope: z.number().optional(),
    yIntercept: z.number().optional(),
    color: z.string(),
    startPoint: z.object({ x: z.number(), y: z.number() }).optional(),
    endPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  })),
  scale: z.object({
    xMax: z.number().optional(),
    yMax: z.number().optional(),
    xAxisLabels: z.array(z.number()).optional(),
    yAxisLabels: z.array(z.number()).optional(),
  }),
  keyPoints: z.array(z.object({
    label: z.string(),
    x: z.number(),
    y: z.number(),
    dataX: z.number().optional(),
    dataY: z.number().optional(),
  })),
  annotations: z.array(z.object({
    type: z.enum(['y-intercept-shift', 'parallel-label', 'slope-comparison', 'intersection-point', 'slope-triangle', 'point-label']),
    from: z.number().optional(),
    to: z.number().optional(),
    label: z.string(),
    position: z.string().optional(),
  })),
});

// Problem analysis schema (from Claude during Step 2)
export const ProblemAnalysisSchema = z.object({
  problemTranscription: z.string(),
  problemType: z.string(),
  mathematicalStructure: z.string(),
  solution: z.array(SolutionStepSchema),
  answer: z.string(),
  keyChallenge: z.string(),
  commonMistakes: z.array(z.string()),
  requiredPriorKnowledge: z.array(z.string()),
  answerFormat: z.string(),
  visualType: DeckVisualTypeSchema,
  svgSubtype: SvgSubtypeSchema.optional(),
  graphPlan: GraphPlanSchema.optional(),
  // Diagram evolution - shows how visual develops step-by-step (includes keyElements)
  diagramEvolution: DiagramEvolutionSchema.optional(),
  // @deprecated Use diagramEvolution instead - kept for backward compatibility
  diagramPreview: DiagramPreviewSchema.optional(),
});

// Strategy move schema
const StrategyMoveSchema = z.object({
  verb: z.string(),
  description: z.string(),
  result: z.string(),
});

// Strategy definition schema (from Claude during Step 2)
export const StrategyDefinitionSchema = z.object({
  name: z.string(),
  oneSentenceSummary: z.string(),
  moves: z.array(StrategyMoveSchema),
  slideHeaders: z.array(z.string()),
  cfuQuestionTemplates: z.array(z.string()),
});

// Visual plan is flexible - store as JSON since there are many subtypes
const VisualPlanSchema = z.record(z.string(), z.unknown());

// Scenario schema (from Claude during Step 2)
export const ScenarioSchema = z.object({
  name: z.string(),
  context: z.string(),
  themeIcon: z.string(),
  numbers: z.string(),
  description: z.string(),
  problemReminder: z.string().optional(),
  visualPlan: VisualPlanSchema.optional(),
  graphPlan: GraphPlanSchema.optional(),
});

export type ProblemAnalysis = z.infer<typeof ProblemAnalysisSchema>;
export type StrategyDefinition = z.infer<typeof StrategyDefinitionSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;

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
  podsieAssignmentId: z.number().int().optional(), // Linked Podsie assignment ID

  // Visual type (determined during Phase 1 planning)
  deckVisualType: DeckVisualTypeSchema.optional(), // text-only | html-table | svg-visual
  svgSubtype: SvgSubtypeSchema.optional(), // Only if deckVisualType is 'svg-visual'

  // HTML Slides (required)
  htmlSlides: z.array(HtmlSlideSchema).min(1),

  // Learning Goals
  learningGoals: z.array(z.string()).optional(),

  // Analysis Data (optional - stored for deck editing)
  // These fields preserve the wizard state so decks can be loaded back into the wizard
  problemAnalysis: ProblemAnalysisSchema.optional(),
  strategyDefinition: StrategyDefinitionSchema.optional(),
  scenarios: z.array(ScenarioSchema).optional(),

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
