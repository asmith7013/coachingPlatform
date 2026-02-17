# Part 1: Analyze & Plan

## Purpose

Deeply analyze the **mastery check question** the user provided, understand its mathematical structure, define ONE clear strategy, create three scenarios with DIFFERENT contexts, and show the diagram evolution.

## Output Format: PPTX-Compatible HTML

All slides will be **PPTX-compatible HTML** (960×540px, light theme). See `02-generate-slides/02-technical-rules.md` for technical specs.

---

## CRITICAL: Understanding the Input

**The problem image the user provides is the MASTERY CHECK QUESTION** — the actual question students will answer on their exit ticket or assessment.

**Your job is to create a worked example that:**

1. Teaches the SAME mathematical skill
2. Uses the SAME strategy and steps
3. Uses **DIFFERENT context and numbers** than the mastery check

**Why different context?** Students should learn the strategy from the worked example, then apply it independently to the mastery check. If the worked example uses the same numbers/context, students can just copy the answer without learning the underlying skill.

**ALL THREE SCENARIOS must use different contexts:**

- Scenario 1 (Worked Example): Different context from mastery check
- Scenario 2 (Practice): Different context from mastery check AND Scenario 1
- Scenario 3 (Practice): Different context from all above

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

## Using Additional Context (if provided)

If the teacher provided **reference images** or **notes**, incorporate them into your analysis:

- **Reference images**: Use these to understand related concepts, see how similar problems were taught, or identify visual styles the teacher prefers
- **Strategy preferences**: If the teacher says "focus on the balance method", prioritize that strategy even if alternatives exist
- **Context themes**: If the teacher suggests "use gaming themes", incorporate that into scenario creation
- **Focus areas**: If the teacher says "want practice with distributing negatives", ensure the worked example emphasizes that skill

---

## Step 1: Deep Analysis of the Problem

**CRITICAL: Do NOT skip this step. Do NOT proceed until complete.**

### 1a: Solve the problem yourself

- Work through the mastery check step-by-step
- Write out your complete solution
- Identify the final answer

### 1b: Identify the mathematical structure

Be SPECIFIC, not vague:

- ✅ "solving two-step equations with variables on both sides"
- ❌ "algebra"

Ask yourself:

- What mathematical relationships are present?
- What prior knowledge does this assume?
- What format is the answer expected in?

### 1c: Identify what makes this challenging

- Where might students make mistakes?
- What's the key insight needed?
- What misconceptions does this address?

### 1d: Note constraints

- What format is the answer expected in?
- Any special conditions (positive numbers, whole numbers, etc.)?
- Does it ask for explanation/reasoning?

### 1e: Determine visual type

**CRITICAL: ALL graphics/diagrams MUST use SVG.**
SVG is required for PPTX export compatibility. The only exception is simple HTML tables.

**Visual Type Options:**

- **Text-only**: No graphics needed (rare — only pure text/equation problems)
- **HTML table**: Simple data tables with highlighting (HTML `<table>`)
- **SVG visual**: ALL other graphics — this includes:
  - Coordinate planes and graphs (svgSubtype: "coordinate-graph") → see Graph Planning section below
  - **Non-graph diagrams** (svgSubtype: "diagram") → see `reference/diagram-patterns.md`
    - Double number lines, Tape diagrams, Hanger diagrams, Area models, Input-output tables, Ratio tables
  - Geometric shapes (svgSubtype: "shape")
  - Number lines and bar models (svgSubtype: "number-line")
  - Any custom visual (svgSubtype: "other")

### 1f: SVG Planning (REQUIRED if visual type is "SVG visual")

**IF you selected "SVG visual" above, you MUST plan your SVG now.**

**For coordinate-graph subtype**, complete graph planning:

**List Your Equations:**

```
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
```

**Calculate Key Data Points (REQUIRED in graphPlan.keyPoints):**
For EACH line, calculate y at key x values:

- Y-intercepts (where line crosses y-axis)
- Solution points (the answer to the problem)
- Any point specifically asked about in the problem
- Points used for slope triangles or annotations

**Determine Scale (≤10 ticks on each axis):**

X_MAX: rightmost x-value needed (common: 4, 5, 6, 8, 10)

| X_MAX | X-axis labels       | X scale |
| ----- | ------------------- | ------- |
| 4     | 0, 1, 2, 3, 4       | 1       |
| 5     | 0, 1, 2, 3, 4, 5    | 1       |
| 6     | 0, 1, 2, 3, 4, 5, 6 | 1       |
| 8     | 0, 2, 4, 6, 8       | 2       |
| 10    | 0, 2, 4, 6, 8, 10   | 2       |
| 12    | 0, 3, 6, 9, 12      | 3       |
| 20    | 0, 5, 10, 15, 20    | 5       |

Y_MAX: use the table below to get exactly 9-10 ticks:

| If largest Y is... | Use Y_MAX | Increment | Ticks |
| ------------------ | --------- | --------- | ----- |
| ≤ 6                | 6         | 1         | 7     |
| 7-8                | 8         | 1         | 9     |
| 9                  | 9         | 1         | 10    |
| 10-16              | 16        | 2         | 9     |
| 17-18              | 18        | 2         | 10    |
| 19-36              | 36        | 4         | 10    |
| 37-45              | 45        | 5         | 10    |
| 46-72              | 72        | 8         | 10    |
| 73-90              | 90        | 10        | 10    |
| 91-180             | 180       | 20        | 10    |

**Calculate Line Endpoints (CRITICAL):**

For each line equation y = mx + b:

```
Start Point: (x=0, y=b)              — y-intercept
End Point:   (x=X_MAX, y=m*X_MAX+b)  — plug X_MAX into equation
```

If a line exits through the TOP before reaching X_MAX:

```
x = (Y_MAX - b) / m
End point: (x, Y_MAX)
```

**Plan Annotations:**
What mathematical relationship to show?

| If the problem involves...   | Annotation type                    |
| ---------------------------- | ---------------------------------- |
| Two parallel lines           | Y-intercept shift (vertical arrow) |
| Two lines, different slopes  | Slope comparison labels            |
| Lines that intersect         | Intersection point highlight       |
| Single line, slope focus     | Slope triangle                     |
| Single line, intercept focus | Y-intercept point highlight        |

**For other SVG types (diagrams, shapes, etc.):**
Plan the visual elements:

- What shapes/elements are needed?
- What colors will represent each element?
- What annotations will show the math?
- How will the visual change across slides 3-6?

### 1g: Diagram Evolution (REQUIRED for ALL worked examples)

**⚠️ CRITICAL: This step is REQUIRED. Do NOT skip it.**

Create a **Diagram Evolution** showing how the visual develops step-by-step across slides. This shows EXACTLY how the visual will build from initial state through each step of the solution.

Use `reference/diagram-patterns.md` as a guide for ASCII representations.

**The Diagram Evolution MUST include:**

1. **initialState**: ASCII showing the diagram on Problem Setup slide (empty axes, blank tape, etc.)
2. **keyElements**: Array explaining each element and what it represents mathematically
3. **steps**: Array with one entry per strategy move (2-3 entries), each containing:
   - `header`: The slide header (e.g., "STEP 1: IDENTIFY")
   - `ascii`: ASCII showing the diagram state AFTER that step (building cumulatively)
   - `changes`: Array of what was added/changed from previous step

**Why this matters:**

- Teachers can see EXACTLY how the visual will build across slides
- Catches issues like "wrong step order" or "missing annotation" BEFORE slide generation
- The number of steps MUST match `strategyDefinition.moves.length`

---

## Step 2: Define the Strategy Thread

**Before ANY content creation, define ONE clear strategy.**

### 2a: Name the strategy

Give it a clear, memorable name:

- "Balance and Isolate"
- "Find the Unit Rate"
- "Plot and Connect"
- "Table to Equation"

### 2b: State it in one sentence

Student-facing explanation:

- "To solve this, we [VERB] the [OBJECT] to find [GOAL]"

### 2c: Identify the 2-3 moves (maximum 3)

- Move 1: [Action verb] → [What it accomplishes]
- Move 2: [Action verb] → [What it accomplishes]
- Move 3 (if needed): [Action verb] → [What it accomplishes]

### 2d: Define consistent language

These step names MUST:

- Use the EXACT same verbs throughout all slides
- Appear on every slide header
- Be referenced in CFU questions

### 2e: State the Big Idea

One sentence that captures the core mathematical concept:

- "To solve equations, we keep both sides balanced"
- "Unit rates let us compare different quantities fairly"
- "Parallel lines have the same slope but different y-intercepts"

The Big Idea is more general than the strategy summary — it's the mathematical truth students will remember.

---

## Step 3: Create Three Scenarios (All Different from Mastery Check)

### Context Separation

**NONE of the scenarios should use the same context or numbers as the mastery check question.**

| What                         | Context                                  |
| ---------------------------- | ---------------------------------------- |
| Mastery Check (user's input) | The ACTUAL question students will answer |
| Scenario 1 (Worked Example)  | DIFFERENT context — teaches the strategy |
| Scenario 2 (Practice)        | DIFFERENT context — first practice       |
| Scenario 3 (Practice)        | DIFFERENT context — second practice      |

### Scenario Requirements

Each scenario MUST:

- Use the **exact same mathematical structure** as the mastery check
- Require the **exact same strategy** to solve
- Use **DIFFERENT numbers and context** from the mastery check (and from each other)
- Be solvable using the **exact same steps in the exact same order**
- Include a **condensed problem reminder (≤15 words)** for use on slides

### Problem Reminders

**Format:** Short phrases, not full sentences. Max 15 words.

```
✅ GOOD: "30 nuggets total. 6 per student. How many students?"
✅ GOOD: "Drone: 150m in 30 sec. Find the speed."
❌ BAD:  "A large box has 30 chicken nuggets. If each student gets 6 nuggets, how many students can have a snack?"
```

### Visual Progression: Plan What Changes Each Step (REQUIRED for Scenario 1)

For the worked example (Scenario 1), you MUST define what the visual shows at each step:

```
Visual Progression (Scenario 1):
- Setup (Slide 3): [What the visual shows initially]
- Step 1 (Slide 4): [What gets highlighted/added]
- Step 2 (Slide 5): [What gets highlighted/added]
- Step 3 (Slide 6): [Answer revealed on visual]
```

### Scenario Graph Plans (if coordinate-graph)

If the problem requires a coordinate graph, create a `graphPlan` for EACH scenario with that scenario's specific equations and values:

- Each scenario has different numbers, so each needs its own equations, scale, keyPoints, and annotations
- The graph structure (number of lines, annotation type) stays the same across scenarios
- Only the specific values change

### Scenario 1 Diagram Evolution (REQUIRED)

Scenario 1 MUST have its own `diagramEvolution` with its specific numbers in the ASCII art:

- Shows how the visual develops step-by-step for Scenario 1's context/numbers
- Will be used for the worked example slides (slides 3-6)
- Scenarios 2 and 3 do NOT need `diagramEvolution`

### Scenario Design Principles

**DO:**

- Match context to grade level interests (gaming, social media, sports, STEM)
- Keep mathematical difficulty identical to mastery check
- Ensure the same moves apply in the same order
- Use engaging, real-world situations
- Give each scenario a visual anchor (icon/theme)

**DO NOT:**

- Use the same context as the mastery check question
- Use the same numbers as the mastery check question
- Change the problem type
- Add or remove steps from the solution
- Introduce new mathematical concepts

---

## Visual Types Reference

Choose ONE visual type that best represents the math:

| Visual Type           | Use For                               | Key Details to Plan                                      |
| --------------------- | ------------------------------------- | -------------------------------------------------------- |
| `tape-diagram`        | Division, multiplication, part-whole  | boxes, values per box, total, unknown position           |
| `coordinate-graph`    | Linear equations, rates, proportions  | equations, scale, keyPoints, annotations                 |
| `double-number-line`  | Ratios, unit rates, percentages       | quantity A values, quantity B values, alignment          |
| `area-model`          | Multiplication, distributive property | dimensions, partial products                             |
| `number-line`         | Integers, inequalities, operations    | range, marked points, arrows                             |
| `ratio-table`         | Equivalent ratios, scaling            | column values, scale factors                             |
| `hanger-diagram`      | Equation solving, balance             | left side, right side, shapes                            |
| `input-output-table`  | Functions, patterns, rules            | input values, output values, rule                        |
| `grid-diagram`        | Area by counting, decomposing shapes  | rows, cols, shaded regions, unit label                   |
| `net-diagram`         | Surface area, 3D→2D unfolding         | shape type, faces with dimensions, fold lines            |
| `measurement-diagram` | Base & height, labeled dimensions     | shape type, labeled measurements, right angle indicators |
| `discrete-diagram`    | Objects in groups, discrete ratios    | groups, items per group, total, visual type              |
| `base-ten-diagram`    | Place value, decimal operations       | ones, tens, hundreds blocks, operation                   |
| `dot-plot`            | Data distributions, frequencies       | data points, axis range, label                           |
| `box-plot`            | Quartiles, variability, outliers      | min, Q1, median, Q3, max, outliers                       |
| `bar-graph`           | Comparing frequencies, categories     | categories, values, orientation                          |
| `tree-diagram`        | Probability, sample spaces            | branches, probabilities, outcomes                        |
| `circle-diagram`      | Circles with labeled parts            | radius, diameter, circumference, center point            |
| `scale-drawing`       | Maps, floor plans, blueprints         | scale factor, actual/drawing measurements                |
| `scaled-figures`      | Original vs copy comparison           | original dims, scale factor, copy dims                   |
| `other`               | Custom diagrams not listed above      | describe visual structure and key elements               |

Visual selection happens ONCE in analysis, then applies to ALL scenarios.

---

## VisualPlan Schemas (by visual type)

Each scenario MUST have its own VisualPlan with values specific to that scenario's numbers.

**tape-diagram:**

```
VisualPlan:
  boxes: [number of boxes]
  valuePerBox: [value inside each box]
  total: [total value]
  unknownPosition: "start" | "box" | "total"
```

**coordinate-graph:** (See Graph Planning section above for full planning)

```
VisualPlan:
  equations: ["y = 2x + 3", "y = 0.5x"]
  scale: { xMin, xMax, yMin, yMax }
  keyPoints: [{ label: "y-intercept", x: 0, y: 3 }, { label: "solution", x: 4, y: 11 }]
  annotations: ["y-intercept shift", "parallel lines"]
```

**double-number-line:**

```
VisualPlan:
  quantityA: { label: "cups", values: [0, 2, 4, 6] }
  quantityB: { label: "servings", values: [0, 3, 6, 9] }
  highlightPair: [4, 6]
```

**area-model:**

```
VisualPlan:
  dimensions: [width, height] or [a+b, c+d]
  partialProducts: [[a*c, a*d], [b*c, b*d]]
```

**number-line:**

```
VisualPlan:
  range: [min, max]
  markedPoints: [{ value, label, style: "closed"|"open" }]
  arrows: [{ from, to, label }]
```

**ratio-table:**

```
VisualPlan:
  rows: [{ label: "apples", values: [2, 4, 6, "?"] }]
  scaleFactors: ["×2", "×3"]
```

**hanger-diagram:**

```
VisualPlan:
  leftSide: "3x + 1"
  rightSide: "10"
  shapes: { triangle: "x", square: "1" }
```

**input-output-table:**

```
VisualPlan:
  rule: "×3 + 2" or "y = 3x + 2"
  inputs: [1, 2, 3, 4, "?"]
  outputs: [5, 8, 11, 14, "?"]
  unknownPosition: "input" | "output" | "both"
```

**grid-diagram:**

```
VisualPlan:
  rows: [number of rows]
  cols: [number of columns]
  shadedRegions: [{ startRow, startCol, endRow, endCol, color }]
  unitLabel: "sq cm" | "sq in" | "units"
  showGrid: true | false
```

**net-diagram:**

```
VisualPlan:
  shapeType: "rectangular-prism" | "triangular-prism" | "pyramid" | "cube"
  faces: [{ shape: "rectangle" | "triangle", width, height, label }]
  foldLines: true | false
  dimensions: { length, width, height }
```

**measurement-diagram:**

```
VisualPlan:
  shapeType: "triangle" | "parallelogram" | "trapezoid" | "rectangle"
  measurements: [{ label: "base" | "height" | "side", value, position }]
  showRightAngle: true | false
  showDashedHeight: true | false
```

**discrete-diagram:**

```
VisualPlan:
  groups: [number of groups]
  itemsPerGroup: [items in each group]
  totalItems: [total count]
  visualType: "circles" | "squares" | "icons"
  arrangement: "rows" | "clusters"
```

**base-ten-diagram:**

```
VisualPlan:
  hundreds: [number of hundred blocks]
  tens: [number of ten rods]
  ones: [number of unit cubes]
  operation: "none" | "addition" | "subtraction" | "regrouping"
  showValues: true | false
```

**dot-plot:**

```
VisualPlan:
  dataPoints: [2, 3, 3, 4, 4, 4, 5, 5, 6]
  axisLabel: "Number of pets"
  axisRange: [0, 10]
  title: "Pets Owned by Students"
```

**box-plot:**

```
VisualPlan:
  min: 12, q1: 18, median: 25, q3: 32, max: 45
  outliers: [5, 52]
  axisLabel: "Test Scores"
  axisRange: [0, 60]
```

**bar-graph:**

```
VisualPlan:
  categories: ["Red", "Blue", "Green", "Yellow"]
  values: [12, 8, 15, 6]
  orientation: "vertical" | "horizontal"
  axisLabel: "Frequency"
  title: "Favorite Colors"
```

**tree-diagram:**

```
VisualPlan:
  levels: [
    { outcomes: ["Heads", "Tails"], probabilities: [0.5, 0.5] },
    { outcomes: ["Heads", "Tails"], probabilities: [0.5, 0.5] }
  ]
  finalOutcomes: ["HH", "HT", "TH", "TT"]
  highlightPath: ["Heads", "Tails"]
```

**circle-diagram:**

```
VisualPlan:
  radius: 5, diameter: 10, circumference: "10π" or 31.4
  showCenter: true | false
  labeledParts: ["radius", "diameter", "circumference", "center"]
  unit: "cm" | "in" | "units"
```

**scale-drawing:**

```
VisualPlan:
  scaleFactor: "1 cm : 10 m" or "1:100"
  drawingMeasurements: [{ label: "length", value: 5, unit: "cm" }]
  actualMeasurements: [{ label: "length", value: 50, unit: "m" }]
  drawingType: "map" | "floor-plan" | "blueprint" | "other"
```

**scaled-figures:**

```
VisualPlan:
  originalDimensions: [{ label: "width", value: 4 }, { label: "height", value: 6 }]
  scaleFactor: 2.5
  copyDimensions: [{ label: "width", value: 10 }, { label: "height", value: 15 }]
  shapeType: "rectangle" | "triangle" | "polygon"
```

**other:** (custom diagrams)

```
VisualPlan:
  description: "[What the visual shows]"
  elements: ["element 1", "element 2", ...]
  labels: ["label 1", "label 2", ...]
  annotations: ["what to highlight or emphasize"]
```

For custom diagrams, reference `reference/diagram-patterns.md` for SVG implementation patterns.

---

## Output Templates

**After completing all analysis steps, OUTPUT the following templates visibly.**

### PROBLEM ANALYSIS

```
PROBLEM ANALYSIS
================
Problem Transcription: [EXACT verbatim text from image]

Problem Type: [specific type]
Mathematical Structure: [describe relationships]

My Solution:
1. [First step with reasoning]
2. [Second step with reasoning]
3. [Third step with reasoning]
Answer: [final answer]

Key Challenge: [what makes this hard]
Common Mistakes: [likely errors]
Required Prior Knowledge: [prerequisites]
Answer Format: [how answer should be presented]
Visual Type: [Text-only | HTML table | SVG visual]
SVG Subtype (if SVG visual): [coordinate-graph | diagram | shape | number-line | other]

SVG PLAN (only if Visual Type is "SVG visual"):
===============================================
[For coordinate graphs — include full graph plan with equations, scale, key points, annotations]
[For other SVG types — include elements, layout, annotations per slide]

DIAGRAM EVOLUTION (Scenario 1) - REQUIRED:
==========================================
[ASCII representation of the visual structure using patterns from reference/diagram-patterns.md]

Key elements:
- [element 1]: [what it represents]
- [element 2]: [what it represents]

Steps:
[One step per strategy move showing cumulative visual development]
```

### STRATEGY DEFINITION

```
STRATEGY DEFINITION
===================
Strategy Name: "[Name]"
One-Sentence Summary: "[Student-facing explanation]"
Big Idea: "[The core mathematical concept in one sentence]"

The Moves:
1. [VERB]: [Description] → [Result]
2. [VERB]: [Description] → [Result]
3. [VERB]: [Description] → [Result] (if needed)

Slide Headers Will Say:
- "STEP 1: [VERB]"
- "STEP 2: [VERB]"
- "STEP 3: [VERB]" (if needed)

CFU Questions Will Reference:
- "Why did I [VERB] first?"
- "How does [VERB]ing help us find the answer?"
```

### SCENARIOS

```
MASTERY CHECK CONTEXT (from user's input):
[Brief description of the context/numbers in the user's question]

THREE SCENARIOS (all DIFFERENT from mastery check):
===================================================

Scenario 1 (Worked Example):
- Context: [engaging scenario name — DIFFERENT from mastery check]
- Theme/Icon: [visual anchor]
- Numbers: [specific values — DIFFERENT from mastery check]
- Problem Reminder (≤15 words): [condensed summary for slides]
- Same mathematical structure: [yes/explain how]
- Different from mastery check: [yes/explain what's different]
- VisualPlan: [see schema above — details for THIS scenario's numbers]
- GraphPlan: [if coordinate-graph — full plan for THIS scenario]
- Diagram Evolution: [REQUIRED — step-by-step ASCII with THIS scenario's numbers]

Scenario 2 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Problem Reminder (≤15 words): [condensed summary for slides]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenario 1: [yes/explain]
- VisualPlan: [details for THIS scenario's numbers]
- GraphPlan: [if coordinate-graph — full plan for THIS scenario]

Scenario 3 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Problem Reminder (≤15 words): [condensed summary for slides]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenarios 1-2: [yes/explain]
- VisualPlan: [details for THIS scenario's numbers]
- GraphPlan: [if coordinate-graph — full plan for THIS scenario]
```

---

## Output Schema (JSON Reference)

The analysis should match this structure:

```json
{
  "problemAnalysis": {
    "problemTranscription": "EXACT verbatim transcription of everything in the image",
    "problemType": "specific type",
    "mathematicalStructure": "description of relationships",
    "solution": [
      { "step": 1, "description": "what you do", "reasoning": "why you do it" }
    ],
    "answer": "final answer",
    "keyChallenge": "what makes this hard for students",
    "commonMistakes": ["mistake 1", "mistake 2"],
    "requiredPriorKnowledge": ["prereq 1", "prereq 2"],
    "answerFormat": "how answer should be presented",
    "visualType": "text-only | html-table | svg-visual",
    "svgSubtype": "coordinate-graph | diagram | shape | number-line | other",
    "diagramEvolution": {
      "initialState": "ASCII showing the initial diagram state",
      "keyElements": [
        { "element": "element name", "represents": "what it represents" }
      ],
      "steps": [
        {
          "header": "STEP 1: VERB",
          "ascii": "ASCII showing diagram after step 1",
          "changes": ["What was added or modified"]
        }
      ]
    },
    "graphPlan": {
      "equations": [
        {
          "label": "Line 1",
          "equation": "y = mx + b",
          "slope": 5,
          "yIntercept": 0,
          "color": "#60a5fa",
          "startPoint": { "x": 0, "y": 0 },
          "endPoint": { "x": 8, "y": 40 }
        }
      ],
      "scale": {
        "xMax": 8,
        "yMax": 50,
        "xAxisLabels": [0, 2, 4, 6, 8],
        "yAxisLabels": [0, 10, 20, 30, 40, 50]
      },
      "keyPoints": [
        { "label": "y-intercept", "x": 0, "y": 0, "dataX": 0, "dataY": 0 }
      ],
      "annotations": [
        { "type": "y-intercept-shift", "from": 0, "to": 20, "label": "+20" }
      ]
    }
  },
  "strategyDefinition": {
    "name": "Strategy Name",
    "oneSentenceSummary": "To solve this, we...",
    "bigIdea": "The core mathematical concept",
    "moves": [
      {
        "verb": "VERB1",
        "description": "what this step does",
        "result": "what it accomplishes"
      }
    ],
    "slideHeaders": ["STEP 1: VERB1", "STEP 2: VERB2"],
    "cfuQuestionTemplates": [
      "Why did I [VERB] first?",
      "How does [VERB]ing help?"
    ]
  },
  "scenarios": [
    {
      "name": "Scenario name",
      "context": "Real-world context description",
      "themeIcon": "emoji",
      "numbers": "specific numbers used",
      "description": "Full problem statement",
      "problemReminder": "≤15 word summary",
      "visualPlan": {},
      "graphPlan": {},
      "diagramEvolution": {}
    }
  ]
}
```

### Field Requirements

**ALWAYS REQUIRED:**

- `strategyDefinition.moves` — 2-3 moves
- `scenarios` — exactly 3 with different contexts
- `scenarios[0].diagramEvolution` — Scenario 1 needs its own diagram evolution with its specific numbers

**Conditional:**

- `problemAnalysis.svgSubtype` — when `visualType` is `"svg-visual"`
- `problemAnalysis.graphPlan` — when `svgSubtype` is `"coordinate-graph"`
- `scenario[].graphPlan` — when `svgSubtype` is `"coordinate-graph"` (each scenario needs its own)
- `scenario[].visualPlan` — when `svgSubtype` is NOT `"coordinate-graph"`

---

## Completion Checklist

Before proceeding to slide generation, verify:

- [ ] Problem transcription contains EXACT verbatim text from image
- [ ] Problem was FULLY solved step-by-step
- [ ] Problem type is SPECIFIC (not vague like "algebra")
- [ ] ONE clear strategy is named with 2-3 moves maximum
- [ ] Strategy has a one-sentence student-facing summary
- [ ] Big Idea is stated as a mathematical principle
- [ ] All step names use consistent verbs
- [ ] CFU question templates reference strategy verbs
- [ ] ALL 3 scenarios use DIFFERENT contexts from the mastery check
- [ ] All scenarios use the SAME mathematical structure and strategy
- [ ] Each scenario has a condensed problem reminder (≤15 words)
- [ ] Diagram evolution is included with initialState, keyElements, and steps
- [ ] Steps build cumulatively and match strategyDefinition.moves.length
- [ ] Scenario 1 has its own diagramEvolution with its specific numbers
- [ ] IF coordinate-graph: each scenario has its own graphPlan
- [ ] All analysis output is shown visibly

**After outputting the complete analysis, IMMEDIATELY proceed to slide generation (Part 2). Do NOT pause or wait for confirmation.**
