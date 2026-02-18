# 08 - Admin Assignments

## Overview

Admin page for managing coach-teacher assignments. Two-panel layout where admins select a coach, see their current caseload, and add or remove teachers.

## Route

`/skillsHub/admin/assignments/page.tsx`

## Data Dependencies

- All coaches (staff with coach role) from staff data
- All teachers (staff with teacher role) from staff data
- Current assignments from `assignments.actions.ts`

## Access Control

- Only accessible by users with admin/super_admin/director roles
- Check role in page component and show access denied if unauthorized

## Components

### AssignmentManager.tsx

Two-panel layout using Mantine `Grid cols={2}` or `SimpleGrid`.

#### Left Panel: Coach Selection + Current Caseload

- `Select` -- pick a coach (searchable, shows coach name + email)
- Populated from staff records with coach role
- Below: Mantine `Table` of currently assigned teachers for this coach
  - Columns: Teacher Name, School, Assigned Date, Actions
  - Actions: `ActionIcon` with trash icon to remove assignment (calls `removeAssignment`)
  - Confirm removal with `Modal`: "Remove [teacher] from [coach]'s caseload?"

#### Right Panel: Add Teachers

- `MultiSelect` -- search and select teachers to add (searchable, shows name + school)
- Shows all teachers (no role-based restriction per PRD)
- Filter out already-assigned teachers
- `Select` for school (required for assignment)
- `Button` "Assign Selected Teachers"
- Calls `assignTeacher` for each selected teacher
- On success: refetch caseload, show notification

## Edge Cases (from PRD)

- Coach removed from teacher: existing action plans/notes remain visible (historical record)
- Assignment uses soft delete (removedAt timestamp, not actual deletion)
- No "primary coach" concept -- any assigned coach can manage the teacher

## Empty States

- No coach selected: "Select a coach to view their caseload"
- Coach has no teachers: "No teachers assigned to this coach"
- No coaches available: "No staff members with coach role found"

## Files

| File                                                    | Type   |
| ------------------------------------------------------- | ------ |
| `src/app/skillsHub/admin/assignments/page.tsx`          | Create |
| `src/app/skillsHub/_components/AssignmentManager.tsx`   | Create |
