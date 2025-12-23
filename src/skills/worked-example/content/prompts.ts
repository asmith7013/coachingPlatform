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

### STEP 6: Determine Visual Type
- **HTML/CSS**: Tables, text problems, static equations
- **HTML diagrams**: Hanger diagrams, geometric shapes, balance problems
- **SVG graphs**: Coordinate planes, linear equations, graphs, data visualizations

### STEP 7: Graph Planning (REQUIRED if Visual Type is "SVG graphs")

**IF you selected "SVG graphs" above, you MUST complete graph planning NOW.**

This ensures the math is calculated BEFORE slide generation:

**7a: List Your Equations**
Write out every line/equation that will appear:
\`\`\`
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
\`\`\`

**7b: Calculate Key Data Points**
For EACH line, calculate y at key x values:
\`\`\`
Line 1: y = 5x
  - At x=0: y = 0 (y-intercept)
  - At x=4: y = 20
  - At x=8: y = 40

Line 2: y = 5x + 20
  - At x=0: y = 20 (y-intercept)
  - At x=4: y = 40
  - At x=8: y = 60
\`\`\`

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
- [ ] **IF visualType is "SVG graphs":**
  - [ ] graphPlan.equations has ALL lines with slope and y-intercept values
  - [ ] graphPlan.keyPoints has calculated y-values at key x positions
  - [ ] graphPlan.scale has xMax and yMax properly rounded
  - [ ] graphPlan.annotations describes the mathematical relationship to highlight
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

---

## 🔄 PER-SLIDE PROTOCOL (MANDATORY for EVERY Slide)

**For each slide you generate, follow this exact sequence.**

### Step 1: Announce Checkpoint (TEXT to user, NOT in file)

**⚠️ CRITICAL: This is conversational text you say to the user, NOT HTML to write to the file.**

Before writing each slide file, announce what you're about to do in plain text:

\`\`\`
SLIDE [N]: [Type Name]
Paired: [Yes/No] | Base: [Slide # or N/A]
Action: [generate-new | copy-and-add-cfu | copy-and-add-answer]
\`\`\`

**Example announcements (plain text, NOT HTML):**
\`\`\`
SLIDE 3: Step 1 Question
Paired: No | Base: N/A
Action: generate-new using slide-base.html template

SLIDE 4: Step 1 + CFU
Paired: Yes | Base: Slide 3
Action: copy-and-add-cfu (copy slide 3 verbatim, insert CFU box)
\`\`\`

**If slide contains an SVG graph, add graph workflow to checkpoint:**
\`\`\`
SLIDE 2: Problem Setup
Paired: No | Base: N/A
Action: generate-new using slide-two-column.html template
Graph: READ templates/graph-snippet.html → copy → modify for X_MAX=10, Y_MAX=100
Annotations: READ templates/annotation-snippet.html → add y-intercept labels
\`\`\`

**⚠️ CRITICAL: What goes IN the slide HTML file:**
- The file starts with \`<!DOCTYPE html>\` - NOTHING before it
- NO checkpoint announcements (those are conversational only)
- NO protocol notes or comments
- NO explanatory text like "Paired: Yes" or "Action: copy-and-add-answer"
- ONLY valid HTML content starting with \`<!DOCTYPE html>\`

**The checkpoint announcement is what you SAY to the user, NOT what you WRITE to the file.**

---

### Step 2: Determine Slide Type and Template

| Slide # | Type | Is Paired? | Action | Template to Use |
|---------|------|------------|--------|-----------------|
| 1 | Learning Goal | No | generate-new | \`templates/slide-learning-goal.html\` |
| 2 | Problem Setup | No | generate-new | \`templates/slide-two-column.html\` |
| 3 | Step 1 Question | No | generate-new | \`templates/slide-base.html\` |
| 4 | Step 1 + CFU | **YES** | copy-and-add-cfu | **COPY Slide 3** |
| 5 | Step 1 Answer | No | generate-new | \`templates/slide-base.html\` |
| 6 | Step 1 + Answer | **YES** | copy-and-add-answer | **COPY Slide 5** |
| 7 | Step 2 Question | No | generate-new | \`templates/slide-base.html\` |
| 8 | Step 2 + CFU | **YES** | copy-and-add-cfu | **COPY Slide 7** |
| 9 | Step 2 Answer | No | generate-new | \`templates/slide-base.html\` |
| 10 | Step 2 + Answer | **YES** | copy-and-add-answer | **COPY Slide 9** |
| 11-12 | Step 3 | Pattern repeats | Same logic | Same templates |
| 13 | Practice 1 | No | generate-new | \`templates/slide-practice.html\` |
| 14 | Practice 2 | No | generate-new | \`templates/slide-practice.html\` |
| 15 | Printable | No | generate-new | \`templates/printable-slide-snippet.html\` |

---

### Step 3a: If Paired Slide → COPY + ADD (Fast Path)

**For slides 4, 6, 8, 10, 12 (all paired slides):**

1. **ANNOUNCE** checkpoint to user (plain text, see Step 1)
2. **COPY** the previous slide's ENTIRE HTML verbatim (from \`<!DOCTYPE html>\` to \`</html>\`)
3. **FIND** the closing \`</body>\` tag
4. **INSERT** the appropriate box IMMEDIATELY BEFORE \`</body>\` (see below)
5. **WRITE** slide file using Write tool (file starts with \`<!DOCTYPE html>\`)
6. **STOP** - Do NOT change anything else

**CFU Box (for slides 4, 8, 12) - ABSOLUTE POSITIONED TOP RIGHT:**
\`\`\`html
<div style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[CFU question using strategy verb]</p>
</div>
\`\`\`

**Answer Box (for slides 6, 10) - ABSOLUTE POSITIONED TOP RIGHT:**
\`\`\`html
<div style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Answer explanation]</p>
</div>
\`\`\`

---

### Step 3b: If New Slide → READ Template and Generate

**For slides 1, 2, 3, 5, 7, 9, 11, 13, 14, 15:**

1. **ANNOUNCE** checkpoint to user (plain text, see Step 1)
2. **READ** the template file specified in the table above
3. **FILL** the template placeholders:
   - \`{{title}}\` → Slide title
   - \`{{step_badge}}\` → "STEP N: [VERB]" (use exact verb from strategy)
   - \`{{content}}\` → Main content (visual, table, etc.)
   - \`{{cfu_question}}\` → CFU question (must reference strategy verb)
4. **IF Visual Type = "SVG graphs"**: Read \`visuals/svg-graphs.md\` FIRST
5. **VERIFY** the Pre-Flight Checklist below
6. **WRITE** slide file using Write tool (file starts with \`<!DOCTYPE html>\`)

---

### Step 4: Repeat Protocol

For each slide N from 1 to 15:
1. Return to Step 1
2. Announce checkpoint (plain text to user)
3. Follow Step 3a or 3b based on paired status
4. Write slide file (starts with \`<!DOCTYPE html>\`, no other content before it)
5. Continue until all slides complete

---

## ⚠️ PAIRED SLIDE CONSISTENCY (CRITICAL)

**This is the most important rule for student learning.**

When students advance from slide 3 to slide 4, they should see **ZERO visual changes** except the CFU box appearing.

**The Test:** If you diff paired slides, the ONLY difference should be the added box \`<div>\`.

**Common Mistakes (NEVER DO THESE):**
- Regenerating the graph (different appearance)
- Changing text (even a period or space)
- Moving elements (even 1px)
- Changing colors or styles
- Reordering HTML attributes

---

## Reference Files to Read

**Before generating slides, read the appropriate files:**

| Visual Type | Files to Read |
|-------------|---------------|
| All slides | \`../../reference/styling.md\` (colors, fonts, spacing) |
| All slides | \`../../reference/pptx-requirements.md\` (constraints) |
| SVG graphs | \`visuals/svg-graphs.md\` (MANDATORY) |

**Template files for each slide type:**
- \`templates/slide-learning-goal.html\` → Slide 1
- \`templates/slide-two-column.html\` → Slide 2 (40%/60% layout)
- \`templates/slide-base.html\` → Step Question/Answer slides
- \`templates/slide-with-cfu.html\` → Example of base + CFU
- \`templates/slide-with-answer.html\` → Example of base + Answer
- \`templates/slide-practice.html\` → Practice problems (zero scaffolding)
- \`templates/printable-slide-snippet.html\` → Printable worksheet

---

## ⚠️ SVG Graph Creation (MANDATORY WORKFLOW)

**When a slide requires an SVG coordinate plane, you MUST follow this workflow:**

### Step 1: Read the Graph Snippet
\`\`\`
READ: templates/graph-snippet.html
\`\`\`

This HTML file is your **starting point**. It contains:
- Arrow marker definitions for axes and lines
- Complete coordinate plane with proper alignment
- Single "0" at origin (not two separate zeros)
- Complete scale labels to the arrows
- Example data lines with extension arrows

### Step 2: Copy and Modify
1. **COPY** the entire \`<svg>...</svg>\` block from graph-snippet.html
2. **ADJUST** X_MAX and Y_MAX for your specific data
3. **RECALCULATE** grid and label positions using the formulas in the snippet
4. **ADD** your specific data lines and points
5. **ADD** annotations using \`templates/annotation-snippet.html\`

### Step 3: Verify Requirements
- [ ] Axes have arrowheads (marker-end)
- [ ] Single "0" at origin
- [ ] Scale labels go to last tick before arrow
- [ ] Data lines extend to plot edges with arrows
- [ ] Annotations use \`font-weight="normal"\` (not bold)

**DO NOT create graphs from scratch.** Always start from graph-snippet.html.

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

## Pre-Flight Checklist (Verify EVERY Slide)

- [ ] File starts with \`<!DOCTYPE html>\` (NO checkpoint, NO comments before it)
- [ ] Body: \`width: 960px; height: 540px\`
- [ ] All text in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` (NOT bare text in divs)
- [ ] Layout uses \`.row\`/\`.col\` classes (NOT inline \`display: flex\`)
- [ ] Fonts: Arial, Georgia, Courier New only
- [ ] Backgrounds/borders on \`<div>\` only (NOT on \`<p>\`, \`<h1>\`)
- [ ] No JavaScript, onclick, or animations
- [ ] Light theme (white #ffffff, dark text #1d1d1d)

**If SVG visual:**
- [ ] Read \`visuals/svg-graphs.md\` first
- [ ] SVG wrapped in container with \`data-svg-region="true"\`
- [ ] All \`<text>\` elements have \`font-family="Arial"\`
- [ ] SVG container in SAME position as other step slides

**If paired slide:**
- [ ] HTML is IDENTICAL to base slide except for added box

---

## Completion Checklist

- [ ] All 14-16 slides generated with checkpoints
- [ ] Paired slides are truly identical (diff test passes)
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position (slides 2-12)
- [ ] Practice slides have zero scaffolding
- [ ] Printable uses white theme + Times New Roman

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
