# Algebra: Tape Diagrams & Equations

## Concept Overview
Tape diagrams (also called bar models or strip diagrams) help visualize algebraic equations by representing quantities as rectangular "tapes" or bars. They bridge concrete and abstract thinking.

## Visual Models

### 1. Basic Equation (w + 8 = 14)
```
Total: 14
┌─────────────────────┐
│      w      │   8   │
└─────────────────────┘
```

**Purpose:** Show additive relationship where unknown + known = total

### 2. Comparison (x = y + 5)
```
x: ┌─────────────────┐
   │    y     │  +5  │
   └─────────────────┘
y: ┌──────────┐
   │    y     │
   └──────────┘
```

**Purpose:** Compare two quantities with difference

### 3. Multiplicative (3w = 24)
```
24
┌────────────────────┐
│  w  │  w  │  w    │
└────────────────────┘
```

**Purpose:** Show repeated quantities

## LLM Prompt Template

```
Generate a p5.js tape diagram for solving an equation.

EQUATION: {equation, e.g., "w + 8 = 14"}
SOLUTION STEPS: {yes/no} - Show step-by-step solution?
ANIMATION: {yes/no} - Animate the solving process?

REQUIREMENTS:
1. Canvas: createCanvas(400, 400)
2. Show equation at top
3. Draw tape diagram with labeled sections
4. Use colors:
   - White/light gray: tapes
   - Red: unknown variable labels
   - Yellow: highlighted sections being removed
   - Purple/blue: text and borders
5. Show solving steps if requested

PHASES (if animated):
1. Show total tape
2. Show split tape (unknown + known)
3. Show removal of known from both sides
4. Show final answer

OUTPUT: Complete working p5.js code
```

## Example Scenarios

### Scenario 1: Simple Addition (Animated)
```
Equation: w + 8 = 14
Phases:
  1. Top tape showing 14
  2. Bottom tape split: w (unknown) | 8 (known)
  3. Visual subtraction: remove 8 from both
  4. Result: w = 6
Display: Phased animation, auto-advance every 2 seconds
```

### Scenario 2: Subtraction (Static)
```
Equation: 20 - x = 12
Display: 
  - Total tape (20)
  - Split into result (12) and unknown (x)
  - Show x = 8
Interactive: No
```

### Scenario 3: Interactive Solver
```
Equation: User-defined
Input: Text boxes for coefficients
Display: Updates tape diagram based on input
Solution: Shows step-by-step solution
Controls: Buttons to advance through steps
```

### Scenario 4: Multiplication/Division
```
Equation: 4x = 20
Display:
  - Top: total tape (20)
  - Bottom: 4 equal sections labeled x
  - Show division: 20 ÷ 4 = 5
  - Therefore x = 5
```

### Scenario 5: Two-Step Equation
```
Equation: 2w + 3 = 11
Phases:
  1. Show total (11)
  2. Split: 2w + 3
  3. Remove 3: 2w = 8
  4. Divide: w = 4
```

## Code Structure Template

```javascript
// Equation: w + 8 = 14
let phase = 0;
let timer = 0;
let phaseDelay = 120;  // 2 seconds

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);
  
  // Title
  fill(0);
  textAlign(CENTER, TOP);
  textSize(16);
  text('w + 8 = 14', 200, 20);
  
  // Draw phases
  if (phase >= 0) drawPhase1();  // Total tape
  if (phase >= 1) drawPhase2();  // Split tape
  if (phase >= 2) drawPhase3();  // Removal
  if (phase >= 3) drawPhase4();  // Answer
  
  // Auto-advance
  timer++;
  if (timer > phaseDelay && phase < 3) {
    phase++;
    timer = 0;
  }
}

function drawPhase1() {
  // Top tape showing total
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(100, 60, 200, 30);
  
  fill(0, 0, 255);
  noStroke();
  textAlign(CENTER, CENTER);
  text('14', 200, 75);
}

function drawPhase2() {
  // Split tape
  // Left section (w)
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(100, 110, 100, 30);
  
  // Right section (8)
  rect(200, 110, 100, 30);
  
  // Dividing line
  stroke(255, 0, 0);
  line(200, 110, 200, 140);
  
  // Labels
  fill(255, 0, 0);
  noStroke();
  text('w', 150, 125);
  text('8', 250, 125);
}

function drawPhase3() {
  // Show removal (highlight in yellow)
  fill(255, 220, 80);
  stroke(0);
  strokeWeight(2);
  rect(200, 160, 100, 30);
  
  fill(0);
  noStroke();
  text('Remove 8', 250, 175);
  text('from both sides', 250, 190);
}

function drawPhase4() {
  // Final answer
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(100, 240, 80, 30);
  
  fill(255, 0, 0);
  noStroke();
  textAlign(CENTER, CENTER);
  text('w = 6', 140, 255);
}

function keyPressed() {
  if (key === ' ') {
    phase = min(phase + 1, 3);
  }
  if (key === 'r') {
    phase = 0;
    timer = 0;
  }
}
```

## Tape Diagram Elements

### Basic Tape
```javascript
function drawTape(x, y, width, height, label, color) {
  fill(color);
  stroke(0);
  strokeWeight(2);
  rect(x, y, width, height);
  
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + width/2, y + height/2);
}
```

### Sectioned Tape
```javascript
function drawSectionedTape(x, y, sections, height) {
  let currentX = x;
  for (let section of sections) {
    fill(section.color);
    stroke(0);
    strokeWeight(2);
    rect(currentX, y, section.width, height);
    
    // Label
    fill(section.labelColor || 0);
    noStroke();
    text(section.label, currentX + section.width/2, y + height/2);
    
    currentX += section.width;
  }
}
```

### Visual Subtraction
```javascript
function drawSubtraction(x, y, totalWidth, removeWidth) {
  // Keep section
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(x, y, totalWidth - removeWidth, 40);
  
  // Remove section (yellow highlight)
  fill(255, 220, 80);
  rect(x + (totalWidth - removeWidth), y, removeWidth, 40);
  
  // Line dividing
  stroke(255, 0, 0);
  strokeWeight(3);
  line(x + (totalWidth - removeWidth), y, x + (totalWidth - removeWidth), y + 40);
}
```

## Color Usage for Algebra

### Variables (Unknown)
```javascript
fill(230, 57, 70);  // Red for w, x, y, etc.
```

### Known Values
```javascript
fill(0, 0, 0);  // Black for numbers
```

### Highlights (Removal/Action)
```javascript
fill(255, 220, 80);  // Yellow for sections being removed
```

### Background Cards
```javascript
fill(15, 35, 65);  // Dark blue card background
fill(75, 50, 120);  // Purple card background
```

## Common Equation Types

### Addition (x + a = b)
```
Total: b
┌────────────┐
│  x  │  a  │
└────────────┘
Solution: x = b - a
```

### Subtraction (x - a = b)
```
Start: x
┌─────────────┐
│  b  │  -a  │
└─────────────┘
Solution: x = b + a
```

### Multiplication (ax = b)
```
Total: b
┌─────────────────┐
│ x │ x │ x │...│
└─────────────────┘
Solution: x = b/a
```

### Two-Step (ax + b = c)
```
Total: c
┌────────────────┐
│  ax  │   b    │
└────────────────┘
Step 1: ax = c - b
Step 2: x = (c-b)/a
```

## Animation Patterns

### Sequential Build
```javascript
let buildPhase = 0;
// Phase 0: equation only
// Phase 1: + top tape
// Phase 2: + split tape
// Phase 3: + solution
```

### Highlighting
```javascript
let highlightAlpha = 0;
let increasing = true;

// Pulse highlight
if (increasing) {
  highlightAlpha += 5;
  if (highlightAlpha > 200) increasing = false;
} else {
  highlightAlpha -= 5;
  if (highlightAlpha < 100) increasing = true;
}

fill(255, 220, 80, highlightAlpha);
```

### Step-by-Step Solver
```javascript
// Show algebraic steps alongside diagram
if (phase === 2) {
  fill(0, 0, 255);
  text('w + 8 - 8 = 14 - 8', 300, 100);
}
if (phase === 3) {
  text('w = 6', 300, 130);
}
```

## Design Guidelines

### Layout for 400×400
```
y = 0-60:    Equation title
y = 60-140:  Phase 1 tape
y = 140-220: Phase 2 tape
y = 220-300: Phase 3 operations
y = 300-360: Phase 4 answer
y = 360-400: Controls/instructions
```

### Tape Proportions
- Height: 30-40px for visibility
- Width: Proportional to values when possible
- Gaps: 10-20px between phases
- Labels: 14-16px font inside tapes

### Interactive Features
```javascript
// Manual advancement
function keyPressed() {
  if (key === ' ') {
    phase++;
  }
}

// Reset
function mousePressed() {
  if (mouseY > 350) {  // Bottom area
    phase = 0;
  }
}
```

## Pedagogical Considerations

1. **Concrete to abstract** - Diagram first, then algebraic notation
2. **Maintain equality** - Show both sides of equation
3. **Visual operations** - Make subtraction/division visible
4. **Step by step** - Don't skip steps in solution
5. **Reinforce inverse operations** - Show undo of operations

## Related Concepts
- Part-whole relationships
- Comparison problems
- Systems of equations
- Proportional reasoning