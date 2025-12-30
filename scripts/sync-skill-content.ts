#!/usr/bin/env npx tsx
/**
 * Sync Skill Content
 *
 * This script synchronizes content from the CLI skill source of truth
 * (.claude/skills/create-worked-example-sg/) to the TypeScript module
 * (src/skills/worked-example/).
 *
 * SOURCE OF TRUTH (Atomic Card-Patterns System):
 *   .claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/
 *     - simple-patterns/ → title-zone, content-box, cfu-answer-card (fill placeholders)
 *     - complex-patterns/ → graph-snippet, annotation-snippet, printable (copy & modify)
 *   .claude/skills/create-worked-example-sg/archived/templates/ → Legacy templates (reference only)
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
  // New atomic card-patterns system
  const cardPatterns = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/card-patterns');
  const simplePatterns = path.join(cardPatterns, 'simple-patterns');
  const complexPatterns = path.join(cardPatterns, 'complex-patterns');
  const archivedTemplates = path.join(CLI_SKILL_DIR, 'archived/templates');
  const outputFile = path.join(TS_SKILL_DIR, 'templates.ts');

  // Read atomic card-patterns (new system)
  const titleZone = readTemplateIfExists(simplePatterns, 'title-zone.html');
  const contentBox = readTemplateIfExists(simplePatterns, 'content-box.html');
  const cfuAnswerCard = readTemplateIfExists(simplePatterns, 'cfu-answer-card.html');

  // Read svg-card template (directly in card-patterns folder)
  const svgCard = readTemplateIfExists(cardPatterns, 'svg-card.html');

  // Read complex patterns (copy-and-modify)
  const graphSnippet = readTemplateIfExists(complexPatterns, 'graph-snippet.html');
  const annotationSnippet = readTemplateIfExists(complexPatterns, 'annotation-snippet.html');
  const printable = readTemplateIfExists(complexPatterns, 'printable-slide-snippet.html');

  // Read archived templates for backward compatibility (legacy exports)
  const slideBase = readTemplateIfExists(archivedTemplates, 'slide-base.html');
  const slideWithCfu = readTemplateIfExists(archivedTemplates, 'slide-with-cfu.html');
  const slideWithAnswer = readTemplateIfExists(archivedTemplates, 'slide-with-answer.html');
  const slideTwoColumn = readTemplateIfExists(archivedTemplates, 'slide-two-column.html');
  const slideLearningGoal = readTemplateIfExists(archivedTemplates, 'slide-learning-goal.html');
  const slidePractice = readTemplateIfExists(archivedTemplates, 'slide-practice.html');
  const slideWithSvg = readTemplateIfExists(archivedTemplates, 'slide-with-svg.html');

  // Generate TypeScript file
  const content = `/**
 * HTML templates for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth (Atomic Card-Patterns System):
 *   .claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/
 *     - simple-patterns/ → title-zone, content-box, cfu-answer-card (fill placeholders)
 *     - complex-patterns/ → graph-snippet, annotation-snippet, printable (copy & modify)
 *
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

// ============================================================================
// ATOMIC CARD-PATTERNS (New System - 11 slides with PPTX animation)
// ============================================================================

/**
 * Title Zone - Top section of every slide
 * Contains: Badge + Title + Subtitle
 * Workflow: Fill placeholders ({{badge_text}}, {{title}}, {{subtitle}})
 *
 * Source: card-patterns/simple-patterns/title-zone.html
 */
export const TITLE_ZONE = \`
${titleZone.trim()}
\`;

/**
 * Content Box - Main content area
 * Contains: Text, lists, equations, tables
 * Workflow: Fill placeholders
 *
 * Source: card-patterns/simple-patterns/content-box.html
 */
export const CONTENT_BOX = \`
${contentBox.trim()}
\`;

/**
 * CFU/Answer Card - Animated overlays
 * Appears on click in PPTX (PPTX animation)
 * Workflow: Fill placeholders, add data-pptx-region attribute
 *
 * Source: card-patterns/simple-patterns/cfu-answer-card.html
 */
export const CFU_ANSWER_CARD = \`
${cfuAnswerCard.trim()}
\`;

/**
 * SVG Card - Container for graphs and diagrams
 * Includes layering system for PPTX animations
 * Workflow: Fill placeholders, add SVG content inside layers
 *
 * Source: card-patterns/svg-card.html
 */
export const SVG_CARD = \`
${svgCard.trim()}
\`;

/**
 * Graph Snippet - Complete coordinate plane template
 * Workflow: Copy entire file, modify values, recalculate pixel positions
 *
 * Contains:
 * - Arrow marker definitions for axes and lines
 * - Complete grid with proper alignment
 * - Single "0" at origin
 * - Complete scale labels to the arrows
 * - Example data lines with extension arrows
 * - Layer structure for PPTX export
 *
 * HOW TO USE:
 * 1. Copy the <svg>...</svg> block
 * 2. Adjust X_MAX and Y_MAX for your data
 * 3. Recalculate positions using: pixelX = 40 + (dataX/X_MAX)*220, pixelY = 170 - (dataY/Y_MAX)*150
 *
 * Source: card-patterns/complex-patterns/graph-snippet.html
 */
export const GRAPH_SNIPPET = \`
${graphSnippet.trim()}
\`;

/**
 * Annotation Snippet - Y-intercept labels, arrows, line equations
 * Workflow: Copy elements, recalculate pixel positions
 *
 * Contains:
 * - Font styling rules (font-weight="normal", font-size="9")
 * - Position calculation formula from data values
 * - Arrow marker definition
 * - Examples for y-intercept labels, shift arrows, line equations
 * - Layer structure for PPTX export
 *
 * Source: card-patterns/complex-patterns/annotation-snippet.html
 */
export const ANNOTATION_SNIPPET = \`
${annotationSnippet.trim()}
\`;

/**
 * Printable slide template - Use for worksheet slides
 * Workflow: Copy entire file, fill in problem content
 *
 * CRITICAL RULES:
 * 1. ALL practice problems go in ONE slide file with multiple print-page divs
 * 2. Each print-page div = one printed page (8.5in x 11in)
 * 3. Use white background, black text, Times New Roman font for printing
 * 4. Include ONLY: Header, Learning Goal, Problem content - NO strategy reminders
 * 5. NEVER create separate slide files for each problem
 *
 * Source: card-patterns/complex-patterns/printable-slide-snippet.html
 */
export const PRINTABLE_TEMPLATE = \`
${printable.trim()}
\`;

// ============================================================================
// LEGACY TEMPLATES (Archived - for backward compatibility)
// ============================================================================

/**
 * @deprecated Use atomic card-patterns (TITLE_ZONE, CONTENT_BOX, etc.) instead
 * Base slide template - Foundation for all slides
 *
 * Source: archived/templates/slide-base.html
 */
export const SLIDE_BASE_TEMPLATE = \`
${slideBase.trim()}
\`;

/**
 * @deprecated Use CFU_ANSWER_CARD instead (with PPTX animation)
 * Slide with CFU (Check for Understanding) box visible
 *
 * Source: archived/templates/slide-with-cfu.html
 */
export const SLIDE_WITH_CFU_TEMPLATE = \`
${slideWithCfu.trim()}
\`;

/**
 * @deprecated Use CFU_ANSWER_CARD instead (with PPTX animation)
 * Slide with Answer box visible
 *
 * Source: archived/templates/slide-with-answer.html
 */
export const SLIDE_WITH_ANSWER_TEMPLATE = \`
${slideWithAnswer.trim()}
\`;

/**
 * @deprecated Use atomic card-patterns instead
 * Two-column layout slide
 *
 * Source: archived/templates/slide-two-column.html
 */
export const SLIDE_TWO_COLUMN_TEMPLATE = \`
${slideTwoColumn.trim()}
\`;

/**
 * @deprecated Use atomic card-patterns instead
 * Learning Goal slide template
 *
 * Source: archived/templates/slide-learning-goal.html
 */
export const SLIDE_LEARNING_GOAL_TEMPLATE = \`
${slideLearningGoal.trim()}
\`;

/**
 * @deprecated Use atomic card-patterns instead
 * Practice slide template
 *
 * Source: archived/templates/slide-practice.html
 */
export const SLIDE_PRACTICE_TEMPLATE = \`
${slidePractice.trim()}
\`;

/**
 * @deprecated Use GRAPH_SNIPPET instead
 * Slide with SVG visual
 *
 * Source: archived/templates/slide-with-svg.html
 */
export const SLIDE_WITH_SVG_TEMPLATE = \`
${slideWithSvg.trim()}
\`;

// Legacy aliases
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;
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
  const diagramPatternsFile = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/visuals/diagram-patterns.md');
  const annotationZonesFile = path.join(CLI_SKILL_DIR, 'phases/03-generate-slides/visuals/annotation-zones.md');
  const layoutPresetsFile = path.join(CLI_SKILL_DIR, 'reference/layout-presets.md');
  const pptxRequirementsFile = path.join(CLI_SKILL_DIR, 'reference/pptx-requirements.md');
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

  // Also read diagram patterns reference (non-graph SVG visuals like tape diagrams, hangers, etc.)
  const diagramPatternsMarkdown = fs.existsSync(diagramPatternsFile)
    ? fs.readFileSync(diagramPatternsFile, 'utf-8')
    : '';

  // Also read annotation zones reference (y-intercept labels, shift arrows, etc.)
  const annotationZonesMarkdown = fs.existsSync(annotationZonesFile)
    ? fs.readFileSync(annotationZonesFile, 'utf-8')
    : '';

  // Also read layout presets reference (full-width, two-column, graph-heavy, etc.)
  const layoutPresetsMarkdown = fs.existsSync(layoutPresetsFile)
    ? fs.readFileSync(layoutPresetsFile, 'utf-8')
    : '';

  // Also read PPTX requirements reference (constraints, fonts, dimensions, etc.)
  const pptxRequirementsMarkdown = fs.existsSync(pptxRequirementsFile)
    ? fs.readFileSync(pptxRequirementsFile, 'utf-8')
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

/**
 * Diagram Patterns Reference (PRIMARY REFERENCE for non-graph SVGs)
 *
 * Visual structure reference for common middle school math representations:
 * - Double Number Lines (ratios, percentages)
 * - Tape Diagrams (part-whole, comparisons)
 * - Hanger Diagrams (equation solving, balance)
 * - Area Models (multiplication, distributive property)
 * - Input-Output Tables (functions, patterns)
 * - Ratio Tables (equivalent ratios)
 *
 * Based on Illustrative Mathematics (IM) curriculum representations.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/diagram-patterns.md
 */
export const DIAGRAM_PATTERNS = \`
${escapeForTemplateLiteral(diagramPatternsMarkdown.trim())}
\`;

/**
 * Annotation Zones Reference
 *
 * Guide for placing annotations on graphs:
 * - Y-intercept labels and shift arrows
 * - Slope triangles
 * - Line equation labels
 * - Point labels
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/annotation-zones.md
 */
export const ANNOTATION_ZONES = \`
${escapeForTemplateLiteral(annotationZonesMarkdown.trim())}
\`;

/**
 * Layout Presets Reference
 *
 * Standard slide layout patterns:
 * - full-width (learning goal slides)
 * - two-column (step slides with visual)
 * - graph-heavy (graph on right, minimal text)
 *
 * Source: .claude/skills/create-worked-example-sg/reference/layout-presets.md
 */
export const LAYOUT_PRESETS = \`
${escapeForTemplateLiteral(layoutPresetsMarkdown.trim())}
\`;

/**
 * PPTX Requirements Reference
 *
 * Complete PPTX export constraints:
 * - Slide dimensions (960×540px)
 * - Supported fonts (Arial, Georgia)
 * - Color palette
 * - Region positioning
 * - Animation/layer system
 *
 * Source: .claude/skills/create-worked-example-sg/reference/pptx-requirements.md
 */
export const PPTX_REQUIREMENTS = \`
${escapeForTemplateLiteral(pptxRequirementsMarkdown.trim())}
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
// REGION DEFAULTS SYNC
// ============================================================================

function syncRegionDefaults() {
  const sourceFile = path.join(CLI_SKILL_DIR, 'reference/region-defaults.md');
  const outputFile = path.join(ROOT, 'src/app/api/scm/worked-examples/export-pptx/helpers/region-constants.ts');

  if (!fs.existsSync(sourceFile)) {
    console.log('⚠️  No region-defaults.md found, skipping');
    return;
  }

  const markdown = fs.readFileSync(sourceFile, 'utf-8');

  // Parse region positions from markdown
  // Format: region: x, y, w, h
  const regionPattern = /^([\w-]+):\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*$/gm;
  const regions: Record<string, { x: number; y: number; w: number; h: number }> = {};

  let match;
  while ((match = regionPattern.exec(markdown)) !== null) {
    const [, name, x, y, w, h] = match;
    regions[name] = {
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      w: parseInt(w, 10),
      h: parseInt(h, 10),
    };
  }

  // Generate TypeScript
  const regionEntries = Object.entries(regions)
    .map(([name, pos]) => `  '${name}': { x: ${pos.x}, y: ${pos.y}, w: ${pos.w}, h: ${pos.h} }`)
    .join(',\n');

  const content = `/**
 * Region default positions for PPTX slide layout.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/region-defaults.md
 * To update: Edit the markdown file, then run:
 *   npm run sync-skill-content
 */

// Slide dimensions
export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;
export const MARGIN = 20;

// Region default positions (pixels)
export const REGION_DEFAULTS: Record<string, { x: number; y: number; w: number; h: number }> = {
${regionEntries}
};

// Bounds validation helpers
export const MAX_RIGHT = SLIDE_WIDTH - MARGIN; // 940
export const MAX_BOTTOM = SLIDE_HEIGHT; // 540

export function isWithinBounds(x: number, y: number, w: number, h: number): boolean {
  return (x + w <= MAX_RIGHT) && (y + h <= MAX_BOTTOM);
}
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced region-constants.ts (${Object.keys(regions).length} regions)`);
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
    syncRegionDefaults();

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
