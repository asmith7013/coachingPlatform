# Question Variant Mapping Integration

## Overview

This document describes the question variant mapping system that identifies which Podsie questions are "root" questions versus "variants" based on code similarity analysis.

## Background

In Podsie assignments, many questions share the same D3 visualization code with only minor changes (different numbers, names, or contextual text). These are called "variants" of a "root" question.

**Example:**
- **Root Question (23716)**: "Fill in the box to write an expression equivalent to **8x - 2x**"
- **Variant 1 (23741)**: "Fill in the box to write an expression equivalent to **9x - 3x**"
- **Variant 2 (23742)**: "Fill in the box to write an expression equivalent to **7x - 4x**"

All three share 100% of the same D3 code structure - only the numbers change.

## Analysis Results

From analyzing `docs/assignment.json`:

- **Total questions**: 213
- **D3 questions** (with code): 135
- **Question groups**: 25
- **Root questions**: 25
- **Variant questions**: 110

Most variants have **99-100% code similarity** after normalization.

## Files Created

### 1. Analysis Scripts

#### `scripts/analyze-question-variants.py`
Python script that:
- Reads assignment data
- Normalizes D3 code (replaces numbers/strings with placeholders)
- Compares code similarity using SequenceMatcher
- Groups questions by similarity (default threshold: 85%)
- Generates the mapping file

**Usage:**
```bash
python3 scripts/analyze-question-variants.py
```

#### `scripts/analyze-question-variants.ts`
TypeScript version (has JSON encoding issues - use Python version)

### 2. Mapping Data

#### `docs/question-variant-mapping.json`
Auto-generated mapping file with format:
```json
{
  "23715": { "type": "root", "groupId": 0 },
  "23741": { "type": "variant", "rootQuestionId": 23716, "groupId": 1 },
  "23742": { "type": "variant", "rootQuestionId": 23716, "groupId": 1 }
}
```

### 3. Utility Functions

#### `src/lib/utils/question-variant-mapping.ts`
Provides helper functions:

- `getQuestionVariantInfo(questionId)` - Get variant info for a question
- `isRootQuestion(questionId)` - Check if question is a root
- `isVariantQuestion(questionId)` - Check if question is a variant
- `getRootQuestionId(questionId)` - Get the root question ID for a variant
- `getVariantGroup(questionId)` - Get all questions in the same variant group
- `getVariantNumber(questionId, questionIds)` - Get variant number (1, 2, 3, etc.)
- **`mapQuestionsToVariantInfo(questionIds)`** - Main function for mapping questions
- `getQuestionStats(questionIds)` - Get root/variant statistics

### 4. Schema Integration

#### `src/lib/schema/zod-schema/scm/section-config.ts`
Already includes the schema for variant mapping:

```typescript
export const PodsieQuestionMapSchema = z.object({
  questionNumber: z.number().int().positive(),
  questionId: z.string(),
  isRoot: z.boolean().default(true),
  rootQuestionId: z.string().optional(),
  variantNumber: z.number().int().positive().optional(),
});
```

## Integration in Section Configs

### Location
`src/app/scm/roadmaps/section-configs/page.tsx`

### Changes Made

**Before:**
```typescript
podsieQuestionMap: match.podsieAssignment.questionIds.map((questionId: number, idx: number) => ({
  questionNumber: idx + 1,
  questionId: String(questionId),
  isRoot: true  // ❌ Always marked as root
}))
```

**After:**
```typescript
import { mapQuestionsToVariantInfo } from "@/lib/utils/question-variant-mapping";

// ...

// Use variant mapping to properly identify root vs variant questions
podsieQuestionMap: mapQuestionsToVariantInfo(match.podsieAssignment.questionIds)
```

### Result

Now when saving assignments via the section-configs page, questions are automatically mapped with proper root/variant distinction:

```typescript
[
  { questionNumber: 1, questionId: "23716", isRoot: true },
  { questionNumber: 2, questionId: "23741", isRoot: false, rootQuestionId: "23716", variantNumber: 1 },
  { questionNumber: 3, questionId: "23742", isRoot: false, rootQuestionId: "23716", variantNumber: 2 }
]
```

## Testing

### Test Script
`scripts/test-variant-mapping.ts`

**Run tests:**
```bash
npx tsx scripts/test-variant-mapping.ts
```

### Test Results
✅ All tests passing:
- Root question detection works
- Variant question detection works
- Root question ID retrieval works
- Question mapping works correctly
- Statistics calculation works

## Usage Example

```typescript
import { mapQuestionsToVariantInfo, getQuestionStats } from '@/lib/utils/question-variant-mapping';

// Map questions from an assignment
const questionIds = [23716, 23741, 23742, 23717, 23746];
const mapped = mapQuestionsToVariantInfo(questionIds);

console.log(mapped);
// Output:
// [
//   { questionNumber: 1, questionId: "23716", isRoot: true },
//   { questionNumber: 2, questionId: "23741", isRoot: false, rootQuestionId: "23716", variantNumber: 1 },
//   { questionNumber: 3, questionId: "23742", isRoot: false, rootQuestionId: "23716", variantNumber: 2 },
//   { questionNumber: 4, questionId: "23717", isRoot: true },
//   { questionNumber: 5, questionId: "23746", isRoot: false, rootQuestionId: "23717", variantNumber: 1 }
// ]

// Get statistics
const stats = getQuestionStats(questionIds);
console.log(stats);
// Output: { total: 5, roots: 2, variants: 3, unmapped: 0 }
```

## Next Steps

### 1. Use in Student Assignment Generation
When generating assignments for students, you can now:
- Select only root questions for some students
- Select specific variants for other students
- Ensure each student gets a different variant

### 2. Progress Tracking
The variant mapping enables:
- Tracking which specific variant a student completed
- Understanding that students who completed different variants actually completed the same underlying question

### 3. Analytics
You can now analyze:
- How many questions in an assignment have variants
- What percentage of questions are roots vs variants
- Which students received which variants

## Maintenance

### Re-generating the Mapping
If new questions are added to Podsie:

1. Export updated assignment data to `docs/assignment.json`
2. Run the analysis script:
   ```bash
   python3 scripts/analyze-question-variants.py
   ```
3. The mapping file will be regenerated at `docs/question-variant-mapping.json`

### Adjusting Similarity Threshold
Edit `scripts/analyze-question-variants.py` line 73:
```python
groups = group_questions_by_variants(d3_questions, similarity_threshold=0.85)
```

- Lower threshold (e.g., 0.70) = more permissive, finds more variants
- Higher threshold (e.g., 0.95) = stricter, only exact matches

## Notes

- The mapping only covers D3 questions (questions with interactive code)
- Canvas questions and other types are not included in the variant analysis
- Questions not in the mapping default to `isRoot: true`
- The first occurrence of a question group is designated as the "root"

## Support

For questions or issues with the variant mapping system:
1. Check the test script output: `npx tsx scripts/test-variant-mapping.ts`
2. Review the analysis output: `python3 scripts/analyze-question-variants.py`
3. Examine a specific question: Use `getQuestionVariantInfo(questionId)` in your code
