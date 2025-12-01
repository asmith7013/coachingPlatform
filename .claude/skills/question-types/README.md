# D3 Question Type Implementation Skills

This directory contains specialized skills for implementing different types of D3 interactive questions.

## Available Question Types

### 1. [Increment Controls Question](implement-increment-controls-question/)
**Pattern:** +/- buttons with emoji/visual displays
**Use for:** Ratio mixtures, recipe scaling, quantity adjustments
**Frequency:** ~40-50% of questions
**Components:** `createStandardCard`, `createExplanationCard`, increment buttons
**Examples:** Drink mix problems, recipe questions

### 2. [Table Input Question](implement-table-question/)
**Pattern:** Fill-in-the-blank tables with text inputs
**Use for:** Ratio tables, completion tables, data entry
**Frequency:** ~20-25% of questions
**Components:** HTML tables or D3 tables, `createStandardCard`
**Examples:** Ratio completion, pattern tables

### 3. [Static Graph Question](implement-static-graph-question/)
**Pattern:** Static D3 line graph with coordinating table inputs
**Use for:** Reading graphs, completing tables from graphs, rate/proportion questions
**Frequency:** ~10-15% of questions
**Components:** `renderStaticGraph()`, table inputs, `createStandardCard`
**Examples:** Coordinate reading, rate tables, proportional relationships

### 4. [Multiple Choice Question](implement-multiple-choice-question/)
**Pattern:** Radio button selections with explanations
**Use for:** Equation selection, concept selection, option choosing
**Frequency:** ~15-20% of questions
**Components:** Custom radio cards, `createStandardCard`, `createExplanationCard`
**Examples:** Equation matching, concept identification

### 5. [Drag Match Question](implement-drag-match-question/)
**Pattern:** Drag-and-drop categorization
**Use for:** Matching tables to equations, categorization, ordering
**Frequency:** ~5-10% of questions
**Components:** `createDragMatcher` (full system)
**Examples:** Match tables to equations/graphs

### 6. [Slider Question](implement-slider-question/)
**Pattern:** Interactive sliders/controls with live visualization updates
**Use for:** Continuous value adjustment, parameter exploration
**Frequency:** ~5% of questions
**Components:** Range inputs, D3 visualizations, `createStandardCard`
**Examples:** Parameter exploration, continuous adjustments

### 7. [Video Question](implement-video-question/)
**Pattern:** Video player with written response
**Use for:** Video-based instruction requiring student reflection
**Frequency:** ~5% of questions
**Components:** `createVideoPlayer`, `createExplanationCard`, `createStandardCard`
**Examples:** Watch and explain, video-based lessons

### 8. [Text Response Question](implement-text-response-question/)
**Pattern:** Static content with text explanations (no video as primary content)
**Use for:** Analysis questions, open responses without video
**Frequency:** ~5% of questions
**Components:** `createExplanationCard`, `createStandardCard`
**Examples:** Text-based reflections, diagram analysis

### 9. [Dynamic Graph Question](implement-dynamic-graph-question/)
**Pattern:** Interactive p5.js coordinate plane for drawing lines
**Use for:** Drawing linear relationships, proportional exploration, slope investigation
**Frequency:** ~5% of questions
**Components:** p5.js coordinate plane (instance mode), `createStandardCard`
**Examples:** Draw lines from origin, match slopes, connect data points

### 10. [Double Number Line Question](implement-double-number-line-question/)
**Pattern:** Two parallel number lines with input boxes showing proportional relationships
**Use for:** Equivalent ratios, proportional relationships, rate visualization
**Frequency:** ~5% of questions
**Components:** SVG foreignObject for input positioning, `createStandardCard`
**Examples:** Complete ratio number lines, find missing equivalent values

### 11. [Custom D3 Question](implement-custom-d3-question/)
**Pattern:** Fallback for unique/complex interactions
**Use for:** Questions not fitting standard patterns
**Frequency:** Rare
**Components:** Custom implementation, refer to common-snippets
**Examples:** Unique visualizations, complex interactions

## How to Use These Skills

### 1. Identify Your Question Type
Look at your source material and match it to one of the patterns above.

### 2. Reference the Appropriate Skill

Each skill directory follows a **standard structure**:

```
implement-{type}-question/
├── SKILL.md          # Complete implementation guide (REQUIRED)
├── PATTERN.md        # Quick visual reference (optional)
└── snippets/         # Reusable components (optional)
    └── {component}.js
```

**File Purposes:**
- **SKILL.md** - Primary documentation: when to use, components needed, implementation steps, configuration options, checklist, working example paths
- **PATTERN.md** - Quick visual reference for complex patterns (drag-match, slider, table, double-number-line)
- **snippets/** - Standalone, configurable components to be inlined into chart.js (coordinate-plane-p5, double-number-line)

### 3. Follow the Implementation Steps
Each SKILL.md provides:
- When to use this pattern vs others
- Required components to inline
- Implementation steps and configuration
- Paths to working codebase examples
- Customization points
- Implementation checklist

### 4. Reuse Existing Components

All reusable components are in `snippets/` directories and must be **inlined directly into chart.js** for production.

**Shared Components** (in `.claude/skills/question-types/snippets/` - used by ALL question types):
- `cards/standard-card.js` - `createStandardCard()` - Standard question card layout
- `cards/video-player.js` - `createVideoPlayer()` - Video player component
- `cards/video-accordion.js` - `createVideoAccordion()` - Collapsible video help
- `cards/explanation-card.js` - `createExplanationCard()` - Student explanation textarea
- `form-inputs.js` - Buttons, inputs, textareas
- `svg-basics.js` - SVG shapes and diagrams

**Question-Specific Snippets** (in `implement-{type}-question/snippets/` - one component per question type):
- `drag-match.js` - Full drag-and-drop categorization system (drag-match)
- `static-graph.js` - Static line graph rendering with grid, axes, arrowheads (static-graph)
- `tables.js` - D3 tables with input cells (table)
- `video-response.js` - Video player + response card pattern (video)
- `coordinate-plane-p5.js` - P5.js interactive coordinate plane component (dynamic-graph)
- `double-number-line.js` - Double number line component with foreignObject inputs (double-number-line)

**Working Examples** (reference these codebase paths):
- Drag-match: `courses/IM-8th-Grade/modules/Unit-3/assignments/510-Proportion-Equations/questions/06/attachments/chart.js`
- Slider: `courses/IM-8th-Grade/modules/Unit-3/assignments/161-Proportion-Graphs/questions/11/attachments/chart.js`
- Static graph: `courses/IM-8th-Grade/modules/Unit-3/assignments/161-Proportion-Graphs/questions/06/attachments/chart.js`
- Table: `courses/IM-8th-Grade/modules/Unit-3/assignments/117-Equivalent-Ratios/questions/05/attachments/chart.js`
- Video: `courses/IM-8th-Grade/modules/Unit-3/assignments/161-Proportion-Graphs/questions/01/attachments/chart.js`
- Double-number-line: `courses/IM-8th-Grade/modules/Unit-3/assignments/117-Equivalent-Ratios/questions/02/attachments/chart.js`

## Decision Tree

```
What does the student do?

Adjust quantities with +/- buttons?
├─ YES → implement-increment-controls-question
└─ NO ↓

Fill in table cells?
├─ YES → Does it include a graph?
│   ├─ YES → implement-static-graph-question
│   └─ NO → implement-table-question
└─ NO ↓

Drag items to categories?
├─ YES → implement-drag-match-question
└─ NO ↓

Select from options (radio)?
├─ YES → implement-multiple-choice-question
└─ NO ↓

Adjust continuous values (slider)?
├─ YES → implement-slider-question
└─ NO ↓

Watch video and explain?
├─ YES → implement-video-question
└─ NO ↓

Write text explanation (no video)?
├─ YES → implement-text-response-question
└─ NO ↓

Draw lines or points on coordinate plane?
├─ YES → implement-dynamic-graph-question
└─ NO ↓

Complete values on double number line?
├─ YES → implement-double-number-line-question
└─ NO → implement-custom-d3-question
```

## Directory Structure Standard

All question type skills follow this structure:

```
implement-{type}-question/
├── SKILL.md          # Complete implementation guide (REQUIRED)
├── PATTERN.md        # Quick visual reference (optional)
└── snippets/         # Reusable components (optional)
    └── {component}.js
```

| File/Directory | Required | Purpose |
|---|---|---|
| `SKILL.md` | ✅ Yes | Complete implementation guide with codebase examples |
| `PATTERN.md` | ⚪ Optional | Quick visual reference for complex patterns |
| `snippets/` | ⚪ Optional | Standalone, configurable, reusable components |

**When to include:**
- **PATTERN.md**: For patterns with complex visual structure (drag-match, table, slider, double-number-line)
- **snippets/**: When pattern needs a standalone, configurable component (coordinate-plane-p5, double-number-line)

**Important:**
- Snippets contain modular components to be inlined into chart.js
- SKILL.md files reference actual codebase files as working examples
- No duplication - snippets are for reusable building blocks only

**Current Status:**
- ✅ **All 11 question types** have `SKILL.md`
- ✅ **7 question types** have `PATTERN.md` (drag-match, slider, table, video, text-response, custom-d3, double-number-line)
- ✅ **6 question types** have question-specific `snippets/`:
  - drag-match: drag-match.js
  - static-graph: static-graph.js
  - table: tables.js
  - video: video-response.js
  - dynamic-graph: coordinate-plane-p5.js
  - double-number-line: double-number-line.js
- ✅ **6 shared snippets** used by all question types (cards + form-inputs + svg-basics)

## Related Skills

- [create-d3-question](../create-d3-question/SKILL.md) - Parent workflow skill
- [create-canvas-question](../create-canvas-question/SKILL.md) - For static image questions
- [create-p5-animation](../create-p5-animation/SKILL.md) - For animated explanations

## Status

All question types follow the standardized structure:

- ✅ **implement-increment-controls-question** - SKILL.md
- ✅ **implement-table-question** - SKILL.md, PATTERN.md, snippets/tables.js
- ✅ **implement-static-graph-question** - SKILL.md, snippets/static-graph.js
- ✅ **implement-multiple-choice-question** - SKILL.md
- ✅ **implement-drag-match-question** - SKILL.md, PATTERN.md, snippets/drag-match.js
- ✅ **implement-slider-question** - SKILL.md, PATTERN.md
- ✅ **implement-video-question** - SKILL.md, PATTERN.md, snippets/video-response.js
- ✅ **implement-text-response-question** - SKILL.md, PATTERN.md
- ✅ **implement-dynamic-graph-question** - SKILL.md, snippets/coordinate-plane-p5.js
- ✅ **implement-double-number-line-question** - SKILL.md, PATTERN.md, snippets/double-number-line.js
- ✅ **implement-custom-d3-question** - SKILL.md, PATTERN.md

## Completed

- ✅ All question-type SKILL.md files created (11 total)
- ✅ Standardized directory structure (SKILL.md, PATTERN.md, snippets/)
- ✅ Shared snippets directory with all reusable components
- ✅ Question-specific snippets (6 total):
  - `drag-match.js` - Drag-and-drop categorization
  - `static-graph.js` - Static line graphs
  - `tables.js` - D3 tables with inputs
  - `video-response.js` - Video + response pattern
  - `coordinate-plane-p5.js` - Interactive coordinate plane
  - `double-number-line.js` - Double number lines with foreignObject
- ✅ [create-d3-question](../create-d3-question/SKILL.md) updated to reference subskills
- ✅ Eliminated redundant templates/ and examples/ directories
- ✅ SKILL.md files reference actual codebase paths as working examples
- ✅ Video question type separated from text-response for clarity
