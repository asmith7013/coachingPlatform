# Multiplication Animation Type

Animations for visualizing multiplication using arrays, grids, groups, and number lines.

## Purpose

Use for:
- Multiplication as arrays (rows x columns)
- Multiplication as repeated groups
- Commutative property visualization
- Skip counting on number lines

## Visual Models

### Rectangular Array
- Rows × Columns = Total
- Orange blocks in grid formation
- Shows area model connection

### Equal Groups
- Distinct groups of objects
- Same amount in each group
- Good for word problems

### Number Line
- Skip counting jumps
- Shows addition connection
- Good for pattern recognition

## Code Structure

```javascript
let rows = 3;
let cols = 8;
let product = rows * cols;

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(240);

  // Title equation
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  text(`${rows} × ${cols} = ${product}`, 300, 60);

  // Draw array
  drawArray(75, 120, rows, cols, 50, 50, 4);
}

function drawArray(startX, startY, rows, cols, cellW, cellH, gap) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      fill(255, 153, 51);
      stroke(255);
      strokeWeight(2);
      rect(
        startX + col * (cellW + gap),
        startY + row * (cellH + gap),
        cellW,
        cellH,
        3
      );
    }
  }
}
```

## Animation Patterns

### Sequential Fill
```javascript
let fillCount = 0;
let fillDelay = 0;

// In draw()
for (let i = 0; i < rows * cols; i++) {
  let row = floor(i / cols);
  let col = i % cols;

  if (i < fillCount) {
    fill(255, 153, 51);  // Filled
  } else {
    fill(255);  // Empty
  }

  rect(x + col * 54, y + row * 54, 50, 50, 3);
}

// Increment fill
fillDelay++;
if (fillDelay > 5 && fillCount < rows * cols) {
  fillCount++;
  fillDelay = 0;
}
```

### Interactive Controls
```javascript
function keyPressed() {
  if (keyCode === UP_ARROW && rows < 12) {
    rows++;
    product = rows * cols;
  }
  if (keyCode === DOWN_ARROW && rows > 1) {
    rows--;
    product = rows * cols;
  }
  if (keyCode === RIGHT_ARROW && cols < 12) {
    cols++;
    product = rows * cols;
  }
  if (keyCode === LEFT_ARROW && cols > 1) {
    cols--;
    product = rows * cols;
  }
}
```

## Scaling for 600x600

```javascript
// For 3×8 array:
cellWidth = 50;
cellHeight = 50;
gap = 4;
totalWidth = 8 * 50 + 7 * 4 = 428px ✓

// For larger arrays (12×12):
cellWidth = 35;
cellHeight = 35;
gap = 3;
totalWidth = 12 * 35 + 11 * 3 = 453px ✓
```

## Color Usage

- **Orange (255, 153, 51)**: Array blocks
- **White (255)**: Block borders/empty cells
- **Purple (75, 50, 120)**: Equation text
- **Light Gray (240)**: Background

## Example Files

### Working Examples
@src/app/animations/examples/multiplication/grid.ts
@src/app/animations/examples/multiplication/number-line.ts
@src/app/animations/examples/multiplication/fraction-circles.ts

### Documentation
@docs/podsie/animations/scenarios/multiplication.md

### Example Prompt

```
Create a p5.js multiplication array for 4 × 6 = 24.

Requirements:
- 4 rows of 6 orange blocks
- Animated fill from left to right
- Show running count as blocks fill
- Display equation at top

Use sequential fill pattern with Auto/Manual toggle.
```

## Educational Context

### Learning Objectives
- Understand multiplication as repeated addition
- See commutative property visually
- Connect to area model
- Build multiplication fluency

### Variations
- Times tables (2-12)
- Commutative property (3×8 vs 8×3)
- Multi-digit (area model with partial products)
