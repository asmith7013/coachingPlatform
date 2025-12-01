# Database Schema - Worked Example Slides (Final)

## Single Collection: `worked-example-decks`

Flexible schema supporting **any visual type** (tables, graphs, double number lines, equations, etc.) while maintaining the core principle: **stationary visuals reduce cognitive load**.

---

## Core Principle

The schema uses **discriminated unions** to support multiple visual types:
- **Table** - Numerical data in rows/columns
- **Graph** - Static or dynamic coordinate planes
- **Double Number Line** - Proportional relationship visualization
- **Equation** - Algebraic expressions with variables
- **Custom D3** - Any D3 component from your question-types library

All visual types follow the **stationary element rule**: position is established in Slide 2 and maintained through Slide 6.

---

## Schema

```typescript
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Visual type discriminated union
const VisualContentSchema = z.discriminatedUnion('type', [
  // Table visual
  z.object({
    type: z.literal('table'),
    tableData: z.array(z.object({
      input: z.number(),
      output: z.number().nullable(),
    })),
    inputLabel: z.string(),
    outputLabel: z.string(),
  }),

  // Graph visual (static or dynamic)
  z.object({
    type: z.literal('graph'),
    graphType: z.enum(['static', 'dynamic']),
    points: z.array(z.tuple([z.number(), z.number().nullable()])),
    xLabel: z.string(),
    yLabel: z.string(),
    xMin: z.number().optional(),
    xMax: z.number().optional(),
    yMin: z.number().optional(),
    yMax: z.number().optional(),
    showOrigin: z.boolean().default(true),
  }),

  // Double number line visual
  z.object({
    type: z.literal('double-number-line'),
    topLabel: z.string(),
    bottomLabel: z.string(),
    segments: z.array(z.object({
      top: z.number().nullable(),
      bottom: z.number().nullable(),
    })),
  }),

  // Equation visual
  z.object({
    type: z.literal('equation'),
    equation: z.string(), // LaTeX or plain text
    variables: z.record(z.number().nullable()), // { x: 5, y: null }
  }),

  // Custom D3 component (for any question type from your library)
  z.object({
    type: z.literal('d3-component'),
    componentName: z.string(), // e.g., 'StaticGraph', 'DoubleNumberLine', 'Table'
    config: z.record(z.unknown()), // Component-specific configuration
  }),
]);

// Layout configuration (same across all visual types)
const LayoutConfigSchema = z.object({
  visualPosition: z.enum(['center', 'left', 'right', 'top']).default('center'),
  annotationPosition: z.enum(['below', 'above', 'right', 'left']).default('below'),
  maintainPosition: z.boolean().default(true),
  highlightStyle: z.enum(['border', 'glow', 'arrow', 'underline']).default('border'),
  questionPosition: z.enum(['below', 'above', 'right', 'left']).default('below'),
  calculationPosition: z.enum(['right', 'left', 'below', 'overlay']).default('right'),
  showVisualOnReveal: z.boolean().default(true),
});

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

    slide2: z.object({ // Context - The Hook
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),

      // Primary visual content (discriminated union)
      visual: VisualContentSchema,

      // Optional: Additional diagram or visualization
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(), // URL or p5.js code
      }).optional(),

      // Layout configuration for visual stability
      layout: LayoutConfigSchema.optional(),
    }),

    slide3: z.object({ // Prediction 1 - Ask
      question: z.string(),

      // Same visual as slide2, with potential highlight
      visual: VisualContentSchema,
      highlightTarget: z.string().optional(), // What to highlight (row index, point, segment, etc.)

      // Optional: Additional visual aid
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout configuration - maintains position from slide2
      layout: LayoutConfigSchema.optional(),
    }),

    slide4: z.object({ // Reveal 1 - Answer
      calculation: z.string(),
      explanation: z.string(),
      answer: z.string(),
      isConstant: z.boolean(),

      // Optional: Same visual as slides 2-3 (for context)
      visual: VisualContentSchema.optional(),

      // Optional: Animated visualization
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout configuration - maintains position from slide2
      layout: LayoutConfigSchema.optional(),
    }),

    slide5: z.object({ // Prediction 2 - Ask
      question: z.string(),

      // Same visual as slide2, with different highlight
      visual: VisualContentSchema,
      highlightTarget: z.string().optional(),

      // Optional: Additional visual aid
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout configuration - maintains position from slide2
      layout: LayoutConfigSchema.optional(),
    }),

    slide6: z.object({ // Reveal 2 - Answer
      calculation: z.string(),
      explanation: z.string(),
      answer: z.string(),

      // Optional: Same visual as slides 2-5 (for context)
      visual: VisualContentSchema.optional(),

      // Optional: Additional visualization
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout configuration - maintains position from slide2
      layout: LayoutConfigSchema.optional(),
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

    slide8: z.object({ // Practice 1 - Independent Application
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),

      // Visual content (same structure as worked example)
      visual: VisualContentSchema,

      // Optional: Additional diagram
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout (fresh layout, not necessarily same as slides 2-6)
      layout: LayoutConfigSchema.optional(),
    }),

    slide9: z.object({ // Practice 2 - Independent Application
      scenario: z.string(),
      context: z.string(),
      icon: z.string(),

      // Visual content (same structure as worked example)
      visual: VisualContentSchema,

      // Optional: Additional diagram
      diagram: z.object({
        type: z.enum(['image', 'p5js']),
        content: z.string(),
      }).optional(),

      // Layout (fresh layout, not necessarily same as slides 2-6)
      layout: LayoutConfigSchema.optional(),
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

const layoutSchema = {
  // For slide2
  tablePosition: { type: String, enum: ['center', 'left', 'right', 'top'], default: 'center' },
  annotationPosition: { type: String, enum: ['below', 'above', 'right', 'left'], default: 'below' },

  // For slides 3-6 (prediction pairs)
  maintainTablePosition: { type: Boolean, default: true },
  highlightStyle: { type: String, enum: ['border', 'glow', 'arrow', 'underline'], default: 'border' },
  questionPosition: { type: String, enum: ['below', 'above', 'right', 'left'], default: 'below' },
  calculationPosition: { type: String, enum: ['right', 'left', 'below', 'overlay'], default: 'right' },
  showTableOnReveal: { type: Boolean, default: true },
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
      layout: layoutSchema,
    },
    slide3: {
      question: String,
      tableData: [{ input: Number, output: Number }],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
      layout: layoutSchema,
    },
    slide4: {
      calculation: String,
      explanation: String,
      answer: String,
      isConstant: Boolean,
      diagram: diagramSchema,
      layout: layoutSchema,
    },
    slide5: {
      question: String,
      tableData: [{ input: Number, output: Number }],
      highlightRow: Number,
      inputLabel: String,
      outputLabel: String,
      diagram: diagramSchema,
      layout: layoutSchema,
    },
    slide6: {
      calculation: String,
      explanation: String,
      answer: String,
      diagram: diagramSchema,
      layout: layoutSchema,
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

## Layout Configuration System

### Purpose

The `layout` field on slides 2-6 ensures **visual stability** across the worked example sequence. This reduces cognitive load by keeping the data table in a fixed position while annotations appear around it.

### How It Works

**Slide 2 (The Hook)** establishes the table position:
```javascript
layout: {
  tablePosition: "center",        // Where the table appears
  annotationPosition: "below"     // Where supporting text goes
}
```

**Slides 3-6 (Prediction Pairs)** maintain that position:
```javascript
layout: {
  maintainTablePosition: true,    // Lock to slide2's position
  highlightStyle: "border",       // How to emphasize rows
  questionPosition: "below",      // Where questions appear
  calculationPosition: "right",   // Where math appears (reveal slides)
  showTableOnReveal: true         // Keep table visible with answer
}
```

### Layout Options

| Field | Options | Description |
|-------|---------|-------------|
| `tablePosition` | `"center"`, `"left"`, `"right"`, `"top"` | Initial table placement (slide 2) |
| `maintainTablePosition` | `true`, `false` | Lock to slide 2 position (slides 3-6) |
| `highlightStyle` | `"border"`, `"glow"`, `"arrow"`, `"underline"` | How to emphasize table rows |
| `questionPosition` | `"below"`, `"above"`, `"right"`, `"left"` | Where "Ask" text appears |
| `calculationPosition` | `"right"`, `"left"`, `"below"`, `"overlay"` | Where math appears on reveals |
| `showTableOnReveal` | `true`, `false` | Show table with answer or hide it |

### Default Behavior

If `layout` is omitted, defaults to:
- Table: centered
- Questions: below table
- Calculations: to the right
- Table always visible
- Border-style highlighting

### Example: Center-Based Layout

```javascript
slides: {
  slide2: {
    // ... other fields
    layout: { tablePosition: "center", annotationPosition: "below" }
  },
  slide3: {
    // ... other fields
    layout: {
      maintainTablePosition: true,
      highlightStyle: "border",
      questionPosition: "below"
    }
  },
  slide4: {
    // ... other fields
    layout: {
      maintainTablePosition: true,
      calculationPosition: "right",
      showTableOnReveal: true
    }
  },
  // ... slides 5-6 follow same pattern
}
```

### Example: Left-Aligned Layout (More Calculation Space)

```javascript
slides: {
  slide2: {
    layout: { tablePosition: "left", annotationPosition: "below" }
  },
  slide3: {
    layout: {
      maintainTablePosition: true,
      highlightStyle: "glow",
      questionPosition: "below"
    }
  },
  slide4: {
    layout: {
      maintainTablePosition: true,
      calculationPosition: "right",  // Large space for complex math
      showTableOnReveal: true
    }
  },
}
```

### When to Use Each Position

| Position | Best For | Trade-offs |
|----------|----------|------------|
| **center** | Standard problems, balanced layout | Limited space for calculations |
| **left** | Complex calculations needed | Less symmetrical |
| **right** | Complex questions, left-to-right reading | Less symmetrical |
| **top** | Diagrams or visualizations below | Less vertical space |

---

## That's It

Simple schema, handles your needs:
- ✅ All 9 slide types
- ✅ Table data
- ✅ p5.js code (stored as string)
- ✅ Image URLs
- ✅ Searchable by grade/concept
- ✅ Layout hints for visual stability
- ❌ No unnecessary complexity

