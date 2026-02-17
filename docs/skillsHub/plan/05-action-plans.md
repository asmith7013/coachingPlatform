# 05 - Action Plans

## Overview

Coaches create structured action plans for teachers, linking them to skills. Each plan contains action steps with due dates and evidence criteria. Plans have a lifecycle: Open -> Closed -> Archived.

## Routes

- `/skillsHub/teacher/[teacherId]/action-plans/page.tsx` -- list all plans for this teacher
- `/skillsHub/teacher/[teacherId]/action-plans/new/page.tsx` -- create new plan + steps

## Data Dependencies

- Action plans from `useActionPlans(teacherId)` hook
- Taxonomy for skill selection from `useTaxonomy()` hook
- Teacher's active skills from `useTeacherSkillStatuses(teacherId)` for suggested skills

## List Page

### Components

- `ActionPlanList.tsx` -- Mantine `Stack` of `ActionPlanCard` components
- Filter tabs: "Open" | "Closed" | "All" using Mantine `SegmentedControl`
- "Create New Plan" button at top

### ActionPlanCard.tsx

- Mantine `Card` with:
  - Title as `Text fw={600}`
  - Linked skills as `Badge` group (colored by domain)
  - Status badge: Open=blue, Closed=gray, Archived=dimmed
  - Progress bar: `Progress` showing X/Y steps complete
  - Created date, relative format
- Click to expand: reveals `ActionStepList` inline using Mantine `Collapse`
- Expanded view shows each step with checkbox, description, due date, completion status

### ActionStepList (inline in card)

- Each step: `Checkbox` (coach can toggle complete), description text, due date as `Badge`, skill tags
- Completing a step calls `completeActionStep` action
- Close plan button in expanded footer (calls `closeActionPlan`)

## Create Form Page

### ActionPlanForm.tsx

- Mantine form components:
  - `TextInput` -- plan title (required)
  - `MultiSelect` -- select skills from taxonomy (searchable, grouped by domain)
  - Dynamic step list with add/remove
- Initial state: 1 empty step, "Add Step" button to add more

### ActionStepFields.tsx (repeatable component)

- Each step row contains:
  - `TextInput` -- description (what to do) (required)
  - `DatePickerInput` -- due date (from `@mantine/dates`)
  - `Textarea` -- evidence of completion criteria
  - `MultiSelect` -- skill tags (pre-populated from plan's skills, can add others)
  - `ActionIcon` -- remove this step (trash icon)
- Minimum 1 step required (can't remove the last one)

### Submission

- Validates all fields with Zod
- Calls `createActionPlanWithSteps` server action (creates plan + all steps atomically)
- On success: redirect to action plans list page
- On error: show Mantine `notifications` toast

## Edge Cases (from PRD)

- Action plan with all steps complete -> plan stays open until coach explicitly closes
- Closing plan does NOT auto-close incomplete steps
- No auto-cascading between plan closure and skill status

## Files

| File                                                              | Type   |
| ----------------------------------------------------------------- | ------ |
| `src/app/skillsHub/teacher/[teacherId]/action-plans/page.tsx`     | Create |
| `src/app/skillsHub/teacher/[teacherId]/action-plans/new/page.tsx` | Create |
| `src/app/skillsHub/_components/ActionPlanList.tsx`                 | Create |
| `src/app/skillsHub/_components/ActionPlanCard.tsx`                 | Create |
| `src/app/skillsHub/_components/ActionPlanForm.tsx`                 | Create |
| `src/app/skillsHub/_components/ActionStepFields.tsx`              | Create |
