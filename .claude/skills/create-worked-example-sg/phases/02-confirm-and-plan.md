# Phase 2: Confirm & Plan

## Purpose
Present your analysis to the user, get their confirmation, and plan the three scenarios.

## Prerequisites
- Phase 1 complete
- You have completed PROBLEM ANALYSIS template
- You have completed STRATEGY DEFINITION template

---

## Step 2.1: Present Analysis to User

**Show the user your understanding and WAIT for confirmation.**

Use this exact template:

```
Based on the problem you provided, here's my understanding:

**Problem Type:** [from PROBLEM ANALYSIS]
**Strategy I'll Use:** [strategy name from STRATEGY DEFINITION]
**One-Sentence Summary:** [from STRATEGY DEFINITION]

**The Steps:**
1. [STEP VERB]: [brief description]
2. [STEP VERB]: [brief description]
3. [STEP VERB]: [brief description, if needed]

**The three scenarios will be:**
- Scenario 1 (worked example): [context + what makes it engaging]
- Scenario 2 (practice): [different context]
- Scenario 3 (practice): [different context]

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

## Step 2.3: Generate Exit Ticket Scenarios

**Only after user confirms**, finalize the three scenarios.

### Scenario Requirements

Each scenario MUST:
- Use the **exact same mathematical structure** as the original
- Require the **exact same strategy** to solve
- Use **different numbers and context** to prevent memorization
- Be solvable using the **exact same steps in the exact same order**

### Scenario Design Principles

**DO:**
- Match context to grade level interests (gaming, social media, sports, etc.)
- Keep mathematical difficulty identical
- Ensure the same moves apply in the same order
- Use engaging, real-world situations
- Give each scenario a visual anchor (icon/theme)

**DO NOT:**
- Change the problem type
- Add or remove steps from the solution
- Introduce new mathematical concepts
- Create scenarios requiring a different strategy

### Output Template:

```
THREE SCENARIOS
===============

Scenario 1 (Worked Example):
- Context: [engaging scenario name]
- Theme/Icon: [visual anchor]
- Numbers: [specific values]
- Same structure as original: [yes/explain how]

Scenario 2 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Uses same strategy: [yes/explain how]

Scenario 3 (Practice):
- Context: [different engaging scenario]
- Theme/Icon: [visual anchor]
- Numbers: [different values]
- Uses same strategy: [yes/explain how]
```

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
  "totalSlides": [estimated count: 8-11],
  "updatedAt": "[ISO timestamp]"
}
```

Use the Read tool to read the current file, then use Edit to update only the changed fields.

---

## Phase 2 Completion Checklist

Before proceeding, verify:
- [ ] User has explicitly confirmed your understanding
- [ ] Three scenarios are defined
- [ ] All scenarios use the SAME strategy
- [ ] All scenarios have the SAME mathematical structure
- [ ] Each scenario has an engaging context and visual anchor
- [ ] Progress file updated with `userConfirmed: true` and `scenarios` array

---

## NEXT PHASE

**When Phase 2 is complete (user has confirmed):**

Use the Read tool to read the Phase 3 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides.md
```

Do NOT proceed to Phase 3 until the user has explicitly confirmed.
