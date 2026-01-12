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
If the problem requires a coordinate graph (`visualType: svg-visual`, `svgSubtype: coordinate-graph`), create a `graphPlan` for EACH scenario with that scenario's specific equations and values:
- Each scenario has different numbers, so each needs its own equations, scale, keyPoints, and annotations
- The graph structure (number of lines, annotation type) stays the same across scenarios
- Only the specific values change based on each scenario's numbers

Example: If Scenario 1 uses "y = 25x + 50" and Scenario 2 uses "y = 15x + 30", each scenario needs its own complete graphPlan with those specific equations, calculated endpoints, and appropriate scale.

### STEP 6: Determine Visual Type

**CRITICAL: ALL graphics/diagrams MUST use SVG.** The only exception is simple HTML tables.

- **text-only**: No graphics needed (rare - pure text/equation problems)
- **html-table**: Simple data tables with highlighting
- **svg-visual**: ALL other graphics - this includes:
  - Coordinate planes and graphs (svgSubtype: "coordinate-graph") → use `graph-planning.md`
  - **Non-graph diagrams** (svgSubtype: "diagram") → **use `reference/diagram-patterns.md` as PRIMARY REFERENCE**
    - Double number lines
    - Tape diagrams (bar models)
    - Hanger diagrams (balance equations)
    - Area models
    - Input-output tables
    - Ratio tables
  - Geometric shapes (svgSubtype: "shape")
  - Number lines and bar models (svgSubtype: "number-line")
  - Any custom visual (svgSubtype: "other")

**For non-graph SVGs:** READ `reference/diagram-patterns.md` to see the exact visual structure students expect from Illustrative Mathematics curriculum.

### STEP 7: SVG Planning (REQUIRED if Visual Type is "svg-visual")

**IF you selected "svg-visual" above, you MUST plan your SVG now.**

**For coordinate-graph subtype**, complete graph planning to ensure math is calculated BEFORE slide generation:

**7a: List Your Equations**
Write out every line/equation that will appear:
```
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
```

**7b: Calculate Key Data Points (REQUIRED in graphPlan.keyPoints)**
For EACH line, calculate y at key x values. These MUST be included in the `keyPoints` array:
- Y-intercepts (where line crosses y-axis)
- Solution points (the answer to the problem)
- Any point specifically asked about in the problem
- Points used for slope triangles or annotations

Example:
```
Line 1: y = 5x
  - At x=0: y = 0 (y-intercept) → keyPoint: { label: "y-intercept Line 1", x: 0, y: 0 }
  - At x=4: y = 20 (solution) → keyPoint: { label: "solution", x: 4, y: 20 }

Line 2: y = 5x + 20
  - At x=0: y = 20 (y-intercept) → keyPoint: { label: "y-intercept Line 2", x: 0, y: 20 }
```

**CRITICAL:** Every important point that will be marked with a dot or label on the graph MUST appear in `keyPoints`.

**7c: Determine Scale (≤10 ticks on each axis)**
- X_MAX: rightmost x-value needed (common: 4, 5, 6, 8, 10)
  - X_MAX ≤6: count by 1s
  - X_MAX >6: count by 2s
- Y_MAX: use the scale tables in `graph-planning.md` to get exactly 9-10 ticks
  - Count by 1s up to Y_MAX=9
  - Count by 2s up to Y_MAX=18
  - Count by 4s up to Y_MAX=36
  - Count by 5s up to Y_MAX=45
  - See `graph-planning.md` for full table

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
