# Phase 2: Confirm & Plan

## Purpose
Present your analysis to the user, get their confirmation, and plan the three scenarios - all using DIFFERENT contexts from the mastery check.

## Output Format: PPTX-Compatible HTML
All slides will be **PPTX-compatible HTML** (960×540px, light theme, 9 slides). See `03-generate-slides/protocol.md` for technical specs.

## Prerequisites
- Phase 1 complete
- You have completed PROBLEM ANALYSIS template
- You have completed STRATEGY DEFINITION template

---

## REMINDER: Context Separation

The user provided a **mastery check question**. ALL scenarios you create must use **different contexts and numbers** from that question:

| What | Context |
|------|---------|
| Mastery Check (user's input) | The ACTUAL question students will answer |
| Scenario 1 (Worked Example) | DIFFERENT context - teaches the strategy |
| Scenario 2 (Practice) | DIFFERENT context - first practice |
| Scenario 3 (Practice) | DIFFERENT context - second practice |

**Students will see:** Worked Example → Practice 1 → Practice 2 → (then later) Mastery Check

---

## Step 2.1: Present Analysis to User

**Show the user your understanding and WAIT for confirmation.**

Use this exact template:

```
Based on the mastery check question you provided, here's my understanding:

**Problem Type:** [from PROBLEM ANALYSIS]
**Strategy I'll Use:** [strategy name from STRATEGY DEFINITION]
**One-Sentence Summary:** [from STRATEGY DEFINITION]

**The Steps:**
1. [STEP VERB]: [brief description]
2. [STEP VERB]: [brief description]
3. [STEP VERB]: [brief description, if needed]

**The three scenarios (all DIFFERENT from the mastery check):**
- Scenario 1 (worked example): [context + what makes it engaging]
- Scenario 2 (practice): [different context]
- Scenario 3 (practice): [different context]

Note: These scenarios all teach the same skill as your mastery check but use different numbers and contexts, so students learn the strategy without seeing the actual answer.

Does this match what you're looking for? Should I proceed or adjust anything?
```

---

## Step 2.2: WAIT for User Confirmation

**STOP HERE. Do not proceed until the user responds.**

The user might:
- **Confirm** ("yes", "proceed", "looks good") → Continue to Step 2.3
- **Request changes** → Adjust your analysis/strategy and re-present
- **Ask questions** → Answer them, then re-confirm

**Do NOT generate slides until the user explicitly confirms.**

---

## Step 2.3: Generate Scenarios (All Different from Mastery Check)

**Only after user confirms**, finalize the three scenarios.

### Critical: Context Separation

**NONE of the scenarios should use the same context or numbers as the mastery check question the user provided.**

The mastery check is what students will answer AFTER completing the worked example and practice. Your scenarios prepare them for it without giving away the answer.

### Scenario Requirements

Each scenario MUST:
- Use the **exact same mathematical structure** as the mastery check
- Require the **exact same strategy** to solve
- Use **DIFFERENT numbers and context** from the mastery check (and from each other)
- Be solvable using the **exact same steps in the exact same order**

### Scenario Design Principles

**DO:**
- Match context to grade level interests (gaming, social media, sports, etc.)
- Keep mathematical difficulty identical to mastery check
- Ensure the same moves apply in the same order
- Use engaging, real-world situations
- Give each scenario a visual anchor (icon/theme)
- **Verify each scenario is clearly different from the mastery check**

**DO NOT:**
- Use the same context as the mastery check question
- Use the same numbers as the mastery check question
- Change the problem type
- Add or remove steps from the solution
- Introduce new mathematical concepts
- Create scenarios requiring a different strategy

### Output Template:

```
MASTERY CHECK CONTEXT (from user's input):
[Brief description of the context/numbers in the user's question]

THREE SCENARIOS (all DIFFERENT from mastery check):
===================================================

Scenario 1 (Worked Example):
- Context: [engaging scenario name - DIFFERENT from mastery check]
- Theme/Icon: [visual anchor]
- Numbers: [specific values - DIFFERENT from mastery check]
- Same mathematical structure: [yes/explain how]
- Different from mastery check: [yes/explain what's different]
- GraphPlan (if coordinate-graph): [equations, scale, keyPoints, annotations for THIS scenario's numbers]

Scenario 2 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenario 1: [yes/explain]
- GraphPlan (if coordinate-graph): [equations, scale, keyPoints, annotations for THIS scenario's numbers]

Scenario 3 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Uses same strategy: [yes/explain how]
- Different from mastery check AND Scenarios 1-2: [yes/explain]
- GraphPlan (if coordinate-graph): [equations, scale, keyPoints, annotations for THIS scenario's numbers]
```

**Note on GraphPlan:** If the problem type requires a coordinate graph (`svgSubtype: coordinate-graph`), each scenario MUST have its own `graphPlan` with pre-calculated equations and values specific to that scenario's numbers. This ensures mathematically accurate graphs during slide generation.

---

## Step 2.4: Update Progress File

After user confirms and scenarios are defined, update the progress file:

**File:** `src/app/presentations/{slug}/.worked-example-progress.json`

Update these fields:
```json
{
  "phase": 2,
  "phaseName": "Confirm & Plan",
  "userConfirmed": true,
  "scenarios": ["[Scenario 1 name]", "[Scenario 2 name]", "[Scenario 3 name]"],
  "totalSlides": [estimated count: 14-16],
  "updatedAt": "[ISO timestamp]"
}
```

Use the Read tool to read the current file, then use Edit to update only the changed fields.

---

## Phase 2 Completion Checklist

Before proceeding, verify:
- [ ] User has explicitly confirmed your understanding
- [ ] Three scenarios are defined
- [ ] All scenarios use the SAME strategy as the mastery check
- [ ] All scenarios have the SAME mathematical structure as the mastery check
- [ ] **ALL scenarios use DIFFERENT contexts from the mastery check**
- [ ] **ALL scenarios use DIFFERENT numbers from the mastery check**
- [ ] Each scenario has an engaging context and visual anchor
- [ ] Progress file updated with `userConfirmed: true` and `scenarios` array

---

## NEXT PHASE

**When Phase 2 is complete (user has confirmed):**

Use the Read tool to read the Phase 3 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/index.md
```

Do NOT proceed to Phase 3 until the user has explicitly confirmed.
