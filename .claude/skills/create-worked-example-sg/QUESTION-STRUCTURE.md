# Question Extraction Structure (Input Format)

This document defines the **input structure** for extracting math questions from images. This is the intermediate format produced by `scripts/transcribe-question.ts`.

## Purpose

This is the **source question** format - what gets extracted from an image before being converted into the full 9-slide worked example deck.

**Flow:**
```
Question Image → [transcribe-question.ts] → ExtractedQuestion → [skill] → WorkedExampleDeck → Database
```

For the **output format** (the full deck structure saved to database), see `DATABASE-SCHEMA.md`.

## Structure

```typescript
interface ExtractedQuestion {
  // Educational metadata
  mathConcept: string;           // e.g., "Proportional Relationships"
  mathStandard?: string;         // e.g., "7.RP.A.1"
  gradeLevel?: number;           // 6-12

  // The core problem
  scenario: string;              // Real-world context
  questionText: string;          // What the problem asks

  // Visual elements (tables, diagrams)
  tableData?: {
    inputLabel: string;          // e.g., "Minutes"
    outputLabel: string;         // e.g., "Views"
    rows: Array<{
      input: number;
      output: number | null;     // null = blank for students to fill
    }>;
  };

  // Solution breakdown
  constantValue: number;         // The key rate/constant
  constantLabel: string;         // e.g., "views per minute"
  steps: string[];               // Step-by-step solution
  finalAnswer: string;

  // Pattern explanation
  pattern: string;               // How this type of problem works
  mathRule?: string;             // Optional notation (e.g., "y = kx")
}
```

## Example: Viral Video Problem

```json
{
  "mathConcept": "Proportional Relationships",
  "mathStandard": "7.RP.A.1",
  "gradeLevel": 7,

  "scenario": "A YouTube video is going viral! Your friend's gaming video gains views at a constant rate.",
  "questionText": "How many views will the video have after 12 minutes?",

  "tableData": {
    "inputLabel": "Minutes",
    "outputLabel": "Views",
    "rows": [
      { "input": 5, "output": 250 },
      { "input": 10, "output": 500 },
      { "input": 12, "output": null },
      { "input": 20, "output": 1000 }
    ]
  },

  "constantValue": 50,
  "constantLabel": "views per minute",

  "steps": [
    "Find the constant rate by dividing views by minutes",
    "250 ÷ 5 = 50 views per minute",
    "Multiply the rate by the time we want",
    "50 × 12 = 600 views"
  ],

  "finalAnswer": "600 views",

  "pattern": "To solve proportional relationship problems: (1) Find the constant rate by dividing one quantity by the other, (2) Use that rate to find missing values by multiplying",
  "mathRule": "y = kx where k = constant rate"
}
```

## How ExtractedQuestion Becomes a Full Deck

The `/create-worked-example-sg` skill takes this extracted structure and generates all 9 slides:

| Slide | Content Source | Layout Notes |
|-------|---------------|--------------|
| **Slide 1** | `mathConcept` → title<br>`pattern` → big idea<br>First table row → example | N/A |
| **Slide 2** | `scenario` → context<br>`tableData` → table | **Establishes table position** (default: center) |
| **Slide 3** | Ask: "How did I know to divide {output} by {input}?"<br>Highlight first row | **Maintains table position** from slide 2 |
| **Slide 4** | `constantValue` → answer<br>First 2 steps → explanation | **Maintains table position**, calculation appears to right |
| **Slide 5** | Ask: "How do we find the missing value?"<br>Highlight row with null | **Maintains table position** |
| **Slide 6** | `finalAnswer` → answer<br>Last 2 steps → explanation | **Maintains table position**, calculation appears to right |
| **Slide 7** | `pattern` → reasoning<br>`mathRule` → optional notation | N/A (no table) |
| **Slide 8-9** | Auto-generate practice scenarios using same structure | Fresh layout (new context) |

### Layout Consistency Rule

**Critical:** Slides 2-6 must maintain the same table position to reduce cognitive load. The skill automatically adds layout configuration to ensure visual stability across the worked example sequence.

## Usage

### Transcribe a Question Image

```bash
tsx .claude/skills/create-worked-example-sg/scripts/transcribe-question.ts \
  ./docs/question.png \
  --type worked-example \
  --grade 7 \
  --output ./temp/
```

### Outputs

1. **question-structure.json** - Full extracted structure
2. **question-contents.md** - Human-readable summary
3. **question.yml** - Metadata for database

### Next Steps After Transcription

1. Review extracted structure for accuracy
2. Invoke `/create-worked-example-sg` skill with the JSON
3. Skill generates 3 scenarios and all 9 slides
4. Saves to database via `saveWorkedExampleDeck()`

## Key Differences from D3 Questions

| D3 Interactive | Worked Example |
|----------------|----------------|
| Student interacts with controls | Student follows guided explanation |
| `chart.js` + `chart.html` | Spectacle slide components |
| `question.yml` + `question-contents.md` | Database schema with embedded slides |
| Manual translation audit | Icons + text-based (future: i18n) |

Both share:
- Common metadata (grade, standard, concept)
- Solution steps and acceptance criteria
- Real-world scenarios and context
