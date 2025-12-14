# Create Assignment Variation Skill - Implementation Plan

## Overview

Create a skill for generating "Version B" of a Podsie assignment. This produces **static, state-test-style questions** - no interactive elements, no input boxes, no movable graphs. Just clean question text with optional static visuals (tables, graphs as images/SVG).

The skill transcribes existing questions and creates variations with new numbers/contexts while maintaining the same mathematical rigor.

## Question Format

These are **paper-test style questions**:
- Plain text question prompt
- Optional static visual (table, graph, diagram)
- Clear acceptance criteria for grading
- NO interactive elements (no input boxes, no D3 interactivity)
- Similar to state standardized test items

## Key Differences from Other Skills

| Aspect | create-worked-example-sg | create-assignment-variation |
|--------|-------------------------|----------------------------|
| Input | Screenshot of math problem | Screenshot of assignment questions |
| Output | Interactive HTML slides | Static question JSON files |
| Visual Types | HTML, P5.js, D3.js (interactive) | Static HTML tables, SVG graphs |
| Interactivity | CFU toggles, animations | **None** - paper-test style |
| DB Collection | `workedexampledecks` | `assignment-variations` (new) |
| Local Path | `src/app/presentations/{slug}/` | `src/app/scm/podsie/variations/{slug}/` |

## Borrowed Patterns

### From create-worked-example-sg:
- Dual-save system (local files + MongoDB)
- Node.js sync script pattern (`sync-to-db.js`)
- Metadata.json structure
- Scope and sequence ID lookup
- Required user input prompts

### From create-variations (podsie-curriculum):
- **Verification checklist** - ensures variation is properly differentiated
- Question content structure (`question-contents.md` format)
- What to transcribe: context, question text, acceptance criteria, explanation
- Variation quality rules (different numbers, same rigor, unique scenarios)
- Emoji/context differentiation patterns

## Schema Design

### Zod Schema: `assignment-variation.ts`

```typescript
// Assignment Variation - a "Version B" copy of an existing assignment
export const AssignmentVariationFieldsSchema = z.object({
  // =====================================
  // IDENTIFYING INFO
  // =====================================
  title: z.string().describe("Assignment title (e.g., 'Linear Equations Practice - Version B')"),
  slug: z.string().describe("URL-friendly identifier"),

  // =====================================
  // SCOPE AND SEQUENCE REFERENCE
  // =====================================
  scopeSequenceTag: ScopeSequenceTagZod.describe("Scope and sequence tag"),
  grade: z.string().describe("Grade level"),
  unitNumber: z.number().int().positive().describe("Unit number"),
  lessonNumber: z.number().int().describe("Lesson number"),
  scopeAndSequenceId: z.string().optional().describe("MongoDB ObjectId of scope-and-sequence doc"),
  section: SectionZod.optional().describe("Lesson section (A, B, C, etc.)"),

  // =====================================
  // ORIGINAL ASSIGNMENT REFERENCE
  // =====================================
  originalAssignmentName: z.string().optional().describe("Name of the original Podsie assignment"),
  originalPodsieAssignmentId: z.string().optional().describe("Podsie assignment UUID if known"),

  // =====================================
  // QUESTIONS
  // =====================================
  questions: z.array(QuestionVariationSchema).describe("Array of question variations"),

  // =====================================
  // METADATA
  // =====================================
  generatedBy: z.enum(["ai", "manual"]).default("ai"),
  sourceImage: z.string().optional().describe("Filename of source screenshot"),
  isPublic: z.boolean().default(true),
  notes: z.string().optional(),
});

// Individual question within the variation (STATIC - no interactivity)
export const QuestionVariationSchema = z.object({
  questionNumber: z.number().int().positive().describe("Question number (1, 2, 3...)"),

  // Content (adapted from question-contents.md)
  questionTitle: z.string().describe("Short descriptive title (<= 80 chars)"),
  contextScenario: z.string().optional().describe("Introductory text/scenario (if any)"),
  questionText: z.string().describe("The actual question prompt - exactly as student sees it"),

  // Static visual (optional) - tables, graphs as static HTML/SVG
  visualType: z.enum(["none", "table", "graph", "diagram"]).default("none"),
  visualHtml: z.string().optional().describe("Static HTML for table or SVG for graph"),
  visualDescription: z.string().optional().describe("Alt text / description of the visual"),

  // Answer information
  acceptanceCriteria: z.array(z.string()).describe("Conditions for correct response"),
  correctAnswer: z.string().describe("The correct answer"),
  acceptableAnswerForms: z.array(z.string()).optional().describe("Equivalent forms accepted (e.g., '0.5', '1/2', '50%')"),

  // Explanation for AI tutor / grading
  explanation: z.string().describe("Guidance for AI tutor - hints, common misconceptions"),
  solutionSteps: z.array(z.string()).optional().describe("Step-by-step solution process"),
});
```

## File Structure

### Local Files
```
src/app/scm/podsie/variations/{slug}/
├── metadata.json           # Assignment metadata + scope/sequence ref
├── question-1.json         # Question 1 content
├── question-2.json         # Question 2 content
├── question-3.json         # etc.
└── README.md              # Auto-generated summary (optional)
```

### metadata.json Structure
```json
{
  "title": "Linear Equations - Version B",
  "slug": "linear-equations-grade8-u3-l5-vB",
  "scopeSequenceTag": "Grade 8",
  "grade": "8",
  "unitNumber": 3,
  "lessonNumber": 5,
  "scopeAndSequenceId": "abc123...",
  "section": "B",
  "originalAssignmentName": "3.5 Linear Equations Practice",
  "questionCount": 5,
  "generatedBy": "ai",
  "sourceImage": "assignment-screenshot.png",
  "createdAt": "2025-12-09T..."
}
```

### question-N.json Structure
```json
{
  "questionNumber": 1,
  "questionTitle": "Finding Slope from Table",
  "contextScenario": "A video game character earns gold coins at a steady rate...",
  "questionText": "What is the rate of change (slope) shown in the table?",
  "visualType": "table",
  "visualHtml": "<table style='border-collapse: collapse;'><tr><th>Hours</th><th>Gold Coins</th></tr><tr><td>1</td><td>15</td></tr><tr><td>2</td><td>30</td></tr><tr><td>3</td><td>45</td></tr></table>",
  "visualDescription": "Table showing Hours (1, 2, 3) and Gold Coins (15, 30, 45)",
  "acceptanceCriteria": [
    "Student identifies the rate of change as 15 coins per hour",
    "Accept equivalent forms: 15, 15.0, 15/1"
  ],
  "correctAnswer": "15",
  "acceptableAnswerForms": ["15", "15.0", "15/1", "15 coins per hour"],
  "explanation": "The rate of change is found by calculating rise/run. Each hour (run of 1) corresponds to 15 more coins (rise of 15). Common misconception: confusing total coins with rate.",
  "solutionSteps": [
    "Identify two points from the table: (1, 15) and (2, 30)",
    "Calculate rise: 30 - 15 = 15",
    "Calculate run: 2 - 1 = 1",
    "Slope = rise/run = 15/1 = 15"
  ]
}
```

## Workflow

### Required User Input (Prompt at Start)
1. **Grade Level** - "6", "7", "8", or "Algebra 1"
2. **Unit Number** - e.g., 3
3. **Lesson Number** - e.g., 5
4. **Section** (optional) - "A", "B", "C", etc.
5. **Original Assignment Name** (optional) - Name from Podsie
6. **Screenshot(s)** - Image(s) of the assignment questions

### Step-by-Step Process

**Step 1: Look up Scope and Sequence ID**
```bash
mongosh "$DATABASE_URL" --eval "
const result = db['scope-and-sequence'].findOne({
  grade: '[GRADE]',
  unitNumber: [UNIT],
  lessonNumber: [LESSON]
});
if (result) {
  print('ID:', result._id.toString());
  print('Lesson:', result.lessonName);
}
" --quiet
```

**Step 2: Analyze Screenshot**
- Count number of questions
- Identify answer type for each (numeric, text, equation, etc.)
- Extract context/scenario for each
- Note any visual elements (tables, graphs, diagrams)

**Step 3: Transcribe Each Question**
For each question, capture:
- Context/scenario text (if any)
- Question prompt (exactly as written)
- Any visual elements as static HTML/SVG
- Correct answer and acceptable forms
- Solution steps

**Step 4: Create Variation Content**
- Keep same mathematical structure/rigor
- Change numbers and context
- Use engaging scenarios (gaming, social media, sports)
- Recalculate all answers based on new numbers

**Step 5: Verify Variation Quality**
Run verification checklist to ensure:
- [ ] All numbers changed from original
- [ ] Context/scenario is different but appropriate
- [ ] Mathematical rigor is equivalent
- [ ] Correct answer recalculated correctly
- [ ] Solution steps updated with new values
- [ ] Visual elements (tables, graphs) updated with new data
- [ ] No copy-paste errors from original

**Step 6: Generate Files Locally**
1. Create directory: `mkdir -p src/app/scm/podsie/variations/{slug}`
2. Write metadata.json
3. Write question-N.json for each question

**Step 7: Sync to MongoDB**
```bash
node .claude/skills/create-assignment-variation/templates/sync-to-db.js {slug} > /tmp/variation-sync.js && mongosh "$DATABASE_URL" < /tmp/variation-sync.js --quiet
```

## Verification Checklist (Adapted from create-variations)

Before marking complete, verify each question passes these checks:

### Content Differentiation
- [ ] **Numbers changed**: All numerical values differ from original
- [ ] **Context unique**: Scenario uses different real-world context
- [ ] **Same difficulty**: Mathematical rigor matches original
- [ ] **Correct math**: Answer is correctly calculated for new values

### Table Verification (if applicable)
- [ ] **All rows updated**: Every row has new values
- [ ] **Column headers match context**: Labels reflect new scenario
- [ ] **Proportional relationships preserved**: If original had constant ratio, variation should too
- [ ] **Data is realistic**: Numbers make sense for the scenario

### Graph Verification (CRITICAL - if applicable)

**Must verify ALL of the following:**
- [ ] **Axis labels updated**: X and Y labels match new context (e.g., "Apples" → "Oranges")
- [ ] **Scale appropriate**: Grid scale fits the new data range
- [ ] **xMin/xMax correct**: X-axis bounds accommodate all data points
- [ ] **yMin/yMax correct**: Y-axis bounds accommodate all data points
- [ ] **Grid tick values**: gridScaleX and gridScaleY produce readable tick marks
- [ ] **Points plotted correctly**: All data points match table values
- [ ] **Line slope accurate**: If showing a line, slope matches the ratio
- [ ] **Legend/labels match**: Any graph labels reference new context
- [ ] **Units displayed**: Units on axes match scenario (e.g., "miles", "hours")

**SVG Graph Config Pattern:**
```html
<!-- Example static SVG graph structure -->
<svg viewBox="0 0 400 300" style="width: 400px; height: 300px;">
  <!-- Grid lines -->
  <line x1="50" y1="250" x2="380" y2="250" stroke="#ccc"/>  <!-- x-axis -->
  <line x1="50" y1="20" x2="50" y2="250" stroke="#ccc"/>    <!-- y-axis -->

  <!-- Axis labels - MUST UPDATE FOR CONTEXT -->
  <text x="215" y="290" text-anchor="middle">Hours</text>
  <text x="15" y="135" text-anchor="middle" transform="rotate(-90, 15, 135)">Distance (miles)</text>

  <!-- Tick marks and values - MUST MATCH DATA RANGE -->
  <text x="50" y="265">0</text>
  <text x="110" y="265">1</text>
  <text x="170" y="265">2</text>
  <!-- etc. -->

  <!-- Data points - MUST MATCH TABLE DATA -->
  <circle cx="110" cy="200" r="5" fill="#4f46e5"/>  <!-- (1, 50) -->
  <circle cx="170" cy="150" r="5" fill="#4f46e5"/>  <!-- (2, 100) -->
</svg>
```

### Answer Accuracy
- [ ] **Correct answer verified**: Manually check the math
- [ ] **Acceptable forms listed**: Include equivalent representations (decimal, fraction, percent)
- [ ] **Solution steps accurate**: Each step uses correct new values
- [ ] **Units consistent**: If answer needs units, they match context

## sync-to-db.js Script

Similar to worked-example sync script but adapted for question structure:
- Reads metadata.json
- Reads all question-N.json files
- Reads any chart.js files from charts/ directory
- Generates MongoDB insert command for `assignment-variations` collection
- Deletes existing doc with same slug before inserting

## Files to Create

### Skill Files
1. `.claude/skills/create-assignment-variation/skill.md` - Main workflow documentation
2. `.claude/skills/create-assignment-variation/templates/metadata.json` - Metadata template
3. `.claude/skills/create-assignment-variation/templates/question.json` - Question template
4. `.claude/skills/create-assignment-variation/templates/sync-to-db.js` - MongoDB sync script

### Schema Files
5. `src/lib/schema/zod-schema/scm/podsie/assignment-variation.ts` - Zod schema
6. `src/lib/schema/mongoose-schema/313/podsie/assignment-variation.model.ts` - Mongoose model
7. Update `src/lib/schema/mongoose-schema/313/podsie/index.ts` - Export model

### Viewer Page (based on worked examples page)
8. `src/app/scm/podsie/variations/page.tsx` - Listing page
   - Table of all variations from MongoDB
   - Filter by grade/unit/lesson
   - Click to view individual variation
   - Shows question count, date created

9. `src/app/scm/podsie/variations/[slug]/page.tsx` - Individual variation viewer
   - Display all questions in order
   - Show question text with visual (if any)
   - Expandable answer/solution section
   - Print-friendly option

### Server Actions
10. `src/app/actions/313/assignment-variations.ts` - CRUD operations
    - `getAssignmentVariations()` - List all
    - `getAssignmentVariationBySlug(slug)` - Get one
    - `deleteAssignmentVariation(slug)` - Delete

## Reference: Worked Examples Page Structure

Copy patterns from:
- `src/app/scm/workedExamples/page.tsx` - Listing page structure
- Adapt for assignment variations schema

## Viewer Page Design

### Listing Page (`/scm/podsie/variations`)
Based on worked examples page:
- Group by unit
- Card for each variation showing:
  - Grade badge, Lesson badge
  - Title
  - Original assignment name (if provided)
  - Question count
  - Created date
- Click card to view variation detail

### Detail Page (`/scm/podsie/variations/[slug]`)
Display the variation as a printable test:
- Header with title, grade, unit/lesson info
- Each question rendered as:
  ```
  Question 1: [Title]

  [Context/Scenario if any]

  [Visual - table or graph if any]

  [Question Text]

  [Expandable: Show Answer / Solution]
  ```
- Print button to generate clean PDF

## Implementation Summary

**Total files to create: 10**

1. Skill files (4):
   - `skill.md`, `templates/metadata.json`, `templates/question.json`, `templates/sync-to-db.js`

2. Schema files (3):
   - Zod schema, Mongoose model, index export update

3. Viewer pages (2):
   - Listing page, Detail/slug page

4. Server actions (1):
   - CRUD operations for variations
