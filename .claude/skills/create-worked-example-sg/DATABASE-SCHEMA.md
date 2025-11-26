# Database Schema - Worked Example Slides (Final)

## Single Collection: `worked-example-decks`

Simple, embedded schema that handles text, tables, p5.js code, and diagrams.

---

## Schema

```typescript
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const WorkedExampleDeckSchema = z.object({
  _id: z.instanceof(ObjectId),

  // Basic Info
  title: z.string(),
  slug: z.string(),

  // Educational Context
  mathConcept: z.string(),
  mathStandard: z.string(),
  gradeLevel: z.number(),

  // The 9 Slides
  slides: z.object({
    slide1: z.object({ // Title
      unit: z.string(),
      title: z.string(),
      bigIdea: z.string(),
      example: z.string(),
      icon: z.string().optional(),
    }),

    slide2: z.object({ // Context
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),
      tableData: z.array(z.object({
        input: z.number(),
        output: z.number().nullable(),
      })),
      inputLabel: z.string(),
      outputLabel: z.string(),
      // Optional: diagram or visualization
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(), // URL or p5.js code
      }).optional(),
    }),

    slide3: z.object({ // Prediction 1
      question: z.string(),
      tableData: z.array(z.object({
        input: z.number(),
        output: z.number().nullable(),
      })),
      highlightRow: z.number().optional(),
      inputLabel: z.string(),
      outputLabel: z.string(),
      // Optional: visual aid
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide4: z.object({ // Reveal 1
      calculation: z.string(),
      explanation: z.string(),
      answer: z.string(),
      isConstant: z.boolean(),
      // Optional: animated visualization
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide5: z.object({ // Prediction 2
      question: z.string(),
      tableData: z.array(z.object({
        input: z.number(),
        output: z.number().nullable(),
      })),
      highlightRow: z.number().optional(),
      inputLabel: z.string(),
      outputLabel: z.string(),
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide6: z.object({ // Reveal 2
      calculation: z.string(),
      explanation: z.string(),
      answer: z.string(),
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide7: z.object({ // Reasoning
      title: z.string(),
      steps: z.array(z.string()),
      mathRule: z.string().optional(),
      keyInsight: z.string().optional(),
      // Optional: concept diagram
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide8: z.object({ // Practice 1
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),
      tableData: z.array(z.object({
        input: z.number(),
        output: z.number().nullable(),
      })),
      inputLabel: z.string(),
      outputLabel: z.string(),
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),

    slide9: z.object({ // Practice 2
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),
      tableData: z.array(z.object({
        input: z.number(),
        output: z.number().nullable(),
      })),
      inputLabel: z.string(),
      outputLabel: z.string(),
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),
    }),
  }),

  // Generation Info
  generatedBy: z.enum(['ai', 'manual']),
  sourceImage: z.string().optional(),

  // Ownership
  createdBy: z.string(),
  isPublic: z.boolean().default(false),

  // Files
  files: z.object({
    pageComponent: z.string(),
    dataFile: z.string(),
  }),

  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type WorkedExampleDeck = z.infer<typeof WorkedExampleDeckSchema>;
```

---

## Mongoose Model

```typescript
// src/lib/schema/mongoose-schema/worked-example-deck.model.ts
import mongoose from 'mongoose';

const diagramSchema = {
  type: { type: String, enum: ['image', 'p5js'] },
  content: String, // URL for images, code string for p5.js
};

const workedExampleDeckSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },

  mathConcept: { type: String, required: true, index: true },
  mathStandard: { type: String, required: true },
  gradeLevel: { type: Number, required: true, index: true },

  slides: {
    slide1: {
      unit: String,
      title: String,
      bigIdea: String,
      example: String,
      icon: String,
    },
    slide2: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [{ input: Number, output: Number }],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide3: {
      question: String,
      tableData: [{ input: Number, output: Number }],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide4: {
      calculation: String,
      explanation: String,
      answer: String,
      isConstant: Boolean,
      diagram: diagramSchema,
    },
    slide5: {
      question: String,
      tableData: [{ input: Number, output: Number }],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide6: {
      calculation: String,
      explanation: String,
      answer: String,
      diagram: diagramSchema,
    },
    slide7: {
      title: String,
      steps: [String],
      mathRule: String,
      keyInsight: String,
      diagram: diagramSchema,
    },
    slide8: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [{ input: Number, output: Number }],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
    slide9: {
      scenario: String,
      context: String,
      icon: String,
      tableData: [{ input: Number, output: Number }],
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
    },
  },

  generatedBy: { type: String, enum: ['ai', 'manual'], required: true },
  sourceImage: String,

  createdBy: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false },

  files: {
    pageComponent: { type: String, required: true },
    dataFile: { type: String, required: true },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

workedExampleDeckSchema.index({ gradeLevel: 1, mathConcept: 1 });
workedExampleDeckSchema.index({ createdBy: 1 });

export const WorkedExampleDeck = mongoose.models.WorkedExampleDeck ||
  mongoose.model('WorkedExampleDeck', workedExampleDeckSchema);
```

---

## Usage Examples

### Save deck with p5.js visualization on Slide 4

```typescript
await saveWorkedExampleDeck({
  title: "Proportional Relationships with Graph",
  slug: "proportions-graphed",
  mathConcept: "Proportional Relationships",
  mathStandard: "7.RP.A.1",
  gradeLevel: 7,
  slides: {
    slide1: { /* ... */ },
    slide2: { /* ... */ },
    slide3: { /* ... */ },
    slide4: {
      calculation: "250 ÷ 5 = 50",
      explanation: "We divided to find the rate",
      answer: "50 views per minute",
      isConstant: true,
      diagram: {
        type: "p5js",
        content: `
          function sketch(p5) {
            p5.setup = () => {
              p5.createCanvas(400, 300);
            };
            p5.draw = () => {
              p5.background(220);
              // Draw proportional relationship line
              p5.line(0, 300, 400, 0);
              p5.text("y = 50x", 200, 150);
            };
          }
        `
      }
    },
    slide5: { /* ... */ },
    // ...
  },
  generatedBy: "ai",
  files: {
    pageComponent: "src/app/presentations/proportions-graphed/page.tsx",
    dataFile: "src/app/presentations/proportions-graphed/data.ts",
  },
});
```

### Save deck with image diagram on Slide 7

```typescript
await saveWorkedExampleDeck({
  // ...
  slides: {
    // ...
    slide7: {
      title: "Pattern for Proportional Relationships",
      steps: [
        "Find the constant rate",
        "Use rate to find missing values",
      ],
      mathRule: "y = kx",
      keyInsight: "The rate stays the same!",
      diagram: {
        type: "image",
        content: "https://example.com/proportions-diagram.png"
      }
    },
    // ...
  },
});
```

---

## Size Estimate

**Without diagrams:** ~5KB per deck
**With p5.js code:** ~15-50KB per deck (depends on sketch complexity)
**With image URLs:** ~5KB (just stores URL, not image)

**MongoDB limit:** 16MB
**Decks with p5.js:** ~300-1000 decks before hitting limit (plenty of room)

---

## That's It

Simple schema, handles your needs:
- ✅ All 9 slide types
- ✅ Table data
- ✅ p5.js code (stored as string)
- ✅ Image URLs
- ✅ Searchable by grade/concept
- ❌ No unnecessary complexity

