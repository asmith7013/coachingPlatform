#!/usr/bin/env npx tsx
/**
 * Sync Skill Content
 *
 * This script synchronizes content from the CLI skill source of truth
 * (.claude/skills/create-worked-example-sg/) to the TypeScript module
 * (src/skills/worked-example/).
 *
 * SOURCE OF TRUTH:
 *   .claude/skills/create-worked-example-sg/templates/*.html
 *   .claude/skills/create-worked-example-sg/reference/*.md
 *
 * GENERATED OUTPUT:
 *   src/skills/worked-example/content/templates.ts
 *   src/skills/worked-example/content/pedagogy.ts
 *   src/skills/worked-example/content/styling.ts
 *
 * Usage:
 *   npx tsx scripts/sync-skill-content.ts
 *   npm run sync-skill-content
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const CLI_SKILL_DIR = path.join(ROOT, '.claude/skills/create-worked-example-sg');
const TS_SKILL_DIR = path.join(ROOT, 'src/skills/worked-example/content');

// ============================================================================
// TEMPLATE SYNC
// ============================================================================

// Escape backticks and template expressions for safe template literals
const escapeForTemplateLiteral = (s: string) => s.replace(/`/g, '\\`').replace(/\${/g, '\\${');

function syncTemplates() {
  const templatesDir = path.join(CLI_SKILL_DIR, 'templates');
  const outputFile = path.join(TS_SKILL_DIR, 'templates.ts');

  // Read all HTML template files
  const cfuToggle = escapeForTemplateLiteral(
    fs.readFileSync(path.join(templatesDir, 'cfu-toggle-snippet.html'), 'utf-8')
  );
  const answerToggle = escapeForTemplateLiteral(
    fs.readFileSync(path.join(templatesDir, 'answer-toggle-snippet.html'), 'utf-8')
  );
  const printable = escapeForTemplateLiteral(
    fs.readFileSync(path.join(templatesDir, 'printable-slide-snippet.html'), 'utf-8')
  );

  // Generate TypeScript file
  const content = `/**
 * HTML templates for worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/templates/
 * To update: Edit the HTML files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * Shared between:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 */

/**
 * CFU Toggle Template - Use for Ask slides
 * The CFU question appears at the bottom when the button is clicked.
 *
 * Source: .claude/skills/create-worked-example-sg/templates/cfu-toggle-snippet.html
 */
export const CFU_TOGGLE_TEMPLATE = \`
${cfuToggle.trim()}
\`;

/**
 * Answer Toggle Template - Use for Reveal slides
 * The answer appears at the bottom when the button is clicked.
 *
 * Source: .claude/skills/create-worked-example-sg/templates/answer-toggle-snippet.html
 */
export const ANSWER_TOGGLE_TEMPLATE = \`
${answerToggle.trim()}
\`;

/**
 * Printable slide template - Use for worksheet slides
 *
 * CRITICAL RULES:
 * 1. ALL practice problems go in ONE slide file with multiple print-page divs
 * 2. Each print-page div = one printed page (8.5in x 11in)
 * 3. Use white background, black text, Times New Roman font for printing
 * 4. Include ONLY: Header, Learning Goal, Problem content - NO strategy reminders
 * 5. NEVER create separate slide files for each problem
 *
 * Source: .claude/skills/create-worked-example-sg/templates/printable-slide-snippet.html
 */
export const PRINTABLE_TEMPLATE = \`
${printable.trim()}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced templates.ts');
}

// ============================================================================
// PEDAGOGY SYNC
// ============================================================================

function syncPedagogy() {
  const sourceFile = path.join(CLI_SKILL_DIR, 'reference/pedagogy.md');
  const outputFile = path.join(TS_SKILL_DIR, 'pedagogy.ts');

  const markdown = fs.readFileSync(sourceFile, 'utf-8');

  // Extract specific sections (include the ## header in capture)
  const fourRulesMatch = markdown.match(/(## The Four Rules[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const cfuPatternsMatch = markdown.match(/(## Check-for-Understanding \(CFU\) Question Patterns[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const slideStructureMatch = markdown.match(/(## Slide Structure[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);

  const fourRules = fourRulesMatch ? fourRulesMatch[1].trim() : '';
  const cfuPatterns = cfuPatternsMatch ? cfuPatternsMatch[1].trim() : '';
  const slideStructure = slideStructureMatch ? slideStructureMatch[1].trim() : '';

  const content = `/**
 * Pedagogy rules for worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/pedagogy.md
 * To update: Edit the markdown file in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 */

/**
 * The Four Rules of worked example creation
 */
export const FOUR_RULES = \`
${escapeForTemplateLiteral(fourRules)}
\`;

/**
 * CFU (Check for Understanding) patterns
 */
export const CFU_PATTERNS = \`
${escapeForTemplateLiteral(cfuPatterns)}
\`;

/**
 * Slide structure guidelines
 */
export const SLIDE_STRUCTURE = \`
${escapeForTemplateLiteral(slideStructure)}
\`;

/**
 * Complete pedagogy document for prompts
 */
export const PEDAGOGY_RULES = \`
${escapeForTemplateLiteral(markdown.trim())}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced pedagogy.ts');
}

// ============================================================================
// STYLING SYNC
// ============================================================================

function syncStyling() {
  const sourceFile = path.join(CLI_SKILL_DIR, 'reference/styling.md');
  const outputFile = path.join(TS_SKILL_DIR, 'styling.ts');

  const markdown = fs.readFileSync(sourceFile, 'utf-8');

  // Extract sections from markdown (include the ## header)
  const colorPaletteMatch = markdown.match(/(## Color Palette[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const typographyMatch = markdown.match(/(## Typography[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const slideContainerMatch = markdown.match(/(## Basic Slide Structure[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const contentBoxesMatch = markdown.match(/(## Common Patterns[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);

  const colorPalette = colorPaletteMatch ? colorPaletteMatch[1].trim() : '';
  const typography = typographyMatch ? typographyMatch[1].trim() : '';
  const slideContainer = slideContainerMatch ? slideContainerMatch[1].trim() : '';
  const contentBoxes = contentBoxesMatch ? contentBoxesMatch[1].trim() : '';

  const content = `/**
 * Styling guide for worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/styling.md
 * To update: Edit the markdown file in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 */

/**
 * Color palette for dark theme slides
 */
export const COLOR_PALETTE = \`
${escapeForTemplateLiteral(colorPalette)}
\`;

/**
 * Typography guidelines
 */
export const TYPOGRAPHY = \`
${escapeForTemplateLiteral(typography)}
\`;

/**
 * Slide container structure
 */
export const SLIDE_CONTAINER = \`
${escapeForTemplateLiteral(slideContainer)}
\`;

/**
 * Content box styling
 */
export const CONTENT_BOXES = \`
${escapeForTemplateLiteral(contentBoxes)}
\`;

/**
 * Complete styling guide for prompts
 */
export const STYLING_GUIDE = \`
${escapeForTemplateLiteral(markdown.trim())}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced styling.ts');
}

// ============================================================================
// PROMPTS SYNC
// ============================================================================

function syncPrompts() {
  const promptsDir = path.join(CLI_SKILL_DIR, 'prompts');
  const outputFile = path.join(TS_SKILL_DIR, 'prompts.ts');

  // Check if prompts directory exists
  if (!fs.existsSync(promptsDir)) {
    console.log('⚠️  No prompts/ directory found, skipping prompts sync');
    return;
  }

  // Read prompt markdown files
  const analyzePromptPath = path.join(promptsDir, 'analyze-problem.md');
  const generatePromptPath = path.join(promptsDir, 'generate-slides.md');

  const analyzePrompt = fs.existsSync(analyzePromptPath)
    ? escapeForTemplateLiteral(fs.readFileSync(analyzePromptPath, 'utf-8'))
    : '';
  const generatePrompt = fs.existsSync(generatePromptPath)
    ? escapeForTemplateLiteral(fs.readFileSync(generatePromptPath, 'utf-8'))
    : '';

  const content = `/**
 * Shared prompt instructions for worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/prompts/
 * To update: Edit the markdown files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
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
export const ANALYZE_PROBLEM_INSTRUCTIONS = \`
${analyzePrompt.trim()}
\`;

/**
 * Generate Slides Instructions
 * Step-by-step guide for creating HTML slides.
 *
 * Source: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 */
export const GENERATE_SLIDES_INSTRUCTIONS = \`
${generatePrompt.trim()}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced prompts.ts');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔄 Syncing skill content from CLI source to TypeScript module...\n');
  console.log(`   Source: ${CLI_SKILL_DIR}`);
  console.log(`   Output: ${TS_SKILL_DIR}\n`);

  try {
    syncTemplates();
    syncPedagogy();
    syncStyling();
    syncPrompts();

    console.log('\n✅ All content synced successfully!');
    console.log('\nRemember: The source of truth is in .claude/skills/create-worked-example-sg/');
    console.log('Edit files there, then run this script to propagate changes.\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
