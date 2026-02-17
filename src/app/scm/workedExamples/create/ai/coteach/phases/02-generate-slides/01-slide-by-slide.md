# Slide-by-Slide Generation Protocol

**What this file covers:** Per-slide protocol, slide structure, what each slide contains.

---

## Output Format

Output all slides separated by `===SLIDE_SEPARATOR===`. Each slide starts with `<!DOCTYPE html>`. No preamble, no announcements, no "I'll generate..." text between slides.

---

## Per-Slide Protocol

### Step 1: Determine Slide Type and Layout

CFU and Answer boxes are STACKED on the same slide (both appear, one after another on click).

| Slide # | Type                 | `data-slide-type`      | Layout Options             | Content                                                                                   |
| ------- | -------------------- | ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| 1       | Teacher Instructions | `teacher-instructions` | `two-column`               | **Teacher-only (students start on Slide 2).** Big Idea + Learning Targets + Deck Overview |
| 2       | Big Idea             | `big-idea`             | `centered`                 | Grade/Unit/Lesson + Big Idea badge + statement                                            |
| 3       | Problem Setup        | `problem-setup`        | `two-column` or `centered` | problem + visual                                                                          |
| 4       | Step 1               | `step`                 | `two-column` or `centered` | step content + CFU + Answer (stacked)                                                     |
| 5       | Step 2               | `step`                 | `two-column` or `centered` | step content + CFU + Answer (stacked)                                                     |
| 6       | Step 3               | `step`                 | `two-column` or `centered` | step content + CFU + Answer (stacked)                                                     |
| 7       | Practice Preview 1   | `practice-preview`     | `two-column` or `centered` | Scenario 2 problem + visual + "Your Task"                                                 |
| 8       | Practice Preview 2   | `practice-preview`     | `two-column` or `centered` | Scenario 3 problem + visual + "Your Task"                                                 |
| 9       | Printable            | `printable-worksheet`  | `full-width`               | printable format                                                                          |
| 10      | Lesson Summary       | `lesson-summary`       | `full-width`               | printable one-page lesson reference card                                                  |

**REQUIRED: Every slide's `<body>` tag MUST include the `data-slide-type` attribute from the table above.**
Example: `<body style="width:960px;height:540px;..." data-slide-type="step">`

**Layout Selection (slides 3-8):**

| Choose `centered` when...                      | Choose `two-column` when...           |
| ---------------------------------------------- | ------------------------------------- |
| Equation IS the visual                         | Text + separate visual needed         |
| Simple diagram (tape, hanger)                  | Complex visual (coordinate graph)     |
| Step is single operation                       | Multiple parts to explain             |
| Focus on ONE thing                             | Show text-visual relationship         |
| **Diagram IS the content** (not supporting it) | **Diagram supports/illustrates text** |

### The Duplication Test (CRITICAL)

**Before choosing two-column, ask: "Would I say the same thing on both sides?"**

| If this happens...                                              | Use this layout                                    |
| --------------------------------------------------------------- | -------------------------------------------------- |
| Left explains "two meanings" + Right shows "two meanings" boxes | `centered` — let the diagram BE the explanation    |
| Left has equation + Right has graph of that equation            | `two-column` — they show DIFFERENT representations |
| Left describes groups + Right shows the same groups visually    | `centered` — remove the text, enlarge the visual   |

**For `two-column` layout (text + visual side-by-side):**

- Left: Main content (36-48px) + Problem reminder at bottom left corner (≤15 words)
- Right: SVG visual or diagram
- Left and right must show DIFFERENT content
- Problem reminder uses `card-patterns/simple-patterns/problem-reminder.html` positioned at y=450

**For `centered` layout (stacked hero content):**

- Main: Large equation/diagram centered (hero element)
- Support: Brief text below (optional)
- Use when the diagram IS the teaching, not just supporting it

See `reference/layout-presets.md` for pixel dimensions and HTML examples.

**Note:** Practice problems appear in TWO places:

1. **Slides 7-8 (Preview)**: One problem per slide for whiteboard work (NO answers shown)
2. **Slide 9 (Printable)**: Both problems with space for written work + answer key

---

### Step 2: Add CFU + Answer Boxes (Same Position, PPTX Animation)

**CFU and Answer boxes occupy the SAME position on the same slide. Both use PPTX animation — CFU appears first, then Answer overlays it on the second click.**

Add BOTH boxes BEFORE the closing `</body>` tag on Step slides (4, 5, 6):

**CFU Box (appears on first click):**

```html
<div
  data-pptx-region="cfu-box"
  data-pptx-x="653"
  data-pptx-y="40"
  data-pptx-w="280"
  data-pptx-h="115"
  style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 12px; border-left: 4px solid #f59e0b; z-index: 100;"
>
  <p
    style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #92400e;"
  >
    CHECK FOR UNDERSTANDING
  </p>
  <p style="margin: 0; font-size: 13px; color: #1d1d1d;">
    [CFU question using strategy verb]
  </p>
</div>
```

**Answer Box (SAME position, appears on second click and overlays CFU):**

```html
<div
  data-pptx-region="answer-box"
  data-pptx-x="653"
  data-pptx-y="40"
  data-pptx-w="280"
  data-pptx-h="115"
  style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 12px; border-left: 4px solid #22c55e; z-index: 101;"
>
  <p
    style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #166534;"
  >
    ANSWER
  </p>
  <p style="margin: 0; font-size: 13px; color: #1d1d1d;">
    [Answer explanation]
  </p>
</div>
```

**How animation works:**

- Both boxes are on the SAME slide at the SAME position (y=40)
- `data-pptx-region="cfu-box"` appears on FIRST click (yellow box)
- `data-pptx-region="answer-box"` appears on SECOND click (green box overlays yellow)
- Answer box has higher z-index (101) to visually layer on top
- See `card-patterns/simple-patterns/cfu-answer-card.html` for full pattern

---

### Step 3: Compose Slides from Atomic Components

1. **CHOOSE LAYOUT** from the table above (full-width or two-column)
2. **COMPOSE** slide using atomic card-patterns:
   - **title-zone**: Badge ("STEP N: [VERB]") + Title + optional Subtitle
   - **content-box**: Main text content (instructions, questions, explanations)
   - **svg-card**: Graph or diagram (if visual slide)
   - Use patterns from `card-patterns/` folder as HTML snippets
3. **IF Visual Type = "coordinate-graph"**: Reference `04-svg-workflow.md` and calculate pixel coordinates yourself
4. **IF Visual Type = "diagram" (non-graph SVG)**: Reference `reference/diagram-patterns.md`
   - Includes: tape diagrams, hanger diagrams, double number lines, input-output tables, area models
   - Based on Illustrative Mathematics (IM) curriculum representations
5. **VERIFY** the pre-flight checklist (see `checklists/pre-flight.md`)

### Step 4: Practice Problem Preview Slides (7-8)

**For Practice Preview slides, use the Problem Setup slide (3) as a template but:**

- Change title zone to: "PRACTICE PROBLEM [1/2]: [Scenario Name] [Icon]"
- Use the appropriate scenario's graphPlan/diagramEvolution:
  - Slide 7: Use `scenarios[1]` (Scenario 2)
  - Slide 8: Use `scenarios[2]` (Scenario 3)
- Include "Your Task:" section prominently with the question to solve
- **NO CFU/Answer boxes** — students work independently on whiteboards
- Keep the same layout style as the worked example (two-column or centered)

### Step 5: Generate Lesson Summary (Slide 10)

**After the printable slide (9) is complete, generate a one-page lesson summary.**

This is a printable reference card that students can use to quickly recall the main idea from this lesson. Use `lesson-summary-snippet.html` as the template.

**Content to include:**

1. **Header:** "LESSON SUMMARY" badge + lesson title + Grade/Unit/Lesson
2. **Big Idea (hero section):** Large, prominent statement from `strategyDefinition.bigIdea`
3. **Strategy Steps:** Numbered list of the 3 moves (verb + description) from `strategyDefinition.moves`
4. **Visual Reference (ALWAYS include):**
   - For coordinate graph lessons: Small labeled graph showing the key concept (use Scenario 1's graphPlan, scaled down)
   - For diagram lessons: Simplified version of the diagram type
   - For text/table lessons: Compact worked example showing the strategy applied
5. **Remember:** 1-2 sentence key takeaway synthesized from `learningGoals`

**Requirements:**

- Single `print-page` div (one page, 8.5in × 11in)
- Uses Times New Roman font (matches printable worksheet)
- Must include `print-page` CSS class for print detection
- Keep it scannable — a student should grasp the key idea at a glance
- Visual should fit in ~40% of the page width

---

## Visual Type Reference

Your visual type was determined in Part 1. Here's what each requires:

**Text-only:**

- No graphics — pure text/equation problems
- Use content-box patterns only

**HTML table:**

- Simple data tables with highlighting
- Use `<table>` with inline styles

**SVG visual (ALL other graphics):**

- Coordinate planes and graphs
- Hanger diagrams and balance problems
- Geometric shapes and diagrams
- Number lines and bar models
- Any custom visual representation

**For SVG visuals, you MUST:**

1. Reference `04-svg-workflow.md` for coordinate graphs
2. Reference `reference/diagram-patterns.md` for other diagram types
3. Wrap in container with `data-pptx-region="svg-container"`
4. Include position attributes: `data-pptx-x`, `data-pptx-y`, `data-pptx-w`, `data-pptx-h`
5. **CRITICAL: Wrap EVERY distinct element in `<g data-pptx-layer="...">`**

### SVG Layer Requirement (MANDATORY)

**Without `data-pptx-layer`, ALL SVG content becomes ONE merged image. Teachers cannot click, move, or edit individual elements.**

Every SVG element group MUST have its own layer:

```html
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
```

**Layer naming:**

- `label-X` for text labels
- `shape-N` or `shape-row-N` for shapes/objects
- `base` for background elements
- `arrow-X` for arrows/annotations

---

## Using the Correct GRAPH PLAN

**CRITICAL: Use EACH SCENARIO'S graphPlan, NOT the mastery check's graphPlan.**

The mastery check (`problemAnalysis.graphPlan`) is for the student's exit ticket/assessment — it is NEVER shown in these slides. Each scenario has its own numbers/context, so each needs its own graphPlan:

| Slides                         | Source          | GraphPlan to Use                                      |
| ------------------------------ | --------------- | ----------------------------------------------------- |
| 3-6 (Worked Example)           | Scenario 1      | `scenarios[0].graphPlan`                              |
| 7 (Practice Preview 1)         | Scenario 2      | `scenarios[1].graphPlan`                              |
| 8 (Practice Preview 2)         | Scenario 3      | `scenarios[2].graphPlan`                              |
| 9 (Printable — Practice 1 & 2) | Scenarios 2 & 3 | `scenarios[1].graphPlan` and `scenarios[2].graphPlan` |

Each GRAPH PLAN contains the semantic decisions for that scenario:

- **Equations** with correct slope/y-intercept for that scenario's numbers
- **Scale** (X_MAX, Y_MAX) appropriate for that scenario's values
- **Line endpoints** (startPoint, endPoint) calculated for that scenario
- **keyPoints** with correct coordinates for that scenario
- **Annotations** type and position

**You MUST implement exactly what each scenario's GRAPH PLAN specifies.** Do NOT use the mastery check's graphPlan.

---

## Output Format

Each slide MUST:

- Start with `<!DOCTYPE html>` as the very first characters
- Contain ONLY valid HTML (no comments or notes before the HTML)
- End with `</html>`

Separate slides with:

```
===SLIDE_SEPARATOR===
```
