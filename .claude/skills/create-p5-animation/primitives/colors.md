# Color Palette

## Standard Math Manipulative Colors

### RGB Format
All colors use `fill(r, g, b)` format in p5.js.

```javascript
// Primary colors
fill(255, 153, 51);   // orange
fill(75, 50, 120);    // purple  
fill(15, 35, 65);     // darkBlue

// Secondary colors
fill(230, 57, 70);    // red
fill(6, 167, 125);    // green
fill(69, 123, 157);   // blue
fill(244, 162, 97);   // yellow

// Neutrals
fill(255, 255, 255);  // white
fill(0, 0, 0);        // black
fill(204, 204, 204);  // gray
fill(240, 240, 240);  // lightGray
```

## Color Usage Guide

### Primary Palette
**Orange** `(255, 153, 51)`
- Main manipulative elements
- Counters, blocks, highlighted items
- Active/filled cells in arrays

**Purple** `(75, 50, 120)`
- Headers, titles
- Mathematical operations
- Secondary emphasis

**Dark Blue** `(15, 35, 65)`
- Alternative blocks
- Contrast with orange
- Division/subtraction contexts

### When to Use Each Color

#### Orange
```javascript
// Arrays, counters, groups
fill(255, 153, 51);
rect(x, y, 40, 40);
```
Use for: multiplication arrays, filled sections, primary objects

#### Purple  
```javascript
// Titles and labels
fill(75, 50, 120);
text('3 × 8 = 24', 200, 40);
```
Use for: equations, headers, emphasis text

#### Dark Blue
```javascript
// Secondary blocks or contrast
fill(15, 35, 65);
rect(x, y, 40, 40);
```
Use for: division arrays, unfilled sections, background cards

#### Red
```javascript
// Variables, unknowns, answers
fill(230, 57, 70);
text('w = 6', 100, 100);
```
Use for: algebra variables, important answers, errors

#### Green
```javascript
// Correct answers, checkmarks
fill(6, 167, 125);
text('✓', 300, 100);
```
Use for: success states, correct indicators

#### Yellow
```javascript
// Highlights, attention
fill(244, 162, 97);
rect(x, y, 60, 40);  // Highlighted section
```
Use for: selections, focus areas, removals

### Background Colors

```javascript
// Light background (default)
background(240, 240, 240);  // lightGray

// White background (clean)
background(255, 255, 255);

// Colored card backgrounds
fill(75, 50, 120);  // Purple card
rect(30, 30, 400, 440);
```

## Transparency

Add alpha value (0-255) as 4th parameter:

```javascript
fill(255, 153, 51, 128);  // 50% transparent orange
fill(0, 0, 0, 200);        // Slightly transparent black
```

Use for:
- Fade-in effects
- Overlays
- Dimmed elements

## Color Combinations

### High Contrast (Good for Visibility)
```javascript
fill(255, 153, 51);  // Orange
stroke(0, 0, 0);      // Black outline
```

### Thematic Sets

**Multiplication Set**
```javascript
// Purple theme
background(232, 228, 243);  // Light purple bg
fill(75, 50, 120);          // Purple cards
fill(255, 153, 51);         // Orange blocks
```

**Division Set**
```javascript
// Blue theme
background(232, 228, 243);  // Light bg
fill(15, 35, 65);          // Dark blue cards
fill(255, 153, 51);         // Orange highlights
```

**Algebra Set**
```javascript
// Neutral with red accent
background(255, 255, 255);  // White
fill(230, 57, 70);          // Red variables
fill(255, 220, 80);         // Yellow highlights
```

## Accessibility Notes

1. **Always use outlines** for shape clarity
```javascript
stroke(0);
strokeWeight(2);
```

2. **Sufficient contrast** between elements
- Orange on white: ✅
- Yellow on white: ⚠️ (add outline)

3. **Color-blind friendly** combinations
- Orange + blue: ✅  
- Red + green: ⚠️ (use with text labels)

## Example Color Schemes

### Array-Based Manipulative
```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240, 240, 240);  // Light gray
  
  // Title in purple
  fill(75, 50, 120);
  text('3 × 8 = 24', 200, 40);
  
  // Orange blocks with white stroke
  fill(255, 153, 51);
  stroke(255);
  strokeWeight(2);
  rect(100, 100, 40, 40);
}
```

### Tape Diagram
```javascript
// Background card in dark blue
fill(15, 35, 65);
rect(30, 30, 340, 340);

// White tape sections
fill(255);
stroke(0);
strokeWeight(2);
rect(50, 100, 150, 40);

// Yellow highlighted section
fill(255, 220, 80);
rect(200, 100, 150, 40);

// Red variable labels
fill(230, 57, 70);
text('w', 125, 120);
```