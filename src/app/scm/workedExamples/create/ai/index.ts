/**
 * AI Content Loader
 *
 * This module exports all AI prompting content (markdown and HTML files)
 * for the worked example creator. Content is loaded directly from the
 * colocated ai/ directory.
 *
 * Previously, content was synced from .claude/skills/create-worked-example-sg/
 * via a sync script. Now everything is colocated here.
 *
 * NOTE: This module uses synchronous file reads at module load time.
 * This is fine for Next.js server components/actions where this runs server-side.
 */

import * as fs from 'fs';
import * as path from 'path';

const AI_DIR = path.dirname(__filename);

/**
 * Read a file from the ai/ directory and return its contents.
 */
function readContent(relativePath: string): string {
  const fullPath = path.join(AI_DIR, relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

// ============================================================================
// HTML TEMPLATES (Card Patterns)
// ============================================================================

// Simple patterns (fill placeholders)
export const TITLE_ZONE = readContent(
  'card-patterns/simple-patterns/title-zone.html'
);
export const CONTENT_BOX = readContent(
  'card-patterns/simple-patterns/content-box.html'
);
export const CFU_ANSWER_CARD = readContent(
  'card-patterns/simple-patterns/cfu-answer-card.html'
);
export const PROBLEM_REMINDER = readContent(
  'card-patterns/simple-patterns/problem-reminder.html'
);

// SVG card
export const SVG_CARD = readContent('card-patterns/svg-card.html');

// Complex patterns (copy & modify)
export const GRAPH_SNIPPET = readContent(
  'card-patterns/complex-patterns/graph-snippet.html'
);
export const ANNOTATION_SNIPPET = readContent(
  'card-patterns/complex-patterns/annotation-snippet.html'
);
export const PRINTABLE_TEMPLATE = readContent(
  'card-patterns/complex-patterns/printable-slide-snippet.html'
);
export const VISUAL_CARD_LAYERS = readContent(
  'card-patterns/complex-patterns/visual-card-layers.html'
);
export const D3_DIAGRAM_TEMPLATE = readContent(
  'card-patterns/complex-patterns/d3-diagram-template.html'
);
export const SLIDE_TEACHER_INSTRUCTIONS_TEMPLATE = readContent(
  'card-patterns/complex-patterns/slide-teacher-instructions.html'
);
export const SLIDE_BIG_IDEA_TEMPLATE = readContent(
  'card-patterns/complex-patterns/slide-big-idea.html'
);

// Archived templates (legacy, for backward compatibility)
export const SLIDE_BASE_TEMPLATE = readContent(
  'archived/templates/slide-base.html'
);
export const SLIDE_WITH_CFU_TEMPLATE = readContent(
  'archived/templates/slide-with-cfu.html'
);
export const SLIDE_WITH_ANSWER_TEMPLATE = readContent(
  'archived/templates/slide-with-answer.html'
);
export const SLIDE_TWO_COLUMN_TEMPLATE = readContent(
  'archived/templates/slide-two-column.html'
);
export const SLIDE_LEARNING_GOAL_TEMPLATE = readContent(
  'archived/templates/slide-learning-goal.html'
);
export const SLIDE_PRACTICE_TEMPLATE = readContent(
  'archived/templates/slide-practice.html'
);
export const SLIDE_WITH_SVG_TEMPLATE = readContent(
  'archived/templates/slide-with-svg.html'
);

// ============================================================================
// PHASE 1 & 3 INSTRUCTIONS (Prompts)
// ============================================================================

// Phase 1: Problem analysis
export const ANALYZE_PROBLEM_INSTRUCTIONS = readContent(
  'phases/01-collect-and-analyze/analyze-problem.md'
);
export const ANALYZE_OUTPUT_SCHEMA = readContent(
  'phases/01-collect-and-analyze/output-schema.md'
);

// Phase 2: Confirmation
export const PHASE2_CONFIRM_PLAN = readContent(
  'phases/02-confirm-and-plan/index.md'
);

// Phase 3: Slide generation
export const PHASE3_OVERVIEW = readContent(
  'phases/03-generate-slides/00-overview.md'
);
export const GENERATE_SLIDES_INSTRUCTIONS = readContent(
  'phases/03-generate-slides/01-slide-by-slide.md'
);
export const TECHNICAL_RULES = readContent(
  'phases/03-generate-slides/02-technical-rules.md'
);
export const SLIDE_PEDAGOGY_RULES = readContent(
  'phases/03-generate-slides/03-pedagogy.md'
);

// Checklists
export const PRE_FLIGHT_CHECKLIST = readContent(
  'phases/03-generate-slides/checklists/pre-flight.md'
);
export const COMPLETION_CHECKLIST = readContent(
  'phases/03-generate-slides/checklists/completion.md'
);

// Phase 4: Save & export
export const PHASE4_SAVE_EXPORT = readContent(
  'phases/04-save-to-database/index.md'
);
export const OPTIMIZE_FOR_EXPORT = readContent(
  'phases/04-save-to-database/optimize-for-export.md'
);

// ============================================================================
// VISUAL/STYLING RULES
// ============================================================================

export const STYLING_GUIDE = readContent('reference/styling.md');
export const LAYOUT_PRESETS = readContent('reference/layout-presets.md');
export const PPTX_REQUIREMENTS = readContent('reference/pptx-requirements.md');
export const DIAGRAM_PATTERNS = readContent('reference/diagram-patterns.md');
export const SVG_COORDINATE_PLANES = readContent(
  'phases/03-generate-slides/04-svg-workflow.md'
);
export const ANNOTATION_ZONES = readContent(
  'phases/03-generate-slides/visuals/annotation-zones.md'
);
export const GRAPH_PLANNING = readContent(
  'phases/01-collect-and-analyze/graph-planning.md'
);

// ============================================================================
// PEDAGOGY
// ============================================================================

export const PEDAGOGY_RULES = readContent('reference/pedagogy.md');

// ============================================================================
// REGION POSITIONS (for PPTX export)
// ============================================================================

export const REGION_DEFAULTS = readContent('reference/region-defaults.md');

// ============================================================================
// EXTRACTED SECTIONS (from pedagogy.md)
// These were previously extracted by the sync script
// ============================================================================

// CFU patterns section
export const CFU_PATTERNS = `
## Check-for-Understanding (CFU) Question Patterns

### CFU Format Rules (STRICTLY ENFORCED)
- **ONE question only** - never two-part questions
- **12 words max** - if longer, it's too complex
- **Strategy-focused** - ask about WHY, not WHAT

### Good CFU Questions (Strategy-focused, ≤12 words)
- "Why did I [VERB] first?" ✅ (6 words)
- "How did I know to [VERB] here?" ✅ (8 words)
- "Why is the '?' at the beginning?" ✅ (7 words)
- "How does [VERB]ing help me find the answer?" ✅ (9 words)

### Bad CFU Questions
- "What is 6 ÷ 2?" ❌ (computation, not strategy)
- "What's the answer?" ❌ (result-focused)
- "What is turtle g's speed? How did you calculate it?" ❌ (TWO questions!)
- "Why did I subtract 4 from both sides instead of dividing first?" ❌ (17 words - too long!)

**The difference**: Good questions are SHORT, ask about decision-making and strategy. Bad questions ask for calculations or are too wordy.
`;

// Slide structure section
export const SLIDE_STRUCTURE = `
## Slide Structure (7 Slides)

### Slide 1: Teacher Instructions
**Purpose**: Provide teacher with lesson overview (not shown to students)
**Content**:
- Big Idea (core mathematical concept)
- Learning Targets
- Strategy overview (name + summary)
- Visually quiet, informational design

### Slide 2: Big Idea
**Purpose**: Introduce the core concept to students
**Content**:
- Grade/Unit/Lesson prominently displayed
- "BIG IDEA" badge
- Big Idea statement (large, centered)
- Clean, student-facing design with gradient background

### Slide 3: Problem Setup (Scenario 1)
**Purpose**: Provide context and show complete problem
**Content**:
- Engaging scenario with theme icon
- Problem statement
- Visual representation (graph, table, diagram)
- No solution yet

### Slides 4-6: Step-by-Step with CFU + Answer (Stacked)

**Each step is ONE slide with both CFU and Answer boxes (animated):**

**Step N Slide** (e.g., Slide 4):
- Step badge: "STEP 1"
- Title: The action question (e.g., "IDENTIFY the slope and y-intercept")
- Visual with result highlighted/annotated
- Problem reminder at bottom left corner
- CFU box (appears on FIRST click)
- Answer box (appears on SECOND click, overlays CFU)

**Number of Steps**: 3 steps = 3 slides

### Slide 7: Printable Worksheet (Final Slide)
**Purpose**: Provide take-home practice
**Content**:
- Practice Problem 1 (Scenario 2) with space for student work
- Practice Problem 2 (Scenario 3) with space for student work
- Must be 8.5" × 11" for printing
`;

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Legacy templates (deprecated toggle-based approach)
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;

// Alias for FOUR_RULES (was empty in original)
export const FOUR_RULES = '';
