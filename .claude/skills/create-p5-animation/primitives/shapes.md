# Available Shapes

## Basic Shapes

### Rectangle
```javascript
rect(x, y, width, height, cornerRadius);
```
- `x, y` - Top-left corner position
- `width, height` - Dimensions
- `cornerRadius` - Optional, for rounded corners

**Example:**
```javascript
fill(255, 153, 51);
stroke(0);
strokeWeight(2);
rect(100, 100, 80, 50, 5);
```

### Square
```javascript
square(x, y, size, cornerRadius);
```
- Same as rectangle but equal sides
- `x, y` - Top-left corner
- `size` - Width and height

### Circle
```javascript
circle(x, y, diameter);
```
- `x, y` - Center position
- `diameter` - Size of circle

**Example:**
```javascript
fill(75, 50, 120);
noStroke();
circle(200, 200, 100);
```

### Ellipse
```javascript
ellipse(x, y, width, height);
```
- `x, y` - Center position
- `width, height` - Horizontal and vertical diameter

### Triangle
```javascript
triangle(x1, y1, x2, y2, x3, y3);
```
- Three points defining the triangle

### Line
```javascript
line(x1, y1, x2, y2);
```
- Draws a line between two points
- Use `strokeWeight()` to set thickness

## Composite Shapes

### Array/Grid
Most common for math manipulatives:

```javascript
// Draw a grid of rectangles
let rows = 3;
let cols = 8;
let cellWidth = 40;
let cellHeight = 40;
let gap = 3;
let startX = 50;
let startY = 100;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    fill(255, 153, 51);
    stroke(255);
    strokeWeight(2);
    rect(
      startX + col * (cellWidth + gap),
      startY + row * (cellHeight + gap),
      cellWidth,
      cellHeight,
      3  // corner radius
    );
  }
}
```

### Tape Diagram
Sequential rectangles for algebra:

```javascript
// Draw tape diagram
function drawTape(x, y, sections, colors) {
  let currentX = x;
  for (let i = 0; i < sections.length; i++) {
    fill(colors[i]);
    stroke(0);
    strokeWeight(2);
    rect(currentX, y, sections[i].width, 40);
    currentX += sections[i].width;
  }
}
```

### Number Line
```javascript
function drawNumberLine(startX, y, length, min, max, interval) {
  // Main line
  stroke(0);
  strokeWeight(2);
  line(startX, y, startX + length, y);
  
  // Tick marks and labels
  let steps = (max - min) / interval;
  for (let i = 0; i <= steps; i++) {
    let x = startX + (i / steps) * length;
    line(x, y - 10, x, y + 10);  // Tick
    
    fill(0);
    noStroke();
    textAlign(CENTER, TOP);
    text(min + (i * interval), x, y + 15);  // Label
  }
}
```

## Text

### Basic Text
```javascript
text(content, x, y);
```

**With styling:**
```javascript
fill(0, 0, 255);
textAlign(CENTER, CENTER);
textSize(24);
textStyle(BOLD);  // or NORMAL, ITALIC
text('3 × 8 = 24', 200, 50);
```

### Text Alignment
```javascript
textAlign(horizontal, vertical);
```
- `horizontal`: LEFT, CENTER, RIGHT
- `vertical`: TOP, CENTER, BOTTOM, BASELINE

## Styling All Shapes

### Fill Color
```javascript
fill(r, g, b);         // RGB
fill(r, g, b, alpha);  // With transparency (0-255)
noFill();              // Remove fill
```

### Stroke (Outline)
```javascript
stroke(r, g, b);
strokeWeight(thickness);
noStroke();  // Remove outline
```

### Common Patterns
```javascript
// Solid shape with outline
fill(255, 153, 51);
stroke(0);
strokeWeight(2);
rect(100, 100, 50, 50);

// Solid shape, no outline
fill(75, 50, 120);
noStroke();
circle(200, 200, 80);

// Outline only, no fill
noFill();
stroke(255, 0, 0);
strokeWeight(3);
rect(150, 150, 60, 60);
```

## Shape Tips for Math Manipulatives

1. **Arrays** - Use for multiplication, division, area models
2. **Rectangles** - Tape diagrams, fractions, place value
3. **Circles** - Fraction pie charts, counters, grouping
4. **Lines** - Number lines, equations, separators
5. **Text** - Labels, equations, instructions

## Emoji Handling (CRITICAL)

⚠️ **NEVER concatenate emoji strings** - they render inconsistently across systems!

### ❌ WRONG:
```javascript
text('🥛🥛🥛', x, y);  // Spacing is unpredictable
```

### ✅ CORRECT:
```javascript
// Draw emojis inside fixed-size circles with loops
let circleSize = 32;
let spacing = 36;

for (let i = 0; i < 3; i++) {
  let cx = x + i * spacing + circleSize/2;
  let cy = y + circleSize/2;

  // Circle container
  fill(255);
  stroke(204, 204, 204);
  strokeWeight(2);
  circle(cx, cy, circleSize);

  // Emoji centered inside
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text('🥛', cx, cy);
}
```

### Emoji Best Practices:
1. **Always use circles/rectangles as containers** for emojis
2. **Draw individual emojis in loops** with fixed spacing
3. **Use fixed spacing values** based on circle diameter (not text width)
4. **Center emojis** inside containers with `textAlign(CENTER, CENTER)`
5. **Keep emoji textSize smaller** than container (e.g., 20px text in 32px circle)

### Common Use Cases:
- **Counters**: Emojis in circles for counting objects
- **Ratios**: Emojis in rows with consistent spacing
- **Groups**: Emojis in rectangular containers

## Canvas Space Planning

For 400x400 canvas:
- **Title area**: y = 0-60
- **Main content**: y = 60-340
- **Instructions**: y = 340-400
- **Margins**: Leave 20-50px on sides