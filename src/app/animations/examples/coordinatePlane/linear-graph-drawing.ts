import { ExampleSketch } from "../../types";

export const LINEAR_GRAPH_DRAWING: ExampleSketch = {
  id: "linear-graph-drawing",
  name: "Linear Graph Drawing",
  description:
    "Interactive coordinate plane for drawing linear lines with snap-to-grid",
  code: `// ==========================================
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
// Format: [{ x: 0, y: 0 }, { x: 5, y: 4000 }]
let initialPoints = [];

// Initial Linear Equations (optional)
// Format: [{ slope: 800, intercept: 0, color: [34, 197, 94] }]
// Equation form: y = slope * x + intercept
// Color format: [R, G, B] where each value is 0-255
let initialEquations = [];

// Pre-drawn Starting Point (optional)
// Set to null for no starting point, or { x: 0, y: 0 } to start from a specific point
// When set, the first click will use this as the starting point
let predrawnStartPoint = null;

// Canvas configuration (usually don't need to modify)
let padding = {
  left: 60,
  right: 40,
  top: 40,
  bottom: 60
};

// Drawing state
let lines = [];
let startPoint = null;
let currentPoint = null;
let hoverPoint = null;

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

function draw() {
  background(255);

  // Draw grid
  drawGrid();

  // Draw axes
  drawAxes();

  // Draw initial equations (behind everything)
  drawInitialEquations();

  // Draw initial points
  drawInitialPoints();

  // Draw predrawn start point (if set and not yet used)
  drawPredrawnStartPoint();

  // Draw all completed lines
  drawLines();

  // Draw preview line
  if (startPoint && currentPoint) {
    drawPreviewLine();
  }

  // Draw hover indicator
  if (hoverPoint && !startPoint) {
    drawHoverIndicator();
  }

  // Draw instructions
  drawInstructions();
}

function drawGrid() {
  stroke(220);
  strokeWeight(1);

  // Vertical grid lines (x-axis)
  for (let x = xMin; x <= xMax; x += gridScale) {
    let px = coordToPixel(x, yMin);
    let py1 = coordToPixel(x, yMin).y;
    let py2 = coordToPixel(x, yMax).y;

    // Make origin line darker
    if (x === 0) {
      stroke(100);
      strokeWeight(2);
    } else {
      stroke(220);
      strokeWeight(1);
    }

    line(px.x, py1, px.x, py2);
  }

  // Horizontal grid lines (y-axis)
  for (let y = yMin; y <= yMax; y += yGridScale) {
    let px1 = coordToPixel(xMin, y).x;
    let px2 = coordToPixel(xMax, y).x;
    let py = coordToPixel(xMin, y).y;

    // Make origin line darker
    if (y === 0) {
      stroke(100);
      strokeWeight(2);
    } else {
      stroke(220);
      strokeWeight(1);
    }

    line(px1, py, px2, py);
  }
}

function drawAxes() {
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(12);

  // X-axis labels
  for (let x = xMin; x <= xMax; x += gridScale) {
    let pos = coordToPixel(x, 0);

    // Tick mark
    stroke(0);
    strokeWeight(2);
    line(pos.x, pos.y - 5, pos.x, pos.y + 5);

    // Label
    noStroke();
    fill(0);
    text(x, pos.x, pos.y + 10);
  }

  // Y-axis labels
  textAlign(RIGHT, CENTER);
  for (let y = yMin; y <= yMax; y += yGridScale) {
    if (y === 0) continue;

    let pos = coordToPixel(0, y);

    // Tick mark
    stroke(0);
    strokeWeight(2);
    line(pos.x - 5, pos.y, pos.x + 5, pos.y);

    // Label
    noStroke();
    fill(0);
    text(y, pos.x - 10, pos.y);
  }

  // Axis titles
  fill(60);
  textSize(14);
  textStyle(BOLD);

  // X-axis title
  textAlign(CENTER, TOP);
  let xAxisY = coordToPixel(0, 0).y;
  text(xAxisLabel, width - padding.right - 40, xAxisY + 30);

  // Y-axis title
  push();
  translate(20, height / 2);
  rotate(-PI / 2);
  textAlign(CENTER, BOTTOM);
  text(yAxisLabel, 0, 0);
  pop();

  textStyle(NORMAL);
}

function drawInitialPoints() {
  if (initialPoints.length === 0) return;

  // Draw points
  fill(100);
  noStroke();
  for (let point of initialPoints) {
    let pos = coordToPixel(point.x, point.y);
    circle(pos.x, pos.y, 8);
  }
}

function drawPredrawnStartPoint() {
  if (!predrawnStartPoint) return;
  if (lines.length > 0) return; // Hide after first line is drawn

  let pos = coordToPixel(predrawnStartPoint.x, predrawnStartPoint.y);

  // Draw a pulsing indicator
  let pulse = sin(frameCount * 0.05) * 0.3 + 0.7; // Oscillates between 0.4 and 1.0

  // Outer glow
  fill(37, 99, 235, 100 * pulse);
  noStroke();
  circle(pos.x, pos.y, 16 * pulse);

  // Main point
  fill(37, 99, 235);
  circle(pos.x, pos.y, 10);

  // Label
  fill(37, 99, 235);
  textSize(11);
  textAlign(LEFT, TOP);
  text('Start here', pos.x + 12, pos.y - 5);
}

function drawInitialEquations() {
  if (initialEquations.length === 0) return;

  for (let eq of initialEquations) {
    let slope = eq.slope;
    let intercept = eq.intercept;
    let color = eq.color || [34, 197, 94]; // Default green

    // Find line intersections with plot boundaries
    let points = [];

    // Check intersection with left edge (x = xMin)
    let yAtXMin = slope * xMin + intercept;
    if (yAtXMin >= yMin && yAtXMin <= yMax) {
      points.push(coordToPixel(xMin, yAtXMin));
    }

    // Check intersection with right edge (x = xMax)
    let yAtXMax = slope * xMax + intercept;
    if (yAtXMax >= yMin && yAtXMax <= yMax) {
      points.push(coordToPixel(xMax, yAtXMax));
    }

    // Check intersection with bottom edge (y = yMin)
    if (slope !== 0) {
      let xAtYMin = (yMin - intercept) / slope;
      if (xAtYMin >= xMin && xAtYMin <= xMax) {
        points.push(coordToPixel(xAtYMin, yMin));
      }
    }

    // Check intersection with top edge (y = yMax)
    if (slope !== 0) {
      let xAtYMax = (yMax - intercept) / slope;
      if (xAtYMax >= xMin && xAtYMax <= xMax) {
        points.push(coordToPixel(xAtYMax, yMax));
      }
    }

    // Draw line if we have at least 2 intersection points
    if (points.length >= 2) {
      stroke(color[0], color[1], color[2], 180); // Slightly transparent
      strokeWeight(2);
      line(points[0].x, points[0].y, points[1].x, points[1].y);
    }
  }
}

function drawLines() {
  for (let lineSegment of lines) {
    let start = coordToPixel(lineSegment.start.x, lineSegment.start.y);
    let end = coordToPixel(lineSegment.end.x, lineSegment.end.y);

    // Draw line
    stroke(37, 99, 235); // Blue
    strokeWeight(3);
    line(start.x, start.y, end.x, end.y);

    // Draw endpoints
    fill(37, 99, 235);
    noStroke();
    circle(start.x, start.y, 8);
    circle(end.x, end.y, 8);
  }
}

function drawPreviewLine() {
  // Calculate slope in coordinate space
  let dx = currentPoint.x - startPoint.x;
  let dy = currentPoint.y - startPoint.y;

  // Handle vertical lines
  if (dx === 0) {
    let startPx = coordToPixel(startPoint.x, startPoint.y);
    let topPx = coordToPixel(startPoint.x, yMax);
    let bottomPx = coordToPixel(startPoint.x, yMin);

    stroke(16, 185, 129); // Green
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    line(topPx.x, topPx.y, bottomPx.x, bottomPx.y);
    drawingContext.setLineDash([]);

    // Draw points
    fill(16, 185, 129);
    noStroke();
    circle(startPx.x, startPx.y, 8);

    let endPx = coordToPixel(currentPoint.x, currentPoint.y);
    fill(16, 185, 129, 150);
    circle(endPx.x, endPx.y, 8);
    return;
  }

  // Calculate slope and intercept
  let slope = dy / dx;
  let intercept = startPoint.y - slope * startPoint.x;

  // Find line intersections with plot boundaries
  let points = [];

  // Check intersection with left edge (x = xMin)
  let yAtXMin = slope * xMin + intercept;
  if (yAtXMin >= yMin && yAtXMin <= yMax) {
    points.push(coordToPixel(xMin, yAtXMin));
  }

  // Check intersection with right edge (x = xMax)
  let yAtXMax = slope * xMax + intercept;
  if (yAtXMax >= yMin && yAtXMax <= yMax) {
    points.push(coordToPixel(xMax, yAtXMax));
  }

  // Check intersection with bottom edge (y = yMin)
  let xAtYMin = (yMin - intercept) / slope;
  if (xAtYMin >= xMin && xAtYMin <= xMax) {
    points.push(coordToPixel(xAtYMin, yMin));
  }

  // Check intersection with top edge (y = yMax)
  let xAtYMax = (yMax - intercept) / slope;
  if (xAtYMax >= xMin && xAtYMax <= xMax) {
    points.push(coordToPixel(xAtYMax, yMax));
  }

  // Draw infinite line if we have at least 2 intersection points
  if (points.length >= 2) {
    stroke(16, 185, 129); // Green
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    line(points[0].x, points[0].y, points[1].x, points[1].y);
    drawingContext.setLineDash([]);
  }

  // Draw start point
  let startPx = coordToPixel(startPoint.x, startPoint.y);
  fill(16, 185, 129);
  noStroke();
  circle(startPx.x, startPx.y, 8);

  // Draw current point
  let endPx = coordToPixel(currentPoint.x, currentPoint.y);
  fill(16, 185, 129, 150);
  circle(endPx.x, endPx.y, 8);
}

function drawHoverIndicator() {
  let pos = coordToPixel(hoverPoint.x, hoverPoint.y);
  fill(16, 185, 129, 50);
  noStroke();
  circle(pos.x, pos.y, 12);

  // Show coordinates
  fill(0);
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text(\`(\${hoverPoint.x}, \${hoverPoint.y})\`, pos.x + 10, pos.y - 10);
}

function drawInstructions() {
  // Position in top-right corner to avoid axes
  let boxX = width - 295;
  let boxY = 10;
  let boxWidth = 285;
  let boxHeight = 80;
  if (initialEquations.length > 0) boxHeight += 15;
  if (lines.length > 0) boxHeight += 15;

  // Draw semi-transparent background for instructions
  fill(255, 255, 255, 230);
  stroke(200);
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 5);

  // Draw text
  noStroke();
  fill(100);
  textSize(11);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  let textX = boxX + 8;
  let y = boxY + 8;

  if (predrawnStartPoint && lines.length === 0) {
    text('• Click anywhere to draw from start', textX, y);
    text('• Lines snap to grid intersections', textX, y + 15);
    text('• Press ESC to cancel', textX, y + 30);
  } else {
    text('• Click to start, click again to finish', textX, y);
    text('• Lines snap to grid intersections', textX, y + 15);
    text('• Press R to reset drawn lines', textX, y + 30);
    text('• Press ESC to cancel current line', textX, y + 45);
  }

  let legendY = y + 60;
  if (initialEquations.length > 0) {
    fill(34, 197, 94);
    text('Green = Initial equations', textX, legendY);
    legendY += 15;
  }

  if (lines.length > 0) {
    fill(37, 99, 235);
    text('Blue = Drawn lines', textX, legendY);
  }
}

// Coordinate transformation functions
function coordToPixel(x, y) {
  let plotWidth = width - padding.left - padding.right;
  let plotHeight = height - padding.top - padding.bottom;

  let xRange = xMax - xMin;
  let yRange = yMax - yMin;

  let px = padding.left + ((x - xMin) / xRange) * plotWidth;
  let py = padding.top + ((yMax - y) / yRange) * plotHeight;

  return { x: px, y: py };
}

function pixelToCoord(px, py) {
  let plotWidth = width - padding.left - padding.right;
  let plotHeight = height - padding.top - padding.bottom;

  let xRange = xMax - xMin;
  let yRange = yMax - yMin;

  let x = xMin + ((px - padding.left) / plotWidth) * xRange;
  let y = yMax - ((py - padding.top) / plotHeight) * yRange;

  return { x: x, y: y };
}

function snapToGrid(coord) {
  return {
    x: Math.round(coord.x / gridScale) * gridScale,
    y: Math.round(coord.y / yGridScale) * yGridScale
  };
}

function isInBounds(px, py) {
  return px >= padding.left &&
         px <= width - padding.right &&
         py >= padding.top &&
         py <= height - padding.bottom;
}

function mouseMoved() {
  if (!isInBounds(mouseX, mouseY)) {
    hoverPoint = null;
    return;
  }

  let coord = pixelToCoord(mouseX, mouseY);
  hoverPoint = snapToGrid(coord);

  if (startPoint) {
    currentPoint = hoverPoint;
  }
}

function mousePressed() {
  if (!isInBounds(mouseX, mouseY)) return;

  let coord = pixelToCoord(mouseX, mouseY);
  let snapped = snapToGrid(coord);

  if (!startPoint) {
    // Start new line
    // If predrawn start point exists and no lines drawn yet, use it as start
    if (predrawnStartPoint && lines.length === 0) {
      startPoint = predrawnStartPoint;
      currentPoint = predrawnStartPoint;
    } else {
      startPoint = snapped;
      currentPoint = snapped;
    }
  } else {
    // Complete line
    lines.push({
      start: startPoint,
      end: snapped
    });

    // Calculate and log slope
    let slope = (snapped.y - startPoint.y) / (snapped.x - startPoint.x);
    console.log(\`Line drawn: y = \${slope}x + \${startPoint.y - slope * startPoint.x}\`);

    startPoint = null;
    currentPoint = null;
  }
}

function keyPressed() {
  // Reset lines with R key
  if (key === 'r' || key === 'R') {
    lines = [];
    startPoint = null;
    currentPoint = null;
  }

  // Cancel current line with ESC
  if (keyCode === ESCAPE) {
    startPoint = null;
    currentPoint = null;
  }
}`,
};
