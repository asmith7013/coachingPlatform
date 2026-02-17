# Phase 3: Generate Slides - Overview

## Purpose

Create PPTX-compatible HTML slides using atomic card-patterns and PPTX animation for CFU/Answer reveals. Total slide count varies based on step count (S = 2-5 steps, default 3).

**Note:** Slides 1-3 are fixed (Teacher Instructions, Big Idea, Problem Setup). Slides 4 through 3+S are step slides (one per step). After the steps come two practice preview slides for whiteboard work, then the printable worksheet, and finally the lesson summary. With the default 3 steps, this yields 10 slides; with 5 steps it yields 12.

## Output Format

All slides are **960x540px, light theme**. CFU/Answer boxes use PPTX animation (appear on click).

## Prerequisites

- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## Document Reading Order

**Read files in numbered order. Each file has ONE job.**

| Step | File                           | What It Contains                             | When to Read                  |
| ---- | ------------------------------ | -------------------------------------------- | ----------------------------- |
| 1    | **00-overview.md** (this file) | Phase purpose, reading order, execution flow | Start here                    |
| 2    | **01-slide-by-slide.md**       | Per-slide protocol, what each slide contains | Before generating             |
| 3    | **02-technical-rules.md**      | PPTX constraints, data attributes, colors    | Before generating             |
| 4    | **03-pedagogy.md**             | Teaching principles, CFU rules, conciseness  | Before generating             |
| 5    | **04-svg-workflow.md**         | SVG pixel math, graph creation               | **Only if Visual Type = SVG** |

**Also read (referenced from card-patterns):**

- `card-patterns/README.md` - Index of HTML patterns
- `../../reference/diagram-patterns.md` - Non-graph SVG patterns (tape diagrams, hangers, etc.)
- `visuals/annotation-zones.md` - Quick zone reference for annotations

**Checklists (use during/after generation):**

- `checklists/pre-flight.md` - Verify BEFORE writing each slide
- `checklists/completion.md` - Verify AFTER all 10 slides done

---

## Phase 3 Execution Flow

```
STEP 3.0: Read Reference Materials
│         Read files 00 → 01 → 02 → 03 (→ 04 if SVG)
│
▼
STEP 3.1: Check Visual Type (from Phase 1)
│   ├── If "text-only" or "HTML table" → Use simple fill patterns
│   └── If "SVG visual" → Read 04-svg-workflow.md + graph-snippet.html
│
▼
STEP 3.2: Generate Slides 1 through 3+S (Worked Example)
│   Slides 1-3 are fixed (Teacher Instructions, Big Idea, Problem Setup).
│   Slides 4 through 3+S are step slides (one per step, S = 2-5).
│   For each slide:
│     1. Announce checkpoint (CLI mode only)
│     2. Choose layout preset (full-width or two-column)
│     3. Compose using card-patterns
│     4. Verify pre-flight checklist
│     5. Write HTML file
│
▼
STEP 3.3: Generate Practice Preview Slides (slides 3+S+1 and 3+S+2)
│   For each practice preview:
│     1. Use Problem Setup slide as template
│     2. Replace scenario with Scenario 2 (first preview) or Scenario 3 (second preview)
│     3. Include "Your Task:" section with the question
│     4. NO CFU/Answer boxes - students work on whiteboards
│
▼
STEP 3.4: Generate Printable (slide 3+S+3)
│   - Generated separately after all previous slides complete
│   - Uses printable-slide-snippet.html pattern
│   - Contains practice problems from Scenarios 2 & 3 + Answer Key
│
▼
STEP 3.5: Generate Lesson Summary (slide 3+S+4)
│   - One-page printable summary of the lesson's main idea
│   - Uses lesson-summary-snippet.html pattern
│   - Contains: Big Idea, Strategy overview, Visual reference, Key Takeaway
│   - Must include print-page class for print detection
│
▼
STEP 3.6: Verify Completion Checklist
          See checklists/completion.md
```

---

## Required Reading Before Generating

**BEFORE creating any slides, read these files:**

```
Read: 01-slide-by-slide.md   ← What each slide contains
Read: 02-technical-rules.md  ← PPTX constraints
Read: 03-pedagogy.md         ← Teaching principles
```

**Also read from reference folder:**

```
Read: ../../reference/styling.md        ← Colors, fonts, layout classes
Read: ../../reference/layout-presets.md ← Layout presets + regions
```

---

## 3 Core Patterns

Most slides use just 3 patterns:

| Region               | Pattern                 | Purpose                                     |
| -------------------- | ----------------------- | ------------------------------------------- |
| Header               | `title-zone.html`       | Badge + Title + Subtitle                    |
| Left column          | `content-box.html`      | Equations, text (main content)              |
| Left column (bottom) | `problem-reminder.html` | Problem reminder at bottom left (≤15 words) |
| Right column         | `svg-visual`            | Diagrams, graphs (see visuals/)             |

**Plus overlays and special cases:**

- `cfu-answer-card.html` → CFU/Answer boxes stacked on same slide (animated, appear on click)
- `graph-snippet.html` → Coordinate graphs (recalculate pixels)
- `slide-teacher-instructions.html` → Slide 1 only (teacher-facing)
- `slide-big-idea.html` → Slide 2 only (student-facing Big Idea)
- `printable-slide-snippet.html` → Printable slide only (slide 3+S+3)
- `lesson-summary-snippet.html` → Lesson summary only (slide 3+S+4)

**Always READ and COPY from snippet files.** Never write HTML from scratch.

---

## File Output Structure

Write each slide to a separate file. The number of step slides (S) varies from 2-5 (default 3), so the total file count varies accordingly.

**Example with 3 steps (default):**

```
src/app/presentations/{slug}/
├── slide-1.html   (Teacher Instructions - Big Idea, Learning Targets, Strategy)
├── slide-2.html   (Big Idea - student-facing)
├── slide-3.html   (Problem Setup)
├── slide-4.html   (Step 1 + CFU + Answer stacked)
├── slide-5.html   (Step 2 + CFU + Answer stacked)
├── slide-6.html   (Step 3 + CFU + Answer stacked)
├── slide-7.html   (Practice Problem 1 Preview - Scenario 2)
├── slide-8.html   (Practice Problem 2 Preview - Scenario 3)
├── slide-9.html   (Printable with Practice Problems 1 & 2 + Answer Key)
└── slide-10.html  (Lesson Summary - one-page printable reference card)
```

**With 5 steps:** slides 4-8 are steps, slide 9 is Practice Preview 1, slide 10 is Practice Preview 2, slide 11 is Printable, slide 12 is Lesson Summary.

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

## NEXT PHASE

**When all slides are written (total count depends on step count):**

Use the Read tool to read the Phase 4 instructions:

```
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
```

Do NOT proceed until all slide files have been written.
