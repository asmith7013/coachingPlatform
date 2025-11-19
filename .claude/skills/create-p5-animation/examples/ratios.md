# Ratios Animation Type

Animations for visualizing ratio relationships using emoji groups, equivalent ratios, and ratio tables.

## Purpose

Use for:
- Ratio introduction (3:4 apples to oranges)
- Equivalent ratios (3:4 = 6:8 = 9:12)
- Scaling ratios up and down
- Real-world ratio applications

## Visual Models

### Emoji Groups
- Rows of emojis in circles
- Top row: first quantity
- Bottom row: second quantity
- Groups repeat for equivalent ratios

### Ratio Table
- Columns showing scaled values
- Consistent visual pattern
- Arrows showing multiplication

## Phases Pattern

```javascript
// Phase 0: First ratio group
// Phase 1: Second ratio group (doubled)
// Phase 2: Label for doubled ratio
// Phase 3: Third ratio group (tripled)
// Phase 4: Label for tripled ratio
// Phase 5: Summary showing all equivalent ratios
```

## Key Functions

```javascript
function drawRatioGroup(x, y, count1, count2, emoji1, emoji2) {
  let circleSize = 32;
  let spacing = 36;

  // Draw top row (first quantity)
  for (let i = 0; i < count1; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + circleSize / 2;

    fill(255);
    stroke(204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(emoji1, cx, cy);
  }

  // Draw colon separator
  fill(75, 50, 120);
  noStroke();
  textSize(28);
  textStyle(BOLD);
  text(':', x + 52, y + 35);

  // Draw bottom row (second quantity)
  for (let i = 0; i < count2; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + 50 + circleSize / 2;

    fill(255);
    stroke(204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(emoji2, cx, cy);
  }
}
```

## Color Usage

- **White (255)**: Emoji circle backgrounds
- **Gray (204)**: Circle borders
- **Purple (75, 50, 120)**: Colon, headers
- **Orange (255, 153, 51)**: Equivalent ratio labels, highlights
- **Black (0)**: Explanatory text

## Emoji Best Practices

**CRITICAL**: Never concatenate emoji strings!

```javascript
// WRONG
text('🍎🍎🍎', x, y);

// RIGHT - Always draw individually in circles
for (let i = 0; i < count; i++) {
  let cx = x + i * spacing + circleSize/2;
  // Draw circle container
  circle(cx, cy, circleSize);
  // Draw emoji centered
  text('🍎', cx, cy);
}
```

## Example Files

### Working Examples
@src/app/animations/examples/ratios/apples-oranges.ts
@src/app/animations/examples/ratios/dollars-hours.ts
@src/app/animations/examples/ratios/flour-eggs.ts

### Example Prompt

```
Create a p5.js animation for the ratio 2:5 (red to blue marbles).

Requirements:
- Show 3 equivalent ratios: 2:5, 4:10, 6:15
- Use 🔴 for red and 🔵 for blue
- Each group appears in phases
- Final phase shows "2:5 = 4:10 = 6:15"

Use emoji circles pattern and Auto/Manual toggle.
```

## Educational Context

### Learning Objectives
- Understand ratio as comparison of quantities
- Recognize equivalent ratios
- See pattern in ratio scaling
- Apply to real-world contexts

### Common Applications
- Recipes (flour:eggs, sugar:butter)
- Rates (dollars:hours, miles:gallons)
- Comparisons (apples:oranges, boys:girls)
- Scaling (1:2 = 2:4 = 3:6)
