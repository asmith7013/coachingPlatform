# Fractions Animation Type

Animations for visualizing equivalent fractions using grids, tape diagrams, and comparison models.

## Purpose

Use for:
- Equivalent fraction demonstrations (2/10 = 20/100)
- Part-whole relationships
- Fraction comparison and simplification
- Visual proofs of fraction equivalence

## Visual Models

### 10x10 Grid (Hundredths)
- 100 squares total
- Shade columns to show fraction
- Good for: 20/100, 50/100, etc.

### 10x1 Grid (Tenths)
- 10 columns total
- Each column = 10 hundredths
- Good for: 2/10, 5/10, etc.

### Tape Diagram
- Horizontal bar divided into sections
- Shaded sections show fraction
- Good for: 3/4, 2/3, etc.

## Phases Pattern

```javascript
// Phase 0: Show first representation
// Phase 1: Show second representation
// Phase 2: Overlay to show equivalence
// Phase 3: Side-by-side comparison with equals sign
```

## Key Functions

```javascript
function drawGrid10x10(x, y, width, height, shadedCount) {
  let cellSize = width / 10;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      let isShaded = col < (shadedCount / 10);
      fill(isShaded ? color(255, 153, 51) : 255);
      stroke(0);
      strokeWeight(1.5);
      rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
    }
  }
}

function drawGrid10x1(x, y, width, height, shadedCount) {
  let colWidth = width / 10;
  for (let col = 0; col < 10; col++) {
    fill(col < shadedCount ? color(255, 153, 51) : 255);
    stroke(0);
    strokeWeight(2);
    rect(x + col * colWidth, y, colWidth, height);
  }
}
```

## Color Usage

- **Orange (255, 153, 51)**: Shaded/filled sections
- **White (255)**: Unshaded sections
- **Dark Blue (15, 35, 65)**: Overlay transparency
- **Red (230, 57, 70)**: Fraction labels
- **Green (6, 167, 125)**: Equals signs, success indicators

## Example Files

### Working Examples
@src/app/animations/examples/fractions/equivalent-2-10-20-100.ts
@src/app/animations/examples/fractions/equivalent-1-2-2-4-4-8.ts
@src/app/animations/examples/fractions/equivalent-4-6-2-3.ts
@src/app/animations/examples/fractions/tape-diagram-3-4.ts

### Example Prompt

```
Create a p5.js animation for equivalent fractions 1/4 = 2/8.

Requirements:
- Phase 0: Show a 1x4 grid with 1 section shaded
- Phase 1: Show a 1x8 grid with 2 sections shaded
- Phase 2: Overlay showing same proportion
- Phase 3: Side by side with equals sign

Use orange for shaded, follow Auto/Manual toggle pattern.
```

## Educational Context

### Learning Objectives
- Understand equivalent fractions have same value
- Visualize multiplication/division relationship
- Connect visual model to symbolic notation
- See that shaded area remains constant

### Common Misconceptions to Address
- Larger denominator doesn't mean larger fraction
- Multiplying top and bottom by same number preserves value
- Different representations can show same amount
