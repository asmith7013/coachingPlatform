# Phase 1: Collect & Analyze

## Purpose
Gather all required information from the user, then deeply analyze the **mastery check question** to understand its mathematical structure and define ONE clear strategy.

## Output Format: PPTX-Compatible HTML
All slides will be **PPTX-compatible HTML** (960×540px, light theme). See `03-generate-slides/protocol.md` for technical specs.

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

Once I have ALL of these (especially the mastery check image), I'll analyze the problem and confirm my approach with you before creating slides.
```

**WAIT** for the user to provide all information. Do NOT proceed until you have:
- [ ] Grade level
- [ ] Unit number
- [ ] Lesson number
- [ ] Learning goals
- [ ] Mastery check question image

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

## Step 1.3: Deep Analysis of the Problem

**CRITICAL: Do NOT skip this step. Do NOT proceed until complete.**

After receiving the problem image, thoroughly analyze it:

### 1.3a: Solve the problem yourself
- Work through it step-by-step
- Write out your complete solution
- Identify the final answer

### 1.3b: Identify the mathematical structure
- What SPECIFIC type of problem is this?
  - Be precise: "solving two-step equations with variables on both sides"
  - NOT vague: "algebra"
- What mathematical relationships are present?
- What prior knowledge does this assume?

### 1.3c: Identify what makes this challenging
- Where might students make mistakes?
- What's the key insight needed?
- What misconceptions does this address?

### 1.3d: Note constraints
- What format is the answer expected in?
- Any special conditions (positive numbers, whole numbers, etc.)?
- Does it ask for explanation/reasoning?

### 1.3e: Determine visual type
- **HTML/CSS**: Tables, text problems, static equations
- **HTML diagrams**: Hanger diagrams, geometric shapes, balance problems
- **SVG graphs**: Coordinate planes, linear equations, graphs, data visualizations

### 1.3f: Graph Planning (REQUIRED if visual type is SVG graphs)

**IF you selected "SVG graphs" above, you MUST complete graph planning NOW.**

```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/graph-planning.md
```

Complete ALL steps in that file and include the GRAPH PLAN in your output below.

**IF you selected "HTML/CSS" or "HTML diagrams", skip to the output template.**

### Output Template (YOU MUST COMPLETE THIS):

```
PROBLEM ANALYSIS
================
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
Visual Type: [HTML/CSS | HTML diagrams | SVG graphs]

GRAPH PLAN (only if Visual Type is SVG graphs):
===============================================
Equations (with EXPLICIT slope and y-intercept):
- Line 1: [equation], slope=[m], y-intercept=[b] ([color])
- Line 2: [equation], slope=[m], y-intercept=[b] ([color])

Scale:
- X_MAX: [rightmost x-value]
- Y_MAX: [top y-value, rounded to nice number]
- X-axis labels: [list]
- Y-axis labels: [list]

Key Points (CALCULATE THESE - ensures math accuracy):
- Line 1 at x=0: y=[calculated]
- Line 1 at x=[X_MAX/2]: y=[calculated]
- Line 1 at x=[X_MAX]: y=[calculated]
- Line 2 at x=0: y=[calculated]
- Line 2 at x=[X_MAX/2]: y=[calculated]
- Line 2 at x=[X_MAX]: y=[calculated]

Annotation:
- Relationship to show: [what mathematical concept]
- Annotation type: [y-intercept-shift / parallel-label / slope-comparison / etc.]
- Label text: [e.g., "+20"]
```

---

## Step 1.4: Define the Strategy Thread

**Before ANY content creation, define ONE clear strategy.**

### 1.4a: Name the strategy
Give it a clear, memorable name:
- "Balance and Isolate"
- "Find the Unit Rate"
- "Plot and Connect"
- "Table to Equation"

### 1.4b: State it in one sentence
Student-facing explanation:
- "To solve this, we [VERB] the [OBJECT] to find [GOAL]"
- Example: "To solve this, we REMOVE equal items from BOTH SIDES to ISOLATE the unknown."

### 1.4c: Identify the 2-3 moves (maximum 3)
- Move 1: [Action verb] → [What it accomplishes]
- Move 2: [Action verb] → [What it accomplishes]
- Move 3 (if needed): [Action verb] → [What it accomplishes]

### 1.4d: Define consistent language
These step names MUST:
- Use the EXACT same verbs throughout all slides
- Appear on every slide header
- Be referenced in CFU questions

### Output Template (YOU MUST COMPLETE THIS):

```
STRATEGY DEFINITION
===================
Strategy Name: "[Name]"
One-Sentence Summary: "[Student-facing explanation]"

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

---

## Step 1.5: Create Progress File

**After completing both analysis templates, create the progress tracking file.**

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
  "strategySteps": ["[VERB1]", "[VERB2]", "[VERB3 if applicable]"],
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
- [ ] All 5 user inputs collected
- [ ] Scope and sequence ID looked up (or noted as undefined)
- [ ] PROBLEM ANALYSIS template completed
- [ ] STRATEGY DEFINITION template completed
- [ ] Strategy has exactly 2-3 moves with consistent verbs
- [ ] **IF visual type is SVG graphs:** GRAPH PLAN completed with scale and annotations
- [ ] Progress file created at `src/app/presentations/{slug}/.worked-example-progress.json`

---

## NEXT PHASE

**When Phase 1 is complete:**

Use the Read tool to read the Phase 2 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/02-confirm-and-plan.md
```

Do NOT proceed to Phase 2 until you have completed BOTH output templates above.
