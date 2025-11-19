# Tape Diagrams Animation Type

Animations for visualizing algebraic equations and ratio relationships using tape (bar) diagrams.

## Purpose

Use for:
- Solving linear equations visually
- Representing part-whole relationships
- Equivalent ratios and fractions
- Variable isolation steps

## Visual Models

### Single Tape
- Horizontal bar divided into sections
- Sections represent quantities
- Labels show values or variables

### Comparison Tapes
- Multiple tapes aligned
- Show equivalent relationships
- Reveal proportions

## Code Structure

```javascript
let phase = 0;
let maxPhase = 4;

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(255);

  // Dark blue background card
  fill(15, 35, 65);
  noStroke();
  rect(45, 45, 510, 510, 8);

  // Draw tape based on phase
  if (phase >= 0) {
    drawTape(75, 150, [
      { width: 225, label: 'w', color: [255, 255, 255] },
      { width: 150, label: '8', color: [255, 220, 80] }
    ]);
    drawBrace(75, 220, 375, '38');
  }

  // Show solving steps in later phases
  if (phase >= 1) {
    // Subtract constant
  }
  if (phase >= 2) {
    // Isolate variable
  }
  // etc.

  // Auto/Manual toggle logic...
}
```

## Key Functions

```javascript
function drawTape(x, y, sections) {
  let currentX = x;

  for (let section of sections) {
    // Draw section rectangle
    fill(section.color);
    stroke(0);
    strokeWeight(2);
    rect(currentX, y, section.width, 60, 4);

    // Draw label
    fill(section.label.match(/[a-z]/i) ? color(230, 57, 70) : 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(section.label, currentX + section.width / 2, y + 30);

    currentX += section.width;
  }
}

function drawBrace(x, y, width, label) {
  // Draw curly brace below tape
  stroke(0);
  strokeWeight(2);
  noFill();

  // Left curve
  arc(x + 10, y + 10, 20, 20, PI, PI + HALF_PI);
  // Horizontal lines
  line(x + 10, y, x + width / 2 - 10, y);
  line(x + width / 2 + 10, y, x + width - 10, y);
  // Middle point
  arc(x + width / 2, y + 10, 20, 20, -HALF_PI, 0);
  arc(x + width / 2, y + 10, 20, 20, PI, PI + HALF_PI);
  // Right curve
  arc(x + width - 10, y + 10, 20, 20, -HALF_PI, 0);

  // Label
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text(label, x + width / 2, y + 20);
}
```

## Phases for Equation Solving

Example: Solve w + 8 = 38

```javascript
// Phase 0: Show equation as tape
// [  w  ][  8  ] = 38

// Phase 1: Show subtraction
// [  w  ][  8  ] - 8 = 38 - 8

// Phase 2: Simplify
// [  w  ] = 30

// Phase 3: Highlight answer
// w = 30 (in red)

// Phase 4: Verify
// 30 + 8 = 38 ✓
```

## Color Usage

- **Dark Blue (15, 35, 65)**: Background card
- **White (255)**: Variable sections
- **Yellow (255, 220, 80)**: Known value sections
- **Red (230, 57, 70)**: Variable labels, answers
- **Green (6, 167, 125)**: Checkmarks, verification
- **Black (0)**: Borders, braces

## Example Files

### Working Examples
@src/app/animations/examples/tapeDiagrams/equivalent-ratios.ts
@src/app/animations/examples/fractions/tape-diagram-3-4.ts

### Documentation
@docs/podsie/animations/scenarios/algebra.md
@docs/podsie/animations/scenarios/fractions-tape-diagrams.md
@docs/podsie/animations/examples/tape-diagram-equivalent-fractions.js

### Example Prompt

```
Create a tape diagram for solving: 3x + 12 = 45

Requirements:
- Phase 0: Show tape with three x sections and one 12 section, total 45
- Phase 1: Subtract 12 from both sides
- Phase 2: Show 3x = 33
- Phase 3: Divide by 3
- Phase 4: Show x = 11 with verification

Use dark blue card background, yellow for constants, white for variables.
```

## Educational Context

### Learning Objectives
- Visualize equation structure
- Understand inverse operations
- See step-by-step solving process
- Connect visual to symbolic

### Common Equation Types
- One-step: x + 5 = 12
- Two-step: 2x + 3 = 15
- Multi-step: 3(x + 2) = 21

### Ratio Applications
- Part-to-part ratios
- Part-to-whole relationships
- Scaling and proportions
