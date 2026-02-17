# 07 - Skill Detail Page

## Overview

Unified detail view for a single skill, showing everything related to it for a specific teacher: status, linked action plans, observation history, notes, and a quick update form for coaches.

## Route

`/skillsHub/skill/[skillId]/page.tsx` with `?teacherId=` query param

## Data Dependencies

- Skill info from taxonomy (via `useTaxonomy()` + `getSkillById()`)
- Skill status from `useTeacherSkillStatuses(teacherId)` (filtered to this skill)
- Action plans linked to this skill from `useActionPlans(teacherId)` (filtered by skillId)
- Observations that rated this skill from `useObservations(teacherId)` (filtered)
- Notes tagged to this skill from a notes query

## Page Layout (Mantine Stack)

### 1. SkillDetailHeader.tsx

- Skill name as `Title order={2}`
- Description as `Text`
- Level `Badge` (L1 blue / L2 purple)
- Current status `SkillStatusBadge`
- Coach only: `SegmentedControl` to change status (calls `updateSkillStatus` action)
- Breadcrumb: Skills Hub > [Domain] > [SubDomain] > [Skill Name]

### 2. Quick Update Section (coach only)

- Lightweight alternative to full observation guide
- Inline form: `SegmentedControl` for rating + `Textarea` for evidence + `Button` "Save"
- Creates a "quick_update" type observation with just this one skill rated
- Collapsed by default, "Quick Update" button to expand

### 3. Action Plans Section

- `Text fw={600}` header: "Action Plans"
- Cards for each action plan linked to this skill (filtered from all plans)
- Each card: plan title, status, relevant action steps (only steps tagged to this skill)
- Compact view -- no full card expansion here

### 4. Observations Timeline (SkillObservationTimeline.tsx)

- `Text fw={600}` header: "Observation History"
- Mantine `Timeline` component showing chronological ratings for this specific skill
- Each timeline item: date, rating badge, evidence text, observer name, observation type
- Most recent first
- Empty state: "No observations recorded for this skill yet"

### 5. Notes Section (SkillNotesSection.tsx)

- `Text fw={600}` header: "Notes"
- List of notes tagged to this skill, most recent first
- Each note: author, date, content text, images (if any) as thumbnails
- Coach only: `NoteEditor` at top to create new notes

### NoteEditor.tsx (shared component)

- Mantine `Textarea` for text content
- Mantine `FileInput` for image upload (accept: image/png, image/jpeg, image/webp)
- Upload flow: select file -> call `uploadImage` server action -> get URL -> add to note
- Mantine `MultiSelect` for tags:
  - Skills: searchable list from taxonomy
  - Action Plans: from teacher's open plans
  - Action Steps: from teacher's open plan steps
- Submit button: calls `createNote` action
- On success: notification + refetch notes

### Image Upload Details

- Server action: `uploadImage(formData: FormData)`
- Validates: file type (png/jpg/webp), size (max 5MB)
- Storage: `/public/uploads/skills-hub/[timestamp]-[filename]` (local dev)
- Returns: `{ success: true, data: { url: "/uploads/skills-hub/..." } }`
- Display: thumbnail with click to expand (Mantine `Image` component)

## Files

| File                                                           | Type   |
| -------------------------------------------------------------- | ------ |
| `src/app/skillsHub/skill/[skillId]/page.tsx`                   | Create |
| `src/app/skillsHub/_components/SkillDetailHeader.tsx`           | Create |
| `src/app/skillsHub/_components/SkillObservationTimeline.tsx`    | Create |
| `src/app/skillsHub/_components/SkillNotesSection.tsx`           | Create |
| `src/app/skillsHub/_components/NoteEditor.tsx`                  | Create |
