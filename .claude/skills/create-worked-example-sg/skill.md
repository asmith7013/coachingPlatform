---
name: Create Worked Example
description: Generate HTML-based slide decks for math worked examples. Use when user says "create worked example" or needs visual step-by-step math instruction with CFU questions and practice problems.
---

# Create Worked Example (HTML Slides)

You are an expert educational content creator specializing in mathematics pedagogy and worked example slide decks.

**Your task:** Generate HTML-based slide decks for math worked examples and save them to the database.

## How This Skill Works

This skill is divided into **4 main phases** for creating new decks, plus **Phase 5** for updating existing decks.

**IMPORTANT:** You MUST read each phase file using the Read tool before executing that phase. Do NOT try to complete the entire workflow from memory.

## Choosing Your Path

**Creating a NEW worked example deck?**
→ Start with Phase 1 (full workflow below)

**Updating an EXISTING deck (changing practice problems, fixing content)?**
→ Go directly to Phase 5: `phases/05-updating-decks.md`

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: COLLECT & ANALYZE                                                 │
│  File: phases/01-collect-and-analyze.md                                     │
│                                                                             │
│  Trigger: User says "create worked example"                                 │
│  Actions: Gather inputs, analyze problem, define ONE strategy               │
│  Output: PROBLEM ANALYSIS + STRATEGY DEFINITION                             │
│  Done when: You have completed both output templates                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: CONFIRM & PLAN                                                    │
│  File: phases/02-confirm-and-plan.md                                        │
│                                                                             │
│  Trigger: Phase 1 complete                                                  │
│  Actions: Present analysis to user, WAIT for confirmation, plan scenarios   │
│  Output: User approval + 3 scenario descriptions                            │
│  Done when: User says "proceed" or similar                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: GENERATE SLIDES                                                   │
│  File: phases/03-generate-slides.md                                         │
│                                                                             │
│  Trigger: User confirms in Phase 2                                          │
│  Actions: Create 8-11 HTML slides following patterns                        │
│  Output: HTML files written to src/app/presentations/{slug}/                │
│  Done when: All slide files are written                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SAVE TO DATABASE                                                  │
│  File: phases/04-save-to-database.md                                        │
│                                                                             │
│  Trigger: All slides written in Phase 3                                     │
│  Actions: Create metadata.json, sync to MongoDB                             │
│  Output: Database entry created, URL provided to user                       │
│  Done when: User receives the presentation URL                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: UPDATING EXISTING DECKS (Alternative Path)                        │
│  File: phases/05-updating-decks.md                                          │
│                                                                             │
│  Trigger: User wants to modify an existing deck                             │
│  Actions: Read existing slide, make targeted edits, sync to database        │
│  Output: Updated deck with preserved formatting                             │
│                                                                             │
│  USE THIS WHEN: Changing practice problems, fixing typos, updating graphs   │
│  DO NOT USE: When changing strategy, restructuring flow, or starting new    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Critical Rules (Apply to ALL Phases)

1. **Do NOT assume problem type** until you see the actual problem image
2. **Do NOT generate scenarios** until deep analysis is complete
3. **Do NOT create slides** until user confirms your understanding
4. **Use ONE strategy** throughout all slides - name it, define it, use consistent language
5. **Problem image is REQUIRED** - you cannot proceed without it
6. **Update progress file** at the end of each phase (see Progress Tracking below)

## Progress Tracking

This skill uses a progress file to track state and enable resumption:

**File:** `src/app/presentations/{slug}/.worked-example-progress.json`

- Created in Phase 1 after analysis is complete
- Updated at each phase transition
- Tracks: current phase, strategy name, slides completed, user confirmation status
- Deleted automatically after Phase 4 verification succeeds

If you find an existing progress file when starting, READ IT and resume from where you left off.

## How to Start

When the user asks to create a worked example:

**STEP 1:** Use the Read tool to read the Phase 1 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze.md
```

**STEP 2:** Follow the instructions in that file completely.

**STEP 3:** At the end of each phase, the file will tell you which phase to read next.

## Required Reading (Before Starting)

**Before reading Phase 1**, use the Read tool to read these files. This establishes the quality bar and patterns you'll follow:

1. **Pedagogical Framework** - The "why" behind the slide structure:
   ```
   Read: .claude/skills/create-worked-example-sg/reference/pedagogy.md
   ```

2. **Styling Guide** - Core styling patterns:
   ```
   Read: .claude/skills/create-worked-example-sg/reference/styling.md
   ```

3. **Complete Example** - See what a finished deck looks like:
   ```
   Read: .claude/skills/create-worked-example-sg/examples/example1.html
   ```

These files establish context that influences all phases. The pedagogy.md especially helps you understand the research-based reasoning behind the Four Rules.

## Reference Materials (Used in Phase 3)

Templates you'll use when creating slides:
- `templates/cfu-toggle-snippet.html` - CFU question toggle pattern
- `templates/answer-toggle-snippet.html` - Answer reveal toggle pattern
- `templates/printable-slide-snippet.html` - Printable worksheet layout
- `templates/metadata.json` - Metadata file template

Scripts:
- `scripts/sync-to-db.js` - Database sync script
- `scripts/verify-worked-example.ts` - Verification script

Phase 3 will instruct you to read these templates before creating slides.

## Quality Checklist (Verify Before Completing Phase 4)

**Strategy & Analysis:**
- ✅ Problem was deeply analyzed BEFORE creating any content
- ✅ ONE clear strategy is named and defined
- ✅ Strategy has a one-sentence student-facing summary
- ✅ All step names use consistent verbs from the strategy definition
- ✅ CFU questions reference the strategy name or step names
- ✅ User confirmed understanding before slide creation began

**Content:**
- ✅ All required user inputs captured (learning goal, grade level, problem image)
- ✅ 3 scenarios all use the SAME strategy (not different approaches)
- ✅ First problem has 2-3 steps with Ask/Reveal pairs
- ✅ CFU questions ask "why/how" not "what"
- ✅ Practice problems can be solved using the exact same steps

**Visual:**
- ✅ Visual elements stay in same position across slides 2-6
- ✅ Practice slides have zero scaffolding
- ✅ All math is accurate
- ✅ HTML is valid and properly styled

## BEGIN

**Read Phase 1 now:** Use the Read tool to read `.claude/skills/create-worked-example-sg/phases/01-collect-and-analyze.md`
