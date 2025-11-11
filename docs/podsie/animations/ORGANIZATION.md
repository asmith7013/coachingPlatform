# Animation System Organization

## 📂 Directory Structure

```
animations/
├── README.md                    # Overview and philosophy
├── primitives/                  # Core constraints & building blocks
│   ├── p5-format.md            # Required p5.js structure
│   ├── shapes.md               # Available shapes & how to draw them
│   ├── colors.md               # Color palette & usage
│   └── animations.md           # Animation techniques & patterns
├── scenarios/                   # Math concept-specific prompts
│   ├── multiplication.md       # Arrays, groups, skip counting
│   ├── division.md             # Partitive, quotative models
│   ├── fractions.md            # Part-whole, area, number line
│   ├── algebra.md              # Tape diagrams, equations
│   ├── geometry.md             # Transformations, shapes
│   └── number-sense.md         # Counting, place value
└── examples/                    # Working code samples
    ├── multiplication-array.js
    ├── tape-diagram-solver.js
    ├── fraction-circles.js
    └── ...more examples
```

## How Files Work Together

### For LLM Code Generation

**Step 1: Read Primitives** (always)
- `p5-format.md` → Learn required structure
- `shapes.md` → Know what shapes are available
- `colors.md` → Use approved color palette  
- `animations.md` → Understand animation patterns

**Step 2: Read Relevant Scenario** (based on math concept)
- `multiplication.md` → If creating multiplication manipulative
- `algebra.md` → If creating tape diagram
- etc.

**Step 3: Reference Examples** (optional but helpful)
- Look at working code in `/examples/`
- See how others solved similar problems

### For Human Developers

**Creating new manipulative:**
1. Identify math concept → Find scenario file
2. Read scenario guidelines & prompt template
3. Check primitives for constraints
4. Write code following format
5. Test in p5.js playground
6. Save successful code to `/examples/`

**Adding new scenario:**
1. Create new file in `/scenarios/`
2. Follow template from existing scenarios
3. Include: concept overview, visual models, LLM prompt, code template
4. Add working examples to `/examples/`

## File Purposes

### Primitives (Building Blocks)

#### `p5-format.md`
**Purpose:** Enforce consistent code structure
**Contains:**
- Required functions (setup, draw)
- Canvas size requirement (400x400)
- Variable declaration patterns
- Common code templates

**Why separate:** These rules apply to ALL manipulatives regardless of math concept

#### `shapes.md`
**Purpose:** Limited vocabulary of shapes
**Contains:**
- Basic shapes (rect, circle, etc.)
- Composite shapes (arrays, tape diagrams, number lines)
- How to draw each shape
- Styling (fill, stroke)

**Why separate:** Shapes are reused across different math concepts

#### `colors.md`
**Purpose:** Consistent, accessible color scheme
**Contains:**
- RGB values for each color
- When to use each color
- Color combinations
- Accessibility notes

**Why separate:** Colors have specific meanings (orange = blocks, red = variables)

#### `animations.md`
**Purpose:** Reusable animation patterns
**Contains:**
- Variable-based animation
- Phased reveals
- Easing functions
- Timing control

**Why separate:** Same animation techniques apply to different concepts

### Scenarios (Concept-Specific)

#### `multiplication.md`
**Purpose:** Guide for creating multiplication visualizations
**Contains:**
- Visual models (arrays, groups, number line)
- LLM prompt template
- Example scenarios
- Code structure template
- Design guidelines

**Why separate:** Multiplication needs specific visual approaches

#### `algebra.md`  
**Purpose:** Guide for tape diagrams and equations
**Contains:**
- Tape diagram patterns
- Equation types
- Solving animations
- Color usage for variables

**Why separate:** Algebra uses unique visual models (tape diagrams)

#### Other scenarios follow same pattern...

### Examples (Working Code)

#### Purpose
- Concrete references for LLMs
- Testing ground for patterns
- Copy-paste starting points

#### Organization
- One file per complete manipulative
- Named descriptively (e.g., `multiplication-array-animated.js`)
- Include comments explaining key parts

## Usage Patterns

### Pattern 1: Simple Static Display
```
LLM reads:
1. p5-format.md (structure)
2. shapes.md (how to draw array)
3. colors.md (use orange for blocks)
4. multiplication.md (array layout guidelines)

LLM generates:
→ Static multiplication array
```

### Pattern 2: Animated Solver
```
LLM reads:
1. p5-format.md (structure)
2. shapes.md (tape diagrams)
3. colors.md (red for variables)
4. animations.md (phased animation)
5. algebra.md (tape diagram solving steps)

LLM generates:
→ Animated tape diagram solver
```

### Pattern 3: Interactive Exploration
```
LLM reads:
1. p5-format.md (structure + interaction functions)
2. shapes.md (arrays)
3. animations.md (state management)
4. multiplication.md (interactive guidelines)

LLM generates:
→ Interactive multiplication explorer with arrow keys
```

## Benefits of This Organization

### ✅ Modular
- Each file has single purpose
- Easy to update one part without affecting others
- Can add new scenarios without changing primitives

### ✅ Composable
- Primitives combine to create any manipulative
- Scenarios reference multiple primitives
- Mix and match as needed

### ✅ Scalable
- Add new scenarios easily
- Expand primitive library gradually
- Examples grow over time

### ✅ LLM-Friendly
- Clear hierarchy (primitives → scenarios → examples)
- Each file is focused and digestible
- Explicit constraints reduce hallucination

### ✅ Human-Readable
- Organized by concept (scenarios)
- Clear file names
- README explains structure

## Adding New Content

### New Shape to Primitives
1. Add to `shapes.md` with drawing example
2. Update relevant scenarios that could use it
3. Create example using the new shape

### New Animation Technique
1. Add to `animations.md` with code example
2. Show use case in scenario
3. Add example demonstrating it

### New Math Concept Scenario
1. Create new file in `/scenarios/`
2. Follow template:
   - Concept overview
   - Visual models
   - LLM prompt template
   - Code structure
   - Example scenarios
   - Design guidelines
3. Add 1-2 working examples to `/examples/`

### New Example
1. Create new `.js` file in `/examples/`
2. Name descriptively
3. Include comments
4. Reference from relevant scenario

## Maintenance

### Regular Updates
- Add successful manipulatives to examples
- Refine scenarios based on LLM output quality
- Expand primitives as new patterns emerge

### Quality Control
- All examples must work in 400x400
- Follow color palette consistently
- Use standard p5.js format
- Test each scenario prompt regularly

## Next Steps

1. ✅ Complete primitive files (shapes, colors, animations, format)
2. ✅ Create 2 example scenarios (multiplication, algebra)
3. ⏭️ Add remaining scenarios (division, fractions, geometry, number-sense)
4. ⏭️ Build example library (10-15 working manipulatives)
5. ⏭️ Test LLM prompts and refine
6. ⏭️ Document lessons learned and best practices