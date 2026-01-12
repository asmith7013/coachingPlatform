#!/usr/bin/env npx tsx
/**
 * Sync Skill Content
 *
 * This script synchronizes content from the CLI skill source of truth
 * (.claude/skills/create-worked-example-sg/) to the TypeScript module
 * (src/skills/worked-example/).
 *
 * MANIFEST-BASED SYNC:
 * - All synced files are explicitly listed in SYNC_MANIFEST
 * - Script warns when new files are added that aren't in the manifest
 * - Outputs a clear mapping report
 *
 * SOURCE OF TRUTH:
 *   .claude/skills/create-worked-example-sg/
 *
 * GENERATED OUTPUT:
 *   src/skills/worked-example/content/
 *     - templates.ts (HTML card-patterns)
 *     - prompts.ts (Phase 1 & 3 instructions)
 *     - styling.ts (Visual rules, SVG, layout)
 *     - pedagogy.ts (Teaching principles)
 *   src/app/api/scm/worked-examples/export-pptx/helpers/
 *     - region-constants.ts (PPTX region positions)
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
// SYNC MANIFEST - All files that should be synced
// ============================================================================

type SyncTarget = 'templates' | 'prompts' | 'styling' | 'pedagogy' | 'regions' | 'skip';

interface ManifestEntry {
  /** Relative path from CLI_SKILL_DIR */
  source: string;
  /** Which output file this syncs to */
  target: SyncTarget;
  /** Export name in the target file (for documentation) */
  exportName?: string;
  /** Why this file is skipped (if target is 'skip') */
  skipReason?: string;
}

const SYNC_MANIFEST: ManifestEntry[] = [
  // ============================================================================
  // HTML TEMPLATES → templates.ts
  // ============================================================================
  // Simple patterns (fill placeholders)
  { source: 'phases/03-generate-slides/card-patterns/simple-patterns/title-zone.html', target: 'templates', exportName: 'TITLE_ZONE' },
  { source: 'phases/03-generate-slides/card-patterns/simple-patterns/content-box.html', target: 'templates', exportName: 'CONTENT_BOX' },
  { source: 'phases/03-generate-slides/card-patterns/simple-patterns/cfu-answer-card.html', target: 'templates', exportName: 'CFU_ANSWER_CARD' },
  { source: 'phases/03-generate-slides/card-patterns/simple-patterns/problem-reminder.html', target: 'templates', exportName: 'PROBLEM_REMINDER' },
  // SVG card (in card-patterns root)
  { source: 'phases/03-generate-slides/card-patterns/svg-card.html', target: 'templates', exportName: 'SVG_CARD' },
  // Complex patterns (copy & modify)
  { source: 'phases/03-generate-slides/card-patterns/complex-patterns/graph-snippet.html', target: 'templates', exportName: 'GRAPH_SNIPPET' },
  { source: 'phases/03-generate-slides/card-patterns/complex-patterns/annotation-snippet.html', target: 'templates', exportName: 'ANNOTATION_SNIPPET' },
  { source: 'phases/03-generate-slides/card-patterns/complex-patterns/printable-slide-snippet.html', target: 'templates', exportName: 'PRINTABLE_TEMPLATE' },
  { source: 'phases/03-generate-slides/card-patterns/complex-patterns/visual-card-layers.html', target: 'templates', exportName: 'VISUAL_CARD_LAYERS' },
  // Archived templates (legacy, for backward compatibility)
  { source: 'archived/templates/slide-base.html', target: 'templates', exportName: 'SLIDE_BASE_TEMPLATE' },
  { source: 'archived/templates/slide-with-cfu.html', target: 'templates', exportName: 'SLIDE_WITH_CFU_TEMPLATE' },
  { source: 'archived/templates/slide-with-answer.html', target: 'templates', exportName: 'SLIDE_WITH_ANSWER_TEMPLATE' },
  { source: 'archived/templates/slide-two-column.html', target: 'templates', exportName: 'SLIDE_TWO_COLUMN_TEMPLATE' },
  { source: 'archived/templates/slide-learning-goal.html', target: 'templates', exportName: 'SLIDE_LEARNING_GOAL_TEMPLATE' },
  { source: 'archived/templates/slide-practice.html', target: 'templates', exportName: 'SLIDE_PRACTICE_TEMPLATE' },
  { source: 'archived/templates/slide-with-svg.html', target: 'templates', exportName: 'SLIDE_WITH_SVG_TEMPLATE' },

  // ============================================================================
  // PHASE 1 & 3 INSTRUCTIONS → prompts.ts
  // ============================================================================
  // Phase 1: Problem analysis
  { source: 'phases/01-collect-and-analyze/analyze-problem.md', target: 'prompts', exportName: 'ANALYZE_PROBLEM_INSTRUCTIONS' },
  // Phase 3: Slide generation
  { source: 'phases/03-generate-slides/00-overview.md', target: 'prompts', exportName: 'PHASE3_OVERVIEW' },
  { source: 'phases/03-generate-slides/01-slide-by-slide.md', target: 'prompts', exportName: 'GENERATE_SLIDES_INSTRUCTIONS' },
  { source: 'phases/03-generate-slides/02-technical-rules.md', target: 'prompts', exportName: 'TECHNICAL_RULES' },
  { source: 'phases/03-generate-slides/03-pedagogy.md', target: 'prompts', exportName: 'SLIDE_PEDAGOGY_RULES' },
  // Checklists
  { source: 'phases/03-generate-slides/checklists/pre-flight.md', target: 'prompts', exportName: 'PRE_FLIGHT_CHECKLIST' },
  { source: 'phases/03-generate-slides/checklists/completion.md', target: 'prompts', exportName: 'COMPLETION_CHECKLIST' },
  // Phase 2: Confirmation (for browser wizard)
  { source: 'phases/02-confirm-and-plan/index.md', target: 'prompts', exportName: 'PHASE2_CONFIRM_PLAN' },

  // ============================================================================
  // VISUAL/STYLING RULES → styling.ts
  // ============================================================================
  { source: 'reference/styling.md', target: 'styling', exportName: 'STYLING_GUIDE' },
  { source: 'reference/layout-presets.md', target: 'styling', exportName: 'LAYOUT_PRESETS' },
  { source: 'reference/pptx-requirements.md', target: 'styling', exportName: 'PPTX_REQUIREMENTS' },
  { source: 'reference/diagram-patterns.md', target: 'styling', exportName: 'DIAGRAM_PATTERNS' },
  { source: 'phases/03-generate-slides/04-svg-workflow.md', target: 'styling', exportName: 'SVG_COORDINATE_PLANES' },
  { source: 'phases/03-generate-slides/visuals/annotation-zones.md', target: 'styling', exportName: 'ANNOTATION_ZONES' },
  { source: 'phases/01-collect-and-analyze/graph-planning.md', target: 'styling', exportName: 'GRAPH_PLANNING' },

  // ============================================================================
  // PEDAGOGY → pedagogy.ts
  // ============================================================================
  { source: 'reference/pedagogy.md', target: 'pedagogy', exportName: 'PEDAGOGY_RULES' },

  // ============================================================================
  // REGION POSITIONS → region-constants.ts
  // ============================================================================
  { source: 'reference/region-defaults.md', target: 'regions', exportName: 'REGION_DEFAULTS' },

  // ============================================================================
  // SKIPPED FILES (documented reasons)
  // ============================================================================
  { source: 'skill.md', target: 'skip', skipReason: 'CLI entry point, not needed for browser' },
  { source: 'update-system.md', target: 'skip', skipReason: 'Internal documentation' },
  { source: 'reference/conciseness-update-plan.md', target: 'skip', skipReason: 'Internal planning doc' },
  { source: 'phases/01-collect-and-analyze/index.md', target: 'skip', skipReason: 'Phase overview, content in analyze-problem.md' },
  { source: 'phases/03-generate-slides/card-patterns/README.md', target: 'skip', skipReason: 'Index doc, templates synced individually' },
  { source: 'phases/04-save-to-database/index.md', target: 'prompts', exportName: 'PHASE4_SAVE_EXPORT' },
  { source: 'phases/04-save-to-database/optimize-for-export.md', target: 'prompts', exportName: 'OPTIMIZE_FOR_EXPORT' },
  { source: 'phases/05-updating-decks/index.md', target: 'skip', skipReason: 'Update flow, CLI-only' },
  { source: 'templates/archived/cfu-toggle-snippet.html', target: 'skip', skipReason: 'Deprecated, use cfu-answer-card.html' },
  { source: 'templates/archived/answer-toggle-snippet.html', target: 'skip', skipReason: 'Deprecated, use cfu-answer-card.html' },
  { source: 'archived/templates/graph-snippet.html', target: 'skip', skipReason: 'Moved to card-patterns/complex-patterns/' },
  { source: 'archived/templates/annotation-snippet.html', target: 'skip', skipReason: 'Moved to card-patterns/complex-patterns/' },
];

// ============================================================================
// HELPERS
// ============================================================================

const escapeForTemplateLiteral = (s: string) => s.replace(/`/g, '\\`').replace(/\${/g, '\\${');

function readFileIfExists(filepath: string): string {
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath, 'utf-8');
  }
  return '';
}

function readAndEscape(filepath: string): string {
  const content = readFileIfExists(filepath);
  return content ? escapeForTemplateLiteral(content) : '';
}

function getManifestEntries(target: SyncTarget): ManifestEntry[] {
  return SYNC_MANIFEST.filter(e => e.target === target);
}

// ============================================================================
// MANIFEST VALIDATION
// ============================================================================

function validateManifest(): { missing: string[]; extra: string[] } {
  // Find all .md and .html files in skill directory
  const allFiles: string[] = [];

  function walkDir(dir: string, relativeTo: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(relativeTo, fullPath);
      if (entry.isDirectory()) {
        walkDir(fullPath, relativeTo);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.html')) {
        allFiles.push(relativePath);
      }
    }
  }

  walkDir(CLI_SKILL_DIR, CLI_SKILL_DIR);

  const manifestSources = new Set(SYNC_MANIFEST.map(e => e.source));

  // Files in directory but not in manifest
  const extra = allFiles.filter(f => !manifestSources.has(f));

  // Files in manifest but not in directory
  const missing = SYNC_MANIFEST
    .filter(e => !fs.existsSync(path.join(CLI_SKILL_DIR, e.source)))
    .map(e => e.source);

  return { missing, extra };
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

function syncTemplates() {
  const entries = getManifestEntries('templates');
  const outputFile = path.join(TS_SKILL_DIR, 'templates.ts');

  // Read all template files
  const templates: Record<string, string> = {};
  for (const entry of entries) {
    const filepath = path.join(CLI_SKILL_DIR, entry.source);
    const content = readAndEscape(filepath);
    if (content) {
      templates[entry.exportName!] = content.trim();
    } else {
      console.log(`  ⚠️  Template not found: ${entry.source}`);
    }
  }

  const content = `/**
 * HTML templates for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/
 * To update: Edit files there, then run: npm run sync-skill-content
 *
 * Synced files:
${entries.map(e => ` *   - ${e.source} → ${e.exportName}`).join('\n')}
 */

// ============================================================================
// ATOMIC CARD-PATTERNS (Current System)
// ============================================================================

export const TITLE_ZONE = \`
${templates['TITLE_ZONE'] || ''}
\`;

export const CONTENT_BOX = \`
${templates['CONTENT_BOX'] || ''}
\`;

export const CFU_ANSWER_CARD = \`
${templates['CFU_ANSWER_CARD'] || ''}
\`;

export const PROBLEM_REMINDER = \`
${templates['PROBLEM_REMINDER'] || ''}
\`;

export const SVG_CARD = \`
${templates['SVG_CARD'] || ''}
\`;

export const GRAPH_SNIPPET = \`
${templates['GRAPH_SNIPPET'] || ''}
\`;

export const ANNOTATION_SNIPPET = \`
${templates['ANNOTATION_SNIPPET'] || ''}
\`;

export const PRINTABLE_TEMPLATE = \`
${templates['PRINTABLE_TEMPLATE'] || ''}
\`;

export const VISUAL_CARD_LAYERS = \`
${templates['VISUAL_CARD_LAYERS'] || ''}
\`;

// ============================================================================
// LEGACY TEMPLATES (Archived - for backward compatibility)
// ============================================================================

/** @deprecated Use atomic card-patterns instead */
export const SLIDE_BASE_TEMPLATE = \`
${templates['SLIDE_BASE_TEMPLATE'] || ''}
\`;

/** @deprecated Use CFU_ANSWER_CARD instead */
export const SLIDE_WITH_CFU_TEMPLATE = \`
${templates['SLIDE_WITH_CFU_TEMPLATE'] || ''}
\`;

/** @deprecated Use CFU_ANSWER_CARD instead */
export const SLIDE_WITH_ANSWER_TEMPLATE = \`
${templates['SLIDE_WITH_ANSWER_TEMPLATE'] || ''}
\`;

/** @deprecated Use atomic card-patterns instead */
export const SLIDE_TWO_COLUMN_TEMPLATE = \`
${templates['SLIDE_TWO_COLUMN_TEMPLATE'] || ''}
\`;

/** @deprecated Use atomic card-patterns instead */
export const SLIDE_LEARNING_GOAL_TEMPLATE = \`
${templates['SLIDE_LEARNING_GOAL_TEMPLATE'] || ''}
\`;

/** @deprecated Use atomic card-patterns instead */
export const SLIDE_PRACTICE_TEMPLATE = \`
${templates['SLIDE_PRACTICE_TEMPLATE'] || ''}
\`;

/** @deprecated Use GRAPH_SNIPPET instead */
export const SLIDE_WITH_SVG_TEMPLATE = \`
${templates['SLIDE_WITH_SVG_TEMPLATE'] || ''}
\`;

// Legacy aliases
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced templates.ts (${entries.length} templates)`);
}

function syncPrompts() {
  const entries = getManifestEntries('prompts');
  const outputFile = path.join(TS_SKILL_DIR, 'prompts.ts');

  // Read all prompt files
  const prompts: Record<string, string> = {};
  for (const entry of entries) {
    const filepath = path.join(CLI_SKILL_DIR, entry.source);
    const content = readAndEscape(filepath);
    if (content) {
      prompts[entry.exportName!] = content.trim();
    } else {
      console.log(`  ⚠️  Prompt file not found: ${entry.source}`);
    }
  }

  const content = `/**
 * Prompt instructions for worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/
 * To update: Edit files there, then run: npm run sync-skill-content
 *
 * Synced files:
${entries.map(e => ` *   - ${e.source} → ${e.exportName}`).join('\n')}
 */

// ============================================================================
// PHASE 1: ANALYZE PROBLEM
// ============================================================================

export const ANALYZE_PROBLEM_INSTRUCTIONS = \`
${prompts['ANALYZE_PROBLEM_INSTRUCTIONS'] || ''}
\`;

// ============================================================================
// PHASE 2: CONFIRM AND PLAN
// ============================================================================

export const PHASE2_CONFIRM_PLAN = \`
${prompts['PHASE2_CONFIRM_PLAN'] || ''}
\`;

// ============================================================================
// PHASE 3: GENERATE SLIDES
// ============================================================================

export const PHASE3_OVERVIEW = \`
${prompts['PHASE3_OVERVIEW'] || ''}
\`;

export const GENERATE_SLIDES_INSTRUCTIONS = \`
${prompts['GENERATE_SLIDES_INSTRUCTIONS'] || ''}
\`;

export const TECHNICAL_RULES = \`
${prompts['TECHNICAL_RULES'] || ''}
\`;

export const SLIDE_PEDAGOGY_RULES = \`
${prompts['SLIDE_PEDAGOGY_RULES'] || ''}
\`;

// ============================================================================
// CHECKLISTS
// ============================================================================

export const PRE_FLIGHT_CHECKLIST = \`
${prompts['PRE_FLIGHT_CHECKLIST'] || ''}
\`;

export const COMPLETION_CHECKLIST = \`
${prompts['COMPLETION_CHECKLIST'] || ''}
\`;

// ============================================================================
// PHASE 4: SAVE & EXPORT
// ============================================================================

export const PHASE4_SAVE_EXPORT = \`
${prompts['PHASE4_SAVE_EXPORT'] || ''}
\`;

export const OPTIMIZE_FOR_EXPORT = \`
${prompts['OPTIMIZE_FOR_EXPORT'] || ''}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced prompts.ts (${entries.length} files)`);
}

function syncStyling() {
  const entries = getManifestEntries('styling');
  const outputFile = path.join(TS_SKILL_DIR, 'styling.ts');

  // Read all styling files
  const styles: Record<string, string> = {};
  for (const entry of entries) {
    const filepath = path.join(CLI_SKILL_DIR, entry.source);
    const content = readAndEscape(filepath);
    if (content) {
      styles[entry.exportName!] = content.trim();
    } else {
      console.log(`  ⚠️  Styling file not found: ${entry.source}`);
    }
  }

  // Extract sections from styling.md for backward compatibility
  const stylingMd = readFileIfExists(path.join(CLI_SKILL_DIR, 'reference/styling.md'));
  const colorPaletteMatch = stylingMd.match(/(## Color Palette[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const typographyMatch = stylingMd.match(/(## Typography[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const slideContainerMatch = stylingMd.match(/(## Basic Slide Structure[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const contentBoxesMatch = stylingMd.match(/(## Common Patterns[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);

  const content = `/**
 * Styling guide for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/
 * To update: Edit files there, then run: npm run sync-skill-content
 *
 * Synced files:
${entries.map(e => ` *   - ${e.source} → ${e.exportName}`).join('\n')}
 */

// ============================================================================
// COMPLETE REFERENCE DOCUMENTS
// ============================================================================

export const STYLING_GUIDE = \`
${styles['STYLING_GUIDE'] || ''}
\`;

export const LAYOUT_PRESETS = \`
${styles['LAYOUT_PRESETS'] || ''}
\`;

export const PPTX_REQUIREMENTS = \`
${styles['PPTX_REQUIREMENTS'] || ''}
\`;

export const DIAGRAM_PATTERNS = \`
${styles['DIAGRAM_PATTERNS'] || ''}
\`;

export const SVG_COORDINATE_PLANES = \`
${styles['SVG_COORDINATE_PLANES'] || ''}
\`;

export const ANNOTATION_ZONES = \`
${styles['ANNOTATION_ZONES'] || ''}
\`;

export const GRAPH_PLANNING = \`
${styles['GRAPH_PLANNING'] || ''}
\`;

// ============================================================================
// EXTRACTED SECTIONS (backward compatibility)
// ============================================================================

export const COLOR_PALETTE = \`
${escapeForTemplateLiteral(colorPaletteMatch ? colorPaletteMatch[1].trim() : '')}
\`;

export const TYPOGRAPHY = \`
${escapeForTemplateLiteral(typographyMatch ? typographyMatch[1].trim() : '')}
\`;

export const SLIDE_CONTAINER = \`
${escapeForTemplateLiteral(slideContainerMatch ? slideContainerMatch[1].trim() : '')}
\`;

export const CONTENT_BOXES = \`
${escapeForTemplateLiteral(contentBoxesMatch ? contentBoxesMatch[1].trim() : '')}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced styling.ts (${entries.length} files)`);
}

function syncPedagogy() {
  const entries = getManifestEntries('pedagogy');
  const outputFile = path.join(TS_SKILL_DIR, 'pedagogy.ts');

  const pedagogyMd = readFileIfExists(path.join(CLI_SKILL_DIR, 'reference/pedagogy.md'));

  // Extract sections
  const fourRulesMatch = pedagogyMd.match(/(## The Four Rules[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const cfuPatternsMatch = pedagogyMd.match(/(## Check-for-Understanding \(CFU\) Question Patterns[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);
  const slideStructureMatch = pedagogyMd.match(/(## Slide Structure[\s\S]*?)(?=\n## [A-Z]|---|\n$)/);

  const content = `/**
 * Pedagogy rules for worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/pedagogy.md
 * To update: Edit the file there, then run: npm run sync-skill-content
 */

export const FOUR_RULES = \`
${escapeForTemplateLiteral(fourRulesMatch ? fourRulesMatch[1].trim() : '')}
\`;

export const CFU_PATTERNS = \`
${escapeForTemplateLiteral(cfuPatternsMatch ? cfuPatternsMatch[1].trim() : '')}
\`;

export const SLIDE_STRUCTURE = \`
${escapeForTemplateLiteral(slideStructureMatch ? slideStructureMatch[1].trim() : '')}
\`;

export const PEDAGOGY_RULES = \`
${escapeForTemplateLiteral(pedagogyMd.trim())}
\`;
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced pedagogy.ts`);
}

function syncRegionDefaults() {
  const sourceFile = path.join(CLI_SKILL_DIR, 'reference/region-defaults.md');
  const outputFile = path.join(ROOT, 'src/app/api/scm/worked-examples/export-pptx/helpers/region-constants.ts');

  if (!fs.existsSync(sourceFile)) {
    console.log('⚠️  No region-defaults.md found, skipping');
    return;
  }

  const markdown = fs.readFileSync(sourceFile, 'utf-8');

  // Parse region positions from markdown
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

  // Parse typography from markdown
  // Format: element: size, weight, color
  const typographyPattern = /^([\w-]+):\s*(\d+),\s*(bold|regular),\s*([A-Fa-f0-9]{6})\s*$/gm;
  const typography: Record<string, { size: number; bold: boolean; color: string }> = {};

  while ((match = typographyPattern.exec(markdown)) !== null) {
    const [, name, size, weight, color] = match;
    typography[name] = {
      size: parseInt(size, 10),
      bold: weight === 'bold',
      color,
    };
  }

  // Parse colors from markdown
  // Format: name: HEXCOLOR
  const colorPattern = /^([\w-]+):\s*([A-Fa-f0-9]{6})\s*$/gm;
  const colors: Record<string, string> = {};

  while ((match = colorPattern.exec(markdown)) !== null) {
    const [, name, color] = match;
    // Skip typography entries (which also match this pattern)
    if (!typography[name]) {
      colors[name] = color;
    }
  }

  const regionEntries = Object.entries(regions)
    .map(([name, pos]) => `  '${name}': { x: ${pos.x}, y: ${pos.y}, w: ${pos.w}, h: ${pos.h} }`)
    .join(',\n');

  const typographyEntries = Object.entries(typography)
    .map(([name, t]) => `  '${name}': { size: ${t.size}, bold: ${t.bold}, color: '${t.color}' }`)
    .join(',\n');

  const colorEntries = Object.entries(colors)
    .map(([name, color]) => `  '${name}': '${color}'`)
    .join(',\n');

  const content = `/**
 * Region default positions, typography, and colors for PPTX slide layout.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/region-defaults.md
 * To update: Edit the markdown file, then run: npm run sync-skill-content
 */

// Slide dimensions
export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;
export const MARGIN = 20;

// Region default positions (pixels)
export const REGION_DEFAULTS: Record<string, { x: number; y: number; w: number; h: number }> = {
${regionEntries}
};

// Typography (shared between HTML generation and PPTX export)
export const TYPOGRAPHY: Record<string, { size: number; bold: boolean; color: string }> = {
${typographyEntries}
};

// Colors (shared between HTML generation and PPTX export)
export const COLORS: Record<string, string> = {
${colorEntries}
};

// Bounds validation helpers
export const MAX_RIGHT = SLIDE_WIDTH - MARGIN; // 940
export const MAX_BOTTOM = SLIDE_HEIGHT; // 540

export function isWithinBounds(x: number, y: number, w: number, h: number): boolean {
  return (x + w <= MAX_RIGHT) && (y + h <= MAX_BOTTOM);
}
`;

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Synced region-constants.ts (${Object.keys(regions).length} regions, ${Object.keys(typography).length} typography, ${Object.keys(colors).length} colors)`);
}

// ============================================================================
// AUTO-UPDATE INDEX.TS
// ============================================================================

function syncIndex() {
  const indexFile = path.join(ROOT, 'src/skills/worked-example/index.ts');

  // Get all prompt exports from manifest
  const promptEntries = getManifestEntries('prompts');
  const promptExports = promptEntries.map(e => e.exportName!);

  const content = `/**
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
 * \`\`\`typescript
 * // In browser creator
 * import { PEDAGOGY_RULES, STYLING_GUIDE, CFU_TOGGLE_TEMPLATE } from '@/skills/worked-example';
 *
 * // In prompts
 * const systemPrompt = \`\${PEDAGOGY_RULES}\\n\\n\${STYLING_GUIDE}\`;
 * \`\`\`
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
${promptExports.map(e => `  ${e},`).join('\n')}
} from './content/prompts';

// Context-specific instructions
export {
  type ExecutionContext,
  CLI_CONTEXT,
  BROWSER_CONTEXT,
  getContextInstructions,
  COMMON_INSTRUCTIONS,
} from './context';
`;

  fs.writeFileSync(indexFile, content);
  console.log(`✅ Synced index.ts (${promptExports.length} prompt exports)`);
}

// ============================================================================
// CHECK CONSUMER IMPORTS
// ============================================================================

function checkConsumerImports() {
  const consumerFile = path.join(ROOT, 'src/app/scm/workedExamples/create/lib/prompts.ts');

  if (!fs.existsSync(consumerFile)) {
    console.log('⚠️  Consumer file not found: lib/prompts.ts');
    return;
  }

  const consumerContent = fs.readFileSync(consumerFile, 'utf-8');

  // Get all prompt exports from manifest
  const promptEntries = getManifestEntries('prompts');
  const missingImports: string[] = [];

  for (const entry of promptEntries) {
    const exportName = entry.exportName!;
    // Check if it's imported (either directly or with alias)
    if (!consumerContent.includes(exportName)) {
      missingImports.push(exportName);
    }
  }

  if (missingImports.length > 0) {
    console.log('\n📦 Consumer file missing these imports:');
    console.log(`   File: src/app/scm/workedExamples/create/lib/prompts.ts`);
    missingImports.forEach(e => console.log(`   - ${e}`));
    console.log('\n   To fix: Import and use these exports in your system prompts.');
  } else {
    console.log('✅ Consumer file has all prompt imports');
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔄 Syncing skill content from CLI source to TypeScript module...\n');
  console.log(`   Source: ${CLI_SKILL_DIR}`);
  console.log(`   Output: ${TS_SKILL_DIR}\n`);

  // Validate manifest first
  console.log('📋 Validating manifest...');
  const { missing, extra } = validateManifest();

  if (missing.length > 0) {
    console.log('\n⚠️  Files in manifest but missing from disk:');
    missing.forEach(f => console.log(`   - ${f}`));
  }

  if (extra.length > 0) {
    console.log('\n⚠️  Files on disk but not in manifest (add to SYNC_MANIFEST):');
    extra.forEach(f => console.log(`   - ${f}`));
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log('   ✅ All files accounted for\n');
  } else {
    console.log('');
  }

  // Print sync mapping
  console.log('📊 Sync mapping:');
  const targets = ['templates', 'prompts', 'styling', 'pedagogy', 'regions'] as const;
  for (const target of targets) {
    const entries = getManifestEntries(target);
    console.log(`   ${target}.ts: ${entries.length} files`);
  }
  const skipped = getManifestEntries('skip');
  console.log(`   skipped: ${skipped.length} files\n`);

  try {
    // Sync content files
    syncTemplates();
    syncPrompts();
    syncStyling();
    syncPedagogy();
    syncRegionDefaults();

    // Auto-update index.ts with all prompt exports
    syncIndex();

    // Check consumer imports
    console.log('\n🔍 Checking consumer imports...');
    checkConsumerImports();

    console.log('\n✅ All content synced successfully!');
    console.log('\n📝 Source of truth: .claude/skills/create-worked-example-sg/');
    console.log('   Edit files there, then run this script to propagate changes.\n');

    // Final warning if there are untracked files
    if (extra.length > 0) {
      console.log('⚠️  WARNING: Some files are not tracked in the manifest.');
      console.log('   Add them to SYNC_MANIFEST in scripts/sync-skill-content.ts\n');
    }
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
