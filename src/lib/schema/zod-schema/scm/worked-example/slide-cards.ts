import { z } from "zod";

/**
 * Atomic Component Schemas for Slide Content
 *
 * Three distinct component types:
 * 1. content - Flexible container for any text-based content (prose, lists, equations, tables)
 * 2. svg - Visual container for graphs/diagrams with layer support
 * 3. cfu/answer - Overlay boxes with animation
 *
 * The AI composes slides by:
 * - Choosing a layout preset (defines region positions)
 * - Placing atomic components in regions
 * - Writing HTML content using card-patterns as reference
 */

// Available atomic component types
export const CardTypeSchema = z.enum([
  "content", // Any text-based content (prose, lists, equations, tables)
  "svg", // Visual container for graphs/diagrams
  "cfu", // Check for Understanding overlay
  "answer", // Answer reveal overlay
]);
export type CardType = z.infer<typeof CardTypeSchema>;

// Base properties shared by all components
export const BaseCardSchema = z.object({
  type: CardTypeSchema,
  background: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

/**
 * Content Box - Universal container for text-based content
 *
 * Can contain any mix of:
 * - Paragraphs (prose)
 * - Lists (bullet/numbered)
 * - Equations (centered math)
 * - Tables
 * - Headers
 *
 * The htmlContent is the actual HTML to render.
 * AI generates this using patterns from card-patterns/content-box.html
 */
export const ContentCardSchema = BaseCardSchema.extend({
  type: z.literal("content"),
  htmlContent: z.string(), // Complete HTML for the content box
});
export type ContentCard = z.infer<typeof ContentCardSchema>;

/**
 * SVG Card - Visual container for graphs and diagrams
 *
 * Features:
 * - viewBox defines coordinate system
 * - Layers support progressive reveal animations
 * - Caption for accessibility
 */
export const SvgCardSchema = BaseCardSchema.extend({
  type: z.literal("svg"),
  viewBox: z.string().default("0 0 560 350"),
  svgContent: z.string(), // Inner SVG content
  layers: z.array(z.string()).optional(), // Layer IDs for animation
  caption: z.string().optional(),
});
export type SvgCard = z.infer<typeof SvgCardSchema>;

/**
 * CFU Card - Check for Understanding overlay
 *
 * Yellow accent, absolute positioned top-right.
 * Animates on click in PPTX.
 */
export const CfuCardSchema = BaseCardSchema.extend({
  type: z.literal("cfu"),
  question: z.string(),
});
export type CfuCard = z.infer<typeof CfuCardSchema>;

/**
 * Answer Card - Answer reveal overlay
 *
 * Green accent, absolute positioned top-right.
 * Animates on click in PPTX.
 */
export const AnswerCardSchema = BaseCardSchema.extend({
  type: z.literal("answer"),
  explanation: z.string(),
});
export type AnswerCard = z.infer<typeof AnswerCardSchema>;

// Discriminated union of all component types
export const CardDefinitionSchema = z.discriminatedUnion("type", [
  ContentCardSchema,
  SvgCardSchema,
  CfuCardSchema,
  AnswerCardSchema,
]);
export type CardDefinition = z.infer<typeof CardDefinitionSchema>;
