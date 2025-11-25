# Schema Changes Summary: Section-Centric Configuration

## Overview
Refactored to a **section-centric design** where each class section has a single configuration document containing all metadata and Podsie assignments. This supports multi-school, multi-section deployments where the same curriculum has different Podsie assignment IDs per section.

## Changes Made

### 1. New Enums Added ([src/lib/schema/enum/313.ts](src/lib/schema/enum/313.ts))

```typescript
// New school enum
export const Schools = ["IS313", "PS19", "X644"] as const;

// New PS19 sections
export const SectionsPS19 = ["601", "602", "603"] as const;

// Combined sections for all schools
export const AllSections = [...Sections313, ...SectionsPS19] as const;
```

### 2. New Collection: `section-configs`

**Purpose**: Store complete configuration for each class section, including metadata and all Podsie assignments.

**Files Created**:
- Zod Schema: [src/lib/schema/zod-schema/313/section-config.ts](src/lib/schema/zod-schema/313/section-config.ts)
- Mongoose Model: [src/lib/schema/mongoose-schema/313/section-config.model.ts](src/lib/schema/mongoose-schema/313/section-config.model.ts)
- Server Actions: [src/app/actions/313/section-config.ts](src/app/actions/313/section-config.ts)
- Helper Utilities: [src/lib/utils/section-config-helpers.ts](src/lib/utils/section-config-helpers.ts)

**Schema Structure**:
```typescript
{
  // Section metadata
  school: "IS313" | "PS19" | "X644",
  classSection: "802" | "803" | "601" | ...,
  teacher: "CARDONA" | "COMPRES" | ...,
  gradeLevel: "6" | "7" | "8",
  scopeSequenceTag: "Grade 8" | "Algebra 1" | ...,
  active: boolean,

  // Array of Podsie assignments for THIS section
  podsieAssignments: [
    {
      unitLessonId: "3.15",
      lessonName: "Solving Systems",
      grade: "8",
      podsieAssignmentId: "assignment-123",
      podsieQuestionMap: [
        { questionNumber: 1, questionId: "q1" },
        { questionNumber: 2, questionId: "q2" }
      ],
      totalQuestions: 10,
      active: true,
      notes?: string
    },
    // ... 160 more assignments
  ],

  notes?: string
}
```

**Document Size**: ~92 KB per section (well within 16 MB MongoDB limit)

**Indexes**:
- Unique: `{ school, classSection }`
- Query: `{ school, active }`, `{ teacher, active }`, `{ gradeLevel, active }`
- Assignment lookup: `{ 'podsieAssignments.unitLessonId' }`

### 3. Updated: `scope-and-sequence` Collection

**Removed Fields**:
- `podsieAssignmentId` ❌
- `podsieQuestionMap` ❌
- `totalQuestions` ❌

**Rationale**: These fields are now section-specific and live in `section-configs` collection as an array of assignments.

**Files Updated**:
- [src/lib/schema/zod-schema/313/scope-and-sequence.ts](src/lib/schema/zod-schema/313/scope-and-sequence.ts)
- [src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts](src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts)

### 4. Updated: `students` Collection

**New Field**:
```typescript
{
  school: "IS313" | "PS19" | "X644", // ✅ NEW
  section: AllSectionsZod, // ✅ UPDATED to support all schools
  // ... rest of fields
}
```

**Files Updated**:
- [src/lib/schema/zod-schema/313/student.ts](src/lib/schema/zod-schema/313/student.ts)
- [src/lib/schema/mongoose-schema/313/student.model.ts](src/lib/schema/mongoose-schema/313/student.model.ts)

**New Index**:
- `{ school, section, active }`

### 5. Updated: Ramp-Up Progress Page

**New Features**:
- School-grouped section selector (IS313 sections shown first, then PS19, X644)
- Lesson section filter (A, B, C, D, E, F, Ramp Ups)
- 3-column filter layout: Class Section | Unit | Lesson Section

**Files Updated**:
- [src/app/roadmaps/ramp-up-progress/page.tsx](src/app/roadmaps/ramp-up-progress/page.tsx)

## Server Actions

### New Actions ([src/app/actions/313/section-config.ts](src/app/actions/313/section-config.ts))

1. **`createSectionConfig()`** - Create new section config
2. **`updateSectionConfig()`** - Update existing config
3. **`deleteSectionConfig()`** - Delete config
4. **`fetchSectionConfigs()`** - Fetch with pagination
5. **`fetchSectionConfigById()`** - Fetch by ID
6. **`fetchSectionConfigsByQuery()`** - Query by school/section/teacher/grade
7. **`getSectionConfig()`** - Get config for specific school + section
8. **`upsertSectionConfig()`** - Create or update entire section config
9. **`addPodsieAssignment()`** - Add assignment to section's array
10. **`updatePodsieAssignment()`** - Update specific assignment in array
11. **`removePodsieAssignment()`** - Remove assignment from array
12. **`getSectionOptions()`** - Get all sections for dropdown (with metadata)
13. **`getPodsieAssignment()`** - Get specific assignment for a lesson

## Helper Utilities

### New Helpers ([src/lib/utils/section-config-helpers.ts](src/lib/utils/section-config-helpers.ts))

```typescript
// Join lessons with their Podsie assignments from section config
joinLessonWithPodsieAssignment(lesson, assignment)
joinLessonsWithSectionConfig(lessons, sectionConfig)

// Fetch joined data
fetchLessonsWithSectionConfig(school, classSection, filters)

// Query helpers
getPodsieAssignmentId(unitLessonId, sectionConfig)
getPodsieQuestionMap(unitLessonId, sectionConfig)
hasPodsieAssignment(unitLessonId, sectionConfig)
getLessonsWithPodsieAssignments(lessons, sectionConfig)
getLessonsWithoutPodsieAssignments(lessons, sectionConfig)

// Stats
getSectionConfigStats(sectionConfig)
```

## Architecture Benefits

### Before (Lesson-Centric, Normalized)
```
scope-and-sequence
└─ Unit 3.15 - Solving Systems
   ├─ curriculum data
   └─ NO Podsie data ✅

podsie-completion (160 documents per section)
├─ IS313 / 802 / Unit 3.15  (1 doc)
├─ IS313 / 802 / Unit 3.16  (1 doc)
├─ IS313 / 802 / Unit 3.17  (1 doc)
└─ ... 157 more docs
```
**Problem**: N+1 queries, difficult to manage section, metadata scattered

### After (Section-Centric, Denormalized) ✅
```
scope-and-sequence
└─ Unit 3.15 - Solving Systems
   └─ curriculum data only

section-configs (1 document per section)
└─ IS313 / 802
   ├─ teacher: "CARDONA"
   ├─ gradeLevel: "8"
   └─ podsieAssignments: [160 assignments]
      ├─ Unit 3.15
      ├─ Unit 3.16
      ├─ Unit 3.17
      └─ ... 157 more
```
**Benefits**: Single query, all metadata together, ~92 KB doc size

### Key Advantages

1. **Natural Mental Model** - Section is the real-world entity
2. **Single Query** - Get all section info + all assignments at once
3. **Easy Management** - "Edit Section 802" shows everything
4. **Atomic Updates** - Use `$push`/`$pull` for assignment array
5. **Efficient Dropdowns** - One query gets all section options with metadata
6. **Perfect Size** - 160 assignments × 575 bytes = 92 KB (0.56% of 16 MB limit)

## Breaking Changes

⚠️ **Students collection now requires `school` field**
- All existing student documents need to be updated with `school: "IS313"`
- Student creation forms need to include school selector

⚠️ **Scope-and-sequence no longer has Podsie fields**
- Code referencing `lesson.podsieAssignmentId` will break
- Use helper functions from `section-config-helpers.ts` instead

⚠️ **Old `podsie-completion` collection is deprecated**
- Replaced by `section-configs`
- Migration script needed to consolidate per-lesson docs into per-section docs

## Migration Path

### Phase 1: Data Migration (TODO)
Create script to consolidate existing Podsie data:

```typescript
// For each section (e.g., IS313/802):
// 1. Find all podsie-completion docs for that section
// 2. Create one section-config doc with:
//    - Section metadata (school, classSection, teacher, grade)
//    - podsieAssignments array from all per-lesson docs
// 3. Validate data integrity
// 4. Delete old podsie-completion docs
```

### Phase 2: Code Updates (TODO)
Update existing code that references old structure:
- Ramp-up progress tracking
- Podsie sync scripts
- Student dashboard displays
- Assessment scrapers

### Phase 3: Database Cleanup
- Drop old `podsie-completion` collection
- Add school field to all existing students (default "IS313")

## Next Steps

1. ✅ Schema changes complete
2. ✅ UI updated with school-grouped sections and lesson section filter
3. ⏳ Create data migration script
4. ⏳ Add school field to all existing students
5. ⏳ Update Podsie sync to use new structure
6. ⏳ Test with real data

## Files to Remove (After Migration)

- ❌ `src/lib/schema/zod-schema/313/podsie-completion.ts`
- ❌ `src/lib/schema/mongoose-schema/313/podsie-completion.model.ts`
- ❌ `src/app/actions/313/podsie-completion.ts`
- ❌ `src/lib/utils/podsie-completion-helpers.ts`
