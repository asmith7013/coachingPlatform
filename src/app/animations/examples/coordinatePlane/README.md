# Coordinate Plane Examples

Interactive p5.js sketches for drawing and visualizing linear relationships on a coordinate plane.

## Examples

### 1. Simple Coordinate Plane
**File:** `simple-coordinate-plane.ts`

A basic, static coordinate plane that demonstrates:
- Grid rendering with configurable x/y ranges
- Axis labels and titles
- Example data points plotted
- Coordinate-to-pixel transformation

**Configuration:**
- X-axis: 0 to 5 (Days)
- Y-axis: 0 to 4000 (Steps)
- Grid scale: 1 unit for X, 500 units for Y

**Use Cases:**
- Display pre-calculated data
- Static visualizations
- Teaching coordinate systems
- Reference implementation

### 2. Linear Graph Drawing
**File:** `linear-graph-drawing.ts`

An interactive coordinate plane where students can draw linear lines:
- **Click to draw**: Click once to start, click again to finish
- **Snap-to-grid**: Points automatically snap to grid intersections
- **Visual feedback**: Hover preview extends line to infinity
- **Multiple lines**: Draw as many lines as needed
- **Keyboard controls**: Press 'R' to reset drawn lines, 'ESC' to cancel current line
- **Initial data**: Display pre-defined equations and points

**Features:**
- Real-time coordinate display on hover
- Slope calculation logged to console
- Infinite line preview while drawing (extends to canvas edges)
- Green initial equations (configurable)
- Blue user-drawn lines
- Transparent hover indicator

**Configuration:**
- Same axis ranges as simple version
- Interactive drawing surface
- Responsive to mouse and keyboard
- Support for initial coordinate pairs
- Support for initial linear equations

**LLM-Friendly Configuration:**

The sketch has a clearly marked configuration section at the top that an LLM can easily modify:

```javascript
// ==========================================
// CONFIGURATION - Easily modifiable by LLM
// ==========================================

// Axis Configuration
let xMin = 0;           // Minimum X value
let xMax = 5;           // Maximum X value
let yMin = 0;           // Minimum Y value
let yMax = 4000;        // Maximum Y value
let gridScale = 1;      // X-axis grid spacing
let yGridScale = 500;   // Y-axis grid spacing

// Axis Labels
let xAxisLabel = 'Days';
let yAxisLabel = 'Steps';

// Initial Points (optional)
let initialPoints = [];

// Initial Linear Equations (optional)
let initialEquations = [];

// Pre-drawn Starting Point (optional)
let predrawnStartPoint = null;
```

**Example Configurations:**

Temperature vs. Time:
```javascript
let xMin = 0, xMax = 24, yMin = 0, yMax = 100;
let gridScale = 2, yGridScale = 10;
let xAxisLabel = 'Hours', yAxisLabel = 'Temperature (°F)';
let initialEquations = [
  { slope: 2.5, intercept: 32, color: [239, 68, 68] }
];
```

Distance vs. Time (multiple scenarios):
```javascript
let xMin = 0, xMax = 10, yMin = 0, yMax = 500;
let gridScale = 1, yGridScale = 50;
let xAxisLabel = 'Time (seconds)', yAxisLabel = 'Distance (meters)';
let initialEquations = [
  { slope: 30, intercept: 0, color: [34, 197, 94] },   // Slow
  { slope: 45, intercept: 0, color: [59, 130, 246] }   // Fast
];
let initialPoints = [
  { x: 0, y: 0 }, { x: 10, y: 300 }, { x: 10, y: 450 }
];
```

Starting from Origin (guided exercise):
```javascript
let xMin = 0, xMax = 10, yMin = 0, yMax = 100;
let gridScale = 1, yGridScale = 10;
let xAxisLabel = 'X', yAxisLabel = 'Y';
let predrawnStartPoint = { x: 0, y: 0 };
// Student clicks anywhere to draw a line from (0,0)
```

## Technical Details

### Coordinate Transformation

Both examples use the same transformation logic:

```javascript
// Convert coordinate (x, y) to pixel position
function coordToPixel(x, y) {
  let plotWidth = width - padding.left - padding.right;
  let plotHeight = height - padding.top - padding.bottom;

  let xRange = xMax - xMin;
  let yRange = yMax - yMin;

  let px = padding.left + ((x - xMin) / xRange) * plotWidth;
  let py = padding.top + ((yMax - y) / yRange) * plotHeight;

  return { x: px, y: py };
}

// Convert pixel position to coordinate
function pixelToCoord(px, py) {
  let plotWidth = width - padding.left - padding.right;
  let plotHeight = height - padding.top - padding.bottom;

  let xRange = xMax - xMin;
  let yRange = yMax - yMin;

  let x = xMin + ((px - padding.left) / plotWidth) * xRange;
  let y = yMax - ((py - padding.top) / plotHeight) * yRange;

  return { x: x, y: y };
}
```

### Snap-to-Grid Logic

The interactive example snaps to grid intersections:

```javascript
function snapToGrid(coord) {
  return {
    x: Math.round(coord.x / gridScale) * gridScale,
    y: Math.round(coord.y / yGridScale) * yGridScale
  };
}
```

### Canvas Layout

```
┌─────────────────────────────────────────┐
│  Padding Top (40px)                     │
├──┬──────────────────────────────────┬───┤
│  │                                  │ P │
│P │                                  │ a │
│a │        Plot Area                 │ d │
│d │                                  │ R │
│L │                                  │ i │
│e │                                  │ g │
│f │                                  │ h │
│t │                                  │ t │
│  │                                  │   │
│6 │                                  │ 4 │
│0 │                                  │ 0 │
├──┴──────────────────────────────────┴───┤
│  Padding Bottom (60px) - Axis Labels    │
└─────────────────────────────────────────┘
```

## Customization

### Changing Axis Ranges

Modify these variables at the top of the sketch:

```javascript
let xMin = 0;      // Minimum X value
let xMax = 5;      // Maximum X value
let yMin = 0;      // Minimum Y value
let yMax = 4000;   // Maximum Y value
```

### Changing Grid Scale

```javascript
let gridScale = 1;      // X-axis grid spacing
let yGridScale = 500;   // Y-axis grid spacing
```

### Changing Axis Labels

```javascript
// In drawAxes() function
text('Days', width - padding.right - 40, xAxisY + 30);  // X-axis label
text('Steps', 0, 0);  // Y-axis label (rotated)
```

### Changing Colors

```javascript
// Grid lines
stroke(220);           // Light gray

// Axes
stroke(100);           // Dark gray

// Completed lines (interactive example)
stroke(37, 99, 235);   // Blue

// Preview line (interactive example)
stroke(16, 185, 129);  // Green
```

## Usage in Applications

### Embedding in React

See the [COORDINATE-PLANE-DRAWING.md](../../COORDINATE-PLANE-DRAWING.md) documentation for a full React implementation that wraps these p5.js concepts into reusable components.

### Standalone p5.js

Copy the code directly into the p5.js editor or your HTML file:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.js"></script>
<script>
  // Paste example code here
</script>
```

## Educational Applications

### 1. Linear Relationships
- Students draw lines between data points
- Observe patterns and calculate slopes
- Compare different linear relationships

### 2. Data Visualization
- Plot real-world data (steps per day, temperature, etc.)
- Visualize trends over time
- Make predictions

### 3. Coordinate Geometry
- Practice plotting points
- Understand coordinate systems
- Explore x/y relationships

### 4. Slope Exploration
- Draw lines with different slopes
- Calculate rise over run
- Find equations of lines

## Enhancements

Possible additions to these examples:

1. **Equation Display**: Show y = mx + b for each line
2. **Slope Calculator**: Real-time slope calculation
3. **Point Labeling**: Show coordinates for each endpoint
4. **Line Deletion**: Click on a line to remove it
5. **Multiple Colors**: Different colored lines
6. **Export**: Save graph as image
7. **Data Import**: Load data from CSV or JSON
8. **Zoom/Pan**: Navigate large coordinate spaces
9. **Touch Support**: Mobile-friendly interaction
10. **Undo/Redo**: History management

## Learning Objectives

These examples help students:
- ✅ Understand coordinate systems
- ✅ Plot points accurately
- ✅ Draw linear relationships
- ✅ Calculate slopes from graphs
- ✅ Interpret visual data representations
- ✅ Make connections between graphs and equations
