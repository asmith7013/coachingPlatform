# Phase 1: Collect & Analyze

## Purpose

Gather all required information from the user, then deeply analyze the **mastery check question** to understand its mathematical structure and define ONE clear strategy.

## Output Format: PPTX-Compatible HTML

All slides will be **PPTX-compatible HTML** (960×540px, light theme). See `03-generate-slides/02-technical-rules.md` for technical specs.

## Prerequisites

- User has requested a worked example
- You have NOT yet seen the problem image

---

## CRITICAL: Understanding the Input

**The problem image the user provides is the MASTERY CHECK QUESTION** - the actual question students will answer on their exit ticket or assessment.

**Your job is to create a worked example that:**

1. Teaches the SAME mathematical skill
2. Uses the SAME strategy and steps
3. Uses a **DIFFERENT context and numbers** than the mastery check

**Why different context?** Students should learn the strategy from the worked example, then apply it independently to the mastery check. If the worked example uses the same numbers/context, students can just copy the answer without learning the underlying skill.

**ALL THREE SCENARIOS must use different contexts:**

- Scenario 1 (Worked Example): Different context from mastery check
- Scenario 2 (Practice): Different context from mastery check AND Scenario 1
- Scenario 3 (Practice): Different context from all above

---

## Step 1.1: Collect Required Information

**Prompt the user for ALL of these:**

```
To create a worked example, I need the following information:

1. **Grade Level**: What grade is this for? (Valid: "6", "7", "8", or "Algebra 1")
2. **Unit Number**: What unit is this from? (e.g., 4)
3. **Lesson Number**: What lesson is this? (e.g., 1)
4. **Learning Goals**: What should students learn from this?
   (e.g., "Students will be able to solve linear equations using the distributive property")
5. **Mastery Check Question**: Please upload an image of the mastery check/exit ticket question.
   (I'll create a worked example that teaches this skill using DIFFERENT numbers and context)

**Optional - Additional Context:**
6. **Reference Images**: Any additional images for context (previous worked examples, diagrams, related problems)
7. **Notes for AI**: Any preferences like "Focus on the balance method strategy", "Want practice with distributing negative numbers", "Use gaming themes for practice problems"

Once I have the required items (especially the mastery check image), I'll analyze the problem and confirm my approach with you before creating slides.
```

**WAIT** for the user to provide all information. Do NOT proceed until you have:

- [ ] Grade level
- [ ] Unit number
- [ ] Lesson number
- [ ] Learning goals
- [ ] Mastery check question image
- [ ] (Optional) Additional reference images
- [ ] (Optional) Notes/preferences for the AI

---

## Step 1.2: Look Up Scope and Sequence ID

After receiving the grade, unit, and lesson, query MongoDB:

```bash
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const grade = '[GRADE]';
const unitNumber = [UNIT_NUMBER];
const lessonNumber = [LESSON_NUMBER];

const result = db['scope-and-sequence'].findOne({
  grade: grade,
  unitNumber: unitNumber,
  lessonNumber: lessonNumber
});

if (result) {
  print('Scope and Sequence ID:', result._id.toString());
  print('Lesson Name:', result.lessonName);
  print('Unit:', result.unit);
} else {
  print('No matching scope and sequence found');
}
" --quiet
```

Store the `scopeAndSequenceId` for later. If not found, continue anyway (set to `undefined`).

---

## Step 1.3: Backward Planning Analysis

**CRITICAL: Do NOT skip this step. Do NOT proceed until complete.**

After receiving the problem image (and any additional context), perform a full backward planning analysis.

### Using Additional Context (if provided)

If the teacher provided **reference images** or **notes**, incorporate them into your analysis:

- **Reference images**: Use these to understand related concepts, see how similar problems were taught, or identify visual styles the teacher prefers
- **Strategy preferences**: If the teacher says "focus on the balance method", prioritize that strategy even if alternatives exist
- **Context themes**: If the teacher suggests "use gaming themes", incorporate that into scenario creation
- **Focus areas**: If the teacher says "want practice with distributing negatives", ensure the worked example emphasizes that skill

### 1.3a: Follow the Backward Planning Protocol

**Read the detailed analysis instructions:**

```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md
```

Follow Steps 1-6 in that file exactly. The protocol is:

1. **Deep Exit Ticket Analysis** — solve step-by-step, identify mathematical structure, articulate what correct understanding looks like
2. **Develop Big Idea** — two drafts: detailed (know/do/understand) → simplified (one sentence + supporting patterns)
3. **Anticipate Misconceptions** — 2-5 structured misconceptions that DRIVE the step count. Each has: misconception, studentWorkExample, rootCause, addressedInStep
4. **Design Thinking** — map each misconception to a worked example step, write design rationale
5. **Define Strategy** — moves determined by misconceptions (not arbitrary), discovery questions for each step
6. **Create Scenarios** — 3 different contexts from the mastery check

**The output schema is defined in:**

```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/output-schema.md
```

Your output MUST match that JSON schema exactly. Do NOT use the old "Common Mistakes" or "Key Challenge" format.

### 1.3b: Determine visual type

**CRITICAL: ALL graphics/diagrams MUST use SVG.**
SVG is required for PPTX export compatibility. The only exception is simple HTML tables.

**Visual Type Options:**

- **Text-only**: No graphics needed (rare - only pure text/equation problems)
- **HTML table**: Simple data tables with highlighting (HTML `<table>`)
- **SVG visual**: ALL other graphics - this includes:
  - Coordinate planes and graphs
  - Hanger diagrams and balance problems
  - Geometric shapes and diagrams
  - Number lines and bar models
  - Any custom visual representation

**If your problem needs ANY visual beyond a simple table, you MUST use SVG.**

### 1.3c: SVG Planning (REQUIRED if visual type is "SVG visual")

**IF you selected "SVG visual" above, you MUST plan your SVG now.**

**For coordinate plane graphs:**

```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/graph-planning.md
```

Complete ALL steps in that file and include the GRAPH PLAN in your output below.

**For other SVG types (diagrams, shapes, etc.):**
Plan the visual elements:

- What shapes/elements are needed?
- What colors will represent each element?
- What annotations will show the math?
- How will the visual change across slides 2-8?

**IF you selected "Text-only" or "HTML table", skip to the output template.**

### 1.3d: Diagram Evolution (REQUIRED for ALL worked examples)

**⚠️ CRITICAL: This step is REQUIRED. Do NOT skip it.**

Create a **Diagram Evolution** showing how the visual develops step-by-step across slides. This is what teachers need to visualize before approving generation.

**Reference the canonical patterns:**

```
Read: .claude/skills/create-worked-example-sg/reference/diagram-patterns.md
```

Use the ASCII representations in that file as a guide. Generate ASCII previews that match the structure for your visual type.

**Read the detailed instructions and output schema:**

```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/output-schema.md
```

See the "STEP 8: Generate Diagram Evolution Preview" section in analyze-problem.md for complete instructions and examples.

**The Diagram Evolution MUST include:**

1. **initialState**: ASCII showing the diagram on Problem Setup slide (empty axes, blank tape, etc.)
2. **keyElements**: Array explaining each element and what it represents mathematically
3. **steps**: Array with one entry per strategy move (2-5 entries), each containing:
   - `header`: The slide header (e.g., "STEP 1: IDENTIFY")
   - `ascii`: ASCII showing the diagram state AFTER that step (building cumulatively)
   - `changes`: Array of what was added/changed from previous step

**Why this matters:**

- Teachers can see EXACTLY how the visual will build across slides
- Catches issues like "wrong step order" or "missing annotation" BEFORE slide generation
- The number of steps MUST match `strategyDefinition.moves.length`

---

## Step 1.4: Create Progress File

**After completing the backward planning analysis, create the progress tracking file.**

Use the Write tool to create `.worked-example-progress.json` in the presentation directory:

**File path:** `src/app/presentations/{slug}/.worked-example-progress.json`

Where `{slug}` is generated from the strategy name and grade level (e.g., `balance-isolate-hanger-grade8`).

```json
{
  "slug": "[slug]",
  "phase": 1,
  "phaseName": "Collect & Analyze",
  "gradeLevel": "[grade]",
  "unitNumber": [unit],
  "lessonNumber": [lesson],
  "scopeAndSequenceId": "[id or null]",
  "strategyName": "[from STRATEGY DEFINITION]",
  "strategySteps": ["[VERB1]", "[VERB2]", "...(2-5 verbs, determined by misconception count)"],
  "problemType": "[from PROBLEM ANALYSIS]",
  "userConfirmed": false,
  "slidesCompleted": [],
  "totalSlides": 0,  // Will be 14-16 for PPTX format
  "scenarios": [],
  "createdAt": "[ISO timestamp]",
  "updatedAt": "[ISO timestamp]"
}
```

**IMPORTANT:**

- Create the directory first: `mkdir -p src/app/presentations/{slug}`
- This file tracks progress and enables resumption if interrupted
- The file will be deleted at the end of Phase 4 upon successful completion

---

## Phase 1 Completion Checklist

Before proceeding, verify you have:

- [ ] All 5 required user inputs collected (grade, unit, lesson, learning goals, mastery check image)
- [ ] (If provided) Additional context incorporated into analysis
- [ ] Scope and sequence ID looked up (or noted as undefined)
- [ ] Full backward planning analysis completed (following analyze-problem.md Steps 1-6):
  - [ ] Deep Exit Ticket Analysis (solved step-by-step, mathematical structure identified)
  - [ ] Big Idea developed (two drafts: detailed → simplified + supporting patterns)
  - [ ] Anticipated Misconceptions identified (2-5 structured misconceptions with studentWorkExample, rootCause, addressedInStep)
  - [ ] Design Thinking completed (each misconception mapped to a WE step, design rationale written)
  - [ ] Strategy defined (moves determined by misconception count, discovery questions for each step)
  - [ ] 3 scenarios created (all different contexts from mastery check)
- [ ] Output matches output-schema.md JSON structure
- [ ] Strategy has 2-5 moves determined by misconception count (each misconception maps to a step via addressedInStep)
- [ ] Visual type determined: Text-only, HTML table, or SVG visual
- [ ] **Diagram Evolution preview created** showing step-by-step progression (how content builds across slides)
- [ ] **IF visual type is SVG visual:** SVG PLAN completed (elements, layout, annotations per slide)
- [ ] Progress file created at `src/app/presentations/{slug}/.worked-example-progress.json`

---

## NEXT PHASE

**When Phase 1 is complete:**

Use the Read tool to read the Phase 2 instructions:

```
Read: .claude/skills/create-worked-example-sg/phases/02-confirm-and-plan.md
```

Do NOT proceed to Phase 2 until the backward planning analysis is complete and output matches the schema.
