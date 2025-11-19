# Geometry Animation Type

Animations for visualizing geometric concepts including similar triangles, scale factors, and transformations.

## Purpose

Use for:
- Similar triangles and scale factors
- Proportional side lengths
- Geometric ratios
- Triangle comparisons

## Visual Models

### Similar Triangles
- Multiple triangles with proportional sides
- Labels showing measurements
- Scale factor relationships

### Side Ratio Tables
- Corresponding sides
- Ratio calculations
- Pattern recognition

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
  text('Similar Triangles', 300, 50);

  // Draw triangles based on phase
  if (phase >= 0) {
    drawTriangle(100, 150, 'small', [3, 4, 5]);
  }

  if (phase >= 1) {
    drawTriangle(350, 150, 'large', [6, 8, 10]);
  }

  if (phase >= 2) {
    drawRatioTable(150, 400, [
      ['Small', 'Large', 'Ratio'],
      ['3', '6', '1:2'],
      ['4', '8', '1:2'],
      ['5', '10', '1:2']
    ]);
  }

  if (phase >= 3) {
    drawScaleFactor(300, 350, '×2');
  }

  // Auto/Manual toggle logic...
}
```

## Key Functions

```javascript
function drawTriangle(x, y, size, sides) {
  // Calculate triangle based on sides
  // For right triangle with sides [a, b, c]:
  let scale = size === 'small' ? 20 : 30;

  let x1 = x;
  let y1 = y + sides[1] * scale;
  let x2 = x + sides[0] * scale;
  let y2 = y + sides[1] * scale;
  let x3 = x;
  let y3 = y;

  // Draw triangle
  fill(255, 153, 51, 100);
  stroke(255, 153, 51);
  strokeWeight(3);
  triangle(x1, y1, x2, y2, x3, y3);

  // Label sides
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);

  // Bottom side
  text(sides[0], (x1 + x2) / 2, y1 + 20);
  // Left side
  text(sides[1], x1 - 20, (y1 + y3) / 2);
  // Hypotenuse
  text(sides[2], (x2 + x3) / 2 + 15, (y2 + y3) / 2);
}

function drawRatioTable(x, y, data) {
  let cellW = 80;
  let cellH = 30;

  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      // Cell background
      fill(row === 0 ? color(75, 50, 120) : 255);
      stroke(0);
      strokeWeight(1);
      rect(x + col * cellW, y + row * cellH, cellW, cellH);

      // Cell text
      fill(row === 0 ? 255 : 0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      text(data[row][col], x + col * cellW + cellW / 2, y + row * cellH + cellH / 2);
    }
  }
}

function drawScaleFactor(x, y, factor) {
  // Arrow with scale factor
  stroke(6, 167, 125);
  strokeWeight(3);
  line(x - 50, y, x + 50, y);

  // Arrow head
  line(x + 40, y - 10, x + 50, y);
  line(x + 40, y + 10, x + 50, y);

  // Label
  fill(6, 167, 125);
  noStroke();
  textAlign(CENTER, BOTTOM);
  textSize(20);
  textStyle(BOLD);
  text(factor, x, y - 10);
}
```

## Color Usage

- **Orange (255, 153, 51)**: Triangle fill and stroke
- **Purple (75, 50, 120)**: Headers, table headers
- **Green (6, 167, 125)**: Scale factor arrows
- **White (255)**: Table cells
- **Black (0)**: Labels, measurements

## Example Files

### Working Examples
@src/app/animations/examples/triangleRatios/scale-factor.ts
@src/app/animations/examples/triangleRatios/long-medium.ts
@src/app/animations/examples/triangleRatios/medium-short.ts

### Example Prompt

```
Create a similar triangles animation with scale factor 3.

Requirements:
- Phase 0: Small triangle with sides 2, 3, 4
- Phase 1: Large triangle with sides 6, 9, 12
- Phase 2: Ratio table showing corresponding sides
- Phase 3: Arrow showing "×3" scale factor
- Phase 4: Statement "All ratios equal 1:3"

Use orange triangles with labeled sides, ratio table below.
```

## Educational Context

### Learning Objectives
- Identify similar figures
- Calculate scale factors
- Find missing side lengths
- Understand proportional relationships

### Common Applications
- Map scales
- Architectural drawings
- Shadow problems
- Indirect measurement

### Key Concepts
- Corresponding angles equal
- Corresponding sides proportional
- Scale factor consistency
- AA, SAS, SSS similarity

---

## Dilation Animations

Interactive visualizations for dilation transformations with adjustable scale factors.

### Purpose

Use for:
- Dilation centered at a point
- Scale factor exploration (including fractions)
- Comparing original and image figures
- Understanding similarity through transformations

### Visual Elements

- Coordinate grid with axes
- Original polygon (blue)
- Dilated polygon (red)
- Dilation rays from center
- Interactive slider for scale factor
- Legend showing components

### Configuration Pattern

```javascript
// ==========================================
// CONFIGURATION - Easily modifiable
// ==========================================

// Polygon vertices (any shape)
let points = [
  { x: 10, y: 10, label: 'P' },
  { x: 8, y: 8, label: 'Q' },
  { x: 12, y: 6, label: 'R' },
  { x: 14, y: 8, label: 'S' }
];

// Center of dilation
let center = { x: 12, y: 6, label: 'R' };

// Scale factors available
let scaleFactors = [
  { value: 1/3, label: '1/3' },
  { value: 1/2, label: '1/2' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' }
];

// Axis ranges
let xMin = 0, xMax = 20;
let yMin = 0, yMax = 15;

// Colors
let originalColor = [59, 130, 246]; // Blue
let dilatedColor = [239, 68, 68];   // Red
```

### Key Functions

```javascript
// Convert coordinate to pixel position
function coordToPixel(x, y, plotWidth, plotHeight) {
  let px = padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  let py = padding.top + ((yMax - y) / (yMax - yMin)) * plotHeight;
  return { x: px, y: py };
}

// Calculate dilated points
let dilatedPoints = points.map(p => ({
  x: center.x + (p.x - center.x) * scaleFactor,
  y: center.y + (p.y - center.y) * scaleFactor,
  label: p.label + "'"
}));

// Draw polygon with vertices
function drawPolygon(pts, col, plotWidth, plotHeight) {
  fill(col[0], col[1], col[2], 50);
  stroke(col[0], col[1], col[2]);
  strokeWeight(2);

  beginShape();
  for (let p of pts) {
    let pixel = coordToPixel(p.x, p.y, plotWidth, plotHeight);
    vertex(pixel.x, pixel.y);
  }
  endShape(CLOSE);
}
```

### Interactive Slider

```javascript
function drawSlider() {
  let sliderY = height - 30;
  let sliderX = 100;
  let sliderWidth = 400;

  // Track
  stroke(200);
  strokeWeight(4);
  line(sliderX, sliderY, sliderX + sliderWidth, sliderY);

  // Scale factor positions and handle
  // ... (see full example)
}

function mousePressed() {
  // Check if clicking on slider
  if (mouseY > sliderY - 20 && mouseY < sliderY + 20) {
    if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth) {
      let normalized = (mouseX - sliderX) / sliderWidth;
      scaleIndex = round(normalized * (scaleFactors.length - 1));
    }
  }
}
```

### Example Files

@src/app/animations/examples/geometry/dilation.ts

### Example Prompt

```
Create a dilation animation for a triangle ABC with center at point C.

Configuration:
- Triangle vertices: A(2, 8), B(2, 4), C(6, 4)
- Center of dilation: C(6, 4)
- Scale factors: 1/2, 1, 2, 3
- Show coordinate grid from 0 to 12 on both axes

Include:
- Interactive slider to adjust scale factor
- Dilation rays from center to dilated vertices
- Labels for original (ABC) and dilated (A'B'C') points
- Legend showing original, dilated, and center
```

### Educational Applications

- Explore how dilation changes figure size
- Understand center of dilation affects position
- Compare scale factors < 1 (reduction) vs > 1 (enlargement)
- Verify that dilation preserves shape (angle measures)
