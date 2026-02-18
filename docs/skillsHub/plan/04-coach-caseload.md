# 04 - Coach Caseload Page

## Overview

Dashboard showing all teachers assigned to the logged-in coach, with summary stats per teacher. Entry point for coaches into the skill management workflow.

## Route

`/skillsHub/page.tsx` redirects coaches here, or directly at `/skillsHub/caseload/page.tsx` (TBD based on routing decision in foundation phase).

## Data Dependencies

- Coach's assigned teachers from `useCoachCaseload(coachStaffId)` hook
- Current user's staffId from auth context

## Components

### CaseloadPage (`caseload/page.tsx`)

- `"use client"` component
- Gets current user's staffId from `useAuthenticatedUser()`
- Fetches caseload with `useCoachCaseload(staffId)`
- Renders header + `CaseloadTable`

### CaseloadTable.tsx (`_components/CaseloadTable.tsx`)

- Mantine `Table` with striped rows and hover highlight
- Columns: Teacher Name, School, Active Skills, Open Plans, Last Observation
- Each row clickable -> navigates to `/skillsHub/teacher/[teacherId]`
- Empty state: "No teachers assigned. Contact your admin to get started."
- Loading state: Mantine `Skeleton` rows

### Summary Stats

Per teacher row:

- **Active Skills**: count of skills with status "active" (from TeacherSkillStatus)
- **Open Plans**: count of action plans with status "open"
- **Last Observation**: date of most recent observation, formatted relative ("2 days ago")

These counts come from the `getCoachTeachers` server action (which aggregates this data).

## Teacher Role Redirect

If a teacher visits `/skillsHub`, redirect to `/skillsHub/teacher/[ownStaffId]` (their own skill map).
This logic lives in `page.tsx` (the hub page) or in the layout.

## Files

| File                                              | Type   |
| ------------------------------------------------- | ------ |
| `src/app/skillsHub/caseload/page.tsx`             | Create |
| `src/app/skillsHub/_components/CaseloadTable.tsx` | Create |
