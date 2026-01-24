# Worked Example Browser Wizard

This folder contains the complete worked example creation system, including:
- **UI components** (React wizard)
- **AI prompting** (phases, templates, patterns)
- **Server actions** (Claude API calls)
- **Reference content** (pedagogy, styling, layouts)

## Architecture Overview

```
src/app/scm/workedExamples/create/
├── page.tsx                    ← Main page component
├── layout.tsx                  ← Layout wrapper
│
├── actions/                    ← Server actions (call Claude API)
│   ├── analyze-problem.ts      ← Phase 1: Analyze mastery check image
│   ├── generate-slides.ts      ← Phase 3: Generate HTML slides (SSE streaming)
│   └── upload-image.ts         ← Upload image to blob storage
│
├── components/                 ← React UI components
│   ├── step1/                  ← Grade, unit, lesson, image upload
│   ├── step2/                  ← Show/edit analysis, scenarios, graphPlans
│   ├── step3/                  ← Preview/edit generated slides
│   ├── step4/                  ← Save to database
│   └── shared/                 ← Shared components
│
├── hooks/
│   └── useWizardState.ts       ← Reducer-based state management
│
├── ai/                         ← All AI prompting content
│   ├── phases/                 ← Phase-by-phase instructions
│   │   ├── 01-collect-and-analyze/
│   │   ├── 02-confirm-and-plan/
│   │   ├── 03-generate-slides/
│   │   │   ├── card-patterns/  ← Referenced by phases (symlink-like)
│   │   │   ├── checklists/
│   │   │   └── visuals/
│   │   └── 04-save-to-database/
│   │
│   ├── card-patterns/          ← HTML component patterns
│   │   ├── simple-patterns/    ← Fill placeholders
│   │   └── complex-patterns/   ← Copy & modify
│   │
│   ├── reference/              ← Shared reference docs
│   │   ├── pedagogy.md
│   │   ├── styling.md
│   │   ├── layout-presets.md
│   │   └── region-defaults.md
│   │
│   └── index.ts                ← Content loader (exports all as strings)
│
├── lib/
│   ├── types.ts                ← TypeScript interfaces
│   └── prompts.ts              ← LLM prompt builders
│
└── _deprecated/                ← Superseded CLI scripts
    ├── README.md
    └── *.js, *.sh
```

## Key Files

### ai/index.ts

Exports all AI content (markdown and HTML) as strings:

```typescript
import { PEDAGOGY_RULES, GRAPH_SNIPPET, TECHNICAL_RULES } from './ai';
```

### lib/prompts.ts

Imports from `../ai` and builds prompts for Claude API:

| Function | Purpose |
|----------|---------|
| `ANALYZE_PROBLEM_SYSTEM_PROMPT` | Phase 1 system prompt with JSON schema |
| `GENERATE_SLIDES_SYSTEM_PROMPT` | Phase 3 system prompt with templates |
| `buildAnalyzePrompt()` | Builds user prompt with context |
| `buildGenerateSlidesPrompt()` | Builds user prompt with pre-calculated coordinates |

### lib/types.ts

TypeScript interfaces for all data structures:

| Interface | Purpose |
|-----------|---------|
| `WizardState` | Full wizard state (all steps) |
| `ProblemAnalysis` | Claude's analysis output |
| `StrategyDefinition` | Strategy name, moves, slide headers |
| `Scenario` | Each scenario with context, numbers, graphPlan |
| `GraphPlan` | Pre-calculated graph coordinates |

## Common Update Patterns

### Adding a new field to analysis output

1. Update `lib/types.ts` - Add field to interface
2. Update `ai/phases/01-collect-and-analyze/output-schema.md` - Add to JSON schema
3. Update `lib/prompts.ts` - Reference in prompt if needed
4. Update `components/step2/` - Display the new field

### Changing what Claude receives for slide generation

1. Update `ai/phases/03-generate-slides/` - Modify relevant markdown files
2. Update `lib/prompts.ts` - Modify `GENERATE_SLIDES_SYSTEM_PROMPT` if needed

### Adding new card patterns

1. Add HTML file to `ai/card-patterns/simple-patterns/` or `complex-patterns/`
2. Export from `ai/index.ts`
3. Reference in `lib/prompts.ts` if used in prompts

## GraphPlan Architecture

Each scenario needs its own `graphPlan` for coordinate-graph problems:

| Slides | Scenario | GraphPlan Source |
|--------|----------|------------------|
| 2-6 (Worked Example) | scenarios[0] | `scenarios[0].graphPlan` |
| 7 (Printable with Practice 1 & 2) | scenarios[1], scenarios[2] | Each scenario's graphPlan |

**Never use `problemAnalysis.graphPlan` for slides** - that's the mastery check's graph.

## Testing Changes

1. Run the dev server: `npm run dev`
2. Navigate to `/scm/workedExamples/create`
3. Upload a mastery check image
4. Verify analysis output in Step 2
5. Generate slides and verify in Step 3
6. Export to PPTX to verify formatting
