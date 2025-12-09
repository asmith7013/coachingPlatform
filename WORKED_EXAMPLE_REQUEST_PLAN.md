# Worked Example Request Page Redesign Plan

## Overview
Redesign the worked example request flow to support three distinct request types with type-specific UI and workflows.

## Request Types

### 1. Mastery Check
- Create worked example from the current lesson's target skills
- Form is mostly pre-filled based on lesson data
- No student filter needed
- Simple confirm and submit flow

### 2. Prerequisite Skill
- Create worked example from an essential/helpful skill
- **Student filter appears** (teacher can see mastery data for context)
- Teacher browses practice problems across skills
- Can add multiple practice problems to a "consideration queue"
- Must select exactly ONE practice problem for final submission
- Full skill browsing experience with mastery indicators

### 3. Custom
- Free-form input (current form behavior)
- No student filter needed
- Teacher uploads their own image/content

---

## UI Structure

### Section 1: Header (existing)
- Curriculum/Unit/Lesson selectors (always visible)
- Lesson Context Card (when lesson selected)

### Section 2: Request Type Cards (NEW)
- Three cards in a full-width row
- Initially empty/unselected appearance
- Filled/highlighted when selected
- Cards:
  1. "Mastery Check" - icon + description
  2. "Prerequisite Skill" - icon + description
  3. "Custom" - icon + description

### Section 3: Type-Specific Content (conditional)

#### If "Prerequisite Skill" selected:
- Student Filter appears (in header or dedicated section)
- Three-column layout:
  - Left: Roadmap Skills with mastery indicators + descriptions toggle
  - Middle: Skill Detail View (practice problems, essential question, misconceptions)
  - Right: Context Skill (when clicking prerequisites)
- Practice problems have "Add to Consideration" button
- Selected Problems Queue appears below (new component)

#### If "Mastery Check" selected:
- Simplified view
- Show target skills for the lesson
- Pre-filled form fields
- Confirmation UI

#### If "Custom" selected:
- Current form with manual input fields
- Image upload
- Free-form text inputs

### Section 4: Selected Problems Queue (NEW - for Prerequisite Skill only)
- Horizontal scrollable row of thumbnail cards
- Each card shows:
  - Practice problem image thumbnail
  - Skill number badge
  - Problem number
  - X button to remove
- One card can be "selected" as the final choice (highlighted border)
- "Select for Request" action on each card

### Section 5: Request Form
- Adapts based on request type
- For Mastery Check: mostly pre-filled, read-only display
- For Prerequisite Skill: populated from selected practice problem
- For Custom: full editable form (current behavior)

---

## State Management

### New State Variables
```typescript
// Request type
const [requestType, setRequestType] = useState<'mastery-check' | 'prerequisite-skill' | 'custom' | null>(null);

// Consideration queue for practice problems
interface QueuedPracticeProblem {
  skillNumber: string;
  skillTitle: string;
  problemNumber: number;
  screenshotUrl: string;
  skillColor: 'green' | 'orange' | 'purple';
}
const [practiceProblemQueue, setPracticeProblemQueue] = useState<QueuedPracticeProblem[]>([]);

// Final selected practice problem (from queue)
const [selectedPracticeProblem, setSelectedPracticeProblem] = useState<QueuedPracticeProblem | null>(null);
```

### Existing State to Keep
- Lesson selection (grade, unit, lesson)
- Student filter (only used when requestType === 'prerequisite-skill')
- Skill selection for detail view
- Form fields

---

## Components to Create/Modify

### New Components

1. **RequestTypeSelector** (`src/app/scm/workedExamples/request/components/RequestTypeSelector.tsx`)
   - Three card layout
   - Props: `selectedType`, `onTypeSelect`
   - Visual states: unselected, selected

2. **PracticeProblemQueue** (`src/app/scm/workedExamples/request/components/PracticeProblemQueue.tsx`)
   - Horizontal scrollable list
   - Props: `items`, `selectedItem`, `onSelect`, `onRemove`
   - Thumbnail cards with skill badge, X button

### Modified Components

1. **PracticeProblemsSection** (`src/app/scm/roadmaps/components/SkillDetailView/PracticeProblemsSection.tsx`)
   - Add optional "Add to Consideration" button
   - New props: `onAddToQueue?: (problem: PracticeProblem, skillNumber: string) => void`
   - Show checkmark if problem is already in queue

2. **Request Page** (`src/app/scm/workedExamples/request/page.tsx`)
   - Add RequestTypeSelector at top
   - Conditionally show student filter based on request type
   - Add PracticeProblemQueue section
   - Adapt form based on request type

3. **RequestHeader** (`src/app/scm/workedExamples/request/components/RequestHeader.tsx`)
   - Make studentFilterSlot conditional
   - Only render when passed

---

## Implementation Order

### Phase 1: Request Type Selection
1. Create RequestTypeSelector component
2. Add requestType state to page
3. Wire up type selection
4. Conditionally show/hide student filter based on type

### Phase 2: Practice Problem Queue
1. Create PracticeProblemQueue component
2. Add queue state management
3. Modify PracticeProblemsSection to add "Add to Consideration" button
4. Wire up add/remove/select actions

### Phase 3: Form Adaptation
1. Add logic to pre-fill form based on request type
2. For Mastery Check: auto-populate from lesson data
3. For Prerequisite Skill: populate from selected practice problem
4. For Custom: keep current behavior

### Phase 4: Polish
1. Visual refinements
2. Empty states
3. Validation
4. Error handling

---

## File Locations

```
src/app/scm/workedExamples/request/
├── page.tsx                          # Main page (modify)
├── components/
│   ├── index.ts                      # Exports (modify)
│   ├── RequestHeader.tsx             # Header (modify)
│   ├── RequestTypeSelector.tsx       # NEW
│   ├── PracticeProblemQueue.tsx      # NEW
│   ├── LessonContextCard.tsx         # Keep as-is
│   └── WorkedExampleForm.tsx         # Modify for type-specific behavior

src/app/scm/roadmaps/components/SkillDetailView/
├── PracticeProblemsSection.tsx       # Modify - add queue button
```

---

## Key Decisions
- Teacher can browse and add multiple practice problems to consideration queue
- Must select exactly ONE practice problem for final submission
- Queue has X to remove items, no reordering
- Student filter only appears for "Prerequisite Skill" request type
- Form adapts (pre-fill vs manual) based on request type
