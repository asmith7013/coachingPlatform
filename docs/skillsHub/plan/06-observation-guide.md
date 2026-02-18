# 06 - Observation Guide

## Overview

A dynamic rubric form that auto-generates from the skill taxonomy plus the teacher's active/focus skills. Coaches rate skills during classroom observations, add evidence, and only rated items get saved.

## Route

`/skillsHub/teacher/[teacherId]/observe/page.tsx`

## Data Dependencies

- Taxonomy from `useTaxonomy()`
- Teacher's skill statuses from `useTeacherSkillStatuses(teacherId)` (to know which are active)
- Teacher's action steps from action plan data (to show inline)

## How the Form Auto-Generates

1. Fetch taxonomy (7 domains)
2. Fetch teacher's active skills (status = "active")
3. For each domain, filter to skills that are active for this teacher
4. Show those active skills as the default rubric rows
5. "Show more" expands to show ALL skills in that domain (not just active)
6. Active action steps appear inline under their tagged skill/domain

## Components

### ObservationGuide.tsx (main form wrapper)

- `"use client"` component
- Manages form state for all ratings (Map of skillId -> { rating, evidence })
- Manages domain-level ratings (Map of domainId -> { overallRating, evidence })
- Submit handler: filters to only rated items, calls `createObservation` action

### ObservationHeader.tsx

- Teacher name (display only)
- `DatePickerInput` -- observation date (defaults to today)
- `Select` -- observation type: Classroom Visit, Debrief, 1:1, Quick Update
- `Textarea` -- overall notes (optional)

### DomainRubricSection.tsx

- One per domain that has active skills
- Mantine `Card` with domain name header
- Default: shows only active/focus skills for this domain
- Mantine `Accordion` "Show more skills" to reveal full domain rubric
- Active action steps shown in a callout box within the domain section
- `DomainOverallRating` at the bottom of each domain section

### SkillRatingRow.tsx

- One per skill being rated
- Layout: skill name + description text, then rating controls
- `SegmentedControl` with options: Not Observed, Partial, Mostly, Fully
- Default: no selection (unrated)
- `Textarea` -- evidence field (appears when a rating is selected, optional)
- Visual: compact but readable, alternating row backgrounds

### DomainOverallRating.tsx

- Per domain: overall rating `SegmentedControl` + evidence `Textarea`
- Optional -- coach can skip this

### ActionStepCallout (inline in domain section)

- Shows active action steps tagged to skills in this domain
- Mantine `Alert` or `Paper` with step description, due date, linked skills as badges
- Read-only display (not editable from observation form)

## Submission Behavior

- Filter form state to only include skills where rating != null
- Filter domain ratings to only include domains where overallRating != null
- Minimum: at least 1 skill must be rated
- Call `createObservation(data)` server action
- On success: notification + redirect to teacher's skill map
- On error: notification with error message

## Rating Scale

```
Not Observed | Partial | Mostly | Fully
```

- Maps to: `"not_observed"` | `"partial"` | `"mostly"` | `"fully"`

## Files

| File                                                        | Type   |
| ----------------------------------------------------------- | ------ |
| `src/app/skillsHub/teacher/[teacherId]/observe/page.tsx`    | Create |
| `src/app/skillsHub/_components/ObservationGuide.tsx`         | Create |
| `src/app/skillsHub/_components/ObservationHeader.tsx`        | Create |
| `src/app/skillsHub/_components/DomainRubricSection.tsx`      | Create |
| `src/app/skillsHub/_components/SkillRatingRow.tsx`           | Create |
| `src/app/skillsHub/_components/DomainOverallRating.tsx`      | Create |
