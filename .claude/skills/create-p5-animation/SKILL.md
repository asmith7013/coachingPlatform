# Create P5 Animation Skill

This skill provides comprehensive knowledge for generating p5.js math manipulative animations for educational purposes.

## Purpose

Use this skill when:
- Creating p5.js animations for math concepts
- Generating visual manipulatives for multiplication, fractions, algebra, ratios
- Building interactive or animated math demonstrations
- Following consistent animation patterns and color schemes

## Skill Structure

```
create-p5-animation/
├── SKILL.md                        # This file - main reference
├── AUTO-MANUAL-TOGGLE-PATTERN.md   # REQUIRED for multi-phase animations
├── QUICK-REFERENCE.md              # Quick lookup for patterns
├── VISUAL-GUIDE.md                 # Visual examples
├── GIF-EXPORT-IMPLEMENTATION.md    # Export to GIF
├── examples/                       # Animation type guides
│   ├── fractions.md
│   ├── ratios.md
│   ├── multiplication.md
│   ├── tape-diagrams.md
│   ├── coordinate-plane.md
│   ├── geometry.md
│   └── proportional-relationships.md
├── primitives/                     # Building blocks
│   ├── p5-format.md               # Required code structure
│   ├── shapes.md                  # Available shapes
│   ├── colors.md                  # Color palette
│   └── animations.md              # Animation patterns
└── scenarios/                      # Math concept templates
    ├── multiplication.md          # Arrays, groups, skip counting
    ├── algebra.md                 # Tape diagrams, equations
    └── fractions-tape-diagrams.md # Fraction models
```

## Animation Type Guides

Choose the appropriate guide based on your math concept:

| Type | File | Use For |
|------|------|---------|
| Fractions | `examples/fractions.md` | Equivalent fractions, grids, comparisons |
| Ratios | `examples/ratios.md` | Emoji groups, equivalent ratios, ratio tables |
| Multiplication | `examples/multiplication.md` | Arrays, grids, sequential fill |
| Tape Diagrams | `examples/tape-diagrams.md` | Algebra equations, bar models |
| Coordinate Plane | `examples/coordinate-plane.md` | Graphing, linear relationships |
| Geometry | `examples/geometry.md` | Similar triangles, scale factors, dilations |
| Proportional | `examples/proportional-relationships.md` | Balance models, weights |

## Core Documentation

### Primary References (in this skill folder)

- `AUTO-MANUAL-TOGGLE-PATTERN.md` - REQUIRED for multi-phase animations
- `QUICK-REFERENCE.md` - Quick lookup for patterns and colors
- `VISUAL-GUIDE.md` - Visual examples and layouts

### Primitives (Building Blocks)

- `primitives/p5-format.md` - Required code structure
- `primitives/shapes.md` - Available shapes
- `primitives/colors.md` - Color palette
- `primitives/animations.md` - Animation patterns

### Scenario Templates

- `scenarios/multiplication.md` - Arrays, groups, skip counting
- `scenarios/algebra.md` - Tape diagrams, equations
- `scenarios/fractions-tape-diagrams.md` - Fraction models

### Working Code Examples

@src/app/animations/examples/ - TypeScript implementation examples

## Animation Types (Reusable Scaffolds)

Before creating a new animation from scratch, check if an **animation-type** scaffold already exists for your pattern.

### What are Animation Types?

Animation types are configurable scaffolds - complete, working animations with clearly defined configuration sections. They can be quickly adapted to specific problems by modifying only the configuration.

**Location**: `.claude/skills/create-p5-animation/animation-types/`

**Available Types**:
- **Dynamic Dilation** - Interactive dilation with scale factor slider
- **Dynamic Graph** - Coordinate plane for drawing lines

See [animation-types/README.md](animation-types/README.md) for the full list and decision tree.

### When to Use Animation Types

1. **Check for existing pattern** - Look in `animation-types/` before creating from scratch
2. **Use the scaffold** - Copy the snippet from the animation-type
3. **Modify configuration** - Update only the configuration section for your problem
4. **Save as example** - Save the customized version in `src/app/animations/examples/`

This approach ensures:
- ✅ Consistent patterns across animations
- ✅ Reusable, well-tested code
- ✅ Easy customization for specific problems
- ✅ Clear separation of config vs logic

## Saving New Animations

All new p5.js animations should be saved in the examples folder:

```
src/app/animations/examples/
├── basic.ts                    # Basic shape examples
├── index.ts                    # Main export file
├── coordinatePlane/            # Coordinate plane examples
├── fractions/                  # Fraction examples
├── geometry/                   # Geometry examples (triangles, dilations)
│   ├── index.ts
│   └── dilation.ts
├── multiplication/             # Multiplication examples
├── proportionalRelationships/  # Proportional examples
├── ratios/                     # Ratio examples
├── tapeDiagrams/              # Tape diagram examples
└── triangleRatios/            # Triangle ratio examples
```

### Adding a New Animation

**If an animation-type scaffold exists:**
1. Copy the snippet from `animation-types/{type}/snippets/`
2. Modify only the configuration section
3. Save in the appropriate category folder in `src/app/animations/examples/`
4. Export as `ExampleSketch` object with `id`, `name`, `description`, `code`
5. Import and add to the folder's `index.ts`
6. Update `examples/index.ts` if adding a new category

**If no animation-type exists (creating from scratch):**
1. Create a `.ts` file in the appropriate category folder
2. Export an `ExampleSketch` object with `id`, `name`, `description`, `code`
3. Import and add to the folder's `index.ts`
4. Update `examples/index.ts` to include the new category
5. (Optional) If this becomes a common pattern, create an animation-type scaffold

### File Structure Pattern

```typescript
import { ExampleSketch } from "../../types";

export const MY_ANIMATION: ExampleSketch = {
  id: "my-animation-id",
  name: "My Animation Name",
  description: "Brief description",
  code: \`// p5.js code as string
function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);
  // Animation code
}\`,
};
```

---

## Critical Requirements

### Canvas Size
```javascript
createCanvas(600, 600);  // ALWAYS use 600x600
```

### Required Code Structure
```javascript
// Variables at top
let phase = 0;
let maxPhase = 2;

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(255);
  // Drawing code
}
```

---

## Color Palette (RGB)

### Primary Colors
```javascript
fill(255, 153, 51);   // orange - blocks, counters, main elements
fill(75, 50, 120);    // purple - titles, headers, operations
fill(15, 35, 65);     // darkBlue - alternate blocks, cards
```

### Secondary Colors
```javascript
fill(230, 57, 70);    // red - variables, unknowns, answers
fill(6, 167, 125);    // green - correct/success
fill(255, 220, 80);   // yellow - highlights, focus areas
```

### Neutrals
```javascript
fill(255, 255, 255);  // white
fill(0, 0, 0);        // black
fill(240, 240, 240);  // lightGray - backgrounds
```

---

## Auto/Manual Toggle Pattern (REQUIRED)

All multi-phase animations MUST use this pattern:

```javascript
let phase = 0;
let maxPhase = 3;  // Set to highest phase number (0-indexed)

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(255);

  // Render phases
  if (phase === 0) drawPhase1();
  if (phase === 1) drawPhase2();
  if (phase === 2) drawPhase3();
  if (phase >= 3) drawFinalPhase();

  // Auto-advance logic (only in auto mode)
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
    }
    // Loop back to start after final phase
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
    }
  }
}

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
    } else {
      phase = 0;  // Loop back to start
    }
  }
}
```

### Key Points:
- Toggle button (bottom right) switches between Auto and Manual modes
- **DO NOT** add "Click to continue" text - the toggle button handles UI
- Global variables: `window.animationMode`, `window.animationTimer`, `window.animationPhaseDelay`
- Phase delay default: 120 frames = 2 seconds at 60fps

---

## Common Patterns

### Array/Grid (Multiplication)
```javascript
let rows = 3;
let cols = 8;
let cellWidth = 50;
let gap = 4;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    fill(255, 153, 51);
    stroke(255);
    strokeWeight(2);
    rect(
      75 + col * (cellWidth + gap),
      150 + row * (cellWidth + gap),
      cellWidth,
      cellWidth,
      3
    );
  }
}
```

### Tape Diagram (Algebra)
```javascript
// Background card
fill(15, 35, 65);
rect(45, 45, 510, 510, 8);

// White tape sections
fill(255);
stroke(0);
strokeWeight(2);
rect(75, 150, 225, 60);  // Variable section

// Yellow highlighted section
fill(255, 220, 80);
rect(300, 150, 150, 60);  // Known value

// Red variable label
fill(230, 57, 70);
noStroke();
textAlign(CENTER, CENTER);
text('w', 187, 180);
```

### Emoji Handling (CRITICAL)
```javascript
// WRONG: text('emoji emoji emoji', x, y);
// RIGHT: Draw individually in circles

let circleSize = 40;
let spacing = 48;

for (let i = 0; i < count; i++) {
  let cx = x + i * spacing + circleSize/2;
  let cy = y + circleSize/2;

  // Circle container
  fill(255);
  stroke(204);
  strokeWeight(2);
  circle(cx, cy, circleSize);

  // Emoji centered inside
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text('emoji', cx, cy);
}
```

---

## Math Concept Templates

### Multiplication Array
```javascript
// Title
fill(75, 50, 120);
textAlign(CENTER);
textSize(32);
text(`${rows} x ${cols} = ${rows * cols}`, 300, 60);

// Draw array with animation
for (let i = 0; i < rows * cols; i++) {
  let row = floor(i / cols);
  let col = i % cols;

  if (i < fillCount) {
    fill(255, 153, 51);  // Filled
  } else {
    fill(255);  // Empty
  }

  rect(75 + col * 54, 150 + row * 54, 50, 50, 3);
}
```

### Equivalent Fractions
```javascript
// Phase 0: Show first fraction grid (e.g., 2/10)
// Phase 1: Show multiplication arrow and factor
// Phase 2: Show equivalent fraction grid (e.g., 20/100)
// Phase 3: Show equation

if (phase === 0) {
  drawGrid10x1(75, 150, 45);  // 10 sections, 2 shaded
}
if (phase >= 1) {
  drawArrow(300, 300);
  text('x10', 330, 270);
}
if (phase >= 2) {
  drawGrid10x10(330, 150, 22);  // 100 sections, 20 shaded
}
if (phase >= 3) {
  text('2/10 = 20/100', 300, 570);
}
```

### Ratio Table
```javascript
// Columns with consistent ratios
let ratioA = 3;
let ratioB = 4;

for (let i = 1; i <= 5; i++) {
  let x = 75 + i * 90;
  // Column A value
  text(ratioA * i, x, 150);
  // Column B value
  text(ratioB * i, x, 225);
}
```

---

## Animation Techniques

### Sequential Fill
```javascript
let fillCount = 0;
let fillDelay = 0;

// In draw()
fillDelay++;
if (fillDelay > 10 && fillCount < total) {
  fillCount++;
  fillDelay = 0;
}
```

### Ease Movement
```javascript
let x = 0;
let targetX = 450;
let easeSpeed = 0.1;

// In draw()
x += (targetX - x) * easeSpeed;
```

### Fade In
```javascript
let opacity = 0;
let fadeSpeed = 3;

// In draw()
if (opacity < 255) opacity += fadeSpeed;
fill(255, 153, 51, opacity);
```

---

## Canvas Layout (600x600)

```
(0,0) ------------------- (600,0)
  |   Title Area (y: 0-90)    |
  |---------------------------|
  |                           |
  |   Main Content            |
  |   (y: 90-510)             |
  |                           |
  |---------------------------|
  |   Footer (y: 510-600)     |
(0,600) ----------------- (600,600)
```

- Center: (300, 300)
- Margins: 30-75px on sides
- Title: y = 45-75
- Main content: y = 90-510

---

## Workflow for Creating Manipulatives

### Step 1: Check for Animation Type Scaffold
- Look in `animation-types/` for existing patterns
- Use decision tree in `animation-types/README.md`
- If found, skip to Step 4 (customize configuration)

### Step 2: Identify Math Concept
- Multiplication, division, fractions, algebra, ratios, geometry

### Step 3: Choose Visual Model
- Array, tape diagram, number line, groups, circles
- Interactive controls (slider, click-to-draw, toggles)

### Step 4: Apply Pattern or Customize Scaffold
- **If using animation-type**: Modify only configuration section
- **If creating new**: Use Auto/Manual Toggle pattern if multi-phase
- Use correct colors from palette
- Follow 600x600 canvas requirement

### Step 5: Test
- Check both auto and manual modes (if applicable)
- Verify colors match palette
- Ensure readable at all phases/states
- Test interactive controls (if applicable)

### Step 6: Save and Document
- Save in appropriate examples folder
- If this becomes a common pattern, consider creating an animation-type scaffold

---

## Example Prompts

### Basic Request
```
Create a p5.js manipulative for: 3 x 8 = 24
Use an array model with animated fill sequence.
```

### Detailed Request
```
Generate a p5.js animation for equivalent fractions 2/10 = 20/100.

Requirements:
- Phase 0: Show 10-section grid with 2 shaded
- Phase 1: Show multiplication by 10
- Phase 2: Show 100-section grid with 20 shaded
- Phase 3: Show complete equation

Use the Auto/Manual Toggle pattern and standard color palette.
```

### Algebra Request
```
Create a tape diagram for solving: 3x + 5 = 20

- Show tape with variable section and constant
- Animate the solving process step by step
- Highlight the solution in red
```

---

## Integration with Other Skills

- For UI component integration -> Use `component-system` skill
- For data handling in app -> Use `data-flow` skill
- For overall architecture -> Use `architecture` skill

---

## Key Principles

1. **Constrained = Reliable** - Limited shapes/colors = predictable output
2. **Modular = Flexible** - Primitives combine for any concept
3. **Scenario-Driven** - Each math concept has specific visual needs
4. **Phase-Based** - Build understanding step by step
5. **User Control** - Always support both auto and manual modes

---

## Troubleshooting

**Animation choppy?**
- Check auto-advance logic placement (end of draw())
- Verify frameRate not too low

**Colors look wrong?**
- Verify RGB values match palette
- Check alpha values for transparency

**Phases not advancing?**
- Ensure maxPhase is set correctly (0-indexed)
- Check window.animationMode checks

**Emojis spacing wrong?**
- Never concatenate emoji strings
- Always draw individually in containers

**Content doesn't fit?**
- Scale down cell sizes for larger arrays
- Adjust spacing and margins

---

**Last Updated**: November 2024
**Documentation**: `/docs/podsie/animations/`
