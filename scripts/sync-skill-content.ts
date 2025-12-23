#!/usr/bin/env npx tsx
/**
 * Sync Skill Content
 *
 * This script synchronizes content from the CLI skill source of truth
 * (.claude/skills/create-worked-example-sg/) to the TypeScript module
 * (src/skills/worked-example/).
 *
 * SOURCE OF TRUTH:
 *   .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/*.html
 *   .claude/skills/create-worked-example-sg/reference/*.md
 *   .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/*.md
 *
 * GENERATED OUTPUT:
 *   src/skills/worked-example/content/templates.ts
 *   src/skills/worked-example/content/pedagogy.ts
 *   src/skills/worked-example/content/styling.ts
 *   src/skills/worked-example/content/prompts.ts
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
// TEMPLATE SYNC (PPTX-Compatible)
// ============================================================================

// Escape backticks and template expressions for safe template literals
const escapeForTemplateLiteral = (s: string) => s.replace(/`/g, '\\`').replace(/\${/g, '\\${');

// Helper to read a template file if it exists
function readTemplateIfExists(templatesDir: string, filename: string): string {
  const filepath = path.join(templatesDir, filename);
  if (fs.existsSync(filepath)) {
    return escapeForTemplateLiteral(fs.readFileSync(filepath, 'utf-8'));
  }
  console.log(`  ⚠️  Template not found: ${filename}`);
  return '';
}

function syncTemplates() {
  const templatesDir = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/templates');
  const outputFile = path.join(TS_SKILL_DIR, 'templates.ts');

  // Read all PPTX-compatible HTML template files
  const slideBase = readTemplateIfExists(templatesDir, 'slide-base.html');
  const slideWithCfu = readTemplateIfExists(templatesDir, 'slide-with-cfu.html');
  const slideWithAnswer = readTemplateIfExists(templatesDir, 'slide-with-answer.html');
  const slideTwoColumn = readTemplateIfExists(templatesDir, 'slide-two-column.html');
  const slideLearningGoal = readTemplateIfExists(templatesDir, 'slide-learning-goal.html');
  const slidePractice = readTemplateIfExists(templatesDir, 'slide-practice.html');
  const slideWithSvg = readTemplateIfExists(templatesDir, 'slide-with-svg.html');
  const printable = readTemplateIfExists(templatesDir, 'printable-slide-snippet.html');

  // Read SVG snippet templates (copy-paste starting points for graphs/annotations)
  const graphSnippet = readTemplateIfExists(templatesDir, 'graph-snippet.html');
  const annotationSnippet = readTemplateIfExists(templatesDir, 'annotation-snippet.html');

  // Generate TypeScript file
  const content = `/**
 * HTML templates for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/
 * To update: Edit the HTML files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS (from pptx.md):
 * - Dimensions: 960×540px (fixed)
 * - Fonts: Arial, Georgia only (no custom fonts)
 * - Layout: .row/.col classes (no inline flexbox)
 * - Theme: Light (white background, dark text)
 * - No JavaScript, no onclick, no animations
 *
 * Shared between:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 */

/**
 * Base slide template - Foundation for all slides
 * 960×540px, light theme, Arial font
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-base.html
 */
export const SLIDE_BASE_TEMPLATE = \`
${slideBase.trim()}
\`;

/**
 * Slide with CFU (Check for Understanding) box visible
 * Used for step slides where CFU is revealed
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-cfu.html
 */
export const SLIDE_WITH_CFU_TEMPLATE = \`
${slideWithCfu.trim()}
\`;

/**
 * Slide with Answer box visible
 * Used for step slides where answer is revealed
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-answer.html
 */
export const SLIDE_WITH_ANSWER_TEMPLATE = \`
${slideWithAnswer.trim()}
\`;

/**
 * Two-column layout slide
 * 40% text / 60% visual layout for problem setup and steps
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-two-column.html
 */
export const SLIDE_TWO_COLUMN_TEMPLATE = \`
${slideTwoColumn.trim()}
\`;

/**
 * Learning Goal slide template
 * Opening slide with strategy name, steps, and learning goal
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-learning-goal.html
 */
export const SLIDE_LEARNING_GOAL_TEMPLATE = \`
${slideLearningGoal.trim()}
\`;

/**
 * Practice slide template
 * Used for practice problems with ZERO scaffolding
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-practice.html
 */
export const SLIDE_PRACTICE_TEMPLATE = \`
${slidePractice.trim()}
\`;

/**
 * Slide with SVG visual
 * Used for slides with coordinate planes, graphs, or diagrams
 * Includes data-svg-region attributes for PPTX capture
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-svg.html
 */
export const SLIDE_WITH_SVG_TEMPLATE = \`
${slideWithSvg.trim()}
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
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/printable-slide-snippet.html
 */
export const PRINTABLE_TEMPLATE = \`
${printable.trim()}
\`;

// ============================================================================
// Legacy exports (deprecated - use new PPTX templates above)
// ============================================================================

/**
 * @deprecated Use SLIDE_WITH_CFU_TEMPLATE instead (PPTX-compatible, no toggle)
 */
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;

/**
 * @deprecated Use SLIDE_WITH_ANSWER_TEMPLATE instead (PPTX-compatible, no toggle)
 */
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;

// ============================================================================
// SVG SNIPPETS - Copy-paste starting points
// ============================================================================

/**
 * Graph Snippet - Complete coordinate plane template
 * Use as starting point for ALL SVG graphs.
 *
 * Contains:
 * - Arrow marker definitions for axes and lines
 * - Complete grid with proper alignment
 * - Single "0" at origin
 * - Complete scale labels to the arrows
 * - Example data lines with extension arrows
 *
 * HOW TO USE:
 * 1. Copy the <svg>...</svg> block
 * 2. Adjust X_MAX and Y_MAX for your data
 * 3. Recalculate positions using: pixelX = 40 + (dataX/X_MAX)*220, pixelY = 170 - (dataY/Y_MAX)*150
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/graph-snippet.html
 */
export const GRAPH_SNIPPET = \`
${graphSnippet.trim()}
\`;

/**
 * Annotation Snippet - Y-intercept labels, arrows, line equations
 * Use for adding annotations to coordinate plane graphs.
 *
 * Contains:
 * - Font styling rules (font-weight="normal", font-size="9")
 * - Position calculation formula from data values
 * - Arrow marker definition
 * - Examples for y-intercept labels, shift arrows, line equations
 *
 * CRITICAL: Annotation positions must be calculated from actual data values
 * using the same formula as the graph: pixelY = 170 - (dataY / Y_MAX) * 150
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/annotation-snippet.html
 */
export const ANNOTATION_SNIPPET = \`
${annotationSnippet.trim()}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced templates.ts (PPTX-compatible)');
}

// ============================================================================
// PEDAGOGY SYNC
// ============================================================================

function syncPedagogy() {
  const sourceFile = path.join(CLI_SKILL_DIR, 'reference/pedagogy.md');
  const outputFile = path.join(TS_SKILL_DIR, 'pedagogy.ts');

  if (!fs.existsSync(sourceFile)) {
    console.log('⚠️  No pedagogy.md found, skipping');
    return;
  }

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
  const svgCoordFile = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/visuals/svg-graphs.md');
  const graphPlanningFile = path.join(CLI_SKILL_DIR, 'phases/01-collect-and-analyze/graph-planning.md');
  const outputFile = path.join(TS_SKILL_DIR, 'styling.ts');

  if (!fs.existsSync(sourceFile)) {
    console.log('⚠️  No styling.md found, skipping');
    return;
  }

  const markdown = fs.readFileSync(sourceFile, 'utf-8');

  // Also read SVG coordinate planes reference (critical for graph alignment)
  const svgCoordMarkdown = fs.existsSync(svgCoordFile)
    ? fs.readFileSync(svgCoordFile, 'utf-8')
    : '';

  // Also read graph planning reference (semantic guidance for scale/annotations)
  const graphPlanningMarkdown = fs.existsSync(graphPlanningFile)
    ? fs.readFileSync(graphPlanningFile, 'utf-8')
    : '';

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
 * Styling guide for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/styling.md
 * To update: Edit the markdown file in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS:
 * - Theme: Light (white background, dark text)
 * - Dimensions: 960×540px
 * - Fonts: Arial, Georgia only
 */

/**
 * Color palette for light theme slides (PPTX-compatible)
 */
export const COLOR_PALETTE = \`
${escapeForTemplateLiteral(colorPalette)}
\`;

/**
 * Typography guidelines (web-safe fonts)
 */
export const TYPOGRAPHY = \`
${escapeForTemplateLiteral(typography)}
\`;

/**
 * Slide container structure (960×540px)
 */
export const SLIDE_CONTAINER = \`
${escapeForTemplateLiteral(slideContainer)}
\`;

/**
 * Content box styling (CFU, Answer boxes)
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

/**
 * SVG Coordinate Planes Reference
 *
 * CRITICAL: This contains the formulas and pre-calculated pixel tables
 * that ensure grid lines, labels, and data points align correctly.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/svg-graphs.md
 */
export const SVG_COORDINATE_PLANES = \`
${escapeForTemplateLiteral(svgCoordMarkdown.trim())}
\`;

/**
 * Graph Planning Reference
 *
 * Semantic guidance for planning coordinate plane graphs:
 * - How to calculate X_MAX and Y_MAX from equations
 * - How to choose appropriate scales
 * - How to plan annotations (y-intercept shifts, parallel labels, etc.)
 *
 * This should be used BEFORE pixel implementation (SVG_COORDINATE_PLANES).
 *
 * Source: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/graph-planning.md
 */
export const GRAPH_PLANNING = \`
${escapeForTemplateLiteral(graphPlanningMarkdown.trim())}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced styling.ts');
}

// ============================================================================
// PROMPTS SYNC
// ============================================================================

function syncPrompts() {
  const outputFile = path.join(TS_SKILL_DIR, 'prompts.ts');

  // Read prompt markdown files from their actual locations in phases/
  // Phase 1: analyze-problem.md contains problem analysis instructions
  const analyzePromptPath = path.join(CLI_SKILL_DIR, 'phases/01-collect-and-analyze/analyze-problem.md');
  // Phase 3: protocol.md contains slide generation instructions (the primary technical reference)
  const generatePromptPath = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/protocol.md');

  const analyzePrompt = fs.existsSync(analyzePromptPath)
    ? escapeForTemplateLiteral(fs.readFileSync(analyzePromptPath, 'utf-8'))
    : '';
  const generatePrompt = fs.existsSync(generatePromptPath)
    ? escapeForTemplateLiteral(fs.readFileSync(generatePromptPath, 'utf-8'))
    : '';

  const content = `/**
 * Shared prompt instructions for PPTX-compatible worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth:
 *   - .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md
 *   - .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md
 *
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
 * Source: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md
 */
export const ANALYZE_PROBLEM_INSTRUCTIONS = \`
${analyzePrompt.trim()}
\`;

/**
 * Generate Slides Instructions (PPTX-Compatible)
 * Step-by-step guide for creating HTML slides.
 * Includes PPTX constraints, SVG patterns, and validation checklists.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md
 */
export const GENERATE_SLIDES_INSTRUCTIONS = \`
${generatePrompt.trim()}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log('✅ Synced prompts.ts (PPTX-compatible)');
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
    console.log('\n📝 PPTX-compatible templates are now available in the browser wizard.');
    console.log('   Source of truth: .claude/skills/create-worked-example-sg/');
    console.log('   Edit files there, then run this script to propagate changes.\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
