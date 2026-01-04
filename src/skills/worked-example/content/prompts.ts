/**
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
  - **Non-graph diagrams** (svgSubtype: "diagram") → **use \`diagram-patterns.md\` as PRIMARY REFERENCE**
    - Double number lines
    - Tape diagrams (bar models)
    - Hanger diagrams (balance equations)
    - Area models
    - Input-output tables
    - Ratio tables
  - Geometric shapes (svgSubtype: "shape")
  - Number lines and bar models (svgSubtype: "number-line")
  - Any custom visual (svgSubtype: "other")

**For non-graph SVGs:** READ \`phases/03-generate-slides/visuals/diagram-patterns.md\` to see the exact visual structure students expect from Illustrative Mathematics curriculum.

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

/**
 * Generate Slides Instructions (PPTX-Compatible)
 * Step-by-step guide for creating HTML slides.
 * Includes PPTX constraints, SVG patterns, and validation checklists.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md
 */
export const GENERATE_SLIDES_INSTRUCTIONS = `
# Generate Slides Protocol

**This is the primary technical spec for generating PPTX-compatible HTML slides.**

**Responsibility:** Step-by-step protocol for each individual slide (HOW to generate).

**Delegates to:**
- \`card-patterns/simple-patterns/\` → For title zones, content boxes, CFU/Answer overlays
- \`card-patterns/complex-patterns/\` → For SVG graphs, annotations, printable slides
- \`visuals/svg-graphs.md\` → For pixel calculation formulas (coordinate graph SVGs)
- \`visuals/diagram-patterns.md\` → **PRIMARY REFERENCE for non-graph SVGs** (tape diagrams, hangers, input-output, etc.)

**Don't duplicate here:** High-level workflow (see \`index.md\`), layout presets (see \`reference/layout-presets.md\`).

---

## ⚠️ API MODE vs CLI MODE

**API Mode (browser wizard):** Your response is collected as a single stream.
- Output ONLY HTML slides separated by \`===SLIDE_SEPARATOR===\`
- NO preamble, NO announcements, NO "I'll generate..." text
- First characters of response MUST be \`<!DOCTYPE html>\`

**CLI Mode (file-by-file):** You write individual files with the Write tool.
- Announce checkpoints as conversational text between file writes
- Each file starts with \`<!DOCTYPE html>\`

---

## 🔄 PER-SLIDE PROTOCOL (MANDATORY for EVERY Slide)

**For each slide you generate, follow this exact sequence.**

### Step 1: Announce Checkpoint (CLI MODE ONLY - NOT for API mode)

**⚠️ CRITICAL: Skip this step entirely in API mode. Only do this in CLI mode.**

**CLI Mode:** Before writing each slide file, announce what you're about to do:

\`\`\`
SLIDE [N]: [Type Name]
Action: generate-new
Layout: [full-width | two-column] | Components: [list of card-patterns used]
\`\`\`

**Example announcements (plain text, NOT HTML):**
\`\`\`
SLIDE 3: Step 1 Question + CFU
Action: generate-new
Layout: two-column | Components: title-zone, content-box, svg-card, cfu-card (animated)

SLIDE 4: Step 1 Answer
Action: generate-new
Layout: two-column | Components: title-zone, content-box, svg-card, answer-card (animated)
\`\`\`

**If slide contains an SVG graph, add graph workflow to checkpoint:**
\`\`\`
SLIDE 2: Problem Setup
Action: generate-new
Layout: two-column | Components: title-zone, content-box, svg-card
Graph: Use card-patterns/svg-card.html → modify for X_MAX=10, Y_MAX=100
\`\`\`

**⚠️ CRITICAL: What goes IN the slide HTML file:**
- The file starts with \`<!DOCTYPE html>\` - NOTHING before it
- NO checkpoint announcements (those are conversational only)
- NO protocol notes or comments
- NO explanatory text like "Paired: Yes" or "Action: copy-and-add-answer"
- ONLY valid HTML content starting with \`<!DOCTYPE html>\`

**The checkpoint announcement is what you SAY to the user, NOT what you WRITE to the file.**

---

### Step 2: Determine Slide Type and Layout

**Note:** CFU/Answer boxes use PPTX animations (appear on click) - no duplicate slides needed.

| Slide # | Type | Action | Layout | Components |
|---------|------|--------|--------|------------|
| 1 | Learning Goal | generate-new | \`full-width\` | title-zone, content-box |
| 2 | Problem Setup | generate-new | \`two-column\` | title-zone, content-box, svg-card |
| 3 | Step 1 Question + CFU | generate-new | \`two-column\` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 4 | Step 1 Answer | generate-new | \`two-column\` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 5 | Step 2 Question + CFU | generate-new | \`two-column\` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 6 | Step 2 Answer | generate-new | \`two-column\` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 7 | Step 3 Question + CFU | generate-new | \`two-column\` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 8 | Step 3 Answer | generate-new | \`two-column\` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 9 | Printable | generate-new | \`full-width\` | Special format (portrait, practice problems embedded) |

**Note:** Practice problems are embedded directly in the Printable slide (slide 9) rather than having separate presentation slides. The printable is generated via a separate API call after slides 1-8 complete.

---

### Step 3a: Adding CFU/Answer Boxes (PPTX Animation)

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
- See \`card-patterns/cfu-answer-card.html\` for full pattern

---

### Step 3b: Compose Slides from Atomic Components

**For ALL slides (1-8, printable generated separately):**

1. **ANNOUNCE** checkpoint to user (plain text, see Step 1)
2. **CHOOSE LAYOUT** from the table above (full-width or two-column)
3. **COMPOSE** slide using atomic card-patterns:
   - **title-zone**: Badge ("STEP N: [VERB]") + Title + optional Subtitle
   - **content-box**: Main text content (instructions, questions, explanations)
   - **svg-card**: Graph or diagram (if visual slide)
   - Use patterns from \`card-patterns/\` folder as HTML snippets
4. **IF Visual Type = "coordinate-graph"**: Read \`visuals/svg-graphs.md\` FIRST
5. **IF Visual Type = "diagram" (non-graph SVG)**: Read \`visuals/diagram-patterns.md\` FIRST
   - Includes: tape diagrams, hanger diagrams, double number lines, input-output tables, area models
   - Based on Illustrative Mathematics (IM) curriculum representations
6. **VERIFY** the Pre-Flight Checklist below
7. **WRITE** slide file using Write tool (file starts with \`<!DOCTYPE html>\`)

---

### Step 4: Repeat Protocol

For each slide N from 1 to 8:
1. Return to Step 1
2. Announce checkpoint (plain text to user)
3. Follow Step 3a or 3b based on paired status
4. Write slide file (starts with \`<!DOCTYPE html>\`, no other content before it)
5. Continue until all slides complete

---

## ⚠️ VISUAL CONSISTENCY ACROSS STEP SLIDES (CRITICAL)

**This is the most important rule for student learning.**

The main visual (graph, table, diagram) must stay in the SAME position across all step slides (2-8).

**Common Mistakes (NEVER DO THESE):**
- Moving the graph/visual between slides
- Changing visual dimensions or scale
- Changing the layout structure mid-sequence

**CFU/Answer boxes ANIMATE in place:**
- They overlay the existing content
- The underlying slide content doesn't change
- Teacher clicks to reveal the box during presentation

---

## Reference Files to Read

**Before generating slides, read the appropriate files:**

| Visual Type | Files to Read |
|-------------|---------------|
| All slides | \`../../reference/styling.md\` (colors, fonts, spacing) |
| All slides | \`../../reference/layout-presets.md\` (layout presets + regions) |
| SVG graphs | \`visuals/svg-graphs.md\` (MANDATORY) |

**Atomic card-patterns (two folders):**

| Folder | Patterns | Workflow |
|--------|----------|----------|
| \`simple-patterns/\` | title-zone, content-box, cfu-answer-card | Replace \`{{placeholders}}\` with content |
| \`complex-patterns/\` | graph-snippet, annotation-snippet, printable-slide-snippet | Copy entire file, modify values + recalculate pixels |

**simple-patterns/ (replace placeholders):**
- \`card-patterns/simple-patterns/title-zone.html\` → Badge + Title + Subtitle
- \`card-patterns/simple-patterns/content-box.html\` → Text, lists, equations, tables
- \`card-patterns/simple-patterns/cfu-answer-card.html\` → CFU/Answer overlays (animated)

**complex-patterns/ (copy, modify, and recalculate):**
- \`card-patterns/complex-patterns/graph-snippet.html\` → Full coordinate plane (COPY and recalculate pixels)
- \`card-patterns/complex-patterns/annotation-snippet.html\` → Y-intercept labels, arrows, point labels (recalculate positions)
- \`card-patterns/complex-patterns/printable-slide-snippet.html\` → Printable worksheet (COPY and fill)

**SVG graphs and printable slides use complex-patterns.** Everything else uses simple-patterns.

**Layout composition approach:**
1. Choose layout preset (full-width or two-column)
2. Add title-zone to header region
3. Add content-box(es) to main content regions
4. If SVG needed: clone graph-snippet, recalculate pixels (see SVG section below)
5. Add cfu-card or answer-card overlay (animated)

---

## ⚠️ SVG Graph Creation (THE COMPLEX CASE)

**SVG graphs are the ONLY component that requires the clone-and-modify workflow.**

All other card-patterns use simple placeholder replacement. SVG graphs require:
- Pixel math (coordinate system calculations)
- Layer structure for PPTX export
- Precise alignment of axes, grid, and labels

**Always start from the full working example - do NOT create from scratch.**

### Step 1: Read the Graph Snippets
\`\`\`
READ: card-patterns/complex-patterns/graph-snippet.html      ← FULL WORKING EXAMPLE
READ: card-patterns/complex-patterns/annotation-snippet.html ← Annotation patterns
READ: visuals/svg-graphs.md                                ← Pixel calculation reference
\`\`\`

\`graph-snippet.html\` is your **starting point**. It contains:
- Arrow marker definitions for axes and lines
- Complete coordinate plane with proper alignment
- Single "0" at origin (not two separate zeros)
- Complete scale labels to the arrows
- Example data lines with extension arrows
- Layer structure for PPTX export

### Step 2: Copy and Modify
1. **COPY** the entire \`<svg>...</svg>\` block from graph-snippet.html
2. **ADJUST** X_MAX and Y_MAX for your specific data
3. **RECALCULATE** grid and label positions using the formulas in the snippet
4. **ADD** your specific data lines and points
5. **ADD** annotations using \`card-patterns/complex-patterns/annotation-snippet.html\`

### Step 3: Layer Structure (for PPTX Export)
Each SVG element you want to be independently selectable in PowerPoint/Google Slides needs its own layer:
\`\`\`html
<g data-pptx-layer="line-1"><!-- Blue line + point --></g>
<g data-pptx-layer="line-2"><!-- Green line + point --></g>
<g data-pptx-layer="label-b0"><!-- Y-intercept label --></g>
\`\`\`
See \`card-patterns/complex-patterns/graph-snippet.html\` and \`card-patterns/complex-patterns/annotation-snippet.html\` for the full layer naming convention.

### SVG Graph Checklist (VERIFY BEFORE WRITING SLIDE)

**Structure:**
- [ ] Started from graph-snippet.html (NOT from scratch)
- [ ] SVG wrapped in container with \`data-pptx-region="svg-container"\`
- [ ] Container has position attributes: \`data-pptx-x\`, \`data-pptx-y\`, \`data-pptx-w\`, \`data-pptx-h\`

**Coordinate System:**
- [ ] X_MAX and Y_MAX set correctly for your data
- [ ] Grid lines align with axis labels (same pixel values)
- [ ] Single "0" at origin (not two separate zeros)
- [ ] Scale labels go to last tick before arrow

**Axes & Lines:**
- [ ] Axes have arrowheads (marker-end)
- [ ] Data lines extend to plot edges with arrows
- [ ] All lines use correct colors from styling.md

**Annotations:**
- [ ] All \`<text>\` elements have \`font-family="Arial"\`
- [ ] Annotations use \`font-weight="normal"\` (NOT bold)
- [ ] Annotation positions calculated using pixel formula

**PPTX Export:**
- [ ] Each line in its own \`data-pptx-layer\` group
- [ ] Each annotation in its own \`data-pptx-layer\` group
- [ ] Layer names follow convention: \`line-1\`, \`label-b0\`, \`arrow-shift\`, etc.

---

## CFU Question Requirements

**Questions MUST reference the strategy verb:**
- ✅ "Why did I [VERB] first?"
- ✅ "How did I know to [VERB] here?"
- ✅ "What does [VERB]ing accomplish?"

**Questions must NOT be computational:**
- ❌ "What is 6 ÷ 2?"
- ❌ "What's the answer?"

---

## ⚠️ COLOR FORMAT (CRITICAL)

**ALWAYS use 6-digit hex colors. NEVER use rgb(), rgba(), hsl(), or named colors.**

| ✅ CORRECT | ❌ WRONG |
|-----------|----------|
| \`#ffffff\` | \`white\` |
| \`#1d1d1d\` | \`rgb(29, 29, 29)\` |
| \`#f59e0b\` | \`rgba(245, 158, 11, 1)\` |
| \`#000000\` | \`black\` |

**Why?** The PPTX export parser only understands hex colors. Any other format will cause rendering errors or be ignored.

**For shadows:** Use a simple border instead of box-shadow, or omit shadows entirely. PPTX doesn't support shadows.

---

## Pre-Flight Checklist (Verify EVERY Slide)

- [ ] File starts with \`<!DOCTYPE html>\` (NO checkpoint, NO comments before it)
- [ ] Body: \`width: 960px; height: 540px\`
- [ ] All text in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` (NOT bare text in divs)
- [ ] Layout uses \`.row\`/\`.col\` classes (NOT inline \`display: flex\`)
- [ ] Fonts: Arial, Georgia, Courier New only
- [ ] **Colors: 6-digit hex ONLY (e.g., #ffffff) - NEVER rgb/rgba/named colors**
- [ ] Backgrounds/borders on \`<div>\` only (NOT on \`<p>\`, \`<h1>\`)
- [ ] No JavaScript, onclick, or animations
- [ ] Light theme (white #ffffff, dark text #1d1d1d)

**PPTX Export (data-pptx attributes):**
- [ ] Key regions have \`data-pptx-region\`, \`data-pptx-x/y/w/h\` attributes
- [ ] Badge: \`data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"\`
- [ ] Title: \`data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"\`
- [ ] Subtitle: \`data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"\`
- [ ] CFU/Answer boxes: \`data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"\`

**If SVG visual:**
- [ ] Read \`visuals/svg-graphs.md\` first
- [ ] SVG wrapped in container with \`data-pptx-region="svg-container"\` and position attributes
- [ ] All \`<text>\` elements have \`font-family="Arial"\`
- [ ] SVG container in SAME position as other step slides

**If slide has CFU/Answer box:**
- [ ] Box has correct \`data-pptx-region\` attribute ("cfu-box" or "answer-box")
- [ ] Box is positioned with absolute positioning (top-right overlay)

---

## Completion Checklist

- [ ] All 8 worked example slides generated with checkpoints
- [ ] CFU/Answer boxes have correct data-pptx-region attributes (for animation)
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position (slides 2-8)
- [ ] Printable slide (9) generated separately with practice problems

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

**⚠️ NEVER include in slide files:**
- Checkpoint announcements (those are conversational text to user)
- Protocol comments or notes
- Any text before \`<!DOCTYPE html>\`

When outputting multiple slides in conversation, separate with:
\`\`\`
===SLIDE_SEPARATOR===
\`\`\`
`;
