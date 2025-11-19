# Multiplication Manipulatives

## Concept Overview
Multiplication represents **repeated addition** or **equal groups**. Visual models help students understand:
- Multiplication as arrays (rows × columns)
- Multiplication as groups (number of groups × size of group)
- Commutative property (3×8 = 8×3)
- Relationship to division

## Visual Models

### 1. Rectangular Array
**Best for:** Understanding multiplication as rows × columns

```
Rows × Columns = Total
3 × 8 = 24

□□□□□□□□
□□□□□□□□
□□□□□□□□
```

**Key Features:**
- Each row has same number of items
- Total = rows × columns
- Shows commutative property visually
- Connects to area model

### 2. Equal Groups
**Best for:** Understanding multiplication as repeated addition

```
Groups × Items per Group = Total
3 groups of 8 = 24

[□□□□□□□□]  [□□□□□□□□]  [□□□□□□□□]
   Group 1      Group 2      Group 3
```

**Key Features:**
- Distinct groups
- Same amount in each group
- Can count by groups (skip counting)

### 3. Number Line (Skip Counting)
**Best for:** Connecting multiplication to addition

```
0   8   16   24
├───┼───┼───┤
   +8  +8  +8
```

## LLM Prompt Template

```
Generate a p5.js multiplication manipulative.

CONTEXT: {specific multiplication problem, e.g., "3 × 8 = 24"}
MODEL TYPE: {array, groups, or number_line}
INTERACTIVE: {yes/no} - Should user be able to change numbers?

REQUIREMENTS:
1. Canvas: createCanvas(400, 400)
2. Show the equation clearly at top
3. Use rectangular array OR grouped circles/squares
4. Color scheme: orange (#FF9933) for blocks, purple (#4B3278) for text
5. Include visual labels (row/column counts or group counts)
6. {if interactive} Add sliders or keyboard controls to change multiplier/multiplicand

ANIMATION (optional):
- Fill array sequentially (left-to-right or top-to-bottom)
- Build groups one at a time
- Count up the total

OUTPUT: Complete working p5.js code
```

## Example Scenarios

### Scenario 1: Basic Array (Static)
```
Problem: 3 × 8 = 24
Display: 3 rows of 8 orange squares
Labels: "3 rows", "8 in each row", "24 total"
Interactive: No
```

### Scenario 2: Animated Fill
```
Problem: 4 × 6 = 24
Display: 4 rows of 6 squares that fill in left-to-right
Animation: Fill one square every 5 frames
Labels: Show running count "1, 2, 3... 24"
Interactive: No
```

### Scenario 3: Interactive Exploration
```
Problem: Variable
Display: Adjustable rows and columns
Controls: Arrow keys to change rows (UP/DOWN) and columns (LEFT/RIGHT)
Update: Equation updates as numbers change
Interactive: Yes
```

### Scenario 4: Groups Model
```
Problem: 5 × 7 = 35
Display: 5 groups of 7 circles with spacing between groups
Labels: "5 groups", "7 in each", "5 × 7 = 35"
Animation: Groups appear one by one
Interactive: No
```

### Scenario 5: Facts Practice
```
Problem: Random facts (2-12)
Display: Array model with equation
Interaction: Click to generate new problem
Feature: Shows answer after 2 seconds
```

## Code Structure Template

```javascript
// Variables for multiplication
let rows = 3;
let cols = 8;
let product = rows * cols;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240);
  
  // Title equation
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(`${rows} × ${cols} = ${product}`, 200, 40);
  
  // Draw array
  drawArray(50, 100, rows, cols, 40, 40, 3);
  
  // Labels (optional)
  fill(0);
  textSize(16);
  text(`${rows} rows`, 30, 200);
  text(`${cols} in each row`, 200, 350);
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

## Common Variations

### Times Tables (2-12)
- Display as array
- Show relationship to division
- Practice specific facts

### Multiplication by 10s
- Show columns of 10
- Emphasize place value
- Connect to skip counting by 10

### Commutative Property
- Show 3×8 and 8×3 side by side
- Rotate array to demonstrate equality
- Use different colors for each dimension

### Multi-Digit Multiplication
- Area model (break into parts)
- Partial products shown separately
- Build up to full product

## Design Guidelines

### Visual Clarity
- Clear spacing between elements
- Distinct rows/columns
- Readable labels

### Color Usage
- Orange for blocks/counters
- Purple for equations
- White for empty/background
- Use stroke for definition

### Scaling for 400×400
```javascript
// For 3×8 array:
cellWidth = 40;
cellHeight = 40;
gap = 3;
totalWidth = 8 * 40 + 7 * 3 = 341px ✓ (fits in 400)

// For larger arrays (e.g., 12×12):
cellWidth = 25;
cellHeight = 25;
gap = 2;
totalWidth = 12 * 25 + 11 * 2 = 322px ✓
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
  // Similar for cols with LEFT/RIGHT
}
```

## Pedagogical Considerations

1. **Start concrete** - Show individual objects first
2. **Progress to abstract** - Then show equation
3. **Make connections** - Link to addition, division
4. **Vary representations** - Arrays, groups, number lines
5. **Allow interaction** - Let students explore patterns

## Related Concepts
- Division (inverse operation)
- Area models (geometry connection)
- Factors and multiples
- Distributive property
- Skip counting