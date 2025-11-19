# Proportional Relationships Animation Type

Animations for visualizing proportional relationships using balance models, weight comparisons, and scaling.

## Purpose

Use for:
- Proportional reasoning
- Balance/scale models
- Unit rate exploration
- Comparing proportions visually

## Visual Models

### Balance Scale
- Objects on left and right
- Visual equilibrium
- Shows equal proportions

### Weight Ratio
- Objects with weights
- Scaling relationships
- Multiple representations

## Code Structure

```javascript
let phase = 0;
let maxPhase = 4;

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(240);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER);
  textSize(28);
  text('Proportional Relationship', 300, 50);

  // Draw balance or comparison based on phase
  if (phase >= 0) {
    drawBalance(150, 200);
  }

  if (phase >= 1) {
    drawWeights('left', [1, 1, 1]);  // 3 carrots
  }

  if (phase >= 2) {
    drawWeights('right', [1]);  // 1 apple
  }

  if (phase >= 3) {
    drawEquation('3 carrots = 1 apple');
  }

  if (phase >= 4) {
    drawScaledExample('6 carrots = 2 apples');
  }

  // Auto/Manual toggle logic...
}
```

## Key Functions

```javascript
function drawBalance(x, y) {
  // Base
  fill(100);
  rect(x + 100, y + 150, 100, 20);

  // Fulcrum
  triangle(x + 150, y + 150, x + 130, y + 180, x + 170, y + 180);

  // Beam
  stroke(80);
  strokeWeight(4);
  line(x, y + 100, x + 300, y + 100);

  // Pans
  fill(200);
  ellipse(x + 50, y + 120, 80, 20);
  ellipse(x + 250, y + 120, 80, 20);
}

function drawWeightGroup(x, y, emoji, count) {
  let spacing = 40;

  for (let i = 0; i < count; i++) {
    let cx = x + i * spacing;

    // Circle container
    fill(255);
    stroke(204);
    strokeWeight(2);
    circle(cx, y, 36);

    // Emoji
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(22);
    text(emoji, cx, y);
  }
}
```

## Phases Pattern

```javascript
// Phase 0: Show empty balance
// Phase 1: Add items to left side
// Phase 2: Add items to right side (balance)
// Phase 3: Show ratio equation
// Phase 4: Show scaled equivalent
// Phase 5: General rule
```

## Color Usage

- **Gray (100, 200)**: Balance structure
- **White (255)**: Object containers
- **Purple (75, 50, 120)**: Headers
- **Orange (255, 153, 51)**: Highlights
- **Green (6, 167, 125)**: Equilibrium indicator

## Example Files

### Working Examples
@src/app/animations/examples/proportionalRelationships/carrot-balance.ts
@src/app/animations/examples/proportionalRelationships/weight-ratios.ts

### Example Prompt

```
Create a balance model for: 4 apples = 6 oranges

Requirements:
- Phase 0: Show balance scale
- Phase 1: Add 4 apples to left
- Phase 2: Add 6 oranges to right (balanced)
- Phase 3: Show "4 apples : 6 oranges"
- Phase 4: Show simplified "2:3"
- Phase 5: Show scaled "8 apples = 12 oranges"

Use emoji circles for fruits, balance model in center.
```

## Educational Context

### Learning Objectives
- Understand proportional relationships
- Visualize equal ratios
- See scaling patterns
- Connect to unit rates

### Real-World Applications
- Cooking recipes
- Currency conversion
- Speed/distance/time
- Similar figures

### Key Concepts
- Constant of proportionality
- Unit rate
- Scaling up/down
- Cross multiplication
