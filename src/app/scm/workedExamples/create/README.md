# Worked Example Browser Wizard

This folder contains the browser-based wizard for creating worked example slide decks.

## Architecture Overview

```
src/app/scm/workedExamples/create/
├── page.tsx                    ← Main page component
├── actions/                    ← Server actions (call Claude API)
│   ├── analyze-problem.ts      ← Phase 1: Analyze mastery check image
│   ├── generate-slides.ts      ← Phase 3: Generate 8 HTML slides (SSE streaming) + printable
│   └── upload-image.ts         ← Upload image to blob storage
├── components/                 ← React UI components
│   ├── WizardContainer.tsx     ← Main wizard wrapper with state provider
│   ├── WizardProgress.tsx      ← Step indicator (1-2-3-4)
│   ├── WizardFooter.tsx        ← Navigation buttons (Back/Next)
│   ├── WizardStickyFooter.tsx  ← Sticky footer variant
│   ├── Step1Inputs.tsx         ← Grade, unit, lesson, image upload
│   ├── Step2Analysis.tsx       ← Show/edit analysis, scenarios, graphPlans
│   ├── Step3Slides.tsx         ← Preview/edit generated slides
│   ├── Step4Save.tsx           ← Save to database
│   ├── SlidePreview.tsx        ← Render HTML slide in iframe
│   └── SavedDrafts.tsx         ← Load saved drafts from localStorage
├── hooks/
│   └── useWizardState.ts       ← Reducer-based state management
└── lib/
    ├── types.ts                ← TypeScript interfaces
    └── prompts.ts              ← LLM prompts for Claude API calls
```

## Relationship to CLI Skill

The CLI skill at `.claude/skills/create-worked-example-sg/` is the **source of truth** for:
- Pedagogy and educational principles
- Card patterns (HTML templates)
- Styling constants
- Phase workflow documentation

This browser wizard is a **parallel implementation** that:
- Uses Claude API directly (not Claude CLI)
- Has its own prompts in `lib/prompts.ts` (manually maintained)
- Has its own types in `lib/types.ts`
- Provides a visual UI instead of CLI conversation

**Changes often need to be made in BOTH places.**

## Key Files

### lib/prompts.ts

Contains the prompts sent to Claude API:

| Function | Purpose | When to Update |
|----------|---------|----------------|
| `ANALYZE_PROBLEM_SYSTEM_PROMPT` | Phase 1 system prompt with JSON schema | Changing analysis output structure |
| `buildGenerateSlidesPrompt()` | Builds Phase 3 prompt with all context | Changing what data Claude receives |
| `buildEditSlidesPrompt()` | Prompt for editing existing slides | Changing slide edit behavior |

**Critical:** `buildGenerateSlidesPrompt()` injects:
- Pre-calculated pixel coordinates for SVG graphs
- Each scenario's graphPlan (not the mastery check's graphPlan)
- Strategy definition and slide headers

### lib/types.ts

TypeScript interfaces for all data structures:

| Interface | Purpose |
|-----------|---------|
| `WizardState` | Full wizard state (all steps) |
| `ProblemAnalysis` | Claude's analysis output |
| `StrategyDefinition` | Strategy name, moves, slide headers |
| `Scenario` | Each scenario with context, numbers, graphPlan |
| `GraphPlan` | Pre-calculated graph coordinates |
| `LoadingProgress` | Loading state with phases |

### hooks/useWizardState.ts

Reducer-based state management with actions:
- `SET_ANALYSIS` - Store Claude's analysis
- `UPDATE_SCENARIO` - Edit scenario content
- `SET_SLIDES` - Store generated slides
- `UPDATE_SLIDE` / `UPDATE_SLIDES_BATCH` - Edit slides

### actions/

Server actions that call Claude API:

| Action | Input | Output |
|--------|-------|--------|
| `analyzeProlem()` | Image URL, grade, goals | ProblemAnalysis, StrategyDefinition, Scenarios |
| `generateSlides()` | Analysis data | 8 HTML slides (SSE stream) + 1 printable (separate API) |
| `uploadImage()` | File | Blob URL |

## Common Update Patterns

### Adding a new field to analysis output

1. Update `lib/types.ts` - Add field to interface
2. Update `lib/prompts.ts` - Add to JSON schema in `ANALYZE_PROBLEM_SYSTEM_PROMPT`
3. Update `components/Step2Analysis.tsx` - Display the new field
4. Update skill file - `.claude/skills/.../phases/01-collect-and-analyze/analyze-problem.md`

### Changing what Claude receives for slide generation

1. Update `lib/prompts.ts` - Modify `buildGenerateSlidesPrompt()`
2. Update skill file - `.claude/skills/.../phases/03-generate-slides/index.md`

### Adding new wizard state

1. Update `lib/types.ts` - Add to `WizardState` and `WizardAction`
2. Update `hooks/useWizardState.ts` - Add reducer case
3. Update relevant component to dispatch action

## GraphPlan Architecture

Each scenario needs its own `graphPlan` for coordinate-graph problems:

| Slides | Scenario | GraphPlan Source |
|--------|----------|------------------|
| 2-8 (Worked Example) | scenarios[0] | `scenarios[0].graphPlan` |
| 9 (Printable with Practice 1 & 2) | scenarios[1], scenarios[2] | `scenarios[1].graphPlan`, `scenarios[2].graphPlan` |

**Never use `problemAnalysis.graphPlan` for slides** - that's the mastery check's graph, which is for the student's exit ticket (never shown in slides).

The `buildGenerateSlidesPrompt()` function:
1. Uses `scenarios[0].graphPlan` for worked example slides (2-8)
2. Includes each practice scenario's graphPlan in the prompt
3. Pre-calculates pixel coordinates using the formulas:
   - `toPixelX(dataX) = 40 + (dataX / xMax) * 220`
   - `toPixelY(dataY) = 170 - (dataY / yMax) * 150`

## Sync Script

The sync script (`npm run sync-skill-content`) syncs CLI skill files to TypeScript module:

```
.claude/skills/create-worked-example-sg/  →  src/skills/worked-example/content/
```

**The sync script does NOT update this folder.** All files here are manually maintained.

## Testing Changes

1. Run the dev server: `npm run dev`
2. Navigate to `/scm/workedExamples/create`
3. Upload a mastery check image
4. Verify analysis output in Step 2
5. Generate slides and verify in Step 3
6. Check that graphs use correct coordinates
