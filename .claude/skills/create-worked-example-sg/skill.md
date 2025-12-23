---
name: Create Worked Example
description: Generate PPTX-compatible HTML slide decks for math worked examples. Use when user says "create worked example" or needs visual step-by-step math instruction with CFU questions and practice problems.
---

# Create Worked Example (PPTX-Compatible HTML Slides)

You are an expert educational content creator specializing in mathematics pedagogy and worked example slide decks.

**Your task:** Generate PPTX-compatible HTML-based slide decks for math worked examples and save them to the database.

## PPTX Compatibility

All slides are generated as **PPTX-compatible HTML** that can be:
1. Viewed in the web browser (light theme, 960×540)
2. Converted to PowerPoint for Google Slides export

**Key constraints (see `pptx.md` for details):**
- Dimensions: 960×540px exactly
- Fonts: Arial, Georgia only (web-safe)
- Layout: Use `.row`/`.col` classes (no inline flexbox)
- No JavaScript, no toggles, no animations
- CFU/Answer boxes are static (revealed via slide advancement)

## Single Source of Truth Architecture

**IMPORTANT:** This skill folder (`.claude/skills/create-worked-example-sg/`) is the **SOURCE OF TRUTH** for all worked example content.

```
.claude/skills/create-worked-example-sg/    ← SOURCE OF TRUTH
├── templates/                              ← PPTX-compatible HTML templates
│   ├── slide-base.html                     ← Base 960×540 structure
│   ├── slide-learning-goal.html            ← Opening slide with strategy
│   ├── slide-two-column.html               ← Visual + text layout
│   └── archived/                           ← Deprecated templates
├── reference/                              ← Pedagogy & styling rules
│   ├── pedagogy.md
│   └── styling.md                          ← Layout zones, colors, annotation techniques
├── phases/                                 ← CLI workflow phases
│   ├── 01-collect-and-analyze.md
│   ├── 02-confirm-and-plan.md
│   ├── 03-generate-slides/                 ← Phase 3 folder
│   │   ├── index.md                        ← Main entry point
│   │   ├── protocol.md                     ← Per-slide checkpoint protocol
│   │   ├── templates/                    ← PPTX-compatible templates
│   │   │   ├── slide-base.html
│   │   │   ├── slide-learning-goal.html
│   │   │   ├── slide-two-column.html
│   │   │   ├── slide-with-cfu.html
│   │   │   ├── slide-with-answer.html
│   │   │   ├── slide-practice.html
│   │   │   └── printable-slide-snippet.html
│   │   └── visuals/                        ← Visual-specific docs
│   │       └── svg-graphs.md
│   ├── 04-save-to-database.md
│   └── 05-updating-decks.md
├── prompts/                                ← Shared LLM instructions
│   └── analyze-problem.md                  ← Step-by-step analysis
├── scripts/                                ← PPTX conversion tools
│   ├── generate-pptx.js                    ← HTML → PPTX conversion
│   ├── validate-pptx.sh                    ← Visual validation
│   └── sync-to-db.js                       ← Database sync
├── phases/                                 ← CLI workflow phases
└── pptx.md                                 ← Full PPTX constraints reference

src/skills/worked-example/                  ← AUTO-GENERATED (don't edit!)
├── content/
│   ├── templates.ts                        ← Generated from templates/*.html
│   ├── pedagogy.ts                         ← Generated from reference/pedagogy.md
│   ├── styling.ts                          ← Generated from reference/styling.md
│   └── prompts.ts                          ← Generated from prompts/*.md
├── context.ts                              ← CLI vs Browser differences (manual)
└── index.ts
```

**How updates propagate:**
1. Edit files in `.claude/skills/create-worked-example-sg/` (templates/ or reference/)
2. Run: `npm run sync-skill-content`
3. The TypeScript module is regenerated, making changes available to both:
   - **CLI skill** (reads markdown/HTML directly)
   - **Browser creator** (imports from TypeScript module)

**When updating:**
- Edit `templates/*.html` for HTML template changes
- Edit `reference/*.md` for pedagogy/styling rule changes
- Edit `prompts/*.md` for LLM instruction changes (used by both CLI and browser)
- Run `npm run sync-skill-content` to propagate to TypeScript
- NEVER edit `src/skills/worked-example/content/*.ts` directly (they're auto-generated)

## How This Skill Works

This skill is divided into **4 main phases** for creating new decks, plus **Phase 5** for updating existing decks.

**IMPORTANT:** You MUST read each phase file using the Read tool before executing that phase. Do NOT try to complete the entire workflow from memory.

## Choosing Your Path

**Creating a NEW worked example deck?**
→ Start with Phase 1 (full workflow below)

**Updating an EXISTING deck (changing practice problems, fixing content)?**
→ Go directly to Phase 5: `phases/05-updating-decks.md`

## Phase Overview

**Technical specs are in `prompts/` folder.** The phases below are workflow guidance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: COLLECT & ANALYZE                                                 │
│  Reference: phases/01-collect-and-analyze/                                  │
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
│  Reference: phases/03-generate-slides/ (folder with index.md + protocol.md) │
│                                                                             │
│  Trigger: User confirms in Phase 2                                          │
│  Actions: Create 14-16 PPTX-compatible HTML slides (960×540px)              │
│  Output: HTML files written to src/app/presentations/{slug}/                │
│  Done when: All slide files are written                                     │
│                                                                             │
│  IMPORTANT: Read phases/03-generate-slides/protocol.md for:                 │
│  - Per-slide checkpoint protocol                                            │
│  - PPTX constraints (dimensions, fonts, layout classes)                     │
│  - Paired slide consistency rules                                           │
│  - Pre-flight and completion checklists                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SAVE TO DATABASE                                                  │
│  Reference: scripts/sync-to-db.js                                           │
│                                                                             │
│  Trigger: All slides written in Phase 3                                     │
│  Actions: Create metadata.json, sync to MongoDB                             │
│  Output: Database entry created, URL provided to user                       │
│  Done when: User receives the presentation URL                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: UPDATING EXISTING DECKS (Alternative Path)                        │
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

**STEP 1:** Read the core instruction files:
```
Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/index.md
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md
```

**STEP 2:** Follow the phase workflow below, using the prompts as your technical reference.

## Required Reading (Before Generating Slides)

Use the Read tool to read these files to understand the quality bar:

1. **Problem Analysis Instructions** - How to analyze the math problem:
   ```
   Read: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md
   ```

2. **Slide Generation Protocol** - Per-slide checkpoint protocol and PPTX patterns:
   ```
   Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md
   ```

3. **Pedagogical Framework** - The "why" behind the slide structure:
   ```
   Read: .claude/skills/create-worked-example-sg/reference/pedagogy.md
   ```

4. **Styling Reference** - Colors, fonts, layout classes:
   ```
   Read: .claude/skills/create-worked-example-sg/reference/styling.md
   ```

The `phases/03-generate-slides/protocol.md` file is the **primary technical reference** for creating slides. It contains the per-slide checkpoint protocol, PPTX constraints, paired slide consistency rules, and checklists.

## Reference Materials (Used in Phase 3)

**PPTX-Compatible Templates** (in `phases/03-generate-slides/templates/`):
- `slide-base.html` - Base 960×540 structure with layout zones
- `slide-learning-goal.html` - Opening slide with strategy badge
- `slide-two-column.html` - 40%/60% visual + text layout
- `slide-with-cfu.html` - Slide with static amber CFU box
- `slide-with-answer.html` - Slide with static green answer box
- `slide-practice.html` - Practice problem (zero scaffolding)
- `printable-slide-snippet.html` - Printable worksheet (portrait, Times New Roman)

**Scripts:**
- `scripts/generate-pptx.js` - HTML → PPTX conversion (uses pptxgenjs + html2pptx)
- `scripts/validate-pptx.sh` - Visual validation (PPTX → PDF → images)
- `scripts/sync-to-db.js` - Database sync script

**Full Constraints Reference:**
- `pptx.md` - Complete PPTX compatibility guide (dimensions, fonts, layout rules)

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
- ✅ First problem has 2-3 steps (each with Question → +CFU → Answer → +Answer slides)
- ✅ CFU questions ask "why/how" not "what"
- ✅ Practice problems can be solved using the exact same steps

**Visual:**
- ✅ Visual elements stay in same position across step slides
- ✅ Practice slides have zero scaffolding
- ✅ All math is accurate
- ✅ HTML is valid and properly styled

**PPTX Compatibility (CRITICAL):**
- ✅ All slides are exactly 960×540px
- ✅ All text is in `<p>`, `<h1-6>`, `<ul>`, or `<ol>` tags (NOT bare text in divs!)
- ✅ Using `.row`/`.col` classes (NOT inline `display: flex`)
- ✅ Web-safe fonts only: Arial, Georgia (no Roboto, no custom fonts)
- ✅ Backgrounds/borders only on `<div>` elements (NOT on `<p>`, `<h1>`)
- ✅ No manual bullet symbols (•, -, *) — use `<ul>/<ol>` lists
- ✅ No JavaScript, no onclick, no CSS animations
- ✅ CFU/Answer boxes are static (separate slides, no toggles)
- ✅ Printable slide uses white background (#fff) and Times New Roman

## BEGIN

**Read Phase 1 now:** Use the Read tool to read `.claude/skills/create-worked-example-sg/phases/01-collect-and-analyze.md`
