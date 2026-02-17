import { ExampleSketch } from "../../types";

export const HANGER_BALANCE_GRADE8: ExampleSketch = {
  id: "hanger-balance-grade8",
  name: "Hanger Balance - Grade 8",
  description:
    "Interactive hanger balance showing systems of equations concept. Left: 2 circles + 4 squares. Right: 2 squares + 4 triangles + 2 circles.",
  code: `// ==========================================
// CONFIGURATION
// ==========================================

// Hanger configuration
let hangerY = 80;
let hangerWidth = 320;
let hangerHeight = 400;

// Shape configuration
let shapeSize = 30;
let spacing = 8;

// Left side: 2 circles + 4 squares
let leftShapes = [
  { type: 'circle', color: [230, 57, 70] },   // red circle
  { type: 'circle', color: [230, 57, 70] },   // red circle
  { type: 'square', color: [37, 99, 235] },   // blue square
  { type: 'square', color: [37, 99, 235] },   // blue square
  { type: 'square', color: [37, 99, 235] },   // blue square
  { type: 'square', color: [37, 99, 235] },   // blue square
];

// Right side: 2 squares + 2 triangles + 2 circles + 2 triangles
let rightShapes = [
  { type: 'square', color: [37, 99, 235] },   // blue square
  { type: 'square', color: [37, 99, 235] },   // blue square
  { type: 'triangle', color: [34, 197, 94] }, // green triangle
  { type: 'triangle', color: [34, 197, 94] }, // green triangle
  { type: 'circle', color: [230, 57, 70] },   // red circle
  { type: 'circle', color: [230, 57, 70] },   // red circle
  { type: 'triangle', color: [34, 197, 94] }, // green triangle
  { type: 'triangle', color: [34, 197, 94] }, // green triangle
];

// Animation phases
let phase = 0;
let maxPhase = 3;

// ==========================================
// SETUP
// ==========================================

function setup() {
  createCanvas(600, 600);
  textFont('Arial');
}

// ==========================================
// DRAW
// ==========================================

function draw() {
  background(240, 240, 240);

  // Title
  fill(75, 50, 120);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(24);
  textStyle(BOLD);
  text('Hanger Balance', 300, 20);

  // Instruction text based on phase
  textSize(14);
  textStyle(NORMAL);
  fill(60);
  if (phase === 0) {
    text('The hanger is in balance. Both sides weigh the same.', 300, 55);
  } else if (phase === 1) {
    text('Remove 2 circles from both sides to keep it balanced.', 300, 55);
  } else if (phase === 2) {
    text('Remove 2 squares from both sides.', 300, 55);
  } else if (phase === 3) {
    text('Now we can see: 2 squares = 4 triangles', 300, 55);
  }

  // Draw hanger structure
  drawHanger();

  // Draw shapes on left and right sides
  if (phase === 0) {
    drawShapes(leftShapes, 'left', []);
    drawShapes(rightShapes, 'right', []);
  } else if (phase === 1) {
    // Highlight circles to be removed
    drawShapes(leftShapes, 'left', [0, 1]);
    drawShapes(rightShapes, 'right', [4, 5]);
  } else if (phase === 2) {
    // Circles removed, show squares highlighted
    let leftFiltered = leftShapes.filter((s, i) => i !== 0 && i !== 1);
    let rightFiltered = rightShapes.filter((s, i) => i !== 4 && i !== 5);
    drawShapes(leftFiltered, 'left', [0, 1]); // Highlight first 2 squares
    drawShapes(rightFiltered, 'right', [0, 1]); // Highlight first 2 squares
  } else if (phase >= 3) {
    // Both circles and squares removed
    let leftFinal = leftShapes.filter((s, i) => i !== 0 && i !== 1 && i !== 2 && i !== 3);
    let rightFinal = rightShapes.filter((s, i) => i !== 0 && i !== 1 && i !== 4 && i !== 5);
    drawShapes(leftFinal, 'left', []);
    drawShapes(rightFinal, 'right', []);

    // Show equation
    fill(75, 50, 120);
    textSize(20);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('2 squares = 4 triangles', 300, 520);
  }

  // Auto/Manual mode toggle logic
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
    }
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
    }
  }
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawHanger() {
  push();

  // Hanger hook at top
  stroke(80);
  strokeWeight(3);
  noFill();

  // Hook
  let hookX = 300;
  let hookY = hangerY - 20;
  line(hookX, hookY, hookX, hangerY);

  // Main horizontal bar
  strokeWeight(4);
  line(300 - hangerWidth/2, hangerY, 300 + hangerWidth/2, hangerY);

  // Left string
  let leftX = 300 - hangerWidth/2 + 40;
  line(leftX, hangerY, leftX, hangerY + 80);

  // Right string
  let rightX = 300 + hangerWidth/2 - 40;
  line(rightX, hangerY, rightX, hangerY + 80);

  pop();
}

function drawShapes(shapes, side, highlightIndices) {
  push();

  let baseX = side === 'left' ? 300 - hangerWidth/2 + 40 : 300 + hangerWidth/2 - 40;
  let baseY = hangerY + 90;

  // Calculate total height needed
  let totalHeight = shapes.length * (shapeSize + spacing);
  let startY = baseY;

  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    let y = startY + i * (shapeSize + spacing);

    // Check if this shape should be highlighted
    let isHighlighted = highlightIndices.includes(i);

    // Draw string connecting to shape
    stroke(80);
    strokeWeight(2);
    line(baseX, baseY, baseX, y + shapeSize/2);

    // Draw shape with highlight
    if (isHighlighted) {
      // Yellow glow for highlight
      fill(255, 220, 80, 150);
      noStroke();
      if (shape.type === 'circle') {
        circle(baseX, y + shapeSize/2, shapeSize + 8);
      } else if (shape.type === 'square') {
        rect(baseX - (shapeSize + 8)/2, y, shapeSize + 8, shapeSize + 8, 3);
      } else if (shape.type === 'triangle') {
        drawTriangle(baseX, y + shapeSize/2, shapeSize + 8);
      }
    }

    // Draw the actual shape
    fill(shape.color[0], shape.color[1], shape.color[2]);
    stroke(255);
    strokeWeight(2);

    if (shape.type === 'circle') {
      circle(baseX, y + shapeSize/2, shapeSize);
    } else if (shape.type === 'square') {
      rect(baseX - shapeSize/2, y, shapeSize, shapeSize, 3);
    } else if (shape.type === 'triangle') {
      drawTriangle(baseX, y + shapeSize/2, shapeSize);
    }
  }

  pop();
}

function drawTriangle(cx, cy, size) {
  // Draw equilateral triangle centered at (cx, cy)
  let h = size * 0.866; // height = size * sqrt(3)/2
  triangle(
    cx, cy - h/2,           // top vertex
    cx - size/2, cy + h/2,  // bottom left
    cx + size/2, cy + h/2   // bottom right
  );
}

// ==========================================
// INTERACTION
// ==========================================

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
    } else {
      phase = 0;
    }
  }
}
`,
};
