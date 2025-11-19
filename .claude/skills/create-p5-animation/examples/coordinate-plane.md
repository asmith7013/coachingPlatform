# Coordinate Plane Animation Type

Interactive coordinate plane visualizations for plotting points, drawing lines, and exploring linear relationships.

## Purpose

Use for:
- Plotting coordinate points
- Drawing linear relationships
- Visualizing slope and intercept
- Interactive graphing exercises

## Visual Models

### Simple Coordinate Plane
- Static grid with pre-plotted points
- Axis labels and titles
- Configurable x/y ranges

### Interactive Linear Graph
- Click to draw lines
- Snap-to-grid functionality
- Real-time coordinate display
- Multiple lines support

## Configuration Pattern

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

## Key Functions

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

// Snap to grid intersections
function snapToGrid(coord) {
  return {
    x: Math.round(coord.x / gridScale) * gridScale,
    y: Math.round(coord.y / yGridScale) * yGridScale
  };
}
```

## Canvas Layout

```
┌─────────────────────────────────────────┐
│  Padding Top (40px)                     │
├──┬──────────────────────────────────┬───┤
│P │                                  │ P │
│a │                                  │ a │
│d │        Plot Area                 │ d │
│L │                                  │ R │
│e │                                  │ i │
│f │                                  │ g │
│t │                                  │ h │
│  │                                  │ t │
│60│                                  │40 │
├──┴──────────────────────────────────┴───┤
│  Padding Bottom (60px) - Axis Labels    │
└─────────────────────────────────────────┘
```

## Color Usage

- **Light Gray (220)**: Grid lines
- **Dark Gray (100)**: Axes
- **Blue (37, 99, 235)**: User-drawn lines
- **Green (16, 185, 129)**: Initial equations
- **Red (239, 68, 68)**: Accent lines

## Example Configurations

### Temperature vs Time
```javascript
let xMin = 0, xMax = 24, yMin = 0, yMax = 100;
let gridScale = 2, yGridScale = 10;
let xAxisLabel = 'Hours', yAxisLabel = 'Temperature (°F)';
let initialEquations = [
  { slope: 2.5, intercept: 32, color: [239, 68, 68] }
];
```

### Distance vs Time
```javascript
let xMin = 0, xMax = 10, yMin = 0, yMax = 500;
let gridScale = 1, yGridScale = 50;
let xAxisLabel = 'Time (seconds)', yAxisLabel = 'Distance (meters)';
let initialEquations = [
  { slope: 30, intercept: 0, color: [34, 197, 94] },
  { slope: 45, intercept: 0, color: [59, 130, 246] }
];
```

## Example Files

### Working Examples
@src/app/animations/examples/coordinatePlane/simple-coordinate-plane.ts
@src/app/animations/examples/coordinatePlane/linear-graph-drawing.ts
@src/app/animations/examples/coordinatePlane/README.md
@src/app/animations/examples/coordinatePlane/LLM-USAGE.md

### Documentation
@src/app/animations/COORDINATE-PLANE-DRAWING.md

### Example Prompt

```
Create a coordinate plane for plotting savings over months.

Configuration:
- X-axis: 0 to 12 (Months), grid scale 1
- Y-axis: 0 to 600 (Dollars), grid scale 50
- Initial equation: y = 50x (saving $50/month)
- Interactive: allow drawing additional lines

Use the standard coordinate plane configuration pattern.
```

## Educational Applications

### Learning Objectives
- Understand coordinate systems
- Plot points accurately
- Draw linear relationships
- Calculate slopes from graphs
- Interpret visual data representations

### Interactive Features
- Click to start/finish lines
- Snap-to-grid for accuracy
- 'R' to reset, 'ESC' to cancel
- Hover shows coordinates
