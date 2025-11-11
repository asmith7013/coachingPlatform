# Fractions: Tape Diagrams

## Concept Overview
Tape diagrams (bar models/strip diagrams) are rectangular bars divided into equal sections to represent fractional parts. They bridge concrete and abstract thinking, making fractions visual and accessible.

**Key Insight:** A tape diagram shows that fractions describe **equal parts of a whole**.

## Visual Models

### 1. Basic Fraction (Part of a Whole)
```
Fraction: 3/4

┌─────────┬─────────┬─────────┬─────────┐
│ SHADED  │ SHADED  │ SHADED  │  EMPTY  │
│   1/4   │   1/4   │   1/4   │   1/4   │
└─────────┴─────────┴─────────┴─────────┘
    \______________ 3/4 _______________/
```

**Purpose:** Show what a fraction represents - 3 out of 4 equal parts

### 2. Equivalent Fractions
```
1/2:  ┌───────────┬───────────┐
      │  SHADED   │   EMPTY   │
      └───────────┴───────────┘

2/4:  ┌─────┬─────┬─────┬─────┐
      │ SHD │ SHD │     │     │
      └─────┴─────┴─────┴─────┘

4/8:  ┌──┬──┬──┬──┬──┬──┬──┬──┐
      │S │S │S │S │  │  │  │  │
      └──┴──┴──┴──┴──┴──┴──┴──┘
```

**Purpose:** Show different fractions representing the same amount

### 3. Addition (Same Denominator)
```
1/4 + 2/4 = 3/4

Tape 1 (1/4):
┌─────────┬─────────┬─────────┬─────────┐
│ SHADED  │         │         │         │
└─────────┴─────────┴─────────┴─────────┘

Tape 2 (2/4):
┌─────────┬─────────┬─────────┬─────────┐
│ SHADED  │ SHADED  │         │         │
└─────────┴─────────┴─────────┴─────────┘

Result (3/4):
┌─────────┬─────────┬─────────┬─────────┐
│ ORANGE  │ ORANGE  │ ORANGE  │         │
└─────────┴─────────┴─────────┴─────────┘
```

### 4. Comparison
```
Which is larger: 2/3 or 3/5?

2/3:  ┌──────────┬──────────┬──────────┐
      │ SHADED   │ SHADED   │          │
      └──────────┴──────────┴──────────┘

3/5:  ┌───────┬───────┬───────┬───────┬───────┐
      │ SHADE │ SHADE │ SHADE │       │       │
      └───────┴───────┴───────┴───────┴───────┘
```

**Purpose:** Visual comparison when tapes are same length

### 5. Multiplication (Fraction of a Fraction)
```
1/2 of 2/3 = ?

Step 1: Show 2/3
┌──────────┬──────────┬──────────┐
│ ORANGE   │ ORANGE   │          │
└──────────┴──────────┴──────────┘

Step 2: Divide shaded part in half
┌─────┬─────┬──────────┬──────────┐
│ RED │     │          │          │
└─────┴─────┴──────────┴──────────┘

Result: 1/2 of 2/3 = 2/6 = 1/3
```

## LLM Prompt Template

```
Generate a p5.js tape diagram for fractions.

FRACTION TYPE: {basic, equivalent, addition, comparison, multiplication}
FRACTION(S): {e.g., "3/4" or "1/2 + 1/4" or "2/3 vs 3/5"}
ANIMATION: {yes/no} - Should it build step-by-step?
INTERACTIVE: {yes/no} - Should user be able to change fraction?

REQUIREMENTS:
1. Canvas: createCanvas(400, 400)
2. Show fraction clearly at top
3. Draw rectangular tape(s) divided into equal sections
4. Color scheme:
   - Orange (255, 153, 51): shaded parts
   - White (255): unshaded parts
   - Red (230, 57, 70): fraction labels/brackets
   - Purple (75, 50, 120): title
5. Label each section (e.g., "1/4")
6. Include bracket showing shaded portion
7. Add brief explanation text at bottom

TAPE DIMENSIONS:
- Width: 250-300px (fits in 400px canvas)
- Height: 60-80px (clear visibility)
- Section divisions: clear vertical lines
- Spacing: 20-30px between multiple tapes

OUTPUT: Complete working p5.js code
```

## Example Scenarios

### Scenario 1: Basic Fraction (Static)
```
Fraction: 3/4
Display: One tape, 4 sections, 3 shaded orange
Labels: "1/4" in each section
Bracket: Red bracket showing "3/4"
Text: "3 out of 4 equal parts"
Animation: No
```

### Scenario 2: Build Fraction (Animated)
```
Fraction: 5/8
Display: Tape with 8 sections
Animation: Shade sections one by one (left to right)
Counter: Show running numerator "1/8, 2/8, ... 5/8"
Duration: 200ms per section
```

### Scenario 3: Equivalent Fractions
```
Fractions: 1/2, 2/4, 4/8
Display: Three tapes stacked vertically, same length
Show: All have same shaded amount but different divisions
Highlight: Use same orange shade for all
Label: "All equal to 1/2"
```

### Scenario 4: Addition
```
Problem: 1/4 + 2/4 = ?
Phases:
  1. Show first tape (1/4 shaded)
  2. Show second tape (2/4 shaded)
  3. Combine: show result tape (3/4 shaded)
Colors: Use different orange shades to show combination
```

### Scenario 5: Interactive Explorer
```
Controls: Arrow keys change numerator and denominator
Display: Tape updates in real-time
Range: Denominators 2-12, numerators 0-denominator
Labels: Show both fraction and decimal
Feature: Highlight improper fractions differently
```

### Scenario 6: Comparison
```
Problem: Compare 2/3 and 3/5
Display: Two tapes of equal length, stacked
Alignment: Lined up at left edge
Visual: Show which has more shaded
Label: "2/3 > 3/5" or "2/3 < 3/5"
```

### Scenario 7: Fraction Multiplication
```
Problem: 1/2 × 2/3 = ?
Phases:
  1. Show 2/3 tape
  2. Divide into halves horizontally
  3. Highlight intersection (1/3)
  4. Show result: 1/3
Advanced: Show grid created by multiplication
```

## Code Structure Template

```javascript
// Basic Fraction Tape Diagram

let numerator = 3;
let denominator = 4;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
  noLoop();  // For static display
}

function draw() {
  background(255);
  
  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(32);
  text(`${numerator}/${denominator}`, 200, 30);
  
  // Draw tape
  drawTapeDiagram(50, 150, 300, 80, numerator, denominator);
  
  // Explanation
  fill(0);
  textSize(14);
  text(`${numerator} out of ${denominator} equal parts`, 200, 280);
}

function drawTapeDiagram(x, y, width, height, num, denom) {
  let sectionWidth = width / denom;
  
  // Draw each section
  for (let i = 0; i < denom; i++) {
    // Shade if part of numerator
    if (i < num) {
      fill(255, 153, 51);  // Orange
    } else {
      fill(255);  // White
    }
    
    stroke(0);
    strokeWeight(3);
    rect(x + i * sectionWidth, y, sectionWidth, height);
    
    // Label each section
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text(`1/${denom}`, x + i * sectionWidth + sectionWidth/2, y + height/2);
  }
  
  // Draw bracket over shaded portion
  if (num > 0) {
    stroke(230, 57, 70);  // Red
    strokeWeight(3);
    noFill();
    let bracketY = y - 20;
    line(x, bracketY, x + num * sectionWidth, bracketY);
    line(x, bracketY - 5, x, bracketY + 5);
    line(x + num * sectionWidth, bracketY - 5, x + num * sectionWidth, bracketY + 5);
    
    // Label bracket
    fill(230, 57, 70);
    noStroke();
    textSize(24);
    text(`${num}/${denom}`, x + (num * sectionWidth)/2, bracketY - 25);
  }
}
```

## Animated Version Template

```javascript
// Animated Fraction Builder

let numerator = 5;
let denominator = 8;
let currentShaded = 0;
let timer = 0;
let animationSpeed = 30;  // frames per section

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);
  
  // Title (shows current progress)
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(32);
  text(`${currentShaded}/${denominator}`, 200, 30);
  
  // Draw tape
  let x = 50;
  let y = 150;
  let width = 300;
  let height = 80;
  let sectionWidth = width / denominator;
  
  for (let i = 0; i < denominator; i++) {
    if (i < currentShaded) {
      fill(255, 153, 51);  // Shaded
    } else {
      fill(255);  // Not yet shaded
    }
    
    stroke(0);
    strokeWeight(3);
    rect(x + i * sectionWidth, y, sectionWidth, height);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text(`1/${denominator}`, x + i * sectionWidth + sectionWidth/2, y + height/2);
  }
  
  // Animate shading
  timer++;
  if (timer > animationSpeed && currentShaded < numerator) {
    currentShaded++;
    timer = 0;
  }
  
  // Show completion
  if (currentShaded === numerator) {
    fill(0, 150, 0);
    textSize(20);
    text('Complete!', 200, 280);
  }
}

function mousePressed() {
  // Reset animation
  currentShaded = 0;
  timer = 0;
}
```

## Design Guidelines

### Tape Proportions for 400×400 Canvas

```javascript
// Single tape
tapeX = 50;
tapeY = 150;
tapeWidth = 300;  // Leaves 50px margins
tapeHeight = 80;

// Multiple tapes (stacked)
tape1Y = 120;
tape2Y = 220;
tape3Y = 320;
spacing = 100;  // Between tapes
```

### Section Sizing

```javascript
// Calculate section width
sectionWidth = totalWidth / denominator;

// Minimum readable size
if (sectionWidth < 20) {
  // Reduce font size or total width
}

// Maximum sections that fit clearly
maxSections = 12;  // For 300px tape
```

### Visual Hierarchy

1. **Title** (largest): Fraction at top (size 28-32)
2. **Section labels**: Clear but smaller (size 16-20)
3. **Bracket label**: Medium emphasis (size 20-24)
4. **Explanation**: Smaller supporting text (size 14-16)

### Color Usage

```javascript
// Shaded sections
fill(255, 153, 51);  // Orange

// Unshaded sections
fill(255);  // White

// Fraction labels
fill(230, 57, 70);  // Red

// Section outlines
stroke(0);
strokeWeight(3);

// Brackets
stroke(230, 57, 70);  // Red
strokeWeight(3);
```

### Text Placement

```javascript
// Inside sections (when wide enough)
if (sectionWidth > 40) {
  text('1/' + denom, centerX, centerY);
}

// Below tape (when sections narrow)
if (sectionWidth < 40) {
  // Draw tick marks
  // Place labels below
}
```

## Common Variations

### Improper Fractions (7/4)
```javascript
// Show more than one whole
// Draw multiple complete tapes
let wholes = floor(numerator / denominator);
let remainder = numerator % denominator;

// Draw complete tapes
for (let w = 0; w < wholes; w++) {
  drawCompleteTape(x, y + w * spacing);
}

// Draw partial tape
if (remainder > 0) {
  drawPartialTape(x, y + wholes * spacing, remainder, denominator);
}
```

### Mixed Numbers (2 1/3)
```javascript
// Show as whole tapes + partial
let wholes = 2;
let fractionalPart = [1, 3];  // 1/3

// Draw whole tapes (all shaded)
// Draw partial tape
```

### Decimal Equivalents
```javascript
// Show both fraction and decimal
let decimal = numerator / denominator;
text(`${numerator}/${denominator} = ${decimal.toFixed(2)}`, x, y);
```

### Percentage
```javascript
// Convert to percentage
let percent = (numerator / denominator) * 100;
text(`${numerator}/${denominator} = ${percent}%`, x, y);
```

## Interactive Features

### Change Numerator/Denominator
```javascript
function keyPressed() {
  if (keyCode === UP_ARROW && numerator < denominator) {
    numerator++;
  }
  if (keyCode === DOWN_ARROW && numerator > 0) {
    numerator--;
  }
  if (keyCode === RIGHT_ARROW && denominator < 12) {
    denominator++;
  }
  if (keyCode === LEFT_ARROW && denominator > 2) {
    denominator--;
    numerator = min(numerator, denominator);
  }
  redraw();
}
```

### Click to Shade
```javascript
function mousePressed() {
  // Check if click is on a section
  let sectionIndex = floor((mouseX - tapeX) / sectionWidth);
  
  if (sectionIndex >= 0 && sectionIndex < denominator) {
    // Toggle this section
    if (sectionIndex < numerator) {
      numerator = sectionIndex;  // Unshade
    } else {
      numerator = sectionIndex + 1;  // Shade up to here
    }
  }
}
```

## Pedagogical Considerations

1. **Equal parts are crucial** - Make divisions visually equal
2. **Start simple** - Use denominators like 2, 3, 4 first
3. **Connect representations** - Show fraction, decimal, percentage together
4. **Build complexity** - Start with unit fractions (1/n)
5. **Use consistent colors** - Orange always means "shaded part"
6. **Show operations** - Use multiple tapes for addition/subtraction
7. **Label clearly** - Every section should show what it represents

## Related Concepts
- Unit fractions (1/n)
- Proper vs improper fractions
- Mixed numbers
- Equivalent fractions
- Fraction operations (add, subtract, multiply, divide)
- Decimals and percentages
- Ratios and proportions