# P5 Animation Types

This directory contains configurable animation scaffolds for creating p5.js math visualizations. Each animation-type is a reusable pattern that can be easily customized for specific mathematical problems.

## What are Animation Types?

**Animation types** are conceptual scaffolds - complete, working p5.js animations with clearly defined configuration sections. An LLM (or developer) can quickly adapt these scaffolds to specific problems by modifying only the configuration, without changing the core functionality.

### Difference from Examples

- **Examples** (`src/app/animations/examples/`): Specific implementations for particular problems
- **Animation Types** (this directory): Flexible scaffolds that can be configured for many similar problems

## Available Animation Types

### 1. [Dynamic Dilation](implement-dynamic-dilation/)
**Pattern:** Interactive dilation with scale factor slider
**Use for:** Dilations centered at a point, scale factor exploration, similarity concepts
**Features:**
- Adjustable scale factors (including fractions)
- Toggle dilation rays
- Toggle coordinate grid
- Interactive slider and keyboard controls

**Example Configuration:**
```javascript
let points = [
  { x: 10, y: 10, label: 'P' },
  { x: 8, y: 8, label: 'Q' },
  { x: 12, y: 6, label: 'R' },
  { x: 14, y: 8, label: 'S' }
];
let center = { x: 10, y: 8, label: 'O' };
let scaleFactors = [
  { value: 1/3, label: '1/3' },
  { value: 1/2, label: '1/2' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' }
];
```

### 2. [Dynamic Graph (Coordinate Plane)](implement-dynamic-graph-question/)
**Pattern:** Interactive p5.js coordinate plane for drawing lines
**Use for:** Drawing linear relationships, proportional exploration, slope investigation
**Features:**
- Click-to-draw line interaction
- Snap-to-grid with configurable subdivisions
- Optional initial equations (reference lines)
- Optional initial points
- Keyboard controls (R to reset, ESC to cancel)

**Example Configuration:**
```javascript
{
  xMin: 0, xMax: 10,
  yMin: 0, yMax: 100,
  gridScaleX: 1, gridScaleY: 10,
  xLabel: "Time (hours)",
  yLabel: "Distance (miles)",
  predrawnStartPoint: { x: 0, y: 0 },  // Force drawing from origin
  snapSubdivisions: 1  // Grid-only snapping
}
```

### 3. [Dynamic Tape Diagram](implement-dynamic-tape-diagram/)
**Pattern:** Interactive tape diagram builder with drag-and-drop
**Use for:** Building algebraic equations, bar models, proportional relationships
**Features:**
- Drag variables (x) from palette to tape
- Resize constants before adding to tape
- Set total value to see proportional sizing
- Remove parts with X button
- Live equation display

**Example Configuration:**
```javascript
{
  variable: {
    x: 80, y: 100, w: 60, h: 60,
    color: [230, 57, 70],
    label: 'x'
  },
  constant: {
    x: 200, y: 100, w: 100, h: 60,
    minWidth: 40, maxWidth: 300,
    initialValue: 1, maxValue: 20,
    color: [6, 167, 125]
  },
  totalConfig: {
    initial: 0,
    showProportions: true
  }
}
```

### 4. [Algebra Tiles](implement-algebra-tiles/)
**Pattern:** Interactive algebra tiles manipulative with cancellation
**Use for:** Modeling algebraic expressions, zero principle, combining like terms
**Features:**
- Drag tiles (x, -x, 1, -1) from palette to workspace
- Move and rearrange placed tiles
- Automatic cancellation when opposite tiles are close
- Visual feedback with grey color and dashed lines
- Live simplified equation display

**Example Configuration:**
```javascript
{
  tileConfig: {
    x: { width: 80, height: 60, color: [102, 178, 102], label: 'x' },
    negX: { width: 80, height: 60, color: [230, 57, 70], label: '-x' },
    one: { width: 50, height: 50, color: [255, 193, 94], label: '1' },
    negOne: { width: 50, height: 50, color: [230, 57, 70], label: '-1' }
  },
  cancelConfig: {
    snapDistance: 40,
    cancelledColor: [150, 150, 150]
  }
}
```

## How to Use Animation Types

### 1. Identify Your Animation Need
Look at your math problem and match it to one of the animation types above.

### 2. Reference the Appropriate Animation Type
Each animation-type directory contains:
- `SKILL.md` - When to use, features, configuration guide
- `snippets/` - Complete working code
- Examples of common configurations

### 3. Customize the Configuration
Each animation type has a clearly marked configuration section:
```javascript
// ==========================================
// CONFIGURATION - Easily modifiable
// ==========================================
```

Modify only this section for your specific problem.

### 4. Keep Core Functionality Intact
Don't modify:
- Drawing logic
- Event handlers
- Helper functions
- Interaction patterns

## Decision Tree

```
What type of interaction do you need?

Interactive dilation with scale factors?
├─ YES → implement-dynamic-dilation
└─ NO ↓

Draw lines on coordinate plane?
├─ YES → implement-dynamic-graph-question
└─ NO ↓

Build tape diagrams with drag-and-drop?
├─ YES → implement-dynamic-tape-diagram
└─ NO ↓

Drag algebra tiles with cancellation?
├─ YES → implement-algebra-tiles
└─ NO → Check other animation types or create custom
```

## Structure

```
animation-types/
├── README.md                           # This file
├── SUMMARY.md                          # Implementation summary
├── implement-dynamic-dilation/
│   ├── SKILL.md                       # Full documentation
│   └── snippets/
│       └── dynamic-dilation.ts        # Complete working code
├── implement-dynamic-graph-question/
│   ├── SKILL.md                       # Full documentation
│   └── snippets/
│       └── coordinate-plane-p5.js     # Complete working code
├── implement-dynamic-tape-diagram/
│   ├── SKILL.md                       # Full documentation
│   └── snippets/
│       └── dynamic-tape-diagram.ts    # Complete working code
└── implement-algebra-tiles/
    ├── SKILL.md                       # Full documentation
    └── snippets/
        └── algebra-tiles.ts           # Complete working code
```

## Integration with create-p5-animation Skill

When using the `create-p5-animation` skill, the workflow is:

1. Identify the appropriate animation type
2. Reference the SKILL.md for that type
3. Copy the snippet code
4. Modify only the configuration section
5. Save as a new example in `src/app/animations/examples/`

This ensures:
- ✅ Consistent patterns across animations
- ✅ Reusable, well-tested code
- ✅ Easy customization for specific problems
- ✅ Clear separation of config vs logic

## Best Practices

### When Creating New Animation Types

1. **Clear Configuration Section**: Always mark the configuration section clearly
2. **Comprehensive Documentation**: Include all configuration options in SKILL.md
3. **Common Patterns**: Provide 3-5 common configuration patterns
4. **Working Snippet**: Include complete, tested code in snippets/
5. **Checklist**: Provide implementation checklist in SKILL.md

### When Using Existing Animation Types

1. **Start with Snippet**: Copy the complete code from snippets/
2. **Modify Config Only**: Only change values in the configuration section
3. **Test Locally**: Test with the p5.js examples page before finalizing
4. **Document Changes**: Note what was customized if creating a new example

## Status

| Animation Type | Status | Has Snippet | Common Patterns |
|---------------|--------|-------------|-----------------|
| Dynamic Dilation | ✅ Complete | ✅ Yes | ✅ 3 patterns |
| Dynamic Graph | ✅ Complete | ✅ Yes | ✅ 4 patterns |
| Dynamic Tape Diagram | ✅ Complete | ✅ Yes | ✅ 3 patterns |
| Algebra Tiles | ✅ Complete | ✅ Yes | ✅ 4 patterns |

## Related Skills

- [create-p5-animation](../SKILL.md) - Parent skill for p5.js animations
- [QUICK-REFERENCE](../QUICK-REFERENCE.md) - Quick lookup for p5 patterns
- [examples](../examples/) - Specific animation examples

## Future Animation Types

Potential animation types to add:
- Rotation animations
- Reflection animations
- Translation animations
- Function transformations
- Probability simulations
- Statistical visualizations

---

**Last Updated**: November 2024
**Maintained By**: AI Coaching Platform Team
