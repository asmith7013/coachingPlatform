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

**The exit ticket is the essential source of truth.** Everything in this analysis flows FROM the exit ticket. Follow this backward planning protocol carefully.

### STEP 1: Deep Exit Ticket Analysis

**This is the foundation — everything else builds on this analysis.**

**1a: Solve the Problem**
- Work through the mastery check step-by-step
- Write out your complete solution with reasoning
- Identify the final answer

**1b: Identify Mathematical Structure**
Be SPECIFIC, not vague:
- ✅ "solving two-step equations with variables on both sides"
- ❌ "algebra"

Ask yourself:
- What mathematical relationships are present?
- What prior knowledge does this assume?
- What format is the answer expected in?

**1c: Articulate What Correct Understanding Looks Like**
This is the essential piece — what does a student need to understand to get this problem correct?
- What mathematical knowledge must they apply?
- What key insight separates students who get it right from those who don't?
- What does the correct reasoning process look like?

### STEP 2: Develop the Big Idea

**The Big Idea is a generalizable mathematical principle — NOT something specific to this problem's context.**

**CRITICAL CONSTRAINT:** The Big Idea must transfer beyond the specific problem context. It should NOT reference context-specific details (e.g., "area of a circle is πr²") but instead capture the underlying mathematical structure (e.g., "linear relationships have a constant rate of change; you can identify linearity from a table by checking if the differences are constant"). The Big Idea should apply to ANY problem testing the same mathematical concept.

**2a: First Draft (Detailed)**
Articulate what students need to know, do, or understand to get the exit ticket correct:
- Use bullet sub-points for each key understanding
- Explicitly connect to the exit ticket: "Here is the Big Idea, here is how it shows up in what students must do on the exit ticket, and here is where misconceptions can block them"
- Include mathematical structure and reasoning, not just procedures

**Example (from Gr8 Unit 4 Lesson 7 — All/Some/No Solutions):**
> - A one variable equation of the form ax + b = cx + d has infinite solutions if the coefficients are equal and the constants are equal (a = c and b = d)
> - A one variable equation has no solutions if the coefficients are equal but the constants are unequal (a = c but b ≠ d)
> - A one variable equation has one solution if the coefficients are unequal (a ≠ c)

**2b: Revised Draft (Simplified)**
Distill to:
- One sentence capturing the core mathematical principle
- 2-4 supporting structural patterns

**Example:**
> The structure of an equation helps us predict how many solutions it will have.
> - ax + b = ax + b (same coefficients, same constants): infinite solutions
> - ax + b = ax + d (same coefficients, different constants): no solutions
> - ax + b = cx + d (different coefficients): one solution

The simplified Big Idea goes into `strategyDefinition.bigIdea`. The detailed version goes into `strategyDefinition.bigIdeaDetailed`. The supporting patterns go into `strategyDefinition.bigIdeaSupportingPatterns`.

### STEP 3: Anticipate Misconceptions

**This is the most critical step — misconceptions DRIVE the number of worked example steps.**

For EACH anticipated misconception, provide:
1. **The misconception** — what the student incorrectly believes
2. **What their work looks like** — specific wrong answers/choices they'd make on the exit ticket
3. **Root cause** — why they make this mistake (what understanding they're missing)

**The number of misconceptions you identify here will determine the number of steps in your worked example.** Each step should directly address one or more misconceptions. If you identify 2 key stumbling blocks, design 2 steps. If you identify 4, design 4 steps. Aim for 2-5 misconceptions (3 is typical).

**Example (Gr8 Unit 4 Lesson 7):**
1. Student thinks that a different constant (other than 8) will yield ONE solution
   - What it looks like: For "one value of x," they write "10" (a constant, not a variable term)
   - Root cause: Doesn't understand that differing constants with same coefficients means NO solution
2. Student confuses no solution with infinite solutions
   - What it looks like: For "no values of x," writes 8; for "all values," writes something other than 8
   - Root cause: Can't distinguish the conditions for no vs. infinite solutions
3. Student assumes every equation has one solution
   - What it looks like: For "no values" and "all values," writes "Not possible"
   - Root cause: Has only seen equations with one solution, doesn't believe 0 or infinite solutions exist

### STEP 4: Worked Example Design Thinking

**Map each misconception to a worked example step. This is where you explicitly connect the design to the exit ticket.**

For each misconception from Step 3:
- Describe which step will address it and HOW
- If a misconception needs its own dedicated step, give it one
- If two misconceptions can be addressed in the same step, group them

Write a brief design rationale explaining:
- Why the worked example is structured this way
- How the steps connect back to what students need for the exit ticket
- What discovery questions ("What do you notice?") will guide students toward the Big Idea

**Example:**
> I want to create problems where students work with equations that have none, one, and infinite solutions so they can compare how they are different. I want them to notice both the structure of the equation and the structure of the solution.
> - Step 1 addresses misconception 3 (assumes one solution): Show equations with ONE solution so students see the baseline
> - Step 2 addresses misconception 1 (different constant = one solution): Show equations with NO solutions so students see what happens when coefficients match but constants differ
> - Step 3 addresses misconception 2 (confuses no/infinite): Show equations with INFINITE solutions so students can compare with Step 2

### STEP 5: Define ONE Clear Strategy

**The strategy thread runs through ALL slides.**

**5a: Name the Strategy**
Give it a clear, memorable name:
- "Balance and Isolate"
- "Find the Unit Rate"
- "Plot and Connect"

**5b: State it in One Sentence**
Student-facing explanation:
- "To solve this, we [VERB] the [OBJECT] to find [GOAL]"

**5c: Identify Moves (2-5, determined by misconceptions)**
Each move addresses one or more misconceptions from Step 3. The number of moves should match the misconception-to-step mapping from Step 4.
Each move: [Action verb] → [What it accomplishes] → [Which misconception it addresses]

**5d: Define Consistent Language**
These step verbs MUST:
- Be the EXACT same throughout all slides
- Appear on every slide header ("STEP 1: [VERB]")
- Be referenced in CFU questions

**5e: Define Discovery Questions**
For each step, define a "What do you notice?" style question that guides students toward the Big Idea:
- "What do you notice about the structure of the equations?"
- "What pattern do you see in the solutions?"
- "How does this compare to what we saw in the previous step?"

### STEP 6: Create Three Scenarios
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

**IMPORTANT: Scenario 1 Diagram Evolution**
Scenario 1 is the worked example, so it MUST have its own `diagramEvolution` with its specific numbers in the ASCII art:
- The `diagramEvolution` shows how the visual develops step-by-step for Scenario 1's context/numbers
- Scenario 1's `diagramEvolution` will be used for the worked example slides (slides 3-6)
- Scenarios 2 and 3 do NOT need `diagramEvolution` (they are practice problems on the printable slide)

Example: If the mastery check divides 24 among 4 groups but Scenario 1 divides 30 nuggets among 5 students, Scenario 1 needs its own `diagramEvolution` showing 30 ÷ 5 = 6 in the ASCII art, NOT the mastery check's 24 ÷ 4 = 6.

### STEP 7: Determine Visual Type

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

### STEP 8: SVG Planning (REQUIRED if Visual Type is "svg-visual")

**IF you selected "svg-visual" above, you MUST plan your SVG now.**

**For coordinate-graph subtype**, complete graph planning to ensure math is calculated BEFORE slide generation:

**8a: List Your Equations**
Write out every line/equation that will appear:
```
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
```

**8b: Calculate Key Data Points (REQUIRED in graphPlan.keyPoints)**
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

**8c: Determine Scale (≤10 ticks on each axis)**
- X_MAX: rightmost x-value needed (common: 4, 5, 6, 8, 10)
  - X_MAX ≤6: count by 1s
  - X_MAX >6: count by 2s
- Y_MAX: use the scale tables in `graph-planning.md` to get exactly 9-10 ticks
  - Count by 1s up to Y_MAX=9
  - Count by 2s up to Y_MAX=18
  - Count by 4s up to Y_MAX=36
  - Count by 5s up to Y_MAX=45
  - See `graph-planning.md` for full table

**8d: Plan Annotations**
What mathematical relationship to show?
- Y-intercept shift (vertical arrow showing difference)
- Parallel lines (same slope label)
- Slope comparison
- Intersection point

**Include these calculated values in the graphPlan field of your output.**

### STEP 9: Generate Diagram Evolution Preview (REQUIRED for ALL worked examples)

**After planning the visual structure, create a step-by-step evolution showing how the diagram develops across slides.**

This is the most important preview for teachers - it shows EXACTLY how the visual will build from initial state through each step of the solution.

**9a: Create Initial State**
Show the diagram as it appears on the Problem Setup slide (Slide 3):
- For coordinate graphs: axes with scale labels, but no lines drawn yet
- For tape diagrams: the total bar with the unknown marked
- For hanger diagrams: the initial equation on the balance
- For number lines: the empty line with range marked

**9b: Create Step-by-Step Evolution**
For EACH strategy move, show:
1. The diagram state AFTER that step is completed (building cumulatively on previous steps)
2. What was added/changed from the previous state
3. Use ASCII art that matches the visual type

**9c: Match Steps to Strategy Moves**
The number of steps in diagramEvolution MUST match strategyDefinition.moves.length:
- 2 moves = 2 evolution steps
- 3 moves = 3 evolution steps
- 5 moves = 5 evolution steps

**Example for Coordinate Graph (2-line system of equations):**
```json
"diagramEvolution": {
  "initialState": "    y\n  50│\n    │\n  40│\n    │\n  30│\n    │\n  20│\n    │\n  10│\n    │\n   0└────┬────┬────┬────┬──── x\n        2    4    6    8",
  "steps": [
    {
      "header": "STEP 1: IDENTIFY",
      "ascii": "    y\n  50│              ╱\n    │            ╱\n  40│          ╱\n    │        ╱\n  30│      ╱\n    │    ╱\n  20├──●           ← y-intercept (0, 20)\n    │╱\n  10│\n    │\n   0└────┬────┬────┬────┬──── x\n        2    4    6    8",
      "changes": ["Draw first line y = 5x + 20 (blue)", "Mark y-intercept at (0, 20)"]
    },
    {
      "header": "STEP 2: COMPARE",
      "ascii": "    y\n  50│              ╱\n    │            ╱\n  40│          ╱  ╲\n    │        ╱      ╲\n  30├──────●          ╲   ← y-intercept (0, 30)\n    │    ╱              ╲\n  20├──●\n    │╱\n  10│\n    │\n   0└────┬────┬────┬────┬──── x\n        2    4    6    8",
      "changes": ["Draw second line y = 3x + 30 (green)", "Mark y-intercept at (0, 30)"]
    },
    {
      "header": "STEP 3: SOLVE",
      "ascii": "    y\n  50│              ╱\n  45├────────────★     ← intersection (5, 45)\n  40│          ╱╲\n    │        ╱    ╲\n  30├──────●        ╲\n    │    ╱            ╲\n  20├──●\n    │╱\n  10│\n    │\n   0└────┬────┬────┬────┬──── x\n        2    4    6    8",
      "changes": ["Mark intersection point at (5, 45)", "Highlight: This is where both equations are equal"]
    }
  ]
}
```

**Example for Tape Diagram (division problem):**
```json
"diagramEvolution": {
  "initialState": "Total: 24 stickers to share among 4 friends\n\n┌────────────────────────────────────────┐\n│                 24                     │\n└────────────────────────────────────────┘",
  "steps": [
    {
      "header": "STEP 1: PARTITION",
      "ascii": "┌──────────┬──────────┬──────────┬──────────┐\n│    ?     │    ?     │    ?     │    ?     │ = 24\n└──────────┴──────────┴──────────┴──────────┘\n    ↑           ↑           ↑           ↑\n Friend 1   Friend 2   Friend 3   Friend 4",
      "changes": ["Divide tape into 4 equal parts", "Mark each part with ? (unknown)"]
    },
    {
      "header": "STEP 2: CALCULATE",
      "ascii": "┌──────────┬──────────┬──────────┬──────────┐\n│    6     │    6     │    6     │    6     │ = 24 ✓\n└──────────┴──────────┴──────────┴──────────┘\n\n24 ÷ 4 = 6 stickers per friend",
      "changes": ["Calculate: 24 ÷ 4 = 6", "Fill in each box with 6"]
    }
  ]
}
```

---

## Completion Checklist (Verify Before Responding)

- [ ] problemTranscription contains EXACT verbatim text from image (all text, numbers, diagrams)
- [ ] Problem was FULLY solved step-by-step (Step 1a)
- [ ] Problem type is SPECIFIC (not vague like "algebra") (Step 1b)
- [ ] Big Idea is a **generalizable mathematical principle** — not context-specific (Step 2)
- [ ] Big Idea has TWO DRAFTS: detailed (bigIdeaDetailed) and simplified (bigIdea) (Step 2)
- [ ] Anticipated misconceptions are structured with studentWorkExample and rootCause (Step 3)
- [ ] Each misconception maps to a worked example step via addressedInStep (Step 4)
- [ ] Number of strategy moves matches the misconception-to-step mapping (Step 5)
- [ ] Design rationale explains WHY the WE is structured this way (Step 4)
- [ ] Discovery questions guide students toward Big Idea (Step 5e)
- [ ] Strategy has consistent verbs used throughout all slides (Step 5d)
- [ ] CFU question templates reference strategy verbs
- [ ] ALL 3 scenarios use DIFFERENT contexts from the mastery check
- [ ] All scenarios use the SAME mathematical structure and strategy
- [ ] **diagramEvolution is included** showing how content develops across slides:
  - [ ] initialState shows the Problem Setup slide
  - [ ] keyElements array explains each element and what it represents
  - [ ] steps array has one entry per strategy move
  - [ ] Each step's header matches the slide header ("STEP N: VERB")
  - [ ] Steps build cumulatively (each shows previous + new additions)
  - [ ] Changes array lists what was added/modified in that step
- [ ] **IF visualType is "svg-visual":**
  - [ ] svgSubtype is specified (coordinate-graph, diagram, shape, number-line, or other)
  - [ ] **IF svgSubtype is "coordinate-graph":**
    - [ ] problemAnalysis.graphPlan has equations, keyPoints, scale, and annotations for the mastery check
    - [ ] **EACH scenario has its own graphPlan** with that scenario's specific equations and values
    - [ ] All graphPlans have: equations with slope/y-intercept, proper scale, and annotations
    - [ ] **keyPoints array includes:** y-intercepts, solution points, and any points to be labeled on the graph
- [ ] **Scenario 1 has its own diagramEvolution** with Scenario 1's specific values in the ASCII art (not the mastery check's values)

---

## ⚠️ CRITICAL: REQUIRED FIELDS (DO NOT OMIT)

**Your response MUST include ALL of these fields or it will fail validation:**

1. **scenarios[0].diagramEvolution** - SCENARIO 1 MUST HAVE diagramEvolution (used for worked example slides)
   - Scenario 1 is the worked example, so it needs `diagramEvolution` with its specific numbers
   - `initialState`: ASCII showing Problem Setup slide for Scenario 1's numbers
   - `keyElements`: Array explaining each element and what it represents mathematically
   - `steps`: Array with one entry per strategy move (2-5 entries)
   - Each step needs: `header`, `ascii`, `changes[]`

2. **strategyDefinition.moves** - Must have 2-5 moves (determined by misconception count; 3 is typical)

3. **scenarios** - Must have exactly 3 scenarios with different contexts

4. **anticipatedMisconceptions** - Must be an array of structured misconception objects with addressedInStep

5. **strategyDefinition.bigIdeaDetailed** - Detailed Big Idea (first draft)

6. **strategyDefinition.designRationale** - Why the WE is structured this way

7. **strategyDefinition.discoveryQuestions** - One per step

**If you skip diagramEvolution on Scenario 1, validation will fail!**

---

## Output Format

**For the complete JSON output schema, see:**
```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/output-schema.md
```

Return ONLY valid JSON matching that schema. Do not include any explanation or markdown formatting.
