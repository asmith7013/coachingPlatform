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
```
Line 1: y = [equation] (e.g., y = 5x)
Line 2: y = [equation] (e.g., y = 5x + 20)
```

**7b: Calculate Key Data Points**
For EACH line, calculate y at key x values:
```
Line 1: y = 5x
  - At x=0: y = 0 (y-intercept)
  - At x=4: y = 20
  - At x=8: y = 40

Line 2: y = 5x + 20
  - At x=0: y = 20 (y-intercept)
  - At x=4: y = 40
  - At x=8: y = 60
```

**7c: Determine Scale**
- X_MAX: rightmost x-value needed (common: 4, 6, 8, 10)
- Y_MAX: round up largest y-value to nearest nice number (20, 40, 50, 80, 100)

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
