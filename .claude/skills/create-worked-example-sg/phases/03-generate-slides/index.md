# Phase 3: Generate Slides

## Purpose
Create 9 PPTX-compatible HTML slides using atomic card-patterns and PPTX animation for CFU/Answer reveals.

**Note:** Slides 1-8 are the worked example. Slide 9 (the printable worksheet with practice problems) is generated separately after the main slides complete.

## Output Format: PPTX-Compatible HTML
All slides are **960×540px, light theme**. CFU/Answer boxes use PPTX animation (appear on click). See `protocol.md` in this folder for complete technical specs.

## Prerequisites
- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## Document Hierarchy (Separation of Concerns)

**Each file has a single, well-defined responsibility:**

| File | Responsibility | When to Read |
|------|---------------|--------------|
| **index.md** (this file) | High-level overview, execution flow, WHAT to do | Start here, once at phase start |
| **protocol.md** | Per-slide execution protocol, HOW to do each slide | Reference for every slide |
| **card-patterns/** | Atomic HTML patterns to compose | When writing HTML |
| **visuals/svg-graphs.md** | SVG pixel calculations and formulas | Only for SVG graph slides |
| **visuals/annotation-zones.md** | Quick zone reference for annotations | Only when adding annotations |

**Abstraction levels (most general → most specific):**
```
index.md (Phase overview)
    └── protocol.md (Per-slide protocol)
            ├── card-patterns/simple-patterns/ (Fill placeholders)
            └── card-patterns/complex-patterns/ (Copy + recalculate)
                    └── visuals/svg-graphs.md (Pixel math formulas)
                            └── visuals/annotation-zones.md (Zone reference)
```

**Don't read everything upfront.** Follow the execution path and read files when needed.

---

## ⚠️ CRITICAL: Per-Slide Checkpoint Protocol

**Every slide MUST follow the checkpoint protocol from `protocol.md` (in this folder).**

Before generating each slide, announce:
```
SLIDE [N]: [Type Name]
Action: generate-new
Layout: [full-width | two-column] | Components: [list of card-patterns used]
```

**CFU/Answer boxes use PPTX animation** - they appear on click, no duplicate slides needed.

---

## Phase 3 Execution Path

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.0: Read Reference Materials                              │
│           (REQUIRED before any slide creation)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.1: Check Visual Type                                     │
│   ├── If "HTML/CSS" → Use simple fill patterns                  │
│   └── If "SVG graphs" → Use clone-and-modify workflow           │
│              (READ visuals/svg-graphs.md + card-patterns/       │
│               graph-snippet.html)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.2: Generate Slides (ATOMIC COMPOSITION)                  │
│   For each slide N from 1 to 8:                                 │
│   1. Announce checkpoint                                        │
│   2. Choose layout preset (full-width or two-column)            │
│   3. Compose using card-patterns:                               │
│      - title-zone, content-box, svg-card                        │
│      - cfu-card or answer-card (animated)                       │
│   4. Write HTML                                                 │
│                                                                 │
│ STEP 3.3: Generate Printable (Slide 9)                          │
│   - Generated separately after slides 1-8 complete              │
│   - Uses printable-slide-snippet.html pattern                   │
│   - Contains practice problems from Scenarios 2 & 3             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.4: Verify Completion Checklist                           │
│           (See protocol.md)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## STEP 3.0: Read Reference Materials (REQUIRED)

**BEFORE creating any slides, you MUST read these reference files using the Read tool:**

```
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md   ← PRIMARY TECHNICAL SPEC
Read: .claude/skills/create-worked-example-sg/reference/styling.md                    ← Colors, fonts, layout classes
Read: .claude/skills/create-worked-example-sg/reference/layout-presets.md             ← Layout presets + regions
```

**The `protocol.md` file contains:**
- Checkpoint format with layout and components
- PPTX constraints (dimensions, fonts, layout classes)
- Atomic card-patterns (two types: fill patterns vs clone-and-modify)
- CFU/Answer box animation patterns
- SVG Graph checklist
- Pre-flight and completion checklists

**Card-patterns for composing slides:**
**simple-patterns/ (replace placeholders):**
- `card-patterns/simple-patterns/title-zone.html` → Badge + Title + Subtitle
- `card-patterns/simple-patterns/content-box.html` → Text, lists, equations, tables
- `card-patterns/simple-patterns/cfu-answer-card.html` → CFU/Answer overlays (animated)

**complex-patterns/ (copy, modify, recalculate pixels):**
- `card-patterns/complex-patterns/graph-snippet.html` → SVG graphs (copy and recalculate)
- `card-patterns/complex-patterns/annotation-snippet.html` → SVG annotations (copy and recalculate)
- `card-patterns/complex-patterns/visual-card-layers.html` → Right-column content with multiple elements (MANDATORY pattern)
- `card-patterns/complex-patterns/printable-slide-snippet.html` → Printable worksheet

---

## PPTX Slide Structure (9 slides)

CFU/Answer boxes use **PPTX animation** (appear on click) - no duplicate slides needed.

| # | Slide Type | Layout | Components |
|---|------------|--------|------------|
| 1 | Learning Goal | `full-width` | title-zone, content-box |
| 2 | Problem Setup | `two-column` | title-zone, content-box, svg-card |
| 3 | Step 1 Question + CFU | `two-column` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 4 | Step 1 Answer | `two-column` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 5 | Step 2 Question + CFU | `two-column` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 6 | Step 2 Answer | `two-column` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 7 | Step 3 Question + CFU | `two-column` | title-zone, content-box, svg-card, **cfu-card** (animated) |
| 8 | Step 3 Answer | `two-column` | title-zone, content-box, svg-card, **answer-card** (animated) |
| 9 | Printable | `full-width` | WHITE theme, portrait, practice problems embedded |

**Note:** Practice problems are embedded directly in the Printable slide (slide 9) rather than having separate presentation slides. Students apply the strategy independently on the printable worksheet.

---

## Key PPTX Constraints (Quick Reference)

| Rule | Requirement |
|------|-------------|
| Dimensions | `width: 960px; height: 540px` (EXACT) |
| Fonts | Arial, Georgia, Courier New ONLY (no Roboto, no custom fonts) |
| Layout | Use `.row`/`.col` classes (NEVER inline `display: flex`) |
| Text | ALL text in `<p>`, `<h1-6>`, `<ul>`, `<ol>` (text in `<div>` disappears!) |
| Backgrounds | Only on `<div>` elements (NOT on `<p>`, `<h1>`) |
| Bullets | Use `<ul>/<ol>` (NEVER manual •, -, * characters) |
| Interactivity | NO JavaScript, NO onclick, NO animations |
| Theme | Light (white background, dark text) |

**Full specs in:** `protocol.md` (this folder)

---

## Critical Visual Rules

### Rule 1: Visual Stability (NON-NEGOTIABLE)
- Keep main visual (table/diagram) in the SAME position across slides 2-8
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

### Rule 2: Animation-Based Reveal (PPTX Feature)
- CFU/Answer boxes use PPTX animation - appear on click
- No duplicate slides needed for reveals
- Teacher clicks to reveal CFU or Answer during presentation
- **No JavaScript, no onclick handlers in HTML**

### Rule 3: Scaffolding Removal (NON-NEGOTIABLE)
- Slides 2-8: Maximum scaffolding (step headers, CFU, highlighting)
- Printable slide 9: ZERO scaffolding (just practice problems with work space)
- Students must apply strategy independently on the printable worksheet

### Rule 4: Consistent Step Names
- Use EXACT verbs from strategyDefinition.moves throughout
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these exact verbs

---

## CFU Question Guidelines

**Questions MUST reference the strategy verb:**
- ✅ "Why did I [VERB] first?" (strategy question)
- ✅ "How did I know to [VERB] here?" (decision-making question)
- ✅ "What does [VERB]ing accomplish?" (conceptual question)

**Questions must NOT be computational:**
- ❌ "What is 6 ÷ 2?" (computation question)
- ❌ "What's the answer?" (result question)

---

## Visual Type Reference

Your visual type was determined in Phase 1. Here's what each requires:

**Text-only:**
- No graphics - pure text/equation problems
- Use content-box patterns only

**HTML table:**
- Simple data tables with highlighting
- Use `<table>` with inline styles
- See `card-patterns/simple-patterns/content-box.html` for table examples

**SVG visual (ALL other graphics):**
- Coordinate planes and graphs
- Hanger diagrams and balance problems
- Geometric shapes and diagrams
- Number lines and bar models
- Any custom visual representation

**CRITICAL:** For PPTX compatibility, ALL SVGs must:
1. Be wrapped in a container with `data-pptx-region="svg-container"`
2. Have position attributes: `data-pptx-x`, `data-pptx-y`, `data-pptx-w`, `data-pptx-h`
3. Use `data-pptx-layer` for animation groups

See `card-patterns/complex-patterns/graph-snippet.html` for the complete pattern.

**CRITICAL:** For PPTX compatibility, ALL right-column visual content must:
1. Wrap EACH distinct element (table, equation card, comparison, etc.) in its own `data-pptx-region="visual-*"`
2. Include `data-pptx-x`, `data-pptx-y`, `data-pptx-w`, `data-pptx-h` on each element
3. Calculate vertical positions to stack without overlap

See `card-patterns/complex-patterns/visual-card-layers.html` and `protocol.md` for the complete pattern.

---

## SVG Visual Implementation (THE COMPLEX CASE)

**If your PROBLEM ANALYSIS from Phase 1 has Visual Type = "SVG visual", this section is MANDATORY.**

**SVG visuals are the ONLY component that requires the clone-and-modify workflow.** All other card-patterns use simple placeholder replacement.

### Step 1: Read the Graph Snippets

```
READ: card-patterns/complex-patterns/graph-snippet.html      ← FULL WORKING EXAMPLE (start here)
READ: card-patterns/complex-patterns/annotation-snippet.html ← Annotation patterns with layers
READ: visuals/svg-graphs.md                 ← Pixel calculation reference
```

### Step 2: Retrieve the Correct GRAPH PLAN

**⚠️ CRITICAL: Use EACH SCENARIO'S graphPlan, NOT the mastery check's graphPlan.**

The mastery check (`problemAnalysis.graphPlan`) is for the student's exit ticket/assessment - it is NEVER shown in these slides. Each scenario has its own numbers/context, so each needs its own graphPlan:

| Slides | Source | GraphPlan to Use |
|--------|--------|------------------|
| 2-8 (Worked Example) | Scenario 1 | `scenarios[0].graphPlan` |
| 9 (Printable - Practice 1 & 2) | Scenarios 2 & 3 | `scenarios[1].graphPlan` and `scenarios[2].graphPlan` |

Each GRAPH PLAN contains the semantic decisions for that scenario:
- **Equations** with correct slope/y-intercept for that scenario's numbers
- **Scale** (X_MAX, Y_MAX) appropriate for that scenario's values
- **Line endpoints** (startPoint, endPoint) calculated for that scenario
- **keyPoints** with correct coordinates for that scenario
- **Annotations** type and position

**You MUST implement exactly what each scenario's GRAPH PLAN specifies.** Do NOT use the mastery check's graphPlan. Do NOT recalculate or change the scale.

### Step 3: Clone and Modify graph-snippet.html

1. **COPY** the entire `<svg>...</svg>` block from graph-snippet.html
2. **ADJUST** X_MAX and Y_MAX for your specific data
3. **RECALCULATE** grid and label positions using formulas from svg-graphs.md
4. **ADD** your specific data lines and points
5. **ADD** annotations using annotation-snippet.html patterns

### Step 4: Verify SVG Graph Checklist

See `protocol.md` for the complete SVG Graph Checklist. Key items:
- [ ] Started from graph-snippet.html (NOT from scratch)
- [ ] Each line in its own `data-pptx-layer` group
- [ ] Each annotation in its own `data-pptx-layer` group
- [ ] All `<text>` elements have `font-family="Arial"`
- [ ] Grid lines align with axis labels (same pixel values)

---

## Core Pedagogical Principles

These rules are NON-NEGOTIABLE:

### The "Click-to-Reveal" Principle
- CFU/Answer boxes start HIDDEN, appear when teacher clicks
- Forces mental commitment before seeing solution
- Animation handles reveal - no duplicate slides needed

### The "Visual Stability" Principle
- Keep main visual (table, diagram) in SAME position across slides 2-8
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard - problem stays put, annotations appear

### The "Scaffolding Removal" Principle
- Slides 2-8: Maximum scaffolding (step-by-step, highlighting, CFU)
- Printable slide 9: ZERO scaffolding (just practice problems with work space)
- Students must apply the strategy independently on the printable worksheet

### The "Real World" Principle
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
├── slide-1.html   (Learning Goal)
├── slide-2.html   (Problem Setup)
├── slide-3.html   (Step 1 Question + CFU)
├── slide-4.html   (Step 1 Answer)
├── slide-5.html   (Step 2 Question + CFU)
├── slide-6.html   (Step 2 Answer)
├── slide-7.html   (Step 3 Question + CFU)
├── slide-8.html   (Step 3 Answer)
└── slide-9.html   (Printable with Practice Problems 1 & 2)
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

---

## Phase 3 Completion Checklist

Before proceeding, verify:
- [ ] All 9 slides written to files (8 worked example + 1 printable)
- [ ] Slides 1-8 are exactly 960×540px
- [ ] All text is in `<p>`, `<h1-6>`, `<ul>`, `<ol>` tags (NOT bare text in divs!)
- [ ] Using `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Web-safe fonts only: Arial, Georgia
- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position across slides 2-8
- [ ] CFU/Answer boxes have correct `data-pptx-region` attributes (for animation)
- [ ] Printable slide (9) has zero scaffolding, WHITE background, Times New Roman
- [ ] Printable slide contains both practice problems with work space
- [ ] No JavaScript, no onclick, no CSS animations
- [ ] **IF SVG visual:** SVG container has data-pptx-region and position attributes
- [ ] **IF SVG visual (coordinate-graph):** Scale matches SVG PLAN from Phase 1
- [ ] **IF SVG visual:** Annotations match SVG PLAN type and positions
- [ ] **IF SVG visual:** Completed SVG Checklist from protocol.md

---

## NEXT PHASE

**When all slides are written:**

Use the Read tool to read the Phase 4 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
```

Do NOT proceed until all slide files have been written.
