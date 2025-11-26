import { z } from 'zod';

// Diagram schema (for p5.js or images)
const DiagramSchema = z.object({
  type: z.enum(['image', 'p5js']),
  content: z.string(), // URL or p5.js code
});

// Table row schema
const TableRowSchema = z.object({
  input: z.number(),
  output: z.number().nullable(),
});

// Individual slide schemas
const Slide1Schema = z.object({
  unit: z.string(),
  title: z.string(),
  bigIdea: z.string(),
  example: z.string(),
  icon: z.string().optional(),
});

const Slide2Schema = z.object({
  scenario: z.string(),
  context: z.string(),
  icon: z.string(),
  tableData: z.array(TableRowSchema),
  inputLabel: z.string(),
  outputLabel: z.string(),
  diagram: DiagramSchema.optional(),
});

const Slide3Schema = z.object({
  question: z.string(),
  tableData: z.array(TableRowSchema),
  highlightRow: z.number().optional(),
  inputLabel: z.string(),
  outputLabel: z.string(),
  diagram: DiagramSchema.optional(),
});

const Slide4Schema = z.object({
  calculation: z.string(),
  explanation: z.string(),
  answer: z.string(),
  isConstant: z.boolean(),
  diagram: DiagramSchema.optional(),
});

const Slide5Schema = z.object({
  question: z.string(),
  tableData: z.array(TableRowSchema),
  highlightRow: z.number().optional(),
  inputLabel: z.string(),
  outputLabel: z.string(),
  diagram: DiagramSchema.optional(),
});

const Slide6Schema = z.object({
  calculation: z.string(),
  explanation: z.string(),
  answer: z.string(),
  diagram: DiagramSchema.optional(),
});

const Slide7Schema = z.object({
  title: z.string(),
  steps: z.array(z.string()),
  mathRule: z.string().optional(),
  keyInsight: z.string().optional(),
  diagram: DiagramSchema.optional(),
});

const Slide8Schema = z.object({
  scenario: z.string(),
  context: z.string(),
  icon: z.string(),
  tableData: z.array(TableRowSchema),
  inputLabel: z.string(),
  outputLabel: z.string(),
  diagram: DiagramSchema.optional(),
});

const Slide9Schema = z.object({
  scenario: z.string(),
  context: z.string(),
  icon: z.string(),
  tableData: z.array(TableRowSchema),
  inputLabel: z.string(),
  outputLabel: z.string(),
  diagram: DiagramSchema.optional(),
});

// All 9 slides together
const SlidesSchema = z.object({
  slide1: Slide1Schema,
  slide2: Slide2Schema,
  slide3: Slide3Schema,
  slide4: Slide4Schema,
  slide5: Slide5Schema,
  slide6: Slide6Schema,
  slide7: Slide7Schema,
  slide8: Slide8Schema,
  slide9: Slide9Schema,
});

// Files reference
const FilesSchema = z.object({
  pageComponent: z.string(),
  dataFile: z.string(),
});

// Main deck schema
export const WorkedExampleDeckSchema = z.object({
  // Basic Info
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),

  // Educational Context
  mathConcept: z.string(),
  mathStandard: z.string(),
  gradeLevel: z.number().min(3).max(12),

  // The 9 Slides
  slides: SlidesSchema,

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
export type TableRow = z.infer<typeof TableRowSchema>;
export type Diagram = z.infer<typeof DiagramSchema>;

// Individual slide type exports (for component props)
export type Slide1 = z.infer<typeof Slide1Schema>;
export type Slide2 = z.infer<typeof Slide2Schema>;
export type Slide3 = z.infer<typeof Slide3Schema>;
export type Slide4 = z.infer<typeof Slide4Schema>;
export type Slide5 = z.infer<typeof Slide5Schema>;
export type Slide6 = z.infer<typeof Slide6Schema>;
export type Slide7 = z.infer<typeof Slide7Schema>;
export type Slide8 = z.infer<typeof Slide8Schema>;
export type Slide9 = z.infer<typeof Slide9Schema>;
