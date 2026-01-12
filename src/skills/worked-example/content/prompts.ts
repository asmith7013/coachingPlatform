/**
 * Prompt instructions for worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/
 * To update: Edit files there, then run: npm run sync-skill-content
 *
 * Synced files:
 *   - phases/01-collect-and-analyze/analyze-problem.md → ANALYZE_PROBLEM_INSTRUCTIONS
 *   - phases/03-generate-slides/00-overview.md → PHASE3_OVERVIEW
 *   - phases/03-generate-slides/01-slide-by-slide.md → GENERATE_SLIDES_INSTRUCTIONS
 *   - phases/03-generate-slides/02-technical-rules.md → TECHNICAL_RULES
 *   - phases/03-generate-slides/03-pedagogy.md → SLIDE_PEDAGOGY_RULES
 *   - phases/03-generate-slides/checklists/pre-flight.md → PRE_FLIGHT_CHECKLIST
 *   - phases/03-generate-slides/checklists/completion.md → COMPLETION_CHECKLIST
 *   - phases/02-confirm-and-plan/index.md → PHASE2_CONFIRM_PLAN
 *   - phases/04-save-to-database/index.md → PHASE4_SAVE_EXPORT
 *   - phases/04-save-to-database/optimize-for-export.md → OPTIMIZE_FOR_EXPORT
 */

// ============================================================================
// PHASE 1: ANALYZE PROBLEM
// ============================================================================

export const ANALYZE_PROBLEM_INSTRUCTIONS = `
# Analyze Problem Prompt

This prompt is used when analyzing a mastery check question image.
Both CLI and browser contexts use this same instruction set.

---

## CRITICAL: Understanding the Input

**The problem image is the MASTERY CHECK QUESTION** - the actual question students will answer on their exit ticket or assessment.

**Your job is to create a worked example that:**
1. Teaches the SAME mathematical skill
2. Uses the SAME strategy and steps
3. Uses DIFFERENT context and numbers than the mastery check

**Why different context?** Students should learn the strategy from the worked example, then apply it independently to the mastery check. If we use the same numbers/context, students can just copy the answer without learning.

---

## CRITICAL: Transcription First

**BEFORE doing any analysis, you MUST first transcribe EXACTLY what you see in the image.**

This includes:
- All text (problem statement, questions, instructions)
- All numbers and mathematical expressions
- Any diagrams, tables, or visual elements (describe them precisely)
- Answer choices if present
- Any labels, headers, or context provided

**Why this matters:** If the transcription is wrong, the entire analysis will be wrong. Take extra care to read ALL text, numbers, and visual elements accurately.

---

## Step-by-Step Instructions

### STEP 1: Solve the Problem Yourself
- Work through the mastery check step-by-step
- Write out your complete solution
- Identify the final answer

### STEP 2: Identify Mathematical Structure
Be SPECIFIC, not vague:
- ✅ "solving two-step equations with variables on both sides"
- ❌ "algebra"

Ask yourself:
- What mathematical relationships are present?
- What prior knowledge does this assume?
- What format is the answer expected in?

### STEP 3: Identify What Makes This Challenging
- Where might students make mistakes?
- What's the key insight needed?
- What misconceptions does this address?

### STEP 4: Define ONE Clear Strategy
**This is critical. The strategy thread runs through ALL slides.**

**4a: Name the Strategy**
Give it a clear, memorable name:
- "Balance and Isolate"
- "Find the Unit Rate"
- "Plot and Connect"

**4b: State it in One Sentence**
Student-facing explanation:
- "To solve this, we [VERB] the [OBJECT] to find [GOAL]"

**4c: Identify 2-3 Moves (maximum 3)**
Each move: [Action verb] → [What it accomplishes]

**4d: Define Consistent Language**
These step verbs MUST:
- Be the EXACT same throughout all slides
- Appear on every slide header ("STEP 1: [VERB]")
- Be referenced in CFU questions

### STEP 5: Create Three Scenarios
**ALL must use DIFFERENT contexts from the mastery check:**

| Scenario | Purpose | Context Rule |
|----------|---------|--------------|
| 1 | Worked Example (full scaffolding) | DIFFERENT from mastery check |
| 2 | Practice (NO scaffolding) | DIFFERENT from mastery check AND Scenario 1 |
| 3 | Practice (NO scaffolding) | DIFFERENT from ALL above |

**DO:**
- Match context to grade level interests (gaming, social media, sports, STEM)
- Keep mathematical difficulty identical
- Give each scenario a visual anchor (icon/theme)

**DO NOT:**
- Use the same context as the mastery check
- Use the same numbers as the mastery check
- Change the problem type between scenarios

**IMPORTANT: Scenario Graph Plans**
If the problem requires a coordinate graph (\`visualType: svg-visual\`, \`svgSubtype: coordinate-graph\`), create a \`graphPlan\` for EACH scenario with that scenario's specific equations and values:
- Each scenario has different numbers, so each needs its own equations, scale, keyPoints, and annotations
- The graph structure (number of lines, annotation type) stays the same across scenarios
- Only the specific values change based on each scenario's numbers

Example: If Scenario 1 uses "y = 25x + 50" and Scenario 2 uses "y = 15x + 30", each scenario needs its own complete graphPlan with those specific equations, calculated endpoints, and appropriate scale.

### STEP 6: Determine Visual Type

**CRITICAL: ALL graphics/diagrams MUST use SVG.** The only exception is simple HTML tables.

- **text-only**: No graphics needed (rare - pure text/equation problems)
- **html-table**: Simple data tables with highlighting
- **svg-visual**: ALL other graphics - this includes:
  - Coordinate planes and graphs (svgSubtype: "coordinate-graph") → use \`graph-planning.md\`
  - **Non-graph diagrams** (svgSubtype: "diagram") → **use \`reference/diagram-patterns.md\` as PRIMARY REFERENCE**
    - Double number lines
    - Tape diagrams (bar models)
    - Hanger diagrams (balance equations)
    - Area models
    - Input-output tables
    - Ratio tables
  - Geometric shapes (svgSubtype: "shape")
  - Number lines and bar models (svgSubtype: "number-line")
  - Any custom visual (svgSubtype: "other")

**For non-graph SVGs:** READ \`reference/diagram-patterns.md\` to see the exact visual structure students expect from Illustrative Mathematics curriculum.

### STEP 7: SVG Planning (REQUIRED if Visual Type is "svg-visual")

**IF you selected "svg-visual" above, you MUST plan your SVG now.**

**For coordinate-graph subtype**, complete graph planning to ensure math is calculated BEFORE slide generation:

**7a: List Your Equations**
Write out every line/equation that will appear:
\`\`\`
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
\`\`\`

**7b: Calculate Key Data Points (REQUIRED in graphPlan.keyPoints)**
For EACH line, calculate y at key x values. These MUST be included in the \`keyPoints\` array:
- Y-intercepts (where line crosses y-axis)
- Solution points (the answer to the problem)
- Any point specifically asked about in the problem
- Points used for slope triangles or annotations

Example:
\`\`\`
Line 1: y = 5x
  - At x=0: y = 0 (y-intercept) → keyPoint: { label: "y-intercept Line 1", x: 0, y: 0 }
  - At x=4: y = 20 (solution) → keyPoint: { label: "solution", x: 4, y: 20 }

Line 2: y = 5x + 20
  - At x=0: y = 20 (y-intercept) → keyPoint: { label: "y-intercept Line 2", x: 0, y: 20 }
\`\`\`

**CRITICAL:** Every important point that will be marked with a dot or label on the graph MUST appear in \`keyPoints\`.

**7c: Determine Scale (≤10 ticks on each axis)**
- X_MAX: rightmost x-value needed (common: 4, 5, 6, 8, 10)
  - X_MAX ≤6: count by 1s
  - X_MAX >6: count by 2s
- Y_MAX: use the scale tables in \`graph-planning.md\` to get exactly 9-10 ticks
  - Count by 1s up to Y_MAX=9
  - Count by 2s up to Y_MAX=18
  - Count by 4s up to Y_MAX=36
  - Count by 5s up to Y_MAX=45
  - See \`graph-planning.md\` for full table

**7d: Plan Annotations**
What mathematical relationship to show?
- Y-intercept shift (vertical arrow showing difference)
- Parallel lines (same slope label)
- Slope comparison
- Intersection point

**Include these calculated values in the graphPlan field of your output.**

---

## Completion Checklist (Verify Before Responding)

- [ ] problemTranscription contains EXACT verbatim text from image (all text, numbers, diagrams)
- [ ] Problem was FULLY solved step-by-step
- [ ] Problem type is SPECIFIC (not vague like "algebra")
- [ ] ONE clear strategy is named with 2-3 moves maximum
- [ ] Strategy has a one-sentence student-facing summary
- [ ] All step names use consistent verbs
- [ ] CFU question templates reference strategy verbs
- [ ] ALL 3 scenarios use DIFFERENT contexts from the mastery check
- [ ] All scenarios use the SAME mathematical structure and strategy
- [ ] **IF visualType is "svg-visual":**
  - [ ] svgSubtype is specified (coordinate-graph, diagram, shape, number-line, or other)
  - [ ] **IF svgSubtype is "coordinate-graph":**
    - [ ] problemAnalysis.graphPlan has equations, keyPoints, scale, and annotations for the mastery check
    - [ ] **EACH scenario has its own graphPlan** with that scenario's specific equations and values
    - [ ] All graphPlans have: equations with slope/y-intercept, proper scale, and annotations
    - [ ] **keyPoints array includes:** y-intercepts, solution points, and any points to be labeled on the graph
`;

// ============================================================================
// PHASE 2: CONFIRM AND PLAN
// ============================================================================

export const PHASE2_CONFIRM_PLAN = `
# Phase 2: Confirm & Plan

## Purpose
Present your analysis to the user, get their confirmation, and plan the three scenarios - all using DIFFERENT contexts from the mastery check.

## Output Format: PPTX-Compatible HTML
All slides will be **PPTX-compatible HTML** (960×540px, light theme, 9 slides). See \`03-generate-slides/02-technical-rules.md\` for technical specs.

## Prerequisites
- Phase 1 complete
- You have completed PROBLEM ANALYSIS template
- You have completed STRATEGY DEFINITION template

---

## REMINDER: Context Separation

The user provided a **mastery check question**. ALL scenarios you create must use **different contexts and numbers** from that question:

| What | Context |
|------|---------|
| Mastery Check (user's input) | The ACTUAL question students will answer |
| Scenario 1 (Worked Example) | DIFFERENT context - teaches the strategy |
| Scenario 2 (Practice) | DIFFERENT context - first practice |
| Scenario 3 (Practice) | DIFFERENT context - second practice |

**Students will see:** Worked Example → Practice 1 → Practice 2 → (then later) Mastery Check

---

## Step 2.1: Present Analysis to User

**Show the user your understanding and WAIT for confirmation.**

Use this exact template:

\`\`\`
Based on the mastery check question you provided, here's my understanding:

**Problem Type:** [from PROBLEM ANALYSIS]
**Strategy I'll Use:** [strategy name from STRATEGY DEFINITION]
**One-Sentence Summary:** [from STRATEGY DEFINITION]

**Visual Type:** [from Visual Types table]
**Visual Plan:** [key details for this visual - see VisualPlan schemas]
  - [field 1]: [value]
  - [field 2]: [value]
  - [field 3]: [value, if applicable]

**The Steps:**
1. [STEP VERB]: [brief description]
2. [STEP VERB]: [brief description]
3. [STEP VERB]: [brief description, if needed]

**The three scenarios (all DIFFERENT from the mastery check):**
- Scenario 1 (worked example): [context + what makes it engaging]
- Scenario 2 (practice): [different context]
- Scenario 3 (practice): [different context]

Note: These scenarios all teach the same skill as your mastery check but use different numbers and contexts, so students learn the strategy without seeing the actual answer.
\`\`\`

### ⚠️ REQUIRED: Include Diagram Preview

**Include the Diagram Preview you created in Phase 1.** This shows the user the visual structure for confirmation.

The preview was already generated in Phase 1 using \`reference/diagram-patterns.md\` as a guide. Present it here so the user can confirm the visual structure is correct before proceeding.

**Example:**
\`\`\`
**Diagram Preview (Scenario 1 - Chicken Nuggets):**

┌────────┬────────┬────────┬────────┬────────┐
│   ?    │   6    │   6    │   6    │   6    │  = 30
└────────┴────────┴────────┴────────┴────────┘

Key elements:
- Unknown (?) at start: number of students
- Each box: 6 nuggets per student
- Total: 30 nuggets

Does this visual structure look right?
\`\`\`

**Then ask for confirmation:**

\`\`\`
Does this match what you're looking for? Should I proceed or adjust anything?
\`\`\`

---

## Step 2.2: WAIT for User Confirmation

**STOP HERE. Do not proceed until the user responds.**

The user might:
- **Confirm** ("yes", "proceed", "looks good") → Continue to Step 2.3
- **Request changes** → Adjust your analysis/strategy and re-present
- **Ask questions** → Answer them, then re-confirm

**Do NOT generate slides until the user explicitly confirms.**

---

## Visual Types

**Choose ONE visual type that best represents the math:**

| Visual Type | Use For | Key Details to Plan |
|-------------|---------|---------------------|
| \`tape-diagram\` | Division, multiplication, part-whole | boxes, values per box, total, unknown position |
| \`coordinate-graph\` | Linear equations, rates, proportions | equations, scale, keyPoints, annotations |
| \`double-number-line\` | Ratios, unit rates, percentages | quantity A values, quantity B values, alignment |
| \`area-model\` | Multiplication, distributive property | dimensions, partial products |
| \`number-line\` | Integers, inequalities, operations | range, marked points, arrows |
| \`ratio-table\` | Equivalent ratios, scaling | column values, scale factors |
| \`hanger-diagram\` | Equation solving, balance | left side, right side, shapes |
| \`input-output-table\` | Functions, patterns, rules | input values, output values, rule |
| \`grid-diagram\` | Area by counting, decomposing shapes | rows, cols, shaded regions, unit label |
| \`net-diagram\` | Surface area, 3D→2D unfolding | shape type, faces with dimensions, fold lines |
| \`measurement-diagram\` | Base & height, labeled dimensions | shape type, labeled measurements, right angle indicators |
| \`discrete-diagram\` | Objects in groups, discrete ratios | groups, items per group, total, visual type |
| \`base-ten-diagram\` | Place value, decimal operations | ones, tens, hundreds blocks, operation |
| \`dot-plot\` | Data distributions, frequencies | data points, axis range, label |
| \`box-plot\` | Quartiles, variability, outliers | min, Q1, median, Q3, max, outliers |
| \`bar-graph\` | Comparing frequencies, categories | categories, values, orientation |
| \`tree-diagram\` | Probability, sample spaces | branches, probabilities, outcomes |
| \`circle-diagram\` | Circles with labeled parts | radius, diameter, circumference, center point |
| \`scale-drawing\` | Maps, floor plans, blueprints | scale factor, actual/drawing measurements |
| \`scaled-figures\` | Original vs copy comparison | original dims, scale factor, copy dims |
| \`other\` | Custom diagrams not listed above | describe visual structure and key elements |

**Visual selection happens ONCE in analysis, then applies to ALL scenarios.**

---

## Step 2.3: Generate Scenarios (All Different from Mastery Check)

**Only after user confirms**, finalize the three scenarios.

### Critical: Context Separation

**NONE of the scenarios should use the same context or numbers as the mastery check question the user provided.**

The mastery check is what students will answer AFTER completing the worked example and practice. Your scenarios prepare them for it without giving away the answer.

### Scenario Requirements

Each scenario MUST:
- Use the **exact same mathematical structure** as the mastery check
- Require the **exact same strategy** to solve
- Use **DIFFERENT numbers and context** from the mastery check (and from each other)
- Be solvable using the **exact same steps in the exact same order**
- Include a **condensed problem reminder (≤15 words)** for use on slides 2-8

### ⚠️ Visual Progression: Plan What Changes Each Step (REQUIRED for Scenario 1)

**For the worked example (Scenario 1), you MUST define what the visual shows at each step.**

The visual should tell a story that builds toward the answer. Each step adds something new.

**Format:** For each step, describe what gets ADDED or HIGHLIGHTED on the visual.

\`\`\`
Visual Progression (Scenario 1):
- Setup (Slide 2): [What the visual shows initially - problem state, unknowns visible]
- Step 1 (Slides 3-4): [What gets highlighted/added after Step 1]
- Step 2 (Slides 5-6): [What gets highlighted/added after Step 2]
- Step 3 (Slides 7-8): [What shows the final answer on the visual]
\`\`\`

**Examples by Visual Type:**

| Visual Type | Setup Shows | Step 1 Adds | Step 2 Adds | Step 3 Adds |
|-------------|-------------|-------------|-------------|-------------|
| Tape diagram | Empty tape with ? and total | Boxes with value per box | Highlight the count | Answer label |
| Coordinate graph | Blank axes with labels | First line plotted | Second line plotted | Intersection labeled |
| Hanger diagram | Initial balanced equation | Subtraction from both sides | Division both sides | Variable isolated |
| Double number line | Two lines with known values | Unit rate marked | Scale factor applied | Unknown value found |

### ⚠️ Conciseness: Define Problem Reminders NOW

For each scenario, create the **condensed problem reminder** that will appear on slides.

**Format:** Short phrases, not full sentences. Max 15 words.

\`\`\`
✅ GOOD: "30 nuggets total. 6 per student. How many students?"
✅ GOOD: "Drone: 150m in 30 sec. Find the speed."
❌ BAD:  "A large box has 30 chicken nuggets. If each student gets 6 nuggets, how many students can have a snack?"
\`\`\`

### Scenario Design Principles

**DO:**
- Match context to grade level interests (gaming, social media, sports, etc.)
- Keep mathematical difficulty identical to mastery check
- Ensure the same moves apply in the same order
- Use engaging, real-world situations
- Give each scenario a visual anchor (icon/theme)
- **Verify each scenario is clearly different from the mastery check**

**DO NOT:**
- Use the same context as the mastery check question
- Use the same numbers as the mastery check question
- Change the problem type
- Add or remove steps from the solution
- Introduce new mathematical concepts
- Create scenarios requiring a different strategy

### Output Template:

\`\`\`
MASTERY CHECK CONTEXT (from user's input):
[Brief description of the context/numbers in the user's question]

VISUAL TYPE: [from Visual Types table above]

THREE SCENARIOS (all DIFFERENT from mastery check):
===================================================

Scenario 1 (Worked Example):
- Context: [engaging scenario name - DIFFERENT from mastery check]
- Theme/Icon: [visual anchor]
- Numbers: [specific values - DIFFERENT from mastery check]
- **Problem Reminder (≤15 words):** [condensed summary for slides]
- Same mathematical structure: [yes/explain how]
- Different from mastery check: [yes/explain what's different]
- **VisualPlan:** [see schema below - details for THIS scenario's numbers]
- **Visual Progression:** (REQUIRED - what changes on visual each step)
  - Setup: [initial state - problem shown, unknowns visible]
  - Step 1: [what gets added/highlighted]
  - Step 2: [what gets added/highlighted]
  - Step 3: [answer revealed on visual]

Scenario 2 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- **Problem Reminder (≤15 words):** [condensed summary for slides]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenario 1: [yes/explain]
- **VisualPlan:** [details for THIS scenario's numbers]

Scenario 3 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- **Problem Reminder (≤15 words):** [condensed summary for slides]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenarios 1-2: [yes/explain]
- **VisualPlan:** [details for THIS scenario's numbers]
\`\`\`

### VisualPlan Schema (by visual type)

Each scenario MUST have its own VisualPlan with values specific to that scenario's numbers.

**tape-diagram:**
\`\`\`
VisualPlan:
  boxes: [number of boxes]
  valuePerBox: [value inside each box]
  total: [total value]
  unknownPosition: "start" | "box" | "total"
\`\`\`

**coordinate-graph:** (See \`phases/01-collect-and-analyze/graph-planning.md\` for full planning)
\`\`\`
VisualPlan:
  equations: ["y = 2x + 3", "y = 0.5x"]
  scale: { xMin, xMax, yMin, yMax }
  keyPoints: [{ label: "y-intercept", x: 0, y: 3 }, { label: "solution", x: 4, y: 11 }]
  annotations: ["y-intercept shift", "parallel lines"]
\`\`\`
**Note:** Coordinate graphs require detailed planning. After selecting this visual type, read \`graph-planning.md\` and complete the full GraphPlan with equations, calculated endpoints, scale tables, and annotation positions.

**double-number-line:**
\`\`\`
VisualPlan:
  quantityA: { label: "cups", values: [0, 2, 4, 6] }
  quantityB: { label: "servings", values: [0, 3, 6, 9] }
  highlightPair: [4, 6]
\`\`\`

**area-model:**
\`\`\`
VisualPlan:
  dimensions: [width, height] or [a+b, c+d]
  partialProducts: [[a*c, a*d], [b*c, b*d]]
\`\`\`

**number-line:**
\`\`\`
VisualPlan:
  range: [min, max]
  markedPoints: [{ value, label, style: "closed"|"open" }]
  arrows: [{ from, to, label }]
\`\`\`

**ratio-table:**
\`\`\`
VisualPlan:
  rows: [{ label: "apples", values: [2, 4, 6, "?"] }]
  scaleFactors: ["×2", "×3"]
\`\`\`

**hanger-diagram:**
\`\`\`
VisualPlan:
  leftSide: "3x + 1"
  rightSide: "10"
  shapes: { triangle: "x", square: "1" }
\`\`\`

**input-output-table:**
\`\`\`
VisualPlan:
  rule: "×3 + 2" or "y = 3x + 2"
  inputs: [1, 2, 3, 4, "?"]
  outputs: [5, 8, 11, 14, "?"]
  unknownPosition: "input" | "output" | "both"
\`\`\`

**grid-diagram:**
\`\`\`
VisualPlan:
  rows: [number of rows]
  cols: [number of columns]
  shadedRegions: [{ startRow, startCol, endRow, endCol, color }]
  unitLabel: "sq cm" | "sq in" | "units"
  showGrid: true | false
\`\`\`

**net-diagram:**
\`\`\`
VisualPlan:
  shapeType: "rectangular-prism" | "triangular-prism" | "pyramid" | "cube"
  faces: [{ shape: "rectangle" | "triangle", width, height, label }]
  foldLines: true | false
  dimensions: { length, width, height }
\`\`\`

**measurement-diagram:**
\`\`\`
VisualPlan:
  shapeType: "triangle" | "parallelogram" | "trapezoid" | "rectangle"
  measurements: [{ label: "base" | "height" | "side", value, position }]
  showRightAngle: true | false
  showDashedHeight: true | false
\`\`\`

**discrete-diagram:**
\`\`\`
VisualPlan:
  groups: [number of groups]
  itemsPerGroup: [items in each group]
  totalItems: [total count]
  visualType: "circles" | "squares" | "icons"
  arrangement: "rows" | "clusters"
\`\`\`

**base-ten-diagram:**
\`\`\`
VisualPlan:
  hundreds: [number of hundred blocks]
  tens: [number of ten rods]
  ones: [number of unit cubes]
  operation: "none" | "addition" | "subtraction" | "regrouping"
  showValues: true | false
\`\`\`

**dot-plot:**
\`\`\`
VisualPlan:
  dataPoints: [2, 3, 3, 4, 4, 4, 5, 5, 6]
  axisLabel: "Number of pets"
  axisRange: [0, 10]
  title: "Pets Owned by Students"
\`\`\`

**box-plot:**
\`\`\`
VisualPlan:
  min: 12
  q1: 18
  median: 25
  q3: 32
  max: 45
  outliers: [5, 52]
  axisLabel: "Test Scores"
  axisRange: [0, 60]
\`\`\`

**bar-graph:**
\`\`\`
VisualPlan:
  categories: ["Red", "Blue", "Green", "Yellow"]
  values: [12, 8, 15, 6]
  orientation: "vertical" | "horizontal"
  axisLabel: "Frequency"
  title: "Favorite Colors"
\`\`\`

**tree-diagram:**
\`\`\`
VisualPlan:
  levels: [
    { outcomes: ["Heads", "Tails"], probabilities: [0.5, 0.5] },
    { outcomes: ["Heads", "Tails"], probabilities: [0.5, 0.5] }
  ]
  finalOutcomes: ["HH", "HT", "TH", "TT"]
  highlightPath: ["Heads", "Tails"]
\`\`\`

**circle-diagram:**
\`\`\`
VisualPlan:
  radius: 5
  diameter: 10
  circumference: "10π" or 31.4
  showCenter: true | false
  labeledParts: ["radius", "diameter", "circumference", "center"]
  unit: "cm" | "in" | "units"
\`\`\`

**scale-drawing:**
\`\`\`
VisualPlan:
  scaleFactor: "1 cm : 10 m" or "1:100"
  drawingMeasurements: [{ label: "length", value: 5, unit: "cm" }]
  actualMeasurements: [{ label: "length", value: 50, unit: "m" }]
  drawingType: "map" | "floor-plan" | "blueprint" | "other"
\`\`\`

**scaled-figures:**
\`\`\`
VisualPlan:
  originalDimensions: [{ label: "width", value: 4 }, { label: "height", value: 6 }]
  scaleFactor: 2.5
  copyDimensions: [{ label: "width", value: 10 }, { label: "height", value: 15 }]
  shapeType: "rectangle" | "triangle" | "polygon"
  showLabels: true | false
\`\`\`

**other:** (custom diagrams)
\`\`\`
VisualPlan:
  description: "[What the visual shows]"
  elements: ["element 1", "element 2", ...]
  labels: ["label 1", "label 2", ...]
  annotations: ["what to highlight or emphasize"]
\`\`\`
**Note:** For custom diagrams, reference \`reference/diagram-patterns.md\` for SVG implementation patterns.

---

## Step 2.4: Update Progress File

After user confirms and scenarios are defined, update the progress file:

**File:** \`src/app/presentations/{slug}/.worked-example-progress.json\`

Update these fields:
\`\`\`json
{
  "phase": 2,
  "phaseName": "Confirm & Plan",
  "userConfirmed": true,
  "scenarios": ["[Scenario 1 name]", "[Scenario 2 name]", "[Scenario 3 name]"],
  "totalSlides": [estimated count: 14-16],
  "updatedAt": "[ISO timestamp]"
}
\`\`\`

Use the Read tool to read the current file, then use Edit to update only the changed fields.

---

## Phase 2 Completion Checklist

Before proceeding, verify:
- [ ] User has explicitly confirmed your understanding
- [ ] User has approved the **Diagram Preview** (ASCII visual structure)
- [ ] Three scenarios are defined
- [ ] All scenarios use the SAME strategy as the mastery check
- [ ] All scenarios have the SAME mathematical structure as the mastery check
- [ ] **ALL scenarios use DIFFERENT contexts from the mastery check**
- [ ] **ALL scenarios use DIFFERENT numbers from the mastery check**
- [ ] Each scenario has an engaging context and visual anchor
- [ ] Progress file updated with \`userConfirmed: true\` and \`scenarios\` array

---

## NEXT PHASE

**When Phase 2 is complete (user has confirmed):**

Use the Read tool to read the Phase 3 instructions:
\`\`\`
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/00-overview.md
\`\`\`

Do NOT proceed to Phase 3 until the user has explicitly confirmed.
`;

// ============================================================================
// PHASE 3: GENERATE SLIDES
// ============================================================================

export const PHASE3_OVERVIEW = `
# Phase 3: Generate Slides - Overview

## Purpose

Create 9 PPTX-compatible HTML slides using atomic card-patterns and PPTX animation for CFU/Answer reveals.

**Note:** Slides 1-8 are the worked example. Slide 9 (the printable worksheet with practice problems) is generated separately after the main slides complete.

## Output Format

All slides are **960x540px, light theme**. CFU/Answer boxes use PPTX animation (appear on click).

## Prerequisites

- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## Document Reading Order

**Read files in numbered order. Each file has ONE job.**

| Step | File | What It Contains | When to Read |
|------|------|------------------|--------------|
| 1 | **00-overview.md** (this file) | Phase purpose, reading order, execution flow | Start here |
| 2 | **01-slide-by-slide.md** | Per-slide protocol, what each slide contains | Before generating |
| 3 | **02-technical-rules.md** | PPTX constraints, data attributes, colors | Before generating |
| 4 | **03-pedagogy.md** | Teaching principles, CFU rules, conciseness | Before generating |
| 5 | **04-svg-workflow.md** | SVG pixel math, graph creation | **Only if Visual Type = SVG** |

**Also read (referenced from card-patterns):**
- \`card-patterns/README.md\` - Index of HTML patterns
- \`../../reference/diagram-patterns.md\` - Non-graph SVG patterns (tape diagrams, hangers, etc.)
- \`visuals/annotation-zones.md\` - Quick zone reference for annotations

**Checklists (use during/after generation):**
- \`checklists/pre-flight.md\` - Verify BEFORE writing each slide
- \`checklists/completion.md\` - Verify AFTER all 9 slides done

---

## Phase 3 Execution Flow

\`\`\`
STEP 3.0: Read Reference Materials
│         Read files 00 → 01 → 02 → 03 (→ 04 if SVG)
│
▼
STEP 3.1: Check Visual Type (from Phase 1)
│   ├── If "text-only" or "HTML table" → Use simple fill patterns
│   └── If "SVG visual" → Read 04-svg-workflow.md + graph-snippet.html
│
▼
STEP 3.2: Generate Slides 1-8
│   For each slide N from 1 to 8:
│     1. Announce checkpoint (CLI mode only)
│     2. Choose layout preset (full-width or two-column)
│     3. Compose using card-patterns
│     4. Verify pre-flight checklist
│     5. Write HTML file
│
▼
STEP 3.3: Generate Printable (Slide 9)
│   - Generated separately after slides 1-8 complete
│   - Uses printable-slide-snippet.html pattern
│   - Contains practice problems from Scenarios 2 & 3
│
▼
STEP 3.4: Verify Completion Checklist
          See checklists/completion.md
\`\`\`

---

## Required Reading Before Generating

**BEFORE creating any slides, read these files:**

\`\`\`
Read: 01-slide-by-slide.md   ← What each slide contains
Read: 02-technical-rules.md  ← PPTX constraints
Read: 03-pedagogy.md         ← Teaching principles
\`\`\`

**Also read from reference folder:**
\`\`\`
Read: ../../reference/styling.md        ← Colors, fonts, layout classes
Read: ../../reference/layout-presets.md ← Layout presets + regions
\`\`\`

---

## 3 Core Patterns

Most slides use just 3 patterns:

| Region | Pattern | Purpose |
|--------|---------|---------|
| Header | \`title-zone.html\` | Badge + Title + Subtitle |
| Left column | \`content-box.html\` | Problem reminder, equations, text |
| Right column | \`svg-visual\` | Diagrams, graphs (see visuals/) |

**Plus overlays and special cases:**
- \`cfu-answer-card.html\` → CFU/Answer boxes (animated)
- \`graph-snippet.html\` → Coordinate graphs (recalculate pixels)
- \`printable-slide-snippet.html\` → Slide 9 only

**Always READ and COPY from snippet files.** Never write HTML from scratch.

---

## File Output Structure

Write each slide to a separate file:

\`\`\`
src/app/presentations/{slug}/
├── slide-1.html   (Learning Goal)
├── slide-2.html   (Problem Setup)
├── slide-3.html   (Step 1 Question + CFU)
├── slide-4.html   (Step 1 Answer)
├── slide-5.html   (Step 2 Question + CFU)
├── slide-6.html   (Step 2 Answer)
├── slide-7.html   (Step 3 Question + CFU)
├── slide-8.html   (Step 3 Answer)
└── slide-9.html   (Printable with Practice Problems 1 & 2)
\`\`\`

Use the Write tool for each slide file.

### Track Progress After Each Slide

**After writing EACH slide file**, update the progress file:

\`\`\`json
{
  "slidesCompleted": ["slide-1.html", "slide-2.html", ...],
  "updatedAt": "[ISO timestamp]"
}
\`\`\`

---

## NEXT PHASE

**When all slides are written:**

Use the Read tool to read the Phase 4 instructions:
\`\`\`
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
\`\`\`

Do NOT proceed until all slide files have been written.
`;

export const GENERATE_SLIDES_INSTRUCTIONS = `
# Slide-by-Slide Generation Protocol

**What this file covers:** Per-slide protocol, slide structure, what each slide contains, generation modes.

---

## API MODE vs CLI MODE

**API Mode (browser wizard):** Your response is collected as a single stream.
- Output ONLY HTML slides separated by \`===SLIDE_SEPARATOR===\`
- NO preamble, NO announcements, NO "I'll generate..." text
- First characters of response MUST be \`<!DOCTYPE html>\`

**CLI Mode (file-by-file):** You write individual files with the Write tool.
- Announce checkpoints as conversational text between file writes
- Each file starts with \`<!DOCTYPE html>\`

---

## Per-Slide Protocol (MANDATORY for EVERY Slide)

### Step 1: Announce Checkpoint (CLI MODE ONLY)

**Skip this step entirely in API mode.**

Before writing each slide file, announce what you're about to do:

\`\`\`
SLIDE [N]: [Type Name]
Action: generate-new
Layout: [full-width | two-column | centered] | Components: [list of card-patterns used]
\`\`\`

**Example announcements:**
\`\`\`
SLIDE 3: Step 1 Question + CFU
Action: generate-new
Layout: centered | Components: title-zone, content-box, cfu-card (animated)

SLIDE 4: Step 1 Answer
Action: generate-new
Layout: two-column | Components: title-zone, content-box, svg-card, answer-card (animated)
\`\`\`

**If slide contains an SVG graph, add graph workflow:**
\`\`\`
SLIDE 2: Problem Setup
Action: generate-new
Layout: two-column | Components: title-zone, content-box, svg-card
Graph: Use card-patterns/svg-card.html → modify for X_MAX=10, Y_MAX=100
\`\`\`

**What goes IN the slide HTML file:**
- The file starts with \`<!DOCTYPE html>\` - NOTHING before it
- NO checkpoint announcements (those are conversational only)
- NO protocol notes or comments
- ONLY valid HTML content starting with \`<!DOCTYPE html>\`

---

### Step 2: Determine Slide Type and Layout

CFU/Answer boxes use PPTX animations (appear on click) - no duplicate slides needed.

| Slide # | Type | Layout Options | Content |
|---------|------|----------------|---------|
| 1 | Learning Goal | \`full-width\` | content-box |
| 2 | Problem Setup | \`two-column\` or \`centered\` | problem + visual |
| 3-8 | Step slides | \`two-column\` or \`centered\` | step content + cfu/answer |
| 9 | Printable | \`full-width\` | printable format |

**Layout Selection (slides 2-8):**

| Choose \`centered\` when... | Choose \`two-column\` when... |
|---------------------------|----------------------------|
| Equation IS the visual | Text + separate visual needed |
| Simple diagram (tape, hanger) | Complex visual (coordinate graph) |
| Step is single operation | Multiple parts to explain |
| Focus on ONE thing | Show text-visual relationship |
| **Diagram IS the content** (not supporting it) | **Diagram supports/illustrates text** |

### ⚠️ The Duplication Test (CRITICAL)

**Before choosing two-column, ask: "Would I say the same thing on both sides?"**

| If this happens... | Use this layout |
|-------------------|-----------------|
| Left explains "two meanings" + Right shows "two meanings" boxes | \`centered\` - let the diagram BE the explanation |
| Left has equation + Right has graph of that equation | \`two-column\` - they show DIFFERENT representations |
| Left describes groups + Right shows the same groups visually | \`centered\` - remove the text, enlarge the visual |

**Example of duplication (BAD - use centered instead):**
\`\`\`
LEFT COLUMN               RIGHT COLUMN
"Meaning 1: How many      [Box: "Meaning 1:
slices per group?"         How many in each group?"]
"Meaning 2: How many      [Box: "Meaning 2:
groups?"                   How many groups?"]
\`\`\`
↑ This duplicates! The visual boxes say the same thing as the text. Use \`centered\` and let the diagram speak for itself with a brief subtitle.

**For \`two-column\` layout (text + visual side-by-side):**
- Left: Problem reminder (≤15 words) + main content (36-48px)
- Right: SVG visual or diagram
- **⚠️ Left and right must show DIFFERENT content**

**For \`centered\` layout (stacked hero content):**
- Main: Large equation/diagram centered (hero element)
- Support: Brief text below (optional)
- **Use when the diagram IS the teaching, not just supporting it**

See \`reference/layout-presets.md\` for pixel dimensions and HTML examples.

**Note:** Practice problems are embedded directly in the Printable slide (slide 9) rather than having separate presentation slides.

---

### Step 3: Add CFU/Answer Boxes (PPTX Animation)

**CFU and Answer boxes use PPTX animation - they appear on click, no duplicate slides needed.**

Add the appropriate box BEFORE the closing \`</body>\` tag:

**CFU Box (for Question slides 3, 5, 7) - Appears on click:**
\`\`\`html
<div data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[CFU question using strategy verb]</p>
</div>
\`\`\`

**Answer Box (for Answer slides 4, 6, 8) - Appears on click:**
\`\`\`html
<div data-pptx-region="answer-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Answer explanation]</p>
</div>
\`\`\`

**How animation works:**
- \`data-pptx-region="cfu-box"\` or \`"answer-box"\` triggers animation in PPTX export
- Box starts HIDDEN when slide displays
- Box APPEARS when teacher clicks (during presentation)
- See \`card-patterns/simple-patterns/cfu-answer-card.html\` for full pattern

---

### Step 4: Compose Slides from Atomic Components

**For ALL slides (1-8, printable generated separately):**

1. **ANNOUNCE** checkpoint to user (plain text, CLI mode only)
2. **CHOOSE LAYOUT** from the table above (full-width or two-column)
3. **COMPOSE** slide using atomic card-patterns:
   - **title-zone**: Badge ("STEP N: [VERB]") + Title + optional Subtitle
   - **content-box**: Main text content (instructions, questions, explanations)
   - **svg-card**: Graph or diagram (if visual slide)
   - Use patterns from \`card-patterns/\` folder as HTML snippets
4. **IF Visual Type = "coordinate-graph"**: Read \`04-svg-workflow.md\` FIRST
5. **IF Visual Type = "diagram" (non-graph SVG)**: Read \`../../reference/diagram-patterns.md\` FIRST
   - Includes: tape diagrams, hanger diagrams, double number lines, input-output tables, area models
   - Based on Illustrative Mathematics (IM) curriculum representations
6. **VERIFY** the pre-flight checklist (see \`checklists/pre-flight.md\`)
7. **WRITE** slide file using Write tool (file starts with \`<!DOCTYPE html>\`)

### Step 5: Repeat Protocol

For each slide N from 1 to 8:
1. Return to Step 1
2. Announce checkpoint (plain text to user, CLI mode only)
3. Compose slide using card-patterns
4. Write slide file (starts with \`<!DOCTYPE html>\`, no other content before it)
5. Continue until all slides complete

---

## Visual Type Reference

Your visual type was determined in Phase 1. Here's what each requires:

**Text-only:**
- No graphics - pure text/equation problems
- Use content-box patterns only

**HTML table:**
- Simple data tables with highlighting
- Use \`<table>\` with inline styles
- See \`card-patterns/simple-patterns/content-box.html\` for table examples

**SVG visual (ALL other graphics):**
- Coordinate planes and graphs
- Hanger diagrams and balance problems
- Geometric shapes and diagrams
- Number lines and bar models
- Any custom visual representation (coins, objects, arrays)

**For SVG visuals, you MUST:**
1. Read \`04-svg-workflow.md\` for coordinate graphs
2. Read \`../../reference/diagram-patterns.md\` for other diagram types
3. Wrap in container with \`data-pptx-region="svg-container"\`
4. Include position attributes: \`data-pptx-x\`, \`data-pptx-y\`, \`data-pptx-w\`, \`data-pptx-h\`
5. **⚠️ CRITICAL: Wrap EVERY distinct element in \`<g data-pptx-layer="...">\`**

### ⚠️ SVG Layer Requirement (MANDATORY)

**Without \`data-pptx-layer\`, ALL SVG content becomes ONE merged image. Teachers cannot click, move, or edit individual elements.**

Every SVG element group MUST have its own layer:
\`\`\`html
<svg viewBox="0 0 400 300">
  <g data-pptx-layer="label-title">
    <text>Title here</text>
  </g>
  <g data-pptx-layer="shape-row-1">
    <!-- First row of shapes -->
  </g>
  <g data-pptx-layer="shape-row-2">
    <!-- Second row of shapes -->
  </g>
  <g data-pptx-layer="label-equation">
    <text>48 ÷ 6 = ?</text>
  </g>
</svg>
\`\`\`

**Layer naming:**
- \`label-X\` for text labels
- \`shape-N\` or \`shape-row-N\` for shapes/objects
- \`base\` for background elements
- \`arrow-X\` for arrows/annotations

---

## Using the Correct GRAPH PLAN

**CRITICAL: Use EACH SCENARIO'S graphPlan, NOT the mastery check's graphPlan.**

The mastery check (\`problemAnalysis.graphPlan\`) is for the student's exit ticket/assessment - it is NEVER shown in these slides. Each scenario has its own numbers/context, so each needs its own graphPlan:

| Slides | Source | GraphPlan to Use |
|--------|--------|------------------|
| 2-8 (Worked Example) | Scenario 1 | \`scenarios[0].graphPlan\` |
| 9 (Printable - Practice 1 & 2) | Scenarios 2 & 3 | \`scenarios[1].graphPlan\` and \`scenarios[2].graphPlan\` |

Each GRAPH PLAN contains the semantic decisions for that scenario:
- **Equations** with correct slope/y-intercept for that scenario's numbers
- **Scale** (X_MAX, Y_MAX) appropriate for that scenario's values
- **Line endpoints** (startPoint, endPoint) calculated for that scenario
- **keyPoints** with correct coordinates for that scenario
- **Annotations** type and position

**You MUST implement exactly what each scenario's GRAPH PLAN specifies.** Do NOT use the mastery check's graphPlan. Do NOT recalculate or change the scale.

---

## Context-Aware Generation Modes

### Mode: Full (Default)
Generate all slides from scratch.

### Mode: Continue
Resume from where generation was interrupted.
- DO NOT regenerate existing slides
- Match style of existing slides exactly
- Start from next slide number

### Mode: Update
Regenerate only specific slides with targeted changes.
- Output ONLY the slides marked for update
- Maintain same structure as existing slides
- Use original slide numbers

---

## Output Format

**Each slide file must:**
- Start with \`<!DOCTYPE html>\` as the very first characters
- Contain ONLY valid HTML (no checkpoint comments, no protocol notes)
- End with \`</html>\`

**NEVER include in slide files:**
- Checkpoint announcements (those are conversational text to user)
- Protocol comments or notes
- Any text before \`<!DOCTYPE html>\`

When outputting multiple slides in conversation (API mode), separate with:
\`\`\`
===SLIDE_SEPARATOR===
\`\`\`
`;

export const TECHNICAL_RULES = `
# Technical Rules for PPTX-Compatible HTML

**What this file covers:** PPTX constraints, data attributes, color format, right-column layers.

---

## PPTX Constraints (Quick Reference)

| Rule | Requirement |
|------|-------------|
| Dimensions | \`width: 960px; height: 540px\` (EXACT) |
| Fonts | Arial, Georgia, Courier New ONLY (no Roboto, no custom fonts) |
| Layout | Use \`.row\`/\`.col\` classes (NEVER inline \`display: flex\`) |
| Text | ALL text in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` (text in \`<div>\` disappears!) |
| Backgrounds | Only on \`<div>\` elements (NOT on \`<p>\`, \`<h1>\`) |
| Bullets | Use \`<ul>/<ol>\` (NEVER manual bullet characters like •, -, *) |
| Interactivity | NO JavaScript, NO onclick, NO CSS animations |
| Theme | Light (white #ffffff background, dark #1d1d1d text) |
| **SVG Layers** | **⚠️ EVERY SVG element in \`<g data-pptx-layer="...">\` (or becomes ONE image!)** |

---

## Color Format (CRITICAL)

**ALWAYS use 6-digit hex colors. NEVER use rgb(), rgba(), hsl(), or named colors.**

| CORRECT | WRONG |
|---------|-------|
| \`#ffffff\` | \`white\` |
| \`#1d1d1d\` | \`rgb(29, 29, 29)\` |
| \`#f59e0b\` | \`rgba(245, 158, 11, 1)\` |
| \`#000000\` | \`black\` |

**Why?** The PPTX export parser only understands hex colors. Any other format will cause rendering errors or be ignored.

**For shadows:** Use a simple border instead of box-shadow, or omit shadows entirely. PPTX doesn't support shadows.

---

## Data-PPTX Attributes

Every element that should be positioned in PPTX needs these attributes:

\`\`\`html
<div data-pptx-region="[region-name]"
     data-pptx-x="[x-position]"
     data-pptx-y="[y-position]"
     data-pptx-w="[width]"
     data-pptx-h="[height]">
\`\`\`

### Standard Region Positions

| Region | x | y | w | h |
|--------|---|---|---|---|
| badge | 20 | 16 | 100 | 30 |
| title | 130 | 16 | 810 | 30 |
| subtitle | 20 | 55 | 920 | 30 |
| left-column | 20 | 150 | 368 | 360 |
| svg-container | 408 | 150 | 532 | 360 |
| cfu-box | 653 | 40 | 280 | 115 |
| answer-box | 653 | 40 | 280 | 115 |

---

## Right-Column Visual Layers (MANDATORY for PPTX Export)

**Every element in the right column MUST have its own \`data-pptx-region="visual-*"\` with coordinates.**

This ensures each visual element (table, equation card, comparison box, etc.) becomes an independent PPTX object that teachers can move and resize.

### Why This Matters

When multiple elements share one region, they become a single merged image in PowerPoint. Teachers can't adjust individual pieces. By giving each element its own region, they can:
- Reposition elements independently
- Resize individual components
- Delete/hide specific parts

### Pattern: Wrap Each Element

**See:** \`card-patterns/complex-patterns/visual-card-layers.html\` for complete examples.

**Right column bounds (standard two-column layout):**
- x: 408-940 (width: 532)
- y: 140-510 (height: 370)
- Content typically starts at x=420 with 12px margin

**Naming convention:** \`data-pptx-region="visual-[name]"\`
- \`visual-table\` - for data tables
- \`visual-equation\` - for equation cards
- \`visual-comparison\` - for comparison notes
- \`visual-result\` - for result/answer boxes
- \`visual-1\`, \`visual-2\`, etc. - when order matters

### Example: Right Column with Table + Equation Card

\`\`\`html
<!-- Wrapper has NO data-pptx-region - just for layout -->
<div class="col center" style="width: 60%; padding: 12px; gap: 16px;">

  <!-- LAYER 1: Table - its own region -->
  <div data-pptx-region="visual-table"
       data-pptx-x="420" data-pptx-y="150"
       data-pptx-w="500" data-pptx-h="160"
       style="background: #ffffff; border-radius: 8px; padding: 12px;">
    <table>...</table>
  </div>

  <!-- LAYER 2: Equation card - its own region -->
  <div data-pptx-region="visual-equation"
       data-pptx-x="420" data-pptx-y="320"
       data-pptx-w="500" data-pptx-h="100"
       style="background: #e8f4fd; border-radius: 8px; padding: 16px; border-left: 4px solid #1791e8;">
    <p style="font-family: Georgia, serif; font-size: 18px;">y = 3x + 5</p>
  </div>

</div>
\`\`\`

### Position Calculation (Vertical Stacking)

**Standard spacing:**
- Element 1: y=150, h=160 → bottom at y=310
- Gap: 10px
- Element 2: y=320, h=100 → bottom at y=420
- Gap: 10px
- Element 3: y=430, h=70 → bottom at y=500

### Checklist for Right-Column Content

- [ ] Each distinct visual element has its own \`data-pptx-region="visual-*"\`
- [ ] Each element has \`data-pptx-x\`, \`data-pptx-y\`, \`data-pptx-w\`, \`data-pptx-h\`
- [ ] Wrapper div has NO data-pptx-region (just for HTML layout)
- [ ] Coordinates don't overlap (stack with 10-16px gaps)
- [ ] Element backgrounds are set (they're preserved in screenshots)

---

## SVG-Specific Requirements

For SVG visuals, additional rules apply:

### ⚠️ Height Constraints (CRITICAL)

**Problem:** \`data-pptx-*\` attributes only affect PPTX export, NOT browser rendering. Without CSS constraints, SVGs overflow the slide boundary.

**Solution:** ALWAYS add CSS height constraints to BOTH the container AND the SVG element.

**Container requirements:**
\`\`\`html
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360"
     data-svg-region="true"
     style="max-height: 360px; overflow: hidden;">
  <svg viewBox="0 0 520 350" style="width: 100%; height: 350px; max-height: 350px;">
    ...
  </svg>
</div>
\`\`\`

**Height values by layout:**
| Layout | Container max-height | SVG height/max-height |
|--------|---------------------|----------------------|
| \`two-column\` | 360px | 350px |
| \`graph-heavy\` | 360px | 350px |
| \`centered\` | 200px | 180px |

**Common mistakes:**
- ❌ Only using \`data-pptx-h\` without CSS (works in PPTX, overflows in browser)
- ❌ Using \`viewBox\` alone without \`height\`/\`max-height\` style
- ❌ Setting SVG \`height: 100%\` without container constraint

### ⚠️ Layer Structure (CRITICAL for PPTX Export)

**Without \`data-pptx-layer\`, ALL SVG content becomes ONE image. With layers, each element becomes a separate clickable/editable image in PowerPoint.**

Every distinct visual element MUST be wrapped in \`<g data-pptx-layer="...">\`:

\`\`\`html
<g data-pptx-layer="base-graph"><!-- Grid, axes --></g>
<g data-pptx-layer="line-1"><!-- First data line --></g>
<g data-pptx-layer="line-2"><!-- Second data line --></g>
<g data-pptx-layer="label-b0"><!-- Y-intercept label --></g>
<g data-pptx-layer="shape-1"><!-- Individual shape --></g>
<g data-pptx-layer="arrow-counting"><!-- Arrow annotation --></g>
\`\`\`

**Layer naming convention:**
| Element Type | Pattern | Example |
|--------------|---------|---------|
| Base structure | \`base\`, \`base-graph\` | Grid, axes |
| Data lines | \`line-N\` | \`line-1\`, \`line-2\` |
| Shapes | \`shape-N\` | \`shape-1\`, \`shape-2\` |
| Labels | \`label-X\` | \`label-b0\`, \`label-title\` |
| Points | \`point-X\` | \`point-solution\` |
| Arrows | \`arrow-X\` | \`arrow-counting\` |

See \`reference/diagram-patterns.md\` for complete examples with layers.

**Text in SVG:**
- ALL \`<text>\` elements must have \`font-family="Arial"\`
- Use \`font-weight="normal"\` for annotations (NOT bold)

See \`04-svg-workflow.md\` for coordinate graph SVG rules.

---

## Layout Classes

Use these instead of inline flexbox:

| Class | Purpose |
|-------|---------|
| \`.row\` | Horizontal flex container |
| \`.col\` | Vertical flex container |
| \`.center\` | Center content |
| \`.items-center\` | Align items center |
| \`.gap-sm\` | Small gap (8px) |
| \`.gap-md\` | Medium gap (16px) |
| \`.fit\` | Fit content width |

**NEVER use inline \`display: flex\`** - always use \`.row\` or \`.col\` classes.

---

## File Format Requirements

**Each slide file must:**
- Start with \`<!DOCTYPE html>\` as the very first characters
- Have \`<body>\` with exact dimensions: \`width: 960px; height: 540px\`
- End with \`</html>\`
- Contain NO JavaScript
- Contain NO comments before \`<!DOCTYPE html>\`
`;

export const SLIDE_PEDAGOGY_RULES = `
# Pedagogical Principles

**What this file covers:** Teaching principles, visual consistency, CFU rules, conciseness requirements.

---

## Core Principles (NON-NEGOTIABLE)

### 1. The "Click-to-Reveal" Principle

- CFU/Answer boxes start HIDDEN, appear when teacher clicks
- Forces mental commitment before seeing solution
- Animation handles reveal - no duplicate slides needed
- **No JavaScript, no onclick handlers in HTML**

### 2. The "Visual Stability" Principle

- Keep main visual (table, diagram) in SAME position across slides 2-8
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard - problem stays put, annotations appear

### 3. The "Scaffolding Removal" Principle

- Slides 2-8: Maximum scaffolding (step-by-step, highlighting, CFU)
- Printable slide 9: ZERO scaffolding (just practice problems with work space)
- Students must apply the strategy independently on the printable worksheet

### 4. The "Consistent Step Names" Principle

- Use EXACT verbs from strategyDefinition.moves throughout
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these exact verbs

### 5. The "Real World" Principle

- Use engaging, age-appropriate contexts
- Avoid boring textbook scenarios (no "John has 5 apples")
- Each scenario needs a visual anchor (icon or theme)

**Good scenario contexts by grade:**
- Grade 6-7: Video game items, YouTube views, TikTok followers, sports stats
- Grade 8-9: Drone flight, crypto mining, streaming subscriptions, esports tournaments
- Grade 10+: Investment returns, data science, engineering projects, startup growth

---

## Visual Consistency Across Step Slides (CRITICAL)

**This is the most important rule for student learning.**

The main visual (graph, table, diagram) must stay in the SAME position across all step slides (2-8).

### What "Consistency" Means

**Position stays fixed. Content evolves.**

| Stays Fixed | Changes Each Step |
|-------------|-------------------|
| Visual position (x, y, width, height) | Which elements are highlighted |
| Overall scale and dimensions | Annotations and labels added |
| Base structure (axes, grid, boxes) | Values revealed or filled in |
| Layout (two-column, left/right split) | Emphasis shifts to current step |

### Progressive Visual Revelation (REQUIRED)

**Each step slide must ADD something new to the visual.** If slides 3-8 show identical visuals, students see repetition instead of progression.

**The Visual Tells a Story:**
\`\`\`
Slide 2 (Setup):    Shows the PROBLEM → unknowns visible, nothing solved yet
Slide 3-4 (Step 1): Shows Step 1 RESULT → first piece of solution highlighted
Slide 5-6 (Step 2): Shows Step 2 RESULT → builds on Step 1
Slide 7-8 (Step 3): Shows COMPLETE SOLUTION → answer visible on visual
\`\`\`

**Examples of What to ADD Each Step:**

| Visual Type | What Gets Added/Highlighted |
|-------------|----------------------------|
| Coordinate graph | New line plotted, point labeled, intersection marked |
| Tape diagram | Boxes divided, values filled in, count revealed |
| Hanger diagram | Terms removed from both sides, variable isolated |
| Double number line | Unit rate marked, unknown value found |
| Input-output table | Pattern arrow, missing value filled |
| Area model | Partial products computed, sum shown |

### Common Mistakes (NEVER DO THESE)

**Position/Structure Errors:**
- Moving the graph/visual between slides
- Changing visual dimensions or scale
- Changing the layout structure mid-sequence

**Repetition Errors:**
- Showing the IDENTICAL visual across multiple step slides
- Keeping the same elements highlighted without adding new information
- Not showing the result of each step ON the visual
- Showing the same concept/information in multiple places on the same slide (e.g., equation in left column AND on the visual)

### CFU/Answer Boxes ANIMATE in place

- They overlay the existing content
- The underlying slide content doesn't change
- Teacher clicks to reveal the box during presentation

---

## CFU Question Requirements

**Format Rules (STRICTLY ENFORCED):**
- **ONE question only** - never two-part questions
- **12 words max** - if longer, rewrite it shorter
- **Strategy-focused** - ask about WHY, not WHAT

**Questions MUST reference the strategy verb:**
- "Why did I [VERB] first?" (6 words)
- "How did I know to [VERB] here?" (8 words)
- "Why is the '?' at the beginning?" (7 words)

**Questions must NOT be:**
- "What is 6 / 2?" (computation)
- "What's the answer?" (result-focused)
- "What is X? How did you calculate it?" (TWO questions - WRONG!)
- Questions longer than 12 words

---

## Answer Box Requirements

**Format Rules (STRICTLY ENFORCED):**
- **25 words max** - 1-2 short sentences only
- **Direct answer** - no extra context or "fun facts"
- **No redundancy** - don't repeat what the visual shows

**Good answers:**
- "Each box represents one student. The 6 inside shows nuggets per student." (12 words)
- "I subtracted 4 to isolate the variable term on one side." (11 words)

**Bad answers:**
- "To ISOLATE the variable term! Subtracting 4 removes the constant, leaving just 2x alone on one side. This is also called the constant of proportionality - the slope of line g!" (too long, extra context)

---

## Left Column Conciseness (CRITICAL)

**The left column is for TEXT CONTENT ONLY. Keep it minimal.**

### Problem Reminder Box (Slides 2-8)

**Format:** Ultra-condensed summary, max 15 words

\`\`\`
GOOD: "30 nuggets total. 6 per student. How many students?"
GOOD: "Turtle g travels at constant speed. Find when it catches turtle f."
BAD:  "A large box has 30 chicken nuggets. If each student gets 6 nuggets, how many students can have a snack?"
\`\`\`

### Step Content (Left Column)

**NO explanatory prose.** The step title + equation IS the content.

| Element | Max Words | Purpose |
|---------|-----------|---------|
| Step title | 6-8 words | "STEP 1: Write the Equations" |
| Subtitle | 0 words | REMOVE entirely - no "First, let's..." |
| Problem reminder | 15 words | Condensed problem summary |
| Main content | n/a | Large (36-48px) - equation, key text, or focus element |
| Supporting text | 10 words | Only if absolutely needed |

**What to REMOVE from left column:**
- "First, let's figure out how fast turtle g is moving by finding a point on the line."
- "Now we need to identify what each number represents in this problem."
- "Let's start by writing the equation that represents this situation."
- Any sentence starting with "Let's", "Now", "First", "Next"

**What to KEEP in left column:**
- Step badge and title
- Condensed problem reminder (15 words max)
- Large main content (36-48px)
- Brief bullet points (if needed, 3-5 words each)

---

## Two-Column Rule: COMPLEMENTARY, NOT DUPLICATE

\`\`\`
LEFT COLUMN              RIGHT COLUMN
-------------            -------------
Problem reminder    →    Visual diagram
Equations (as text)      Diagram showing same math visually
Brief explanation        Labels & annotations

If you wrote it on the left, DON'T write it on the right
\`\`\`

**Test:** Cover the right column. Can you understand the step from just the left?
**Test:** Cover the left column. Can you understand the step from just the right?
If BOTH columns show the same information, you've duplicated. DELETE from one side.

---

## The 3-Second Scan Test

**Can a student understand the slide's key point in 3 seconds?**

If not, it's too cluttered. Remove:
- Explanatory subtitles
- Redundant info boxes
- Text that explains what the visual already shows
- Multiple pieces of information competing for attention

---

## Visual Annotation Rules (ALL Diagram Types)

**Reference:** \`reference/diagram-patterns.md\` contains diagram-specific examples.

### The Core Principle (Transferable Across All Visuals)

**Annotations are LABELS, not EXPLANATIONS.**

| ✅ Labels (SHORT, on visual) | ❌ Explanations (LONG, belongs in left column) |
|------------------------------|-----------------------------------------------|
| \`6\` | \`Each box represents 6 nuggets\` |
| \`?\` | \`The question mark shows what we're solving for\` |
| \`(0, 6)\` | \`y-intercept = 6\` |
| \`g\` | \`This line represents turtle g\` |

### The Delete Test

**Before finalizing any slide:** For each text element on the visual, ask: "If I delete this, does the visual still make sense?"

- If YES → delete it (the left column can explain it)
- If NO → keep it (it's a necessary label)

### Why This Works Across Contexts

This principle applies whether the visual is:
- A tape diagram (label boxes with numbers, not sentences)
- A coordinate graph (label points with coordinates, not descriptions)
- An area model (label partial products, not "this is where we multiply")
- A hanger diagram (label sides with expressions, not "left side equals right side")

The left column EXPLAINS. The visual SHOWS. They complement, never duplicate.
`;

// ============================================================================
// CHECKLISTS
// ============================================================================

export const PRE_FLIGHT_CHECKLIST = `
# Pre-Flight Checklist

**Verify BEFORE writing each slide.**

---

## The 3-Second Scan Test (VERIFY FIRST)

**Can a student understand the slide's key point in 3 seconds?**

If not, it's too cluttered. Remove content until it passes.

---

## Conciseness Checks

- [ ] **NO explanatory subtitles** (no "First, let's figure out...")
- [ ] **Problem reminder <= 15 words** (e.g., "30 nuggets total. 6 per student. How many students?")
- [ ] **CFU question: ONE question, <= 12 words** (no two-part questions!)
- [ ] **Answer box <= 25 words** (1-2 sentences only)
- [ ] **Left/Right columns are COMPLEMENTARY** (text left, visual right - NO duplication)
- [ ] **No redundant info boxes** (no "Reading the graph: ..." boxes)
- [ ] **Visuals are self-explanatory** (no text boxes explaining what's already shown)

---

## ⚠️ The Duplication Test (two-column layouts)

**If using two-column, verify you're not duplicating:**

- [ ] Left column says something DIFFERENT than the visual on the right
- [ ] If left explains "meanings" and right shows "meanings" boxes → use \`centered\` instead
- [ ] If left describes groups and right shows those same groups → use \`centered\` instead

**Ask:** "Am I saying the same thing twice?" If yes, switch to \`centered\` and let the diagram be the content.

---

## Technical Requirements

- [ ] File starts with \`<!DOCTYPE html>\` (NO checkpoint, NO comments before it)
- [ ] Body: \`width: 960px; height: 540px\`
- [ ] All text in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` (NOT bare text in divs)
- [ ] Layout uses \`.row\`/\`.col\` classes (NOT inline \`display: flex\`)
- [ ] Fonts: Arial, Georgia, Courier New only
- [ ] **Colors: 6-digit hex ONLY (e.g., #ffffff) - NEVER rgb/rgba/named colors**
- [ ] Backgrounds/borders on \`<div>\` only (NOT on \`<p>\`, \`<h1>\`)
- [ ] No JavaScript, onclick, or animations
- [ ] Light theme (white #ffffff, dark text #1d1d1d)

---

## PPTX Export (data-pptx attributes)

- [ ] Key regions have \`data-pptx-region\`, \`data-pptx-x/y/w/h\` attributes
- [ ] Badge: \`data-pptx-x="20" data-pptx-y="16" data-pptx-w="100" data-pptx-h="30"\`
- [ ] Title: \`data-pptx-x="130" data-pptx-y="16" data-pptx-w="810" data-pptx-h="30"\`
- [ ] Subtitle: \`data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="30"\`
- [ ] CFU/Answer boxes: \`data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"\`

---

## If Right-Column Has Visual Content

- [ ] Each distinct element has its own \`data-pptx-region="visual-*"\`
- [ ] Each element has \`data-pptx-x\`, \`data-pptx-y\`, \`data-pptx-w\`, \`data-pptx-h\`
- [ ] Wrapper div has NO data-pptx-region
- [ ] Coordinates don't overlap (stack with 10-16px gaps)

---

## If SVG Visual

- [ ] Read \`04-svg-workflow.md\` first
- [ ] SVG wrapped in container with \`data-pptx-region="svg-container"\` and position attributes
- [ ] All \`<text>\` elements have \`font-family="Arial"\`
- [ ] SVG container in SAME position as other step slides
- [ ] **⚠️ EVERY element group wrapped in \`<g data-pptx-layer="...">\`** (REQUIRED for editability)
- [ ] Layer names follow convention: \`label-X\`, \`shape-N\`, \`base\`, \`arrow-X\`

---

## If Slide Has CFU/Answer Box

- [ ] Box has correct \`data-pptx-region\` attribute ("cfu-box" or "answer-box")
- [ ] Box is positioned with absolute positioning (top-right overlay)
- [ ] CFU question references strategy verb
- [ ] Answer is direct, <= 25 words
`;

export const COMPLETION_CHECKLIST = `
# Completion Checklist

**Verify AFTER all 9 slides are written.**

---

## All Slides

- [ ] All 9 slides written to files (8 worked example + 1 printable)
- [ ] Slides 1-8 are exactly 960x540px
- [ ] All text is in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` tags (NOT bare text in divs!)
- [ ] Using \`.row\`/\`.col\` classes (NOT inline \`display: flex\`)
- [ ] Web-safe fonts only: Arial, Georgia, Courier New
- [ ] No JavaScript, no onclick, no CSS animations

---

## Content Quality

- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position across slides 2-8
- [ ] Each step slide ADDS something new to the visual

---

## PPTX Export

- [ ] CFU/Answer boxes have correct \`data-pptx-region\` attributes (for animation)
- [ ] All key regions have position attributes

---

## Printable Slide (Slide 9)

- [ ] Has zero scaffolding (no step headers, no hints)
- [ ] WHITE background (#ffffff)
- [ ] Times New Roman font
- [ ] Contains BOTH practice problems (from Scenarios 2 & 3)
- [ ] Each problem has work space

---

## If SVG Visual

- [ ] SVG container has \`data-pptx-region\` and position attributes
- [ ] Scale matches GRAPH PLAN from Phase 1 (scenarios[0].graphPlan)
- [ ] Annotations match GRAPH PLAN type and positions
- [ ] Completed SVG Checklist from \`04-svg-workflow.md\`
- [ ] Each line in its own \`data-pptx-layer\` group
- [ ] Each annotation in its own \`data-pptx-layer\` group
- [ ] All \`<text>\` elements have \`font-family="Arial"\`
- [ ] Grid lines align with axis labels (same pixel values)

---

## Ready for Phase 4

When all items are checked, proceed to:
\`\`\`
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
\`\`\`
`;

// ============================================================================
// PHASE 4: SAVE & EXPORT
// ============================================================================

export const PHASE4_SAVE_EXPORT = `
# Phase 4: Save & Export

## Purpose
Save the worked example to the database and export to PPTX or Google Slides for classroom use.

## Output Format
All slides are **960×540px, light theme** (9 slides). CFU/Answer boxes use PPTX animation. See \`03-generate-slides/02-technical-rules.md\` for technical specs.

## Prerequisites
- Phases 1-3 complete
- All slide HTML generated

---

## Phase 4.0: Optimize for Export (NEW - Run First!)

**Before saving or exporting, optimize slides for better PPTX quality.**

See: **[optimize-for-export.md](./optimize-for-export.md)** for full instructions.

### Quick Summary

The optimization step converts simple SVGs to HTML, resulting in **editable PPTX elements** instead of static images:

| Before Optimization | After Optimization |
|---------------------|-------------------|
| SVG rect + text → Screenshot (PNG) | HTML div + p → Native shapes/text |
| Teacher can't edit | Teacher can move/resize/edit |

### When to Convert SVGs

| SVG Contains | Action |
|--------------|--------|
| Only \`<rect>\`, \`<text>\`, \`<line>\`, \`<circle>\` | **Convert to HTML** |
| \`<path>\` with curves, gradients, graphs | Keep as SVG |

### Browser Wizard: Automatic Optimization

The browser wizard automatically runs optimization before export:
1. Click "Export to Slides"
2. System analyzes all slides for simple SVGs
3. Simple SVGs converted to HTML \`visual-*\` regions
4. Optimized slides exported to PPTX/Google Slides

### CLI Mode: Manual Optimization

Before saving, review each slide and convert simple SVGs manually following the patterns in \`optimize-for-export.md\`.

---

## Workflow Options

There are **two workflows** depending on how the deck was created:

| Workflow | When to Use | Save Method | Export Options |
|----------|-------------|-------------|----------------|
| **Browser Wizard** | Created in \`/scm/workedExamples/create\` | Step 4 UI | PPTX download, Google Slides |
| **CLI Mode** | Created via Claude Code skill | sync-to-db.js script | Manual PPTX export |

---

## Browser Wizard Workflow (Recommended)

If slides were created using the browser wizard at \`/scm/workedExamples/create\`:

### Step 4.1: Review Metadata

The wizard's Step 4 displays a form with:
- **Title** (required) - Display name for the deck
- **Slug** (required) - URL-safe identifier (lowercase, hyphens only)
- **Math Concept** - Topic area (e.g., "Linear Equations")
- **Math Standard** - Standard code (e.g., "8.EE.C.7")
- **Is Public** - Visibility setting

### Step 4.2: Export Options

**Before saving**, you can export to:

#### Export to PPTX (Download)

Generates a PowerPoint file that can be:
- Edited in Microsoft PowerPoint
- Uploaded to Google Drive manually
- Shared via email or LMS

**API Endpoint:** \`POST /api/scm/worked-examples/export-pptx\`
\`\`\`typescript
{
  slides: SlideData[],  // Array of { slideNumber, htmlContent }
  title: string,        // Deck title
  mathConcept?: string  // Optional metadata
}
// Returns: Binary PPTX file
\`\`\`

#### Export to Google Slides (Direct)

Uploads directly to the user's Google Drive as a Google Slides presentation.

**Requirements:**
- User must be signed in with Google OAuth
- Google Drive scope must be authorized

**API Endpoint:** \`POST /api/scm/worked-examples/export-google-slides\`
\`\`\`typescript
{
  slides: SlideData[],  // Array of { slideNumber, htmlContent }
  title: string,        // Deck title
  mathConcept?: string, // Optional metadata
  slug?: string         // If provided, saves URL to database
}
// Returns: { success: true, url: string, fileId: string }
\`\`\`

**Flow:**
1. Generate PPTX server-side
2. Upload to user's Google Drive
3. Convert to Google Slides format
4. Return Google Slides URL
5. If \`slug\` provided, save URL to database

### Step 4.3: Save to Database

Click "Save Deck" to:
1. Create a \`WorkedExampleDeck\` document in MongoDB
2. Store all HTML slides
3. Link to Google Slides URL (if exported)
4. Clear the wizard's local state

**Server Action:** \`saveWorkedExampleDeck\`

---

## CLI Mode Workflow

If slides were created using Claude Code (file-by-file with Write tool):

### Step 4.1: Create metadata.json

**File:** \`src/app/presentations/{slug}/metadata.json\`

\`\`\`json
{
  "title": "[STRATEGY NAME] - [TOPIC]",
  "slug": "[slug]",
  "mathConcept": "[from PROBLEM ANALYSIS]",
  "mathStandard": "[if known, e.g., 7.RP.A.1]",
  "gradeLevel": "[6/7/8 or 'Algebra 1']",
  "unitNumber": [number],
  "lessonNumber": [number],
  "scopeAndSequenceId": "[from Phase 1 or null]",
  "strategyName": "[from STRATEGY DEFINITION]",
  "strategySteps": ["[VERB 1]", "[VERB 2]", "[VERB 3 if applicable]"],
  "learningGoals": [
    "[goal 1]",
    "[goal 2 if applicable]"
  ],
  "scenarios": [
    "[Scenario 1 name]",
    "[Scenario 2 name]",
    "[Scenario 3 name]"
  ]
}
\`\`\`

### Step 4.2: Sync to MongoDB

\`\`\`bash
source .env.local && node .claude/skills/create-worked-example-sg/scripts/sync-to-db.js {slug}
\`\`\`

**Expected output:**
\`\`\`
✅ HTML Deck saved successfully!
Deck ID: [ObjectId]
Slug: [slug]
Total slides: 9
📁 Local files: src/app/presentations/[slug]/
🔗 View at: /presentations/[slug]
\`\`\`

### Step 4.3: Run Verification Script

\`\`\`bash
npx tsx .claude/skills/create-worked-example-sg/scripts/verify-worked-example.ts --slug {slug} --verbose
\`\`\`

### Step 4.4: Clean Up Progress File

After verification passes:
\`\`\`bash
rm src/app/presentations/{slug}/.worked-example-progress.json
\`\`\`

---

## PPTX Export Technical Details

### How HTML Becomes PPTX

The export system uses \`data-pptx-*\` attributes to map HTML elements to PowerPoint shapes:

\`\`\`html
<div data-pptx-region="badge"
     data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
     style="background: #1791e8; ...">
  <p>STEP 1</p>
</div>
\`\`\`

| Attribute | Purpose |
|-----------|---------|
| \`data-pptx-region\` | Element type (badge, title, content-box, cfu-box, etc.) |
| \`data-pptx-x\` | X position in pixels (from 960px width) |
| \`data-pptx-y\` | Y position in pixels (from 540px height) |
| \`data-pptx-w\` | Width in pixels |
| \`data-pptx-h\` | Height in pixels |

### Region Types

| Region | PPTX Behavior |
|--------|---------------|
| \`badge\` | Native text box with background |
| \`title\` | Native text (heading style) |
| \`subtitle\` | Native text |
| \`content-box\` | Text box with optional background |
| \`left-column\` | Text box (left side) |
| \`svg-container\` | Rendered as PNG image(s) |
| \`cfu-box\` | Text box with **click animation** (appears on click) |
| \`answer-box\` | Text box with **click animation** (appears on click) |

### SVG Handling

SVG elements are rendered to PNG using Puppeteer:
1. Parse SVG from HTML
2. Render in headless Chromium
3. Export as PNG with transparency
4. Embed in PPTX as image

**Multi-layer SVGs** (with \`data-pptx-layer\` attributes) are rendered as separate images for independent manipulation in PowerPoint.

### CFU/Answer Animation

Elements with \`data-pptx-region="cfu-box"\` or \`"answer-box"\` are:
- Added to the slide
- Set to **appear on click** (PPTX animation)
- Hidden when slide first displays
- Revealed when teacher clicks during presentation

This eliminates the need for duplicate question/answer slides.

---

## Google Slides Integration

### OAuth Requirements

Google Slides export requires:
1. User signed in via Clerk with Google OAuth
2. \`https://www.googleapis.com/auth/drive.file\` scope authorized

### Re-Authorization Flow

If the OAuth token expires, the wizard:
1. Shows a re-authorization prompt
2. User clicks "Re-authorize with Google"
3. Redirects to Google OAuth with \`oidcPrompt: 'consent'\`
4. After re-auth, automatically retries the export

### URL Persistence

When a deck is exported to Google Slides:
1. The Google Slides URL is returned
2. If \`slug\` is provided, URL is saved to \`WorkedExampleDeck.googleSlidesUrl\`
3. The deck list shows a Google Slides icon/link for decks with saved URLs

---

## API Reference

### POST /api/scm/worked-examples/export-pptx

Generates and downloads a PPTX file.

**Request:**
\`\`\`json
{
  "slides": [
    { "slideNumber": 1, "htmlContent": "<!DOCTYPE html>..." }
  ],
  "title": "Balance and Isolate",
  "mathConcept": "Linear Equations"
}
\`\`\`

**Response:** Binary PPTX file with \`Content-Disposition: attachment\`

### POST /api/scm/worked-examples/export-google-slides

Uploads to Google Drive and converts to Google Slides.

**Request:**
\`\`\`json
{
  "slides": [...],
  "title": "Balance and Isolate",
  "mathConcept": "Linear Equations",
  "slug": "balance-isolate-grade8"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "url": "https://docs.google.com/presentation/d/...",
  "fileId": "abc123..."
}
\`\`\`

---

## Phase 4 Completion Checklist

**Browser Wizard:**
- [ ] Reviewed title and slug
- [ ] Exported to PPTX (optional)
- [ ] Exported to Google Slides (optional)
- [ ] Saved to database
- [ ] Received confirmation message

**CLI Mode:**
- [ ] metadata.json created with all required fields
- [ ] Sync script ran successfully
- [ ] Verification script passed
- [ ] Progress file deleted
- [ ] User provided with presentation URL

---

## Troubleshooting

### PPTX Export Fails

1. Check that all slides have valid HTML
2. Verify \`data-pptx-*\` attributes are present on key elements
3. Check server logs for Puppeteer/rendering errors

### Google Slides Export: "Authorization Required"

1. User's Google token may have expired
2. Click "Re-authorize with Google"
3. Complete OAuth flow and retry

### Sync Script Fails

1. Check slide files exist: \`ls src/app/presentations/{slug}/\`
2. Verify metadata.json syntax: \`cat src/app/presentations/{slug}/metadata.json | jq .\`
3. Check DATABASE_URL: \`echo $DATABASE_URL | head -c 50\`

### SVG Not Rendering in PPTX

1. Ensure SVG is wrapped in \`data-pptx-region="svg-container"\`
2. Verify SVG has explicit \`width\` and \`height\` or \`viewBox\`
3. Check for unsupported SVG features (filters, external images)

---

## Summary

Phase 4 provides three output options:

| Output | Format | Editable | Requires Auth |
|--------|--------|----------|---------------|
| **Save to DB** | HTML in MongoDB | Yes (wizard) | Clerk |
| **Export PPTX** | PowerPoint file | Yes (desktop) | No |
| **Export Google Slides** | Google Slides | Yes (online) | Google OAuth |

The user can use any combination of these options.
`;

export const OPTIMIZE_FOR_EXPORT = `
# Phase 4.0: Optimize for Export

**Run this step BEFORE saving or exporting.** This optimization converts simple SVG elements to HTML, resulting in editable PPTX elements instead of static images.

---

## Why This Matters

The PPTX export system handles content differently:

| Content Type | PPTX Result | Teacher Can Edit? |
|--------------|-------------|-------------------|
| HTML with \`data-pptx-region\` | Native shapes/text | Yes |
| SVG elements | Screenshot (PNG) | No (image only) |

**Problem:** Many SVGs contain simple shapes and text that could be native PPTX elements, but get rendered as images because they're wrapped in \`<svg>\`.

**Solution:** Before export, convert simple SVGs to HTML \`<div>\` elements with proper \`data-pptx-region\` attributes.

---

## When to Optimize

**Optimize (convert to HTML):**
- Rectangles with text (comparison boxes, info cards)
- Simple labeled boxes (like "Meaning 1" / "Meaning 2" cards)
- Text-only annotations
- Basic shapes: \`<rect>\`, \`<circle>\`, \`<ellipse>\`, \`<line>\`

**Keep as SVG:**
- Coordinate graphs with axes and grid lines
- Complex paths (\`<path>\` with curves)
- Data visualizations with plotted points
- Arrows with complex paths
- Any SVG using: \`<path>\`, gradients, filters, masks, transforms, \`<image>\`

---

## Decision Flowchart

\`\`\`
For each <svg> in the slide:
    │
    ├─ Contains <path> with curves? ──────────────► KEEP AS SVG
    │
    ├─ Contains gradients/filters/masks? ─────────► KEEP AS SVG
    │
    ├─ Contains coordinate axes/grid? ────────────► KEEP AS SVG
    │
    ├─ Contains plotted data points? ─────────────► KEEP AS SVG
    │
    └─ Contains ONLY rect + text + line + circle? ─► CONVERT TO HTML
\`\`\`

---

## Conversion Process

### Step 1: Identify Simple SVGs

Look for SVGs that contain ONLY:
- \`<rect>\` (with optional \`rx\` for rounded corners)
- \`<text>\` elements
- \`<line>\` elements
- \`<circle>\` or \`<ellipse>\`
- \`<g>\` groupings (for organization)

**Example of a simple SVG (CONVERT):**
\`\`\`html
<svg viewBox="0 0 720 220">
  <g data-pptx-layer="two-meanings">
    <rect x="20" y="20" width="330" height="180" fill="#e0f2fe" stroke="#60a5fa" stroke-width="3" rx="12"/>
    <text x="185" y="50" fill="#1d1d1d" font-weight="bold" text-anchor="middle">Meaning 1:</text>
    <text x="185" y="75" fill="#1d1d1d" text-anchor="middle">How many in each group?</text>

    <rect x="370" y="20" width="330" height="180" fill="#dcfce7" stroke="#22c55e" stroke-width="3" rx="12"/>
    <text x="535" y="50" fill="#1d1d1d" font-weight="bold" text-anchor="middle">Meaning 2:</text>
    <text x="535" y="75" fill="#1d1d1d" text-anchor="middle">How many groups?</text>
  </g>
</svg>
\`\`\`

**Example of a complex SVG (KEEP):**
\`\`\`html
<svg viewBox="0 0 520 350">
  <g data-pptx-layer="base">
    <!-- Grid lines -->
    <line x1="60" y1="290" x2="500" y2="290" stroke="#e5e7eb"/>
    <!-- Axes -->
    <line x1="60" y1="30" x2="60" y2="290" stroke="#1d1d1d" stroke-width="2"/>
    <!-- Axis labels, tick marks -->
  </g>
  <g data-pptx-layer="line-1">
    <!-- Plotted line with path -->
    <path d="M 60 230 L 170 200 L 280 170" stroke="#1791e8" fill="none"/>
  </g>
</svg>
\`\`\`

### Step 2: Map SVG Coordinates to PPTX Coordinates

The SVG uses a \`viewBox\` coordinate system. Convert to slide coordinates (960x540):

**Given:**
- SVG container position: \`data-pptx-x\`, \`data-pptx-y\` on the parent
- SVG viewBox: \`viewBox="0 0 [vbWidth] [vbHeight]"\`
- Element in SVG: \`x\`, \`y\`, \`width\`, \`height\`

**Formula:**
\`\`\`
pptx_x = container_x + (svg_x / vbWidth) * container_w
pptx_y = container_y + (svg_y / vbHeight) * container_h
pptx_w = (svg_width / vbWidth) * container_w
pptx_h = (svg_height / vbHeight) * container_h
\`\`\`

**Example calculation:**
- Container: x=408, y=150, w=532, h=360
- viewBox: 0 0 720 220
- SVG rect: x=20, y=20, width=330, height=180

\`\`\`
pptx_x = 408 + (20 / 720) * 532 = 408 + 14.8 ≈ 423
pptx_y = 150 + (20 / 220) * 360 = 150 + 32.7 ≈ 183
pptx_w = (330 / 720) * 532 ≈ 244
pptx_h = (180 / 220) * 360 ≈ 295
\`\`\`

### Step 3: Convert SVG Elements to HTML

**SVG \`<rect>\` → HTML \`<div>\`:**

\`\`\`html
<!-- BEFORE (SVG) -->
<rect x="20" y="20" width="330" height="180"
      fill="#e0f2fe" stroke="#60a5fa" stroke-width="3" rx="12"/>

<!-- AFTER (HTML) -->
<div data-pptx-region="visual-meaning-1"
     data-pptx-x="423" data-pptx-y="183" data-pptx-w="244" data-pptx-h="295"
     style="background: #e0f2fe; border: 3px solid #60a5fa; border-radius: 12px;">
</div>
\`\`\`

**SVG \`<text>\` → HTML \`<p>\`:**

\`\`\`html
<!-- BEFORE (SVG) -->
<text x="185" y="50" fill="#1d1d1d" font-size="15" font-weight="bold" text-anchor="middle">
  Meaning 1:
</text>

<!-- AFTER (HTML) - nested inside the div -->
<p style="color: #1d1d1d; font-size: 15px; font-weight: bold; text-align: center; margin: 0;">
  Meaning 1:
</p>
\`\`\`

### Step 4: Group Related Elements

Combine rect + text elements that belong together into a single \`visual-*\` region:

\`\`\`html
<!-- BEFORE: SVG with rect + multiple text elements -->
<svg viewBox="0 0 720 220">
  <rect x="20" y="20" width="330" height="180" fill="#e0f2fe" stroke="#60a5fa" rx="12"/>
  <text x="185" y="50" font-weight="bold" text-anchor="middle">Meaning 1:</text>
  <text x="185" y="75" text-anchor="middle">How many in each group?</text>
  <text x="185" y="130" fill="#1791e8" font-weight="bold">6 groups</text>
</svg>

<!-- AFTER: HTML div with nested paragraphs -->
<div data-pptx-region="visual-meaning-1"
     data-pptx-x="423" data-pptx-y="183" data-pptx-w="244" data-pptx-h="295"
     style="background: #e0f2fe; border: 3px solid #60a5fa; border-radius: 12px; padding: 12px;">
  <p style="font-weight: bold; text-align: center; color: #1d1d1d; margin: 0 0 8px 0;">Meaning 1:</p>
  <p style="text-align: center; color: #1d1d1d; margin: 0 0 16px 0;">How many in each group?</p>
  <p style="font-weight: bold; text-align: center; color: #1791e8; margin: 0;">6 groups</p>
</div>
\`\`\`

---

## Complete Example

### Before Optimization

\`\`\`html
<div data-pptx-region="svg-container"
     data-pptx-x="80" data-pptx-y="140" data-pptx-w="800" data-pptx-h="340"
     class="center">
  <svg viewBox="0 0 720 220" style="width: 100%; max-height: 220px;">
    <g data-pptx-layer="two-meanings">
      <!-- Box 1 -->
      <rect x="20" y="20" width="330" height="180" fill="#e0f2fe" stroke="#60a5fa" stroke-width="3" rx="12"/>
      <text x="185" y="50" fill="#1d1d1d" font-size="15" font-weight="bold" text-anchor="middle">Meaning 1:</text>
      <text x="185" y="75" fill="#1d1d1d" font-size="13" text-anchor="middle">How many in each group?</text>
      <text x="185" y="130" fill="#1791e8" font-size="14" font-weight="bold" text-anchor="middle">6 groups</text>
      <text x="185" y="155" fill="#1d1d1d" font-size="12" text-anchor="middle">48 / 6 = ?</text>
      <text x="185" y="180" fill="#737373" font-size="11" text-anchor="middle">coins per group</text>

      <!-- Box 2 -->
      <rect x="370" y="20" width="330" height="180" fill="#dcfce7" stroke="#22c55e" stroke-width="3" rx="12"/>
      <text x="535" y="50" fill="#1d1d1d" font-size="15" font-weight="bold" text-anchor="middle">Meaning 2:</text>
      <text x="535" y="75" fill="#1d1d1d" font-size="13" text-anchor="middle">How many groups?</text>
      <text x="535" y="130" fill="#22c55e" font-size="14" font-weight="bold" text-anchor="middle">6 coins per group</text>
      <text x="535" y="155" fill="#1d1d1d" font-size="12" text-anchor="middle">48 / 6 = ?</text>
      <text x="535" y="180" fill="#737373" font-size="11" text-anchor="middle">groups</text>
    </g>
  </svg>
</div>
\`\`\`

### After Optimization

\`\`\`html
<!-- Wrapper for layout (no data-pptx-region) -->
<div class="row center gap-md" style="padding: 20px;">

  <!-- Box 1: Meaning 1 - Now a visual region -->
  <div data-pptx-region="visual-meaning-1"
       data-pptx-x="102" data-pptx-y="155" data-pptx-w="367" data-pptx-h="279"
       style="background: #e0f2fe; border: 3px solid #60a5fa; border-radius: 12px; padding: 16px; flex: 1;">
    <p style="font-size: 15px; font-weight: bold; text-align: center; color: #1d1d1d; margin: 0 0 8px 0;">Meaning 1:</p>
    <p style="font-size: 13px; text-align: center; color: #1d1d1d; margin: 0 0 20px 0;">How many in each group?</p>
    <p style="font-size: 14px; font-weight: bold; text-align: center; color: #1791e8; margin: 0 0 8px 0;">6 groups</p>
    <p style="font-size: 12px; text-align: center; color: #1d1d1d; margin: 0 0 8px 0;">48 / 6 = ?</p>
    <p style="font-size: 11px; text-align: center; color: #737373; margin: 0;">coins per group</p>
  </div>

  <!-- Box 2: Meaning 2 - Now a visual region -->
  <div data-pptx-region="visual-meaning-2"
       data-pptx-x="491" data-pptx-y="155" data-pptx-w="367" data-pptx-h="279"
       style="background: #dcfce7; border: 3px solid #22c55e; border-radius: 12px; padding: 16px; flex: 1;">
    <p style="font-size: 15px; font-weight: bold; text-align: center; color: #1d1d1d; margin: 0 0 8px 0;">Meaning 2:</p>
    <p style="font-size: 13px; text-align: center; color: #1d1d1d; margin: 0 0 20px 0;">How many groups?</p>
    <p style="font-size: 14px; font-weight: bold; text-align: center; color: #22c55e; margin: 0 0 8px 0;">6 coins per group</p>
    <p style="font-size: 12px; text-align: center; color: #1d1d1d; margin: 0 0 8px 0;">48 / 6 = ?</p>
    <p style="font-size: 11px; text-align: center; color: #737373; margin: 0;">groups</p>
  </div>

</div>
\`\`\`

---

## SVG-to-HTML Mapping Reference

| SVG Element | HTML Equivalent |
|-------------|-----------------|
| \`<rect fill="X" stroke="Y" rx="Z">\` | \`<div style="background: X; border: solid Y; border-radius: Zpx;">\` |
| \`<text fill="X" font-size="Y" font-weight="Z">\` | \`<p style="color: X; font-size: Ypx; font-weight: Z;">\` |
| \`<text text-anchor="middle">\` | \`<p style="text-align: center;">\` |
| \`<text text-anchor="start">\` | \`<p style="text-align: left;">\` |
| \`<text text-anchor="end">\` | \`<p style="text-align: right;">\` |
| \`<line stroke="X">\` | \`<div style="border-top: 1px solid X;">\` (horizontal) |
| \`<circle fill="X" r="Y">\` | \`<div style="background: X; width: Ypx; height: Ypx; border-radius: 50%;">\` |

---

## Checklist

Before saving/exporting, verify:

- [ ] Identified all SVGs in the slide deck
- [ ] Classified each SVG as "simple" (convert) or "complex" (keep)
- [ ] Converted simple SVGs to HTML \`<div>\` elements
- [ ] Each converted element has \`data-pptx-region="visual-*"\`
- [ ] Each converted element has \`data-pptx-x\`, \`data-pptx-y\`, \`data-pptx-w\`, \`data-pptx-h\`
- [ ] Text elements use \`<p>\` tags with proper styling
- [ ] Colors remain in 6-digit hex format
- [ ] Complex SVGs (graphs, paths) remain unchanged

---

## Common Patterns to Convert

### Comparison Cards (Side-by-Side)
Two or more rectangles with text comparing options, meanings, or scenarios.

### Info/Callout Boxes
Single rectangles with header + body text, often with colored borders.

### Labeled Shapes
Simple geometric shapes (circles, rectangles) with text labels.

### Result/Answer Cards
Boxes showing calculated results or answers with highlighting.

---

## What NOT to Convert

- Coordinate plane graphs (axes, grid, plotted points)
- Line graphs or data visualizations
- Arrows with curved paths
- Diagrams with complex positioning relationships
- Any SVG using \`<path>\` with bezier curves
- SVGs with transforms, gradients, or filters
`;
