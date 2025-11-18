import { ExampleSketch } from "../../types";

export const SIMPLE_COORDINATE_PLANE: ExampleSketch = {
  id: "simple-coordinate-plane",
  name: "Simple Coordinate Plane",
  description: "Basic coordinate plane with configurable axes (no drawing)",
  code: `// Coordinate Plane Configuration
let xMin = 0;
let xMax = 5;
let yMin = 0;
let yMax = 4000;
let gridScale = 1; // For x-axis
let yGridScale = 500; // For y-axis

// Canvas configuration
let padding = {
  left: 60,
  right: 40,
  top: 40,
  bottom: 60
};

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
  noLoop(); // Static display
}

function draw() {
  background(255);

  // Draw grid
  drawGrid();

  // Draw axes
  drawAxes();

  // Example: Plot some points
  plotExamplePoints();
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
  text('Days', width - padding.right - 40, xAxisY + 30);

  // Y-axis title
  push();
  translate(20, height / 2);
  rotate(-PI / 2);
  textAlign(CENTER, BOTTOM);
  text('Steps', 0, 0);
  pop();

  textStyle(NORMAL);
}

function plotExamplePoints() {
  // Example data points
  let points = [
    { x: 0, y: 0 },
    { x: 1, y: 500 },
    { x: 2, y: 1000 },
    { x: 3, y: 2500 },
    { x: 4, y: 3000 },
    { x: 5, y: 3500 }
  ];

  // Draw line connecting points
  stroke(37, 99, 235); // Blue
  strokeWeight(3);
  noFill();
  beginShape();
  for (let point of points) {
    let pos = coordToPixel(point.x, point.y);
    vertex(pos.x, pos.y);
  }
  endShape();

  // Draw points
  fill(37, 99, 235);
  noStroke();
  for (let point of points) {
    let pos = coordToPixel(point.x, point.y);
    circle(pos.x, pos.y, 8);
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
}`,
};
