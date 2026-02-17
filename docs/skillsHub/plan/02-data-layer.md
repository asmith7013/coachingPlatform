# 02 - Data Layer

## Overview
Build the complete data layer for SkillsHub: taxonomy fetcher from mathkcs, Mongoose models for all 6 collections, Zod validation schemas, server actions, and React Query hooks.

## Taxonomy Fetcher

### Types
File: `src/app/skillsHub/_types/taxonomy.types.ts`

Mirror the mathkcs Zod schemas:
```typescript
import { z } from "zod";

export const TeacherSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: z.union([z.literal(1), z.literal(2)]),
  pairedSkillId: z.string().optional(),
});

export const TeacherSkillSubDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(TeacherSkillSchema),
});

export const TeacherSkillDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  subDomains: z.array(TeacherSkillSubDomainSchema),
});

export const TeacherSkillsIndexSchema = z.object({
  source: z.string(),
  description: z.string(),
  domains: z.array(TeacherSkillDomainSchema),
});

export type TeacherSkill = z.infer<typeof TeacherSkillSchema>;
export type TeacherSkillSubDomain = z.infer<typeof TeacherSkillSubDomainSchema>;
export type TeacherSkillDomain = z.infer<typeof TeacherSkillDomainSchema>;
export type TeacherSkillsIndex = z.infer<typeof TeacherSkillsIndexSchema>;

// Flat skill with parent context (for lookups)
export type TeacherSkillFlat = TeacherSkill & {
  domainId: string;
  domainName: string;
  subDomainId: string;
  subDomainName: string;
};
```

### Fetcher
File: `src/app/skillsHub/_lib/taxonomy.ts`

```typescript
// In-memory cache
let cachedTaxonomy: TeacherSkillsIndex | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const MATHKCS_API_URL = process.env.MATHKCS_API_URL || "https://<mathkcs-host>";

export async function fetchTaxonomy(): Promise<TeacherSkillsIndex> {
  // Return cache if fresh
  if (cachedTaxonomy && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedTaxonomy;
  }

  const response = await fetch(`${MATHKCS_API_URL}/api/teacher-skills/index.json`);
  const data = await response.json();
  const validated = TeacherSkillsIndexSchema.parse(data);

  cachedTaxonomy = validated;
  cacheTimestamp = Date.now();

  return validated;
}

export function getSkillById(taxonomy: TeacherSkillsIndex, skillId: string): TeacherSkillFlat | null {
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      const skill = subDomain.skills.find(s => s.id === skillId);
      if (skill) {
        return {
          ...skill,
          domainId: domain.id,
          domainName: domain.name,
          subDomainId: subDomain.id,
          subDomainName: subDomain.name,
        };
      }
    }
  }
  return null;
}

export function flattenSkills(taxonomy: TeacherSkillsIndex): TeacherSkillFlat[] {
  const skills: TeacherSkillFlat[] = [];
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        skills.push({
          ...skill,
          domainId: domain.id,
          domainName: domain.name,
          subDomainId: subDomain.id,
          subDomainName: subDomain.name,
        });
      }
    }
  }
  return skills;
}
```

Add `MATHKCS_API_URL` to `.env.local`.

## Mongoose Models

Location: `src/lib/schema/mongoose-schema/skills-hub/`

Create an `index.ts` barrel export in this directory.

### CoachTeacherAssignment
File: `src/lib/schema/mongoose-schema/skills-hub/coach-teacher-assignment.model.ts`

```typescript
// Fields:
coachStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
teacherStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true }
assignedAt: { type: Date, default: Date.now }
removedAt: { type: Date, default: null }

// Indexes:
{ coachStaffId: 1, teacherStaffId: 1 } unique (prevent duplicate assignments)
{ coachStaffId: 1 } (for caseload queries)
{ teacherStaffId: 1 } (for "who coaches this teacher?" queries)
```

### TeacherSkillStatus
File: `src/lib/schema/mongoose-schema/skills-hub/teacher-skill-status.model.ts`

```typescript
// Fields:
teacherStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
skillId: { type: String, required: true } // matches taxonomy skill ID
status: { type: String, enum: ["not_started", "active", "developing", "proficient"], default: "not_started" }
level2Unlocked: { type: Boolean, default: false }
updatedBy: { type: Schema.Types.ObjectId, ref: "NYCPSStaff" } // the coach
updatedAt: { type: Date, default: Date.now }

// Indexes:
{ teacherStaffId: 1, skillId: 1 } unique (one status per teacher per skill)
{ teacherStaffId: 1, status: 1 } (for "get active skills for teacher" queries)
```

### ActionPlan
File: `src/lib/schema/mongoose-schema/skills-hub/action-plan.model.ts`

```typescript
// Fields:
teacherStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
createdBy: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
title: { type: String, required: true }
skillIds: [{ type: String }] // taxonomy skill IDs
status: { type: String, enum: ["open", "closed", "archived"], default: "open" }
closedAt: { type: Date, default: null }
createdAt: { type: Date, default: Date.now }
updatedAt: { type: Date, default: Date.now }

// Indexes:
{ teacherStaffId: 1, status: 1 }
{ createdBy: 1 }
```

### ActionStep
File: `src/lib/schema/mongoose-schema/skills-hub/action-step.model.ts`

```typescript
// Fields:
actionPlanId: { type: Schema.Types.ObjectId, ref: "SkillsHubActionPlan", required: true }
description: { type: String, required: true }
dueDate: { type: Date }
evidenceOfCompletion: { type: String }
skillIds: [{ type: String }] // at least 1 required (validated in Zod, not Mongoose)
completed: { type: Boolean, default: false }
completedAt: { type: Date, default: null }
completedBy: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", default: null }
createdAt: { type: Date, default: Date.now }

// Indexes:
{ actionPlanId: 1 }
```

### Observation
File: `src/lib/schema/mongoose-schema/skills-hub/observation.model.ts`

```typescript
// Fields:
teacherStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
observerId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
date: { type: Date, required: true }
type: { type: String, enum: ["classroom_visit", "debrief", "one_on_one", "quick_update"], default: null }
notes: { type: String, default: null }
duration: { type: Number, default: null } // minutes
ratings: [{
  skillId: { type: String, required: true },
  rating: { type: String, enum: ["not_observed", "partial", "mostly", "fully"], required: true },
  evidence: { type: String, default: null },
}]
domainRatings: [{
  domainId: { type: String, required: true },
  overallRating: { type: String, enum: ["not_observed", "partial", "mostly", "fully"], default: null },
  evidence: { type: String, default: null },
}]
createdAt: { type: Date, default: Date.now }

// Indexes:
{ teacherStaffId: 1, date: -1 }
{ observerId: 1 }
```

### SkillNote
File: `src/lib/schema/mongoose-schema/skills-hub/skill-note.model.ts`

```typescript
// Fields:
authorId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
teacherStaffId: { type: Schema.Types.ObjectId, ref: "NYCPSStaff", required: true }
content: { type: String, required: true }
imageUrls: [{ type: String }]
tags: {
  skillIds: [{ type: String }],
  actionPlanIds: [{ type: Schema.Types.ObjectId, ref: "SkillsHubActionPlan" }],
  actionStepIds: [{ type: Schema.Types.ObjectId, ref: "SkillsHubActionStep" }],
}
createdAt: { type: Date, default: Date.now }
updatedAt: { type: Date, default: Date.now }

// Indexes:
{ teacherStaffId: 1, createdAt: -1 }
{ "tags.skillIds": 1 }
```

## Zod Validation Schemas

Location: `src/app/skillsHub/_types/`

One file per model. Each file exports:
- Input schema (for creation/validation)
- Full document schema (for reading from DB)
- Inferred TypeScript types from both

### skill-status.types.ts
- `SkillStatusEnum = z.enum(["not_started", "active", "developing", "proficient"])`
- `TeacherSkillStatusInput` -- for updates: `{ skillId, status, level2Unlocked? }`
- `TeacherSkillStatusDocument` -- full document with `_id`, `teacherStaffId`, timestamps

### action-plan.types.ts
- `ActionPlanInput` -- `{ title, skillIds[], teacherStaffId }`
- `ActionPlanDocument` -- full document
- `ActionPlanStatus = z.enum(["open", "closed", "archived"])`

### action-step.types.ts
- `ActionStepInput` -- `{ description, dueDate?, evidenceOfCompletion?, skillIds[] (min 1) }`
- `ActionStepDocument` -- full document

### observation.types.ts
- `ObservationRatingInput` -- `{ skillId, rating, evidence? }`
- `DomainRatingInput` -- `{ domainId, overallRating?, evidence? }`
- `ObservationInput` -- `{ teacherStaffId, date, type?, notes?, ratings[], domainRatings[] }`
- `ObservationType = z.enum(["classroom_visit", "debrief", "one_on_one", "quick_update"])`
- `RatingScale = z.enum(["not_observed", "partial", "mostly", "fully"])`

### note.types.ts
- `SkillNoteInput` -- `{ teacherStaffId, content, imageUrls[], tags: { skillIds[], actionPlanIds[], actionStepIds[] } }`
- `SkillNoteDocument` -- full document

### assignment.types.ts
- `CoachTeacherAssignmentInput` -- `{ coachStaffId, teacherStaffId, schoolId }`
- `CoachTeacherAssignmentDocument` -- full document

## Server Actions

Location: `src/app/skillsHub/_actions/`

All files start with `"use server";`. All functions:
- Wrap DB operations with `withDbConnection()` from `@server/db/ensure-connection`
- Return `{ success: boolean, data?: T, error?: string }`
- Validate input with Zod schemas
- Check auth via `getAuthenticatedUser()`
- Handle errors with `handleServerError()` from `@error/handlers/server`

### taxonomy.actions.ts
```typescript
export async function fetchTaxonomyAction() {
  // Wraps the taxonomy fetcher - no DB needed
  // Returns { success: true, data: TeacherSkillsIndex }
}
```

### skill-status.actions.ts (all custom, no CRUD factory)
```typescript
export async function getTeacherSkillStatuses(teacherStaffId: string)
  // Returns all TeacherSkillStatus docs for a teacher

export async function updateSkillStatus(teacherStaffId: string, skillId: string, status: SkillStatus)
  // Upsert: findOneAndUpdate with { teacherStaffId, skillId }, set status + updatedBy + updatedAt

export async function bulkUpdateSkillStatuses(teacherStaffId: string, updates: { skillId: string, status: SkillStatus }[])
  // Bulk upsert using bulkWrite

export async function unlockLevel2(teacherStaffId: string, domainId: string)
  // Fetch taxonomy to get all skills in domain, then bulkWrite to set level2Unlocked=true for all
```

### action-plan.actions.ts (CRUD factory + custom)
```typescript
// CRUD factory for: createActionPlan, fetchActionPlans, fetchActionPlanById, updateActionPlan, deleteActionPlan

export async function getActionPlans(teacherStaffId: string)
  // Custom: find by teacherStaffId, populate step counts

export async function createActionPlanWithSteps(data: { plan: ActionPlanInput, steps: ActionStepInput[] })
  // Custom: create plan, then create all steps with the plan's _id

export async function closeActionPlan(planId: string)
  // Custom: set status="closed", closedAt=now

export async function archiveActionPlan(planId: string)
  // Custom: set status="archived"
```

### action-step.actions.ts (CRUD factory + custom)
```typescript
// CRUD factory for basic operations

export async function getActionSteps(actionPlanId: string)
  // Custom: find by actionPlanId, sorted by createdAt

export async function completeActionStep(stepId: string, completedById: string)
  // Custom: set completed=true, completedAt=now, completedBy
```

### observation.actions.ts (all custom)
```typescript
export async function createObservation(data: ObservationInput)
  // Validate: must have at least one rating
  // Create observation document
  // Only include rated items (filter out empty ratings)

export async function getObservations(teacherStaffId: string)
  // Find by teacherStaffId, sort by date desc, limit 50

export async function getObservation(observationId: string)
  // Find by _id
```

### notes.actions.ts (CRUD factory + custom)
```typescript
// CRUD factory for basic operations

export async function getNotes(teacherStaffId: string, filters?: { skillId?: string, actionPlanId?: string })
  // Custom: query with optional tag filters

export async function uploadImage(formData: FormData)
  // Custom: accepts FormData, validates file type (png/jpg/webp) and size (5MB)
  // Stores to /public/uploads/skills-hub/ (local) -- cloud storage deferred
  // Returns { success: true, data: { url: string } }
```

### assignments.actions.ts (CRUD factory + custom)
```typescript
// CRUD factory for basic operations

export async function getCoachTeachers(coachStaffId: string)
  // Custom: find assignments where coachStaffId matches and removedAt is null
  // Populate teacher staff info (name, email, school)

export async function getTeacherCoaches(teacherStaffId: string)
  // Custom: find assignments where teacherStaffId matches and removedAt is null

export async function assignTeacher(coachStaffId: string, teacherStaffId: string, schoolId: string)
  // Custom: create assignment, check for existing active assignment first

export async function removeAssignment(assignmentId: string)
  // Custom: soft delete - set removedAt=now (don't actually delete, preserve history)
```

## React Query Hooks

Location: `src/app/skillsHub/_hooks/`

Each hook follows the pattern from `src/hooks/scm/podsie/useSectionOptions.ts`:
- Define query keys as const objects
- Use `useQuery` with appropriate staleTime
- Return `{ data, loading, error }` (normalized from React Query's shape)

### useTaxonomy.ts
```typescript
export const taxonomyKeys = { all: ["skills-hub-taxonomy"] as const };

export function useTaxonomy() {
  const { data, isLoading, error } = useQuery({
    queryKey: taxonomyKeys.all,
    queryFn: async () => {
      const result = await fetchTaxonomyAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (taxonomy rarely changes)
  });
  return { taxonomy: data, loading: isLoading, error: error?.message || null };
}
```

### useTeacherSkillStatuses.ts
```typescript
export const skillStatusKeys = {
  all: ["skill-statuses"] as const,
  byTeacher: (id: string) => ["skill-statuses", id] as const,
};

export function useTeacherSkillStatuses(teacherStaffId: string) {
  // queryKey: skillStatusKeys.byTeacher(teacherStaffId)
  // staleTime: 5 * 60 * 1000 (5 minutes)
}
```

### useActionPlans.ts
```typescript
export const actionPlanKeys = {
  all: ["action-plans"] as const,
  byTeacher: (id: string) => ["action-plans", id] as const,
};
// staleTime: 5 * 60 * 1000
```

### useObservations.ts
```typescript
export const observationKeys = {
  all: ["observations"] as const,
  byTeacher: (id: string) => ["observations", id] as const,
};
// staleTime: 5 * 60 * 1000
```

### useCoachCaseload.ts
```typescript
export const caseloadKeys = {
  all: ["coach-caseload"] as const,
  byCoach: (id: string) => ["coach-caseload", id] as const,
};
// staleTime: 5 * 60 * 1000
```

## Files Summary

| File | Type | Description |
|------|------|-------------|
| `src/app/skillsHub/_types/taxonomy.types.ts` | Create | Taxonomy Zod schemas + TS types |
| `src/app/skillsHub/_types/skill-status.types.ts` | Create | Skill status schemas |
| `src/app/skillsHub/_types/action-plan.types.ts` | Create | Action plan schemas |
| `src/app/skillsHub/_types/action-step.types.ts` | Create | Action step schemas |
| `src/app/skillsHub/_types/observation.types.ts` | Create | Observation schemas |
| `src/app/skillsHub/_types/note.types.ts` | Create | Note schemas |
| `src/app/skillsHub/_types/assignment.types.ts` | Create | Assignment schemas |
| `src/app/skillsHub/_lib/taxonomy.ts` | Create | Taxonomy fetcher with cache |
| `src/lib/schema/mongoose-schema/skills-hub/*.model.ts` | Create | 6 Mongoose models |
| `src/app/skillsHub/_actions/*.actions.ts` | Create | 7 server action files |
| `src/app/skillsHub/_hooks/use*.ts` | Create | 5 React Query hooks |
| `.env.local` | Modify | Add MATHKCS_API_URL |
