# Lesson Naming Standardization

## Overview

This document describes the standardization of lesson naming in the scope-and-sequence collection to ensure consistent display across the application.

## Problem Statement

Previously, lesson names embedded type information (e.g., "Ramp Up 1: Division of Fractions") which created display inconsistencies:

- **Ramp Ups**: Name included prefix → "Ramp Up 1: Division of Fractions"
- **Regular Lessons**: Name was just the title → "Projecting and Scaling"
- **UI inconsistency**: When adding "Lesson X:" prefix dynamically, ramp-ups got double prefixes: "Lesson 1: Ramp Up 1: Division of Fractions" ❌

## Solution

Added explicit `lessonType` and `lessonTitle` fields to the scope-and-sequence schema:

```typescript
{
  lessonName: "Ramp Up 1: Division of Fractions",  // Full name (kept for backward compatibility)
  lessonType: "ramp-up",                           // NEW: Explicit type
  lessonTitle: "Division of Fractions",            // NEW: Pure title without prefix
  section: "Ramp Ups",
  // ... other fields
}
```

## Schema Changes

### Zod Schema (`src/lib/schema/zod-schema/scm/scope-and-sequence.ts`)

Added:
- `LessonTypeZod` enum: `"lesson"`, `"ramp-up"`, `"unit-assessment"`
- `lessonType` field (optional)
- `lessonTitle` field (optional)

### Mongoose Schema (`src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts`)

Added:
- `lessonType`: String enum with index
- `lessonTitle`: String field

## Migration

**Script**: `scripts/migrate-lesson-naming.ts`

Extracts `lessonType` and `lessonTitle` from existing `lessonName` values:

| Pattern | lessonType | lessonTitle |
|---------|------------|-------------|
| `"Ramp Up 1: Division of Fractions"` | `ramp-up` | `Division of Fractions` |
| `"Ramp Up #2: Points on a Coordinate Plane"` | `ramp-up` | `Points on a Coordinate Plane` |
| `"End of Unit Assessment 8.2"` | `unit-assessment` | `End of Unit Assessment 8.2` |
| `"Projecting and Scaling"` | `lesson` | `Projecting and Scaling` |

**Run migration**:
```bash
npx tsx scripts/migrate-lesson-naming.ts
```

**Results** (as of 2025-12-02):
- ✅ Processed: 370 lessons
- 🔵 Regular Lessons: 333
- 🟡 Ramp Ups: 35
  - "Ramp Up [N]:" format: 24
  - "Ramp Up #[N]:" format: 11 (to be standardized)
- 🟢 Unit Assessments: 2

## Display Helper Utilities

**File**: `src/lib/utils/lesson-display.ts`

### Key Functions

#### `formatLessonDisplay()`
Intelligently format lesson names for display:

```typescript
// Ramp Up - no prefix added (already has one)
formatLessonDisplay("Ramp Up 1: Division of Fractions", "1", { showLessonNumber: true })
// => "Ramp Up 1: Division of Fractions"

// Regular lesson - prefix added
formatLessonDisplay("Projecting and Scaling", "1", { showLessonNumber: true })
// => "Lesson 1: Projecting and Scaling"

// With DB fields (preferred)
formatLessonDisplay(lesson.lessonName, lessonNumber,
  { showLessonNumber: true },
  lesson.lessonType,   // from DB
  lesson.lessonTitle   // from DB
)
```

#### `extractLessonTitle()`
Extract pure title from lesson name:

```typescript
extractLessonTitle("Ramp Up 1: Division of Fractions")
// => "Division of Fractions"

// With DB field (preferred)
extractLessonTitle(lesson.lessonName, lesson.lessonTitle)
// => uses lesson.lessonTitle directly
```

#### `getLessonType()`
Determine lesson type:

```typescript
getLessonType("Ramp Up 1: Division of Fractions")
// => "ramp-up"

// With DB field (preferred)
getLessonType(lesson.lessonName, lesson.section, lesson.lessonType)
// => uses lesson.lessonType directly
```

#### `buildLessonDisplayName()`
Build complete display name from components:

```typescript
buildLessonDisplayName("ramp-up", 1, "Division of Fractions")
// => "Ramp Up 1: Division of Fractions"

buildLessonDisplayName("lesson", 5, "More Dilations", { showLessonNumber: true })
// => "Lesson 5: More Dilations"

buildLessonDisplayName("lesson", 5, "More Dilations", { showLessonNumber: false })
// => "More Dilations"
```

## Usage Guidelines

### In UI Components

**Before** (inconsistent):
```typescript
const label = showLessonNumber
  ? `Lesson ${lessonNumber}: ${lesson.lessonName}`  // ❌ Double prefix for ramp-ups
  : lesson.lessonName;
```

**After** (consistent):
```typescript
import { formatLessonDisplay } from '@/lib/utils/lesson-display';

const label = formatLessonDisplay(
  lesson.lessonName,
  lessonNumber,
  {
    showLessonNumber: selectedSection !== 'Ramp Ups' && selectedSection !== 'Unit Assessment',
    section: lesson.section
  },
  lesson.lessonType,   // from DB (optional but preferred)
  lesson.lessonTitle   // from DB (optional but preferred)
);
```

### When to Use Each Function

| Function | Use Case |
|----------|----------|
| `formatLessonDisplay()` | **Most common** - Display lesson names in lists, cards, headers |
| `extractLessonTitle()` | Get pure title for search, filtering, or compact displays |
| `getLessonType()` | Categorization, conditional logic, analytics |
| `buildLessonDisplayName()` | Constructing new lesson names from components (e.g., form submissions) |

## Database Fields Priority

**Preferred order** (when available):
1. Use `lessonType` and `lessonTitle` from DB (fast, accurate)
2. Fall back to parsing `lessonName` + `section` (slower, less reliable)

```typescript
// ✅ Best: Use DB fields
formatLessonDisplay(
  lesson.lessonName,
  lessonNumber,
  options,
  lesson.lessonType,   // from DB
  lesson.lessonTitle   // from DB
)

// ⚠️ Fallback: Parse from lessonName
formatLessonDisplay(
  lesson.lessonName,
  lessonNumber,
  { ...options, section: lesson.section }
  // lessonType and lessonTitle will be extracted
)
```

## Future Standardization

### Ramp Up Naming
- **Current**: Mix of `"Ramp Up 1:"` and `"Ramp Up #1:"`
- **Target**: Standardize to `"Ramp Up 1:"` (no #)
- **Function**: `standardizeRampUpName()` available in helper utils

### Unit Assessment Naming
- **Current**: Mix of `"End of Unit Assessment: 8.1"` and `"End of Unit Assessment 8.2"`
- **Target**: Standardize to `"End of Unit Assessment [unit.number]"`

## Testing

Verify migration results:
```bash
# Check a specific unit
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].find({
  scopeSequenceTag: 'Grade 8',
  unitNumber: 2
}).forEach(doc => {
  printjson({
    unitLessonId: doc.unitLessonId,
    lessonName: doc.lessonName,
    lessonType: doc.lessonType,
    lessonTitle: doc.lessonTitle,
    section: doc.section
  });
});
"
```

## Components to Update

Files that display lesson names and should use the helper functions:

- ✅ `src/app/scm/podsie/progress/components/SmartboardDisplay.tsx`
- ✅ `src/app/roadmaps/podsie-progress/components/SmartboardDisplay.tsx`
- [ ] `src/app/scm/podsie/progress/components/AssignmentCard.tsx`
- [ ] `src/app/scm/podsie/progress/components/LessonProgressCard.tsx`
- [ ] `src/app/scm/roadmaps/scope-and-sequence/components/LessonListItem.tsx`
- [ ] `src/app/scm/roadmaps/scope-and-sequence/components/LessonDetailView.tsx`
- [ ] `src/app/incentives/data/tracking-actions.ts`
- [ ] Any other components displaying `lessonName`

## Benefits

1. **Consistency**: All lessons display correctly regardless of type
2. **Maintainability**: Single source of truth for display logic
3. **Flexibility**: Easy to change display formats globally
4. **Performance**: No regex parsing needed when DB fields available
5. **Type Safety**: TypeScript types for lesson categories
6. **Future-proof**: Easy to add new lesson types

## References

- Zod Schema: [src/lib/schema/zod-schema/scm/scope-and-sequence.ts](src/lib/schema/zod-schema/scm/scope-and-sequence.ts)
- Mongoose Model: [src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts](src/lib/schema/mongoose-schema/313/scope-and-sequence.model.ts)
- Display Helpers: [src/lib/utils/lesson-display.ts](src/lib/utils/lesson-display.ts)
- Migration Script: [scripts/migrate-lesson-naming.ts](scripts/migrate-lesson-naming.ts)
