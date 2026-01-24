/**
 * AI Content Loader
 *
 * This module exports all AI prompting content (markdown and HTML files)
 * for the worked example creator. Content is imported at build time using
 * Webpack's asset/source loader.
 */

// ============================================================================
// HTML TEMPLATES (Card Patterns)
// ============================================================================

// Simple patterns (fill placeholders)
import TITLE_ZONE from './card-patterns/simple-patterns/title-zone.html';
import CONTENT_BOX from './card-patterns/simple-patterns/content-box.html';
import CFU_ANSWER_CARD from './card-patterns/simple-patterns/cfu-answer-card.html';
import PROBLEM_REMINDER from './card-patterns/simple-patterns/problem-reminder.html';

// SVG card
import SVG_CARD from './card-patterns/svg-card.html';

// Complex patterns (copy & modify)
import GRAPH_SNIPPET from './card-patterns/complex-patterns/graph-snippet.html';
import ANNOTATION_SNIPPET from './card-patterns/complex-patterns/annotation-snippet.html';
import PRINTABLE_TEMPLATE from './card-patterns/complex-patterns/printable-slide-snippet.html';
import VISUAL_CARD_LAYERS from './card-patterns/complex-patterns/visual-card-layers.html';
import D3_DIAGRAM_TEMPLATE from './card-patterns/complex-patterns/d3-diagram-template.html';
import SLIDE_TEACHER_INSTRUCTIONS_TEMPLATE from './card-patterns/complex-patterns/slide-teacher-instructions.html';
import SLIDE_BIG_IDEA_TEMPLATE from './card-patterns/complex-patterns/slide-big-idea.html';

// Archived templates (legacy, for backward compatibility)
import SLIDE_BASE_TEMPLATE from './archived/templates/slide-base.html';
import SLIDE_WITH_CFU_TEMPLATE from './archived/templates/slide-with-cfu.html';
import SLIDE_WITH_ANSWER_TEMPLATE from './archived/templates/slide-with-answer.html';
import SLIDE_TWO_COLUMN_TEMPLATE from './archived/templates/slide-two-column.html';
import SLIDE_LEARNING_GOAL_TEMPLATE from './archived/templates/slide-learning-goal.html';
import SLIDE_PRACTICE_TEMPLATE from './archived/templates/slide-practice.html';
import SLIDE_WITH_SVG_TEMPLATE from './archived/templates/slide-with-svg.html';

// ============================================================================
// PHASE 1 & 3 INSTRUCTIONS (Prompts)
// ============================================================================

// Phase 1: Problem analysis
import ANALYZE_PROBLEM_INSTRUCTIONS from './phases/01-collect-and-analyze/analyze-problem.md';
import ANALYZE_OUTPUT_SCHEMA from './phases/01-collect-and-analyze/output-schema.md';

// Phase 2: Confirmation
import PHASE2_CONFIRM_PLAN from './phases/02-confirm-and-plan/index.md';

// Phase 3: Slide generation
import PHASE3_OVERVIEW from './phases/03-generate-slides/00-overview.md';
import GENERATE_SLIDES_INSTRUCTIONS from './phases/03-generate-slides/01-slide-by-slide.md';
import TECHNICAL_RULES from './phases/03-generate-slides/02-technical-rules.md';
import SLIDE_PEDAGOGY_RULES from './phases/03-generate-slides/03-pedagogy.md';

// Checklists
import PRE_FLIGHT_CHECKLIST from './phases/03-generate-slides/checklists/pre-flight.md';
import COMPLETION_CHECKLIST from './phases/03-generate-slides/checklists/completion.md';

// Phase 4: Save & export
import PHASE4_SAVE_EXPORT from './phases/04-save-to-database/index.md';
import OPTIMIZE_FOR_EXPORT from './phases/04-save-to-database/optimize-for-export.md';

// ============================================================================
// VISUAL/STYLING RULES
// ============================================================================

import STYLING_GUIDE from './reference/styling.md';
import LAYOUT_PRESETS from './reference/layout-presets.md';
import PPTX_REQUIREMENTS from './reference/pptx-requirements.md';
import DIAGRAM_PATTERNS from './reference/diagram-patterns.md';
import SVG_COORDINATE_PLANES from './phases/03-generate-slides/04-svg-workflow.md';
import ANNOTATION_ZONES from './phases/03-generate-slides/visuals/annotation-zones.md';
import GRAPH_PLANNING from './phases/01-collect-and-analyze/graph-planning.md';

// ============================================================================
// PEDAGOGY
// ============================================================================

import PEDAGOGY_RULES from './reference/pedagogy.md';

// ============================================================================
// REGION POSITIONS (for PPTX export)
// ============================================================================

import REGION_DEFAULTS from './reference/region-defaults.md';

// ============================================================================
// RE-EXPORTS
// ============================================================================

export {
  // Simple patterns
  TITLE_ZONE,
  CONTENT_BOX,
  CFU_ANSWER_CARD,
  PROBLEM_REMINDER,
  // SVG card
  SVG_CARD,
  // Complex patterns
  GRAPH_SNIPPET,
  ANNOTATION_SNIPPET,
  PRINTABLE_TEMPLATE,
  VISUAL_CARD_LAYERS,
  D3_DIAGRAM_TEMPLATE,
  SLIDE_TEACHER_INSTRUCTIONS_TEMPLATE,
  SLIDE_BIG_IDEA_TEMPLATE,
  // Archived templates
  SLIDE_BASE_TEMPLATE,
  SLIDE_WITH_CFU_TEMPLATE,
  SLIDE_WITH_ANSWER_TEMPLATE,
  SLIDE_TWO_COLUMN_TEMPLATE,
  SLIDE_LEARNING_GOAL_TEMPLATE,
  SLIDE_PRACTICE_TEMPLATE,
  SLIDE_WITH_SVG_TEMPLATE,
  // Phase 1
  ANALYZE_PROBLEM_INSTRUCTIONS,
  ANALYZE_OUTPUT_SCHEMA,
  // Phase 2
  PHASE2_CONFIRM_PLAN,
  // Phase 3
  PHASE3_OVERVIEW,
  GENERATE_SLIDES_INSTRUCTIONS,
  TECHNICAL_RULES,
  SLIDE_PEDAGOGY_RULES,
  PRE_FLIGHT_CHECKLIST,
  COMPLETION_CHECKLIST,
  // Phase 4
  PHASE4_SAVE_EXPORT,
  OPTIMIZE_FOR_EXPORT,
  // Visual/styling
  STYLING_GUIDE,
  LAYOUT_PRESETS,
  PPTX_REQUIREMENTS,
  DIAGRAM_PATTERNS,
  SVG_COORDINATE_PLANES,
  ANNOTATION_ZONES,
  GRAPH_PLANNING,
  // Pedagogy
  PEDAGOGY_RULES,
  // Region defaults
  REGION_DEFAULTS,
};

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
