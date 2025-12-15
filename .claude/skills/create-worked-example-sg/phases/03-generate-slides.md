# Phase 3: Generate Slides

## Purpose
Create 8-11 HTML slides following the established patterns, using the strategy defined in Phase 1 and scenarios confirmed in Phase 2.

## Prerequisites
- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## REQUIRED: Read Templates & Examples First

**BEFORE creating any slides, you MUST read these files using the Read tool:**

### Step 3.0: Read Reference Materials

Use the Read tool to read ALL of these files in order:

```
Read: .claude/skills/create-worked-example-sg/reference/styling.md
Read: .claude/skills/create-worked-example-sg/reference/svg-coordinate-planes.md
Read: .claude/skills/create-worked-example-sg/examples/example1.html
Read: .claude/skills/create-worked-example-sg/templates/cfu-toggle-snippet.html
Read: .claude/skills/create-worked-example-sg/templates/answer-toggle-snippet.html
Read: .claude/skills/create-worked-example-sg/templates/printable-slide-snippet.html
```

**What each file provides:**

| File | What It Contains | Use It For |
|------|-----------------|------------|
| `reference/styling.md` | Color palette, typography, layout patterns | All slides - consistent styling |
| `reference/svg-coordinate-planes.md` | **CRITICAL** SVG graph templates & alignment rules | Any slide with coordinate planes/graphs |
| `examples/example1.html` | Complete 9-slide hanger balance deck | See how a full worked example flows |
| `templates/cfu-toggle-snippet.html` | Interactive CFU toggle with onclick | Ask slides (Steps 1-3) |
| `templates/answer-toggle-snippet.html` | Interactive answer toggle with onclick | Reveal slides (Steps 1-3) |
| `templates/printable-slide-snippet.html` | Print-ready layout with header | Final printable worksheet slide |

**DO NOT create slides until you have read ALL 6 files above.**

After reading, update the progress file to confirm:
```json
{
  "phase": 3,
  "phaseName": "Generate Slides",
  "templatesRead": true,
  "updatedAt": "[ISO timestamp]"
}
```

---

## Slide Structure Overview

Create these slides in order:

| # | Slide Type | Content |
|---|------------|---------|
| 1 | Learning Goal | Title + strategy summary |
| 2 | Problem Setup | Scenario 1 (worked example) |
| 3 | Step 1 - Ask | Visual + CFU question |
| 4 | Step 1 - Reveal | Visual + answer |
| 5 | Step 2 - Ask | Updated visual + CFU |
| 6 | Step 2 - Reveal | Updated visual + answer |
| 7 | (Optional) Step 3 | If 3 steps needed |
| 8 | (Optional) Reasoning | If problem asks "explain" |
| 9 | Practice Problem 1 | Scenario 2 - NO scaffolding (dark theme) |
| 10 | Practice Problem 2 | Scenario 3 - NO scaffolding (dark theme) |
| 11 | Printable Worksheets | ALL practice problems in one file (using print-page divs) |

**Note:** The printable worksheet slide (slide-11) contains ALL practice problems. Each problem is wrapped in a `<div class="print-page">` which renders as a separate page when printed. On screen, users scroll through the problems; when printed, each problem appears on its own 8.5x11 page.

---

## Critical Visual Rules

### Rule 1: Visual Stability
- Keep main visual (table/diagram) in the SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

### Rule 2: Fit on Screen
- All content must fit at 100vh height (no scrolling)
- Use bottom padding of 120px on Ask slides for CFU toggle
- Max content height: ~700px for main content

### Rule 3: Consistent Step Names
- Use the EXACT step verbs from your STRATEGY DEFINITION
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these verbs

---

## Visual Type Selection

Choose the right visual approach based on the problem:

**Use HTML/CSS when:**
- Simple tables with highlighting
- Text-based problems
- Static equations
- Minimal animation needed

**Use P5.js when:**
- Hanger diagrams
- Geometric shapes and transformations
- Balance/scale problems
- Interactive manipulatives
- Custom animations

**Use D3.js when:**
- Coordinate planes and graphs
- Data visualizations
- Complex charts
- Mathematical plots

For P5.js/D3.js problems, see `examples/example1.html` for how scripts are embedded.

---

## CRITICAL: SVG Coordinate Plane Creation

**If your worked example includes coordinate planes or graphs, you MUST follow these rules:**

### Required Reference
Before creating ANY SVG graph, you MUST have read `reference/svg-coordinate-planes.md`. This file contains:
- Pre-calculated pixel positions for common scales
- The correct formula for converting data to pixels
- Templates that ensure grid/label alignment

### The Grid Alignment Problem
The #1 bug in SVG graphs is **misaligned grids** where:
- Grid lines appear at different X/Y positions than axis labels
- Data points don't land on grid intersections when they should
- The visual "lies" about the data

### Required Formula
ALL coordinate calculations MUST use this formula:

```
pixelX = ORIGIN_X + (dataX / X_MAX) * PLOT_WIDTH
pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT
```

Standard constants (viewBox 280x200):
- ORIGIN_X = 40, ORIGIN_Y = 170
- PLOT_WIDTH = 220, PLOT_HEIGHT = 150

### Mandatory Checklist for Every Graph

Before finalizing any SVG coordinate plane, verify:

- [ ] Grid vertical lines use the SAME X pixel values as X-axis labels
- [ ] Grid horizontal lines use the SAME Y pixel values as Y-axis labels
- [ ] Data points are calculated using the SAME formula as grid lines
- [ ] Origin (0,0) renders at pixel (40, 170)
- [ ] Maximum point renders at pixel (260, 20)

### Quick Reference: Common Scales

**X-axis (0 to N) label positions (ORIGIN=40, WIDTH=220):**
- 0→4: x = 40, 95, 150, 205, 260
- 0→5: x = 40, 84, 128, 172, 216, 260
- 0→8: x = 40, 67.5, 95, 122.5, 150, 177.5, 205, 232.5, 260
- 0→10: x = 40, 62, 84, 106, 128, 150, 172, 194, 216, 238, 260
- 0→12: x = 40, 58.3, 76.7, 95, 113.3, 131.7, 150, 168.3, 186.7, 205, 223.3, 241.7, 260
- 0→20: x = 40, 51, 62, 73, 84, 95, 106, 117, 128, 139, 150, 161, 172, 183, 194, 205, 216, 227, 238, 249, 260

**Y-axis (0 to N) label positions (ORIGIN=170, HEIGHT=150):**
- 0→100: y = 170, 132.5, 95, 57.5, 20 (for 0, 25, 50, 75, 100)
- 0→80: y = 170, 132.5, 95, 57.5, 20 (for 0, 20, 40, 60, 80)

**IMPORTANT:** Grid lines and labels MUST use the EXACT same pixel values. If a label is at x=95, the corresponding grid line MUST also be at x=95.

### The Element Overlap Problem
The #2 bug in SVG graphs is **overlapping elements** where:
- Arrow markers cover data points or axes
- Point labels collide with each other
- Annotation text overlaps arrows

**ALWAYS use smaller element sizes to prevent overlaps:**

| Element | Use This Size |
|---------|---------------|
| Arrow markers | `markerWidth="6" markerHeight="4"` |
| Arrow stroke | `stroke-width="2"` |
| Point circles | `r="4"` to `r="5"` |
| Point labels | `font-size="9"` to `font-size="10"` |
| Annotation text | `font-size="9"` |

**Small arrow marker template:**
```html
<marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
    <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
</marker>
```

See `reference/svg-coordinate-planes.md` for full overlap prevention guidelines.

---

## Slide Patterns

### Pattern 1: Learning Goal Slide (Slide 1)

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">
    <h3 style="font-size: 32px; font-weight: 500; color: #94a3b8; margin: 0; text-transform: uppercase;">Unit [X] Lesson [Y]</h3>
    <h1 style="font-size: 72px; font-weight: 700; letter-spacing: 2px; color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); margin: 20px 0; text-transform: uppercase;">[STRATEGY NAME]</h1>
    <p style="font-size: 28px; line-height: 1.6; color: #cbd5e1; max-width: 800px; text-align: center; margin-top: 30px;">[ONE-SENTENCE STRATEGY SUMMARY from Phase 1]</p>
</div>
```

### Pattern 2: Problem Setup (Slide 2)

Structure depends on visual type. Include:
- Engaging scenario title
- Problem statement
- Visual representation (table, hanger, graph)
- Clear question

### Pattern 3: Ask Slide with CFU Toggle

**USE THE TEMPLATE:** `templates/cfu-toggle-snippet.html` (you read this earlier)

Customize by:
1. Adding a step header: `<h2>STEP 1: [VERB]</h2>` before your content
2. Replacing `[YOUR SLIDE CONTENT HERE]` with your visual + annotations
3. Replacing `[YOUR QUESTION HERE]` with a strategy-referencing question like "Why did I [VERB] first?"

**Key points:**
- Use inline onclick handlers (works with React's dangerouslySetInnerHTML)
- CFU question MUST reference strategy verb, not ask for computation
- Bottom padding of 120px leaves room for the toggle

### Pattern 4: Reveal Slide with Answer Toggle

**USE THE TEMPLATE:** `templates/answer-toggle-snippet.html` (you read this earlier)

The differences from CFU slides:
- Button text: "↓ Show Answer"
- Box ID: `answer-box` (not `cfu-box`)
- Box background: `#4ade80` (green)
- Border: `#22c55e`
- Badge: "✅ ANSWER"

Customize by:
1. Adding step header showing completion: `<h2>STEP 1: [VERB]</h2>`
2. Showing completed visual (e.g., items crossed out, values filled in)
3. Replacing `[YOUR ANSWER HERE]` with the explanation

### Pattern 5: Practice Problem (NO Scaffolding)

Same structure as Problem Setup, but:
- Different scenario (from Phase 2)
- NO annotations
- NO CFU boxes
- NO step indicators
- Just the problem setup

### Pattern 6: Printable Worksheets (Multiple Problems in One Slide File)

**CRITICAL: ALL practice problems go in ONE slide file with separate print-page divs**

You MUST use the template from `templates/printable-slide-snippet.html`. Create **ONE slide file** (slide-11.html) containing ALL practice problems:
- Each problem is wrapped in its own `<div class="print-page">`
- Each `print-page` div = one printed page (8.5in x 11in)
- Problems are stacked vertically, NOT side-by-side

**DO NOT create separate slide files for each problem.** The correct format uses nested `print-page` divs within a single slide.

```html
<!-- ALL PROBLEMS IN ONE SLIDE FILE with print-page wrappers -->
<div class="slide-container" style="width: 100vw; height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">

    <!-- Page 1: Problem 1 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Header with lesson info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #000;">[LESSON TITLE]</h1>
                <p style="font-size: 13px; color: #333; margin: 4px 0 0 0;">Unit [X] Lesson [Y] | Grade [Z]</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 13px; margin: 0;">Name: _______________________</p>
                <p style="font-size: 13px; margin: 4px 0 0 0;">Date: ________________________</p>
            </div>
        </div>

        <!-- Learning Goal Box -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 15px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [STUDENT-FACING LEARNING GOAL]</p>
        </div>

        <!-- Strategy Reminder -->
        <div style="background: #e8f4e8; border: 1px solid #4a7c4a; padding: 8px 12px; margin-bottom: 15px;">
            <p style="font-size: 11px; margin: 0;"><strong>Strategy:</strong> [STRATEGY NAME] — [BRIEF DESCRIPTION]</p>
        </div>

        <!-- Problem 1 -->
        <div style="border: 2px solid #333; padding: 20px; display: flex; flex-direction: column; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: [SCENARIO NAME]</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                [PROBLEM DESCRIPTION]
            </p>

            <!-- Problem Content: Tables, Equations, Graphs as needed -->
            <div style="display: flex; gap: 30px; margin-bottom: 15px;">
                <!-- Content here -->
            </div>

            <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: auto;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Your Task:</p>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">[SPECIFIC QUESTION]</p>
                <div style="margin-top: 15px; border: 1px solid #ccc; padding: 10px; min-height: 100px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Show your work:</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 2: Problem 2 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 20px auto 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Repeat header, learning goal, strategy, and problem structure -->
        <!-- ... -->
    </div>
</div>

<!-- Print-specific styles - REQUIRED for proper printing -->
<style>
@media print {
    .slide-container {
        overflow: visible !important;
        height: auto !important;
    }
    .print-page {
        width: 8.5in !important;
        height: 11in !important;
        margin: 0 !important;
        padding: 0.5in !important;
        box-sizing: border-box !important;
        page-break-after: always;
        border: none !important;
    }
    .print-page:last-child {
        page-break-after: auto;
    }
    svg line, svg path, svg text, svg circle {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
    div[style*="background"] {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
}
@page {
    size: letter portrait;
    margin: 0;
}
</style>
```

**CRITICAL rules for printable slides:**
1. **ALL problems in ONE slide file** - Use nested `print-page` divs, NOT separate files
2. **Each `print-page` div = one printed page** - 8.5in x 11in with 0.5in padding
3. **Use `overflow-y: auto`** on slide-container for on-screen scrolling
4. **Include `@page` CSS rule** - Sets letter portrait with no margins
5. **Include `page-break-after: always`** - On each `.print-page` div
6. White background, black text, Times New Roman/Georgia serif font
7. Include header, learning goal, and strategy on EACH print-page
8. The screen view shows pages stacked vertically with margin between them

---

## CFU Question Guidelines

**Questions MUST reference the strategy verb:**
- ✅ "Why did I [VERB] first?" (strategy question)
- ✅ "How did I know to [VERB] here?" (decision-making question)
- ✅ "What does [VERB]ing accomplish?" (conceptual question)
- ✅ "What operation should I use here and why?" (conceptual question)

**Questions must NOT be computational:**
- ❌ "What is 6 ÷ 2?" (computation question)
- ❌ "What's the answer?" (result question)
- ❌ "Calculate the unit rate" (task, not question)

---

## Core Pedagogical Principles

These rules are NON-NEGOTIABLE:

### The "Two-Slide" Rule
- NEVER show a question and its answer on the same slide
- Always separate Ask from Reveal
- Forces mental commitment before seeing solution

### The "Visual Stability" Rule
- Keep main visual (table, diagram) in SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard - problem stays put, annotations appear

### The "Scaffolding Removal" Rule
- Slides 2-6: Maximum scaffolding (step-by-step, highlighting, CFU)
- Practice slides: ZERO scaffolding (just the problem setup)
- Students must apply the strategy independently

### The "Real World" Rule
- Use engaging, age-appropriate contexts
- Avoid boring textbook scenarios (no "John has 5 apples")
- Each scenario needs a visual anchor (icon or theme)

**Good scenario contexts by grade:**
- Grade 6-7: Video game items, YouTube views, TikTok followers, sports stats
- Grade 8-9: Drone flight, crypto mining, streaming subscriptions, esports tournaments
- Grade 10+: Investment returns, data science, engineering projects, startup growth

---

## File Output & Progress Tracking

Write each slide to a separate file:
```
src/app/presentations/{slug}/
├── slide-1.html
├── slide-2.html
├── slide-3.html
├── slide-4.html
├── slide-5.html
├── slide-6.html
├── slide-7.html (practice 1)
├── slide-8.html (practice 2)
└── slide-9.html (printable)
```

Use the Write tool for each slide file.

### Track Progress After Each Slide

**After writing EACH slide file**, update the progress file:

```json
{
  "slidesCompleted": ["slide-1.html", "slide-2.html", ...],
  "updatedAt": "[ISO timestamp]"
}
```

This ensures:
1. If interrupted, you can resume from the last completed slide
2. The user can see progress
3. Phase 4 can verify all slides exist

---

## Phase 3 Completion Checklist

Before proceeding, verify:
- [ ] All slides written to files
- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position across slides 2-6
- [ ] Practice slides have zero scaffolding
- [ ] Printable worksheet includes both practice problems

---

## NEXT PHASE

**When all slides are written:**

Use the Read tool to read the Phase 4 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
```

Do NOT proceed until all slide files have been written.
