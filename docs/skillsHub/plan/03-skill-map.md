# 03 - Skill Map Page

## Overview

The core visual of SkillsHub. Shows all skills organized by domain -> subdomain, with status indicators per teacher. Coaches can edit statuses; teachers see read-only.

## Route

`/skillsHub/teacher/[teacherId]/page.tsx`

## Data Dependencies

- Taxonomy from `useTaxonomy()` hook
- Teacher's skill statuses from `useTeacherSkillStatuses(teacherId)` hook
- Current user role from `useAuthenticatedUser()` hook

## Components

### SkillMap.tsx (`_components/SkillMap.tsx`)

- Main container component
- Fetches taxonomy + skill statuses
- Merges them: for each taxonomy skill, looks up the teacher's status (defaults to "not_started")
- Renders as Mantine `SimpleGrid cols={{ base: 1, md: 2 }}` of `DomainSection` cards
- Props: `teacherStaffId: string`, `isCoachView: boolean`

### DomainSection.tsx (`_components/DomainSection.tsx`)

- Mantine `Card` with domain header
- Header: domain name + count of active skills in this domain as `Badge`
- Body: Mantine `Accordion` with one item per subdomain
- Each accordion item: subdomain name as label, list of `SkillCard` components
- Level 2 section: dimmed/collapsed by default, "Unlock Level 2" button for coaches

### SkillCard.tsx (`_components/SkillCard.tsx`)

- Compact card for a single skill
- Layout: horizontal row with skill name, level `Badge` (L1 blue, L2 purple), `SkillStatusBadge`, chevron
- Coach view: clicking opens inline `Select` to change status
- Teacher view: clicking navigates to `/skillsHub/skill/[skillId]?teacherId=[teacherId]`
- Level 2 skills: dimmed opacity + "Locked" badge until `level2Unlocked` is true
- Active/focus skills: left border highlight (blue)

### SkillStatusBadge.tsx (`_components/SkillStatusBadge.tsx`)

- Mantine `Badge` with color based on status:
  - not_started: gray
  - active: blue
  - developing: yellow
  - proficient: green
- Small size, pill variant

## Coach vs Teacher Behavior

- Coach can change skill statuses inline via `Select` dropdown
- Coach can click "Set Active" button on any skill to change status to "active"
- Coach sees "Unlock Level 2" button per domain (calls `unlockLevel2` action)
- Teacher sees read-only view, no edit controls
- Both roles see the same grid layout

## Page Component (`teacher/[teacherId]/page.tsx`)

- `"use client"` component
- Extract `teacherId` from params
- Header: teacher name + school (fetch from staff data or pass via context)
- Quick actions bar: "Create Action Plan" button, "Start Observation" button (coach only)
- Main content: `<SkillMap teacherStaffId={teacherId} isCoachView={isCoach} />`

## Files

| File                                                   | Type   |
| ------------------------------------------------------ | ------ |
| `src/app/skillsHub/teacher/[teacherId]/page.tsx`       | Create |
| `src/app/skillsHub/_components/SkillMap.tsx`            | Create |
| `src/app/skillsHub/_components/DomainSection.tsx`       | Create |
| `src/app/skillsHub/_components/SkillCard.tsx`           | Create |
| `src/app/skillsHub/_components/SkillStatusBadge.tsx`    | Create |
