# Implementation Plan: Add "Big Idea" Concept to Worked Examples

## Overview

Add a "Big Idea" field that captures the single core strategy/concept being taught in a worked example slide deck.

**Key Changes:**
1. Add new **Slide 1: Teacher Instructions** - visually quiet, informational slide with Big Idea + Learning Targets (for teacher prep)
2. **Slide 2: Big Idea** - clean, student-facing slide with badge + statement + prominent Grade/Unit/Lesson
3. Display Big Idea prominently on Step 2 (Analysis view) as a card above all other elements
4. **Consolidate CFU+Answer** - Each step shows both CFU and Answer stacked on the same slide
5. All subsequent slides shift accordingly (new total: 8 slides instead of 9)

**New Slide Structure:**
| Slide | Type | Audience | Content |
|-------|------|----------|---------|
| 1 | Teacher Instructions | Teacher | Big Idea + Learning Targets (visually quiet) |
| 2 | Big Idea | Students | Grade/Unit/Lesson + Big Idea badge + statement |
| 3 | Problem Setup | Students | Scenario introduction with visual |
| 4 | Step 1 | Students | Step content + CFU + Answer (stacked) |
| 5 | Step 2 | Students | Step content + CFU + Answer (stacked) |
| 6 | Step 3 | Students | Step content + CFU + Answer (stacked) |
| 7 | Printable | Students | Practice problems |

**Slide Count Change:** 9 → 7 slides (Teacher Instructions + Big Idea + Problem Setup + 3 Step slides + Printable)

## What is the Big Idea?

The Big Idea is a single sentence that captures the core mathematical concept or strategy being taught. It serves multiple purposes:
- **For teachers**: Quick understanding of the deck's focus
- **For students**: Clear statement of what they'll learn
- **For the LLM**: Context for generating consistent, focused content

Examples:
- "Equations can be solved by keeping both sides balanced"
- "Unit rates help us compare different quantities fairly"
- "Parallel lines have the same slope but different y-intercepts"

---

## Checkpoint 1: Type Definitions & Reducer Updates

### Files to Modify

**File**: `src/app/scm/workedExamples/create/lib/types.ts`

Add `bigIdea` field to `StrategyDefinition` interface:

```typescript
export interface StrategyDefinition {
  name: string;
  oneSentenceSummary: string;
  bigIdea: string;  // NEW: The core concept in one sentence
  moves: {
    verb: string;
    description: string;
    result: string;
  }[];
  slideHeaders: string[];
  cfuQuestionTemplates: string[];
}
```

Add new action types to `WizardAction` union:
```typescript
| { type: 'UPDATE_BIG_IDEA'; payload: string }
| { type: 'UPDATE_STRATEGY_MOVES'; payload: { verb: string; description: string; result: string }[] }
```

**File**: `src/app/scm/workedExamples/create/hooks/useWizardState.ts`

Add reducer cases and helper functions:
```typescript
case 'UPDATE_BIG_IDEA':
  return {
    ...state,
    strategyDefinition: state.strategyDefinition
      ? { ...state.strategyDefinition, bigIdea: action.payload }
      : null,
  };

case 'UPDATE_STRATEGY_MOVES':
  return {
    ...state,
    strategyDefinition: state.strategyDefinition
      ? { ...state.strategyDefinition, moves: action.payload }
      : null,
  };
```

Add exposed functions:
```typescript
const updateBigIdea = (bigIdea: string) => {
  dispatch({ type: 'UPDATE_BIG_IDEA', payload: bigIdea });
};

const updateStrategyMoves = (moves: { verb: string; description: string; result: string }[]) => {
  dispatch({ type: 'UPDATE_STRATEGY_MOVES', payload: moves });
};
```

### Checkpoint 1 Checklist
- [x] Add `bigIdea: string` to `StrategyDefinition` interface in types.ts
- [x] Add `UPDATE_BIG_IDEA` action type to `WizardAction` union
- [x] Add `UPDATE_STRATEGY_MOVES` action type to `WizardAction` union
- [x] Add `UPDATE_BIG_IDEA` case to reducer in useWizardState.ts
- [x] Add `UPDATE_STRATEGY_MOVES` case to reducer in useWizardState.ts
- [x] Add `updateBigIdea` function to hook return value
- [x] Add `updateStrategyMoves` function to hook return value

---

## Checkpoint 2: Prompts Update

### Skill Directory Files to Modify

**File**: `.claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/analyze-problem.md`

Add Big Idea step after STEP 4d (around line 78). Insert new section:
```markdown
**4e: State the Big Idea**
One sentence that captures the core mathematical concept students will learn:
- "To solve equations, we keep both sides balanced"
- "Unit rates let us compare different quantities fairly"
- "Parallel lines have the same slope but different y-intercepts"

The Big Idea is:
- More general than the one-sentence summary (strategy-agnostic)
- A mathematical truth/principle students can remember
- What ties together ALL the steps and scenarios
```

Also update the Completion Checklist (lines 182-200) to include:
- [ ] Big Idea is stated as a mathematical principle (not strategy-specific)

**File**: `.claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/index.md`

Update the STRATEGY DEFINITION output template (around line 330) to include bigIdea field.

**File**: `.claude/skills/create-worked-example-sg/phases/02-confirm-and-plan/index.md`

Update the presentation template (lines 38-61) to show Big Idea:
```markdown
**Problem Type:** [from PROBLEM ANALYSIS]
**Big Idea:** [the core mathematical concept]
**Strategy I'll Use:** [strategy name from STRATEGY DEFINITION]
```

### Browser Wizard Files to Modify

**File**: `src/app/scm/workedExamples/create/lib/prompts.ts`

Update `ANALYZE_PROBLEM_SYSTEM_PROMPT` JSON schema to include bigIdea:
```typescript
"strategyDefinition": {
  "name": "Clear Strategy Name",
  "oneSentenceSummary": "To solve this, we...",
  "bigIdea": "The core mathematical concept in one sentence",  // NEW
  "moves": [...],
  ...
}
```

### Checkpoint 2 Checklist
- [x] **analyze-problem.md**: Add Step 4e for Big Idea
- [x] **analyze-problem.md**: Update completion checklist with Big Idea verification
- [x] **01-collect-and-analyze/index.md**: Add bigIdea to STRATEGY DEFINITION output
- [x] **02-confirm-and-plan/index.md**: Add Big Idea to user presentation template
- [x] **prompts.ts**: Update ANALYZE_PROBLEM_SYSTEM_PROMPT JSON schema with bigIdea
- [x] Verify bigIdea appears in strategyDefinition output from LLM

---

## Checkpoint 3: Step 2 UI Changes

### Files to Modify

**File**: `src/app/scm/workedExamples/create/components/step2/Step2Analysis.tsx`

#### 3a. Add Big Idea card at top of right column (EDITABLE)

```tsx
// State for editing
const [editingBigIdea, setEditingBigIdea] = useState(false);

// In the right column (70%), at the very top before all accordions:
{/* Big Idea Card - FIRST element in right column, EDITABLE */}
<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-4 shadow-sm">
  <div className="flex items-center justify-between mb-2">
    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold text-white uppercase tracking-wide">
      Big Idea
    </span>
    <button
      onClick={() => setEditingBigIdea(!editingBigIdea)}
      className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded cursor-pointer"
    >
      {editingBigIdea ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
    </button>
  </div>
  {editingBigIdea ? (
    <textarea
      value={strategyDefinition.bigIdea}
      onChange={(e) => updateBigIdea(e.target.value)}
      className="w-full bg-white/10 text-white text-lg font-medium rounded p-2 border border-white/20"
      rows={2}
    />
  ) : (
    <p className="text-lg font-medium text-white">
      {strategyDefinition.bigIdea}
    </p>
  )}
</div>
```

#### 3b. Remove the Strategy accordion entirely
Delete the entire `<SectionAccordion title="Strategy" ... />` component (lines ~898-955).

#### 3c. Move Strategy Steps into Worked Example accordion (EDITABLE)
Add a new accordion item inside the Worked Example accordion, after the Question section.

#### 3d. Create StrategyStepsEditor component
**New File**: `src/app/scm/workedExamples/create/components/step2/StrategyStepsEditor.tsx`

```tsx
interface StrategyStepsEditorProps {
  moves: { verb: string; description: string; result: string }[];
  onChange: (moves: { verb: string; description: string; result: string }[]) => void;
}

export function StrategyStepsEditor({ moves, onChange }: StrategyStepsEditorProps) {
  const updateMove = (index: number, field: string, value: string) => {
    const updated = [...moves];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {moves.map((move, i) => (
        <div key={i} className="bg-gray-50 rounded p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge intent="primary" size="xs" rounded="full">{i + 1}</Badge>
            <input
              type="text"
              value={move.verb}
              onChange={(e) => updateMove(i, 'verb', e.target.value)}
              className="font-semibold text-sm border rounded px-2 py-1 w-32"
              placeholder="Verb"
            />
          </div>
          <input
            type="text"
            value={move.description}
            onChange={(e) => updateMove(i, 'description', e.target.value)}
            className="w-full text-sm border rounded px-2 py-1"
            placeholder="Description"
          />
          <input
            type="text"
            value={move.result}
            onChange={(e) => updateMove(i, 'result', e.target.value)}
            className="w-full text-sm text-gray-500 border rounded px-2 py-1"
            placeholder="Result (optional)"
          />
        </div>
      ))}
    </div>
  );
}
```

### Checkpoint 3 Checklist
- [x] Add `editingBigIdea` state to Step2Analysis.tsx
- [x] Add Big Idea card component at top of right column (before all accordions)
- [x] Make Big Idea card editable with pencil icon toggle
- [x] Import `updateBigIdea` from wizard hook
- [x] Delete the Strategy accordion entirely (lines ~898-955)
- [x] Create StrategyStepsEditor.tsx component
- [x] Add `editingStrategySteps` state to Step2Analysis.tsx
- [x] Add Strategy Steps accordion item inside Worked Example accordion
- [x] Import `updateStrategyMoves` from wizard hook
- [x] Verify accordions display in order: Big Idea card → Worked Example → Practice Problems → Problem Analysis

---

## Checkpoint 4: New Slide Templates

### Files to Create

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/complex-patterns/slide-teacher-instructions.html`

Create teacher-facing instructions slide template (visually quiet, informational).

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/complex-patterns/slide-big-idea.html`

Create student-facing Big Idea slide template with Grade/Unit/Lesson prominent.

### Template Designs

#### Slide 1: Teacher Instructions (Visually Quiet)
```
┌──────────────────────────────────────────────────────────────────┐
│  TEACHER INSTRUCTIONS                                  Grade 8 U4 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ BIG IDEA                                                    │ │
│  │ "Equations can be solved by keeping both sides balanced"    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ LEARNING TARGETS                                            │ │
│  │ • Solve two-step equations using inverse operations         │ │
│  │ • Explain why keeping both sides balanced works             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  STRATEGY                                                         │
│  Balance and Isolate: To solve this, we remove equal items...    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### Slide 2: Big Idea (Student-Facing)
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│              Grade 8 · Unit 4 · Lesson 1                        │
│                                                                  │
│                       ┌──────────────┐                          │
│                       │   BIG IDEA   │  ← Badge (blue pill)     │
│                       └──────────────┘                          │
│                                                                  │
│           "Equations can be solved by keeping                   │
│                  both sides balanced"                            │
│                                                                  │
│                 (Large, centered statement)                      │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Checkpoint 4 Checklist
- [x] Create slide-teacher-instructions.html template
- [x] Create slide-big-idea.html template
- [x] Include proper PPTX data attributes in both templates
- [x] Verify visually quiet design for teacher instructions
- [x] Verify prominent Grade/Unit/Lesson in big idea slide

---

## Checkpoint 5: CFU+Answer Consolidation (Step Slides)

### The Change

**Before:** Separate CFU and Answer slides (slides 3-8 were 6 slides for 3 steps)
- Slide 3: Step 1 Question + CFU box
- Slide 4: Step 1 Answer box
- Slide 5: Step 2 Question + CFU box
- Slide 6: Step 2 Answer box
- Slide 7: Step 3 Question + CFU box
- Slide 8: Step 3 Answer box

**After:** Combined CFU+Answer on same slide (3 slides for 3 steps)
- Slide 4: Step 1 with CFU + Answer stacked
- Slide 5: Step 2 with CFU + Answer stacked
- Slide 6: Step 3 with CFU + Answer stacked

### Skill Directory Files to Modify

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/01-slide-by-slide.md`

Update the slide table (lines 65-70):
```markdown
| Slide # | Type | Layout Options | Content |
|---------|------|----------------|---------|
| 1 | Teacher Instructions | `full-width` | Big Idea + Learning Targets + Strategy (quiet) |
| 2 | Big Idea | `centered` | Grade/Unit/Lesson + Big Idea badge + statement |
| 3 | Problem Setup | `two-column` or `centered` | problem + visual |
| 4 | Step 1 | `two-column` or `centered` | step content + CFU + Answer (stacked) |
| 5 | Step 2 | `two-column` or `centered` | step content + CFU + Answer (stacked) |
| 6 | Step 3 | `two-column` or `centered` | step content + CFU + Answer (stacked) |
| 7 | Printable | `full-width` | printable format |
```

Also update:
- Line 69: Remove "3-8 | Step slides" row
- Lines 72-80: Update "Layout Selection (slides 2-8)" to "Layout Selection (slides 2-6)"
- Lines 124-137: Update CFU/Answer box instructions for stacked layout
- Lines 150-173: Update slide count references in Step 4 and 5
- Lines 240-243: Update GraphPlan slide references

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/00-overview.md`

Update references:
- Line 5: Change "9 PPTX-compatible HTML slides" to "7 PPTX-compatible HTML slides"
- Line 7: Change "Slides 1-8 are the worked example. Slide 9" to "Slides 1-6 are the worked example. Slide 7"
- Lines 56-67: Update execution flow for 6 slides instead of 8
- Lines 118-129: Update file output structure for 7 slides

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/checklists/completion.md`

Update references:
- Line 3: Change "all 9 slides" to "all 7 slides"
- Line 9: Change "All 9 slides written to files (8 worked example + 1 printable)" to "All 7 slides written to files (6 worked example + 1 printable)"
- Line 34: Change "Printable Slide (Slide 9)" to "Printable Slide (Slide 7)"

**File**: `.claude/skills/create-worked-example-sg/phases/02-confirm-and-plan/index.md`

Update references:
- Line 7: Change "9 slides" to "7 slides"
- Lines 169-171: Update Visual Progression to reference new slide numbers (Slides 3-6 instead of 3-8)

**File**: `.claude/skills/create-worked-example-sg/phases/04-save-to-database/index.md`

Update printable slide reference from slide 9 to slide 7.

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/simple-patterns/cfu-answer-card.html`

Update the CFU/Answer pattern to show both stacked:
```html
<!-- CFU Box (top) -->
<div data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="100"
     style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 12px; border-left: 4px solid #f59e0b;">
  <p style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 13px; color: #1d1d1d;">{{cfu_question}}</p>
</div>

<!-- Answer Box (below CFU) -->
<div data-pptx-region="answer-box" data-pptx-x="653" data-pptx-y="150" data-pptx-w="280" data-pptx-h="100"
     style="position: absolute; top: 150px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 12px; border-left: 4px solid #22c55e;">
  <p style="font-weight: bold; margin: 0 0 6px 0; font-size: 12px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 13px; color: #1d1d1d;">{{answer}}</p>
</div>
```

**PPTX Animation:** Both boxes still use PPTX animation attributes so they appear on click during presentation. The CFU box appears first, then the Answer box on second click.

**File**: `.claude/skills/create-worked-example-sg/reference/pedagogy.md`

Update references:
- Line 11: Change "9 slides (8 worked example + 1 printable)" to "7 slides (6 worked example + 1 printable)"
- Line 24: Change "Slide Structure (9 Slides)" to "Slide Structure (7 Slides)"
- Line 26: Update "Slide 1: Learning Goal" to "Slide 1: Teacher Instructions" and "Slide 2: Big Idea"
- Lines 42-60: Update "Slides 3-8: Step-by-Step" to "Slides 4-6: Step-by-Step"
- Line 61: Change "Slide 9: Printable" to "Slide 7: Printable"
- Line 70: Update "after slides 1-8 complete" to "after slides 1-6 complete"
- Lines 91, 99: Update slide range references

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/03-pedagogy.md`

Update references:
- Line 25: Change "Printable slide 9" to "Printable slide 7"
- Line 66: Update "slides 3-8" to "slides 4-6"

**File**: `.claude/skills/create-worked-example-sg/phases/05-updating-decks/index.md`

Update printable slide references from slide-9 to slide-7.

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/README.md`

Update printable slide reference from "slide 9" to "slide 7".

**File**: `.claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/complex-patterns/printable-slide-snippet.html`

Update comment on line 10 referencing "slide-9.html".

### Checkpoint 5 Checklist
- [x] **01-slide-by-slide.md**: Update slide table (7 slides), CFU/Answer stacked layout, slide references
- [x] **00-overview.md**: Update slide counts (9→7, 8→6), file output structure
- [x] **completion.md**: Update "all 9 slides" to "all 7 slides", checklist items
- [x] **02-confirm-and-plan/index.md**: Update slide count, Visual Progression slide numbers
- [x] **04-save-to-database/index.md**: Update printable slide reference (9→7)
- [x] **pedagogy.md** (reference/): Update all slide count and structure references
- [x] **03-pedagogy.md**: Update printable and step slide references
- [x] **05-updating-decks/index.md**: Update slide-9 references to slide-7
- [x] **card-patterns/README.md**: Update printable slide reference
- [x] **printable-slide-snippet.html**: Update slide-9 comment
- [x] **cfu-answer-card.html**: Update pattern for stacked CFU+Answer layout
- [x] Verify PPTX animation still works (click-to-reveal for both boxes)

---

## Checkpoint 6: Update Slide Count Constants

### Files to Modify

**File**: `src/app/scm/workedExamples/create/hooks/useWizardState.ts`
- Line 481: Change `EXPECTED_SLIDE_COUNT = 9` to `EXPECTED_SLIDE_COUNT = 7`

**File**: `src/app/scm/workedExamples/create/components/step2/Step2Analysis.tsx`
- Line 141: Change `const fullSlideCount = testMode ? 1 : 8;` to `const fullSlideCount = testMode ? 1 : 6;`
- Line 139 comment: Update from "8 worked example slides" to "6 worked example slides"
- Line 283: Update "Main slides complete" comment

**File**: `src/app/scm/workedExamples/create/components/step2/AnalysisFooter.tsx`
- Line 100: Change `if (slideCount >= 9)` to `if (slideCount >= 7)`
- Line 132: Change `Continue ({slideCount}/9)` to `Continue ({slideCount}/7)`

**File**: `src/app/scm/workedExamples/create/lib/prompts.ts`
- Line 782: Update "slide 9" references
- Update `buildGenerateSlidesPrompt` function to generate 6 slides instead of 8

### Checkpoint 6 Checklist
- [x] Update EXPECTED_SLIDE_COUNT in useWizardState.ts (9 → 7)
- [x] Update fullSlideCount in Step2Analysis.tsx (8 → 6)
- [x] Update comment about slide count in Step2Analysis.tsx
- [x] Update slideCount threshold in AnalysisFooter.tsx (9 → 7)
- [x] Update continue button text in AnalysisFooter.tsx
- [x] Update slide references in prompts.ts
- [x] Update buildGenerateSlidesPrompt to generate correct number of slides

---

## Checkpoint 7: Slide Generation Prompt Updates

### Files to Modify

**File**: `src/app/scm/workedExamples/create/lib/prompts.ts`

Update `buildGenerateSlidesPrompt` to include Big Idea and new slide structure:

```typescript
## Strategy
- Name: ${strategyDefinition.name}
- Big Idea: ${strategyDefinition.bigIdea}  // NEW
- Summary: ${strategyDefinition.oneSentenceSummary}
```

Update slide structure instructions:
```typescript
Generate exactly **6 PPTX-compatible HTML slides** following this structure:

**Teacher Prep (1 slide):**
1. **Teacher Instructions** - Big Idea + Learning Targets + Strategy overview (visually quiet)

**Student-Facing (5 slides):**
2. **Big Idea** - Grade/Unit/Lesson + Big Idea badge + statement (centered)
3. **Problem Setup** - Scenario 1 introduction with visual
4. **Step 1** - Step content + CFU box + Answer box (both stacked, animated)
5. **Step 2** - Step content + CFU box + Answer box (both stacked, animated)
6. **Step 3** - Step content + CFU box + Answer box (both stacked, animated)

(Slide 7 - Printable with practice problems - is generated separately)
```

### Checkpoint 7 Checklist
- [x] Add bigIdea to the Strategy section in buildGenerateSlidesPrompt
- [x] Update slide structure to show 6 slides (not 8)
- [x] Update step slides to show CFU+Answer stacked
- [x] Update printable slide reference (slide 7)
- [x] Verify template references are correct

---

## Checkpoint 8: Sync Script & Final Testing

### Files to Modify

**File**: `scripts/sync-skill-content.ts`

Add entries for the new templates:
```typescript
{ source: 'phases/03-generate-slides/card-patterns/complex-patterns/slide-teacher-instructions.html', target: 'templates', exportName: 'SLIDE_TEACHER_INSTRUCTIONS_TEMPLATE' },
{ source: 'phases/03-generate-slides/card-patterns/complex-patterns/slide-big-idea.html', target: 'templates', exportName: 'SLIDE_BIG_IDEA_TEMPLATE' },
```

### Checkpoint 8 Checklist
- [x] Add new template entries to sync-skill-content.ts
- [x] Run `npm run sync-skill-content`
- [x] Verify templates are synced to TypeScript module (19 templates including new ones)
- [x] Run `npm run typecheck` to verify no type errors
- [x] Run `npm run lint` - pre-existing issue in SCMNav.tsx (unrelated to this migration)
- [x] No format script available in this project (skipped)

---

## Implementation Order Summary

1. **Checkpoint 1** - Types & Reducer (bigIdea field, new actions)
2. **Checkpoint 2** - Prompts (LLM generates bigIdea)
3. **Checkpoint 3** - Step 2 UI (Big Idea card, remove Strategy accordion, move Strategy Steps)
4. **Checkpoint 4** - New Templates (Teacher Instructions, Big Idea slides)
5. **Checkpoint 5** - CFU+Answer Consolidation (merge into single slides)
6. **Checkpoint 6** - Slide Count Updates (9 → 7 total slides)
7. **Checkpoint 7** - Generation Prompt Updates (include bigIdea, new structure)
8. **Checkpoint 8** - Sync & Test

---

## UI Design for Step 2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Left 30%]                    │  [Right 70%]                               │
│                                │                                             │
│  Grade 8 │ Unit 4 │ Lesson 1   │  ┌─────────────────────────────────────┐   │
│                                │  │ ┌───────────┐               [✏️]    │   │
│  ┌──────────────────────────┐  │  │ │ BIG IDEA  │  (badge)              │   │
│  │ Task                     │  │  │ └───────────┘                       │   │
│  │ [Problem Image]          │  │  │                                     │   │
│  │                          │  │  │ "Equations can be solved by        │   │
│  └──────────────────────────┘  │  │  keeping both sides balanced"      │   │
│                                │  └─────────────────────────────────────┘   │
│  ┌──────────────────────────┐  │                                             │
│  │ Learning Targets         │  │  ┌─────────────────────────────────────┐   │
│  │ • Target 1               │  │  │ 🎯 Worked Example                   │   │
│  │ • Target 2               │  │  │  └ Question                         │   │
│  └──────────────────────────┘  │  │  └ Strategy Steps  ← NEW (editable) │   │
│                                │  │  └ Visual/Graph Plan                │   │
│                                │  └─────────────────────────────────────┘   │
│                                │                                             │
│                                │  ┌─────────────────────────────────────┐   │
│                                │  │ 📝 Practice Problems                │   │
│                                │  └─────────────────────────────────────┘   │
│                                │                                             │
│                                │  ┌─────────────────────────────────────┐   │
│                                │  │ 📊 Initial Problem Analysis         │   │
│                                │  └─────────────────────────────────────┘   │
│                                │                                             │
│                                │  ❌ Strategy accordion REMOVED             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step Slide Layout (CFU + Answer Stacked)

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐                                             │
│  │ STEP 1: IDENTIFY│  Title                                      │
│  └─────────────────┘                                             │
│                                                                   │
│  ┌───────────────────────────────────┐  ┌─────────────────────┐  │
│  │                                   │  │ CHECK FOR           │  │
│  │         Main Content              │  │ UNDERSTANDING       │  │
│  │                                   │  │                     │  │
│  │  (Visual/Problem/Equation)        │  │ Why do we...?       │  │
│  │                                   │  │                     │  │
│  │                                   │  └─────────────────────┘  │
│  │                                   │  ┌─────────────────────┐  │
│  │                                   │  │ ANSWER              │  │
│  │                                   │  │                     │  │
│  │                                   │  │ Because we need...  │  │
│  │                                   │  │                     │  │
│  └───────────────────────────────────┘  └─────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

Both CFU and Answer boxes are on the same slide, stacked vertically on the right side. They use PPTX animation:
- CFU box appears on first click
- Answer box appears on second click

---

## Acceptance Criteria

### Big Idea Feature
- [x] Big Idea is generated by LLM during problem analysis
- [x] Big Idea appears prominently in Step 2 Analysis view (above all accordions)
- [x] Big Idea is displayed with a badge-style "BIG IDEA" label
- [x] Big Idea is **editable** in Step 2 (inline edit with pencil icon)

### Step 2 UI Changes
- [x] Strategy accordion is **removed** from Step 2 UI
- [x] Strategy Steps are moved INTO the Worked Example accordion (below Question)
- [x] Strategy Steps are **editable** (with StrategyStepsEditor component)

### Slide Changes
- [x] Slide 1 (Teacher Instructions) shows Big Idea + Learning Targets + Strategy (visually quiet)
- [x] Slide 2 (Big Idea) shows Grade/Unit/Lesson prominently + Big Idea badge + statement
- [x] Step slides (4-6) show CFU + Answer stacked on same slide
- [x] PPTX animation works for CFU/Answer (appear on click)

### Slide Counts
- [x] Total slide count is now 7 (was 9)
- [x] Main slides generated: 6 (was 8)
- [x] Printable slide is slide 7 (was slide 9)
- [x] All slide count constants updated throughout codebase

### Type & Code Updates
- [x] Type definitions are updated with bigIdea field
- [x] Wizard hook has `updateBigIdea` and `updateStrategyMoves` functions
- [x] Sync script propagates changes to TypeScript module
- [x] No TypeScript errors
- [x] No lint errors related to this migration (pre-existing issue in SCMNav.tsx)
