/**
 * Shared prompt instructions for PPTX-compatible worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/prompts/
 * To update: Edit the markdown files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS (from pptx.md):
 * - Dimensions: 960×540px
 * - Fonts: Arial, Georgia only
 * - Layout: .row/.col classes
 * - No JavaScript, no animations
 *
 * These prompts are used by both:
 * - CLI skill: .claude/skills/create-worked-example-sg/ (reads directly)
 * - Browser creator: src/app/scm/workedExamples/create/ (imports from here)
 */

/**
 * Analyze Problem Instructions
 * Step-by-step guide for analyzing a mastery check question.
 *
 * Source: .claude/skills/create-worked-example-sg/prompts/analyze-problem.md
 */
export const ANALYZE_PROBLEM_INSTRUCTIONS = `

`;

/**
 * Generate Slides Instructions (PPTX-Compatible)
 * Step-by-step guide for creating HTML slides.
 * Includes PPTX constraints, SVG patterns, and validation checklists.
 *
 * Source: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 */
export const GENERATE_SLIDES_INSTRUCTIONS = `

`;
