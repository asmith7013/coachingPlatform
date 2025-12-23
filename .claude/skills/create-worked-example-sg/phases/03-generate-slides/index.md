# Phase 3: Generate Slides

## Purpose
Create 14-16 PPTX-compatible HTML slides following the established patterns, using the strategy defined in Phase 1 and scenarios confirmed in Phase 2.

## Output Format: PPTX-Compatible HTML
All slides are **960×540px, light theme, static (no toggles)**. See `protocol.md` in this folder for complete technical specs.

## Prerequisites
- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## ⚠️ CRITICAL: Per-Slide Checkpoint Protocol

**Every slide MUST follow the checkpoint protocol from `protocol.md` (in this folder).**

Before generating each slide, output a checkpoint comment:
```html
<!-- ============================================ -->
<!-- SLIDE [N]: [Type Name] -->
<!-- Paired: [Yes/No] | Base: [Slide # or N/A] -->
<!-- Action: [generate-new | copy-and-add-cfu | copy-and-add-answer] -->
<!-- ============================================ -->
```

**For paired slides (4, 6, 8, 10, 12):** COPY the previous slide verbatim, then ADD only the CFU/Answer box.

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
│   ├── If "HTML/CSS" or "HTML diagrams" → Continue to 3.2        │
│   └── If "SVG graphs" → Read visuals/svg-graphs.md first        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.2: Generate Slides (PER-SLIDE PROTOCOL)                  │
│   For each slide N from 1 to 15:                                │
│   1. Output checkpoint comment                                  │
│   2. Determine: Is this a paired slide?                         │
│      ├── YES → COPY previous slide + ADD box only               │
│      └── NO  → Generate new slide following checklist           │
│   3. Output HTML + separator                                    │
│   4. Track progress                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3.3: Verify Completion Checklist                           │
│           (All 10 items from protocol.md)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## STEP 3.0: Read Reference Materials (REQUIRED)

**BEFORE creating any slides, you MUST read these reference files using the Read tool:**

```
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md   ← PRIMARY TECHNICAL SPEC
Read: .claude/skills/create-worked-example-sg/reference/styling.md                    ← Colors, fonts, layout classes
```

**The `protocol.md` file contains:**
- **PER-SLIDE PROTOCOL** with checkpoint format (FOLLOW THIS)
- PPTX constraints (dimensions, fonts, layout classes)
- Paired slide consistency rules
- CFU/Answer box patterns
- Pre-flight and completion checklists

**Templates are read JUST-IN-TIME** (see Step 3b in protocol.md):
- When generating slide 1 → Read `templates/slide-learning-goal.html`
- When generating slide 2 → Read `templates/slide-two-column.html`
- When generating step slides → Read `templates/slide-base.html`
- When generating practice slides → Read `templates/slide-practice.html`

This keeps context focused on the template you're actively using.
And same focus as I had before, I don't want any content lost. I just want these things reorganized to have a more clear sequential flow, both for the LLM to follow, but more importantly, when I make edits to make sure things are edited, to be consistent throughout and not have breaking changes that violate having one source of truth.  "updatedAt": "[ISO timestamp]"
}
```

---

## PPTX Slide Structure (14-16 slides)

Each "toggle reveal" becomes a **separate slide**. Teacher advances slides to reveal content.

| # | Slide Type | Template | Content |
|---|------------|----------|---------|
| 1 | Learning Goal | slide-learning-goal.html | Strategy name + summary |
| 2 | Problem Setup | slide-two-column.html | Scenario 1 introduction + visual |
| 3 | Step 1 Question | slide-base.html | Visual + question prompt |
| 4 | Step 1 + CFU | slide-with-cfu.html | Same visual + CFU box visible |
| 5 | Step 1 Answer | slide-base.html | Visual + answer shown |
| 6 | Step 1 + Answer Box | slide-with-answer.html | Same visual + answer box visible |
| 7-12 | Steps 2-3 | Same pattern | Question → +CFU → Answer → +Answer Box |
| 13 | Practice 1 | slide-practice.html | Scenario 2 - ZERO scaffolding |
| 14 | Practice 2 | slide-practice.html | Scenario 3 - ZERO scaffolding |
| 15 | Printable | printable-slide-snippet.html | WHITE theme, portrait, all problems |

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
- Keep main visual (table/diagram) in the SAME position across slides 2-12
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

### Rule 2: Multi-Slide Reveal (REPLACES TOGGLES)
- Question slide → CFU revealed on NEXT slide
- Answer slide → Answer box revealed on NEXT slide
- Teacher advances slides to reveal content
- **No JavaScript, no onclick handlers**

### Rule 3: Scaffolding Removal (NON-NEGOTIABLE)
- Slides 2-12: Maximum scaffolding (step headers, CFU, highlighting)
- Practice slides 13-14: ZERO scaffolding (just problem setup)
- Students must apply strategy independently

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

## Visual Type Selection

Choose the right visual approach based on the problem:

**Use HTML/CSS when:**
- Simple tables with highlighting
- Text-based problems
- Static equations
- No complex graphics needed

**Use SVG when:**
- Coordinate planes and graphs
- Custom diagrams
- Data visualizations
- Mathematical plots

**Note:** For PPTX compatibility, SVGs must follow specific patterns. See `visuals/svg-graphs.md` for SVG container requirements.

---

## SVG Coordinate Planes (MANDATORY if Visual Type is SVG graphs)

**If your PROBLEM ANALYSIS from Phase 1 has Visual Type = "SVG graphs", this section is MANDATORY.**

### Step 1: Retrieve Your GRAPH PLAN

Your GRAPH PLAN from Phase 1 contains the semantic decisions:
- **Equations** and colors
- **Scale** (X_MAX, Y_MAX, Y-axis labels)
- **Annotation** type and position

**You MUST implement exactly what your GRAPH PLAN specifies.** Do NOT recalculate or change the scale.

### Step 2: Read Pixel Implementation Reference

```
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/svg-graphs.md
```

This file contains:
- Pixel conversion formulas
- Pre-calculated pixel tables for your Y_MAX
- Grid alignment rules
- Annotation positioning in pixels

### Step 3: Convert GRAPH PLAN to Pixels

Using your GRAPH PLAN and the pixel tables:

1. **Look up your scale**: Find Y_MAX in the pixel tables → get Y-axis pixel positions
2. **Calculate line endpoints**: Use the formula `pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT`
3. **Position annotations**: Convert annotation position from GRAPH PLAN to pixels

### Step 4: Implement SVG

- Use `data-svg-region` attributes for PPTX capture
- All `<text>` elements must have `font-family="Arial"`
- Use the SVG color palette from `../../reference/styling.md`

### Standard SVG Dimensions (PPTX-Compatible)

| Layout | SVG Container | SVG Size | viewBox |
|--------|---------------|----------|---------|
| Two-column (60%) | 584×392px | 520×360px | `0 0 520 360` |
| Full-width | 920×400px | 880×380px | `0 0 880 380` |
| Practice (centered) | 600×400px | 560×380px | `0 0 560 380` |

### Verification Checklist (REQUIRED for graphs)

Before finalizing any slide with a graph:
- [ ] Y-axis labels match GRAPH PLAN (not recalculated)
- [ ] Scale accommodates ALL data points (lines don't go off-graph)
- [ ] Annotation type matches GRAPH PLAN
- [ ] Annotation is positioned correctly (e.g., y-intercept arrow LEFT of y-axis)
- [ ] Grid lines align with axis labels (same pixel values)

---

## Core Pedagogical Principles

These rules are NON-NEGOTIABLE:

### The "Multi-Slide Reveal" Principle
- NEVER show a question and its answer on the same slide
- Use separate slides for reveal (replaces toggles)
- Forces mental commitment before seeing solution

### The "Visual Stability" Principle
- Keep main visual (table, diagram) in SAME position across slides 2-12
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard - problem stays put, annotations appear

### The "Scaffolding Removal" Principle
- Slides 2-12: Maximum scaffolding (step-by-step, highlighting, CFU)
- Practice slides 13-14: ZERO scaffolding (just the problem setup)
- Students must apply the strategy independently

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
├── slide-1.html
├── slide-2.html
├── slide-3.html
├── slide-4.html
├── slide-5.html
├── slide-6.html
├── slide-7.html
├── slide-8.html
├── slide-9.html
├── slide-10.html
├── slide-11.html
├── slide-12.html
├── slide-13.html (practice 1)
├── slide-14.html (practice 2)
└── slide-15.html (printable)
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
- [ ] All slides written to files (14-16 slides)
- [ ] All slides are exactly 960×540px
- [ ] All text is in `<p>`, `<h1-6>`, `<ul>`, `<ol>` tags (NOT bare text in divs!)
- [ ] Using `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Web-safe fonts only: Arial, Georgia
- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position across slides 2-12
- [ ] CFU/Answer boxes are STATIC (on separate slides, no toggles)
- [ ] Practice slides have zero scaffolding
- [ ] Printable slide uses WHITE background, Times New Roman
- [ ] No JavaScript, no onclick, no CSS animations
- [ ] **IF SVG graphs:** Scale matches GRAPH PLAN from Phase 1
- [ ] **IF SVG graphs:** Annotations match GRAPH PLAN type and position

---

## NEXT PHASE

**When all slides are written:**

Use the Read tool to read the Phase 4 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
```

Do NOT proceed until all slide files have been written.
