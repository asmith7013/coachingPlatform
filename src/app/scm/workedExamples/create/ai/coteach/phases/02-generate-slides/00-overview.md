# Part 2: Generate Slides — Overview

## Purpose

Create 10 PPTX-compatible HTML slides using atomic card-patterns and PPTX animation for CFU/Answer reveals.

**Slide breakdown:** Slides 1-6 are the worked example, slides 7-8 are practice problem previews for whiteboard work, slide 9 is the printable worksheet, and slide 10 is the lesson summary.

## Output Format

All slides are **960x540px, light theme**. CFU/Answer boxes use PPTX animation (appear on click).

Output all 10 slides inline, separated by `===SLIDE_SEPARATOR===`. Each slide starts with `<!DOCTYPE html>`.

## Prerequisites

- Part 1 (Analyze & Plan) complete
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS, DIAGRAM EVOLUTION

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

**Also reference:**

- `card-patterns/` — HTML templates (index in card-patterns README)
- `reference/diagram-patterns.md` — Non-graph SVG patterns (tape diagrams, hangers, etc.)
- `visuals/annotation-zones.md` — Quick zone reference for annotations

**Checklists (use during/after generation):**

- `checklists/pre-flight.md` — Verify BEFORE writing each slide
- `checklists/completion.md` — Verify AFTER all 10 slides done

---

## Execution Flow

```
STEP 1: Read Reference Materials
│       Read files 00 → 01 → 02 → 03 (→ 04 if SVG)
│
▼
STEP 2: Check Visual Type (from Part 1)
│   ├── If "text-only" or "HTML table" → Use simple fill patterns
│   └── If "SVG visual" → Read 04-svg-workflow.md + graph-snippet.html
│
▼
STEP 3: Generate Slides 1-6 (Worked Example)
│   For each slide N from 1 to 6:
│     1. Choose layout preset (full-width or two-column)
│     2. Compose using card-patterns
│     3. Verify pre-flight checklist
│     4. Output HTML
│
▼
STEP 4: Generate Slides 7-8 (Practice Problem Previews)
│   For each practice preview (7 and 8):
│     1. Use Problem Setup slide as template
│     2. Replace scenario with Scenario 2 (slide 7) or Scenario 3 (slide 8)
│     3. Include "Your Task:" section with the question
│     4. NO CFU/Answer boxes — students work on whiteboards
│
▼
STEP 5: Generate Printable (Slide 9)
│   - Uses printable-slide-snippet.html pattern
│   - Contains practice problems from Scenarios 2 & 3 + Answer Key
│
▼
STEP 6: Generate Lesson Summary (Slide 10)
│   - One-page printable summary of the lesson's main idea
│   - Uses lesson-summary-snippet.html pattern
│   - Contains: Big Idea, Strategy overview, Visual reference, Key Takeaway
│   - Must include print-page class for print detection
│
▼
STEP 7: Verify Completion Checklist
         See checklists/completion.md
```

---

## 3 Core Patterns

Most slides use just 3 patterns:

| Region               | Pattern                 | Purpose                                     |
| -------------------- | ----------------------- | ------------------------------------------- |
| Header               | `title-zone.html`       | Badge + Title + Subtitle                    |
| Left column          | `content-box.html`      | Equations, text (main content)              |
| Left column (bottom) | `problem-reminder.html` | Problem reminder at bottom left (≤15 words) |
| Right column         | SVG visual              | Diagrams, graphs                            |

**Plus overlays and special cases:**

- `cfu-answer-card.html` → CFU/Answer boxes stacked on same slide (animated, appear on click)
- `graph-snippet.html` → Coordinate graphs (calculate pixels yourself using formulas in 04-svg-workflow.md)
- `slide-teacher-instructions.html` → Slide 1 only (teacher-facing)
- `slide-big-idea.html` → Slide 2 only (student-facing Big Idea)
- `printable-slide-snippet.html` → Slide 9 only (printable worksheet)
- `lesson-summary-snippet.html` → Slide 10 only (lesson summary reference card)

**Always COPY from snippet files.** Never write HTML from scratch.
