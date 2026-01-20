/**
 * Shared Worked Example Skill Content
 *
 * This module re-exports content used by both:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 *
 * ⚠️  SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/
 *
 * The content files (templates.ts, pedagogy.ts, styling.ts) are AUTO-GENERATED.
 * To update pedagogy rules, styling, or templates:
 *   1. Edit files in .claude/skills/create-worked-example-sg/ (templates/ or reference/)
 *   2. Run: npm run sync-skill-content
 *   3. The TypeScript files here will be regenerated
 *
 * @example
 * ```typescript
 * // In browser creator
 * import { PEDAGOGY_RULES, STYLING_GUIDE, CFU_TOGGLE_TEMPLATE } from '@/skills/worked-example';
 *
 * // In prompts
 * const systemPrompt = `${PEDAGOGY_RULES}\n\n${STYLING_GUIDE}`;
 * ```
 */

// Pedagogy content
export {
  FOUR_RULES,
  CFU_PATTERNS,
  SLIDE_STRUCTURE,
  PEDAGOGY_RULES,
} from './content/pedagogy';

// Styling content
export {
  COLOR_PALETTE,
  TYPOGRAPHY,
  SLIDE_CONTAINER,
  CONTENT_BOXES,
  STYLING_GUIDE,
} from './content/styling';

// HTML templates (PPTX-compatible)
export {
  SLIDE_BASE_TEMPLATE,
  SLIDE_WITH_CFU_TEMPLATE,
  SLIDE_WITH_ANSWER_TEMPLATE,
  SLIDE_TWO_COLUMN_TEMPLATE,
  SLIDE_LEARNING_GOAL_TEMPLATE,
  SLIDE_PRACTICE_TEMPLATE,
  SLIDE_WITH_SVG_TEMPLATE,
  PRINTABLE_TEMPLATE,
  // SVG snippets (copy-paste starting points for graphs)
  GRAPH_SNIPPET,
  ANNOTATION_SNIPPET,
  // Legacy exports (deprecated)
  CFU_TOGGLE_TEMPLATE,
  ANSWER_TOGGLE_TEMPLATE,
} from './content/templates';

// Shared prompt instructions (used by both CLI and browser)
// ⚠️ AUTO-SYNCED from manifest - all Phase 1-3 instructions
export {
  ANALYZE_PROBLEM_INSTRUCTIONS,
  ANALYZE_OUTPUT_SCHEMA,
  PHASE3_OVERVIEW,
  GENERATE_SLIDES_INSTRUCTIONS,
  TECHNICAL_RULES,
  SLIDE_PEDAGOGY_RULES,
  PRE_FLIGHT_CHECKLIST,
  COMPLETION_CHECKLIST,
  PHASE2_CONFIRM_PLAN,
  PHASE4_SAVE_EXPORT,
  OPTIMIZE_FOR_EXPORT,
} from './content/prompts';

// Context-specific instructions
export {
  type ExecutionContext,
  CLI_CONTEXT,
  BROWSER_CONTEXT,
  getContextInstructions,
  COMMON_INSTRUCTIONS,
} from './context';
