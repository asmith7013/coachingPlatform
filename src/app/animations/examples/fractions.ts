import { ExampleSketch } from "../types";

export const FRACTION_EXAMPLES: ExampleSketch[] = [
  {
    id: "tape-diagram-fraction-3-4",
    name: "Tape Diagram: 3/4",
    description: "Animated fraction visualization",
    code: `// Tape Diagram: Fraction 3/4
// Animated - each section fills one at a time

let currentShaded = 0;
let timer = 0;
let fillDelay = 60;  // 1 second per section
let sections = 4;
let target = 3;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title - just the fraction
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(48);
  textStyle(BOLD);
  text('3/4', 200, 60);

  // Draw tape diagram
  let tapeX = 50;
  let tapeY = 180;
  let tapeWidth = 300;
  let tapeHeight = 80;
  let sectionWidth = tapeWidth / sections;

  for (let i = 0; i < sections; i++) {
    // Shade based on animation progress
    if (i < currentShaded) {
      fill(255, 153, 51);  // Orange for shaded parts
    } else {
      fill(255);  // White for unshaded
    }

    stroke(0);
    strokeWeight(3);
    rect(tapeX + i * sectionWidth, tapeY, sectionWidth, tapeHeight);
  }

  // Animate filling
  timer++;
  if (timer > fillDelay && currentShaded < target) {
    currentShaded++;
    timer = 0;
  }
}

function mousePressed() {
  // Reset on click
  currentShaded = 0;
  timer = 0;
}`,
  },
  {
    id: "tape-diagram-equivalent-fractions",
    name: "Tape Diagram: Equivalent Fractions",
    description: "Shows 1/2 = 2/4 = 4/8",
    code: `// Tape Diagram: Equivalent Fractions
// Shows 1/2 = 2/4 = 4/8 using aligned tapes

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
  noLoop();
}

function draw() {
  background(255);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(28);
  textStyle(BOLD);
  text('Equivalent Fractions', 200, 20);

  fill(0);
  textSize(16);
  textStyle(NORMAL);
  text('1/2 = 2/4 = 4/8', 200, 55);

  // Draw three tapes of equal length
  let tapeX = 50;
  let tapeWidth = 300;
  let tapeHeight = 60;

  // Tape 1: 1/2
  drawFractionTape(tapeX, 100, tapeWidth, tapeHeight, 1, 2, '1/2');

  // Tape 2: 2/4
  drawFractionTape(tapeX, 180, tapeWidth, tapeHeight, 2, 4, '2/4');

  // Tape 3: 4/8
  drawFractionTape(tapeX, 260, tapeWidth, tapeHeight, 4, 8, '4/8');

  // Explanation
  fill(0);
  textSize(14);
  textAlign(CENTER, TOP);
  text('All three tapes show the same shaded amount.', 200, 345);
  text('They are equivalent (equal) fractions.', 200, 365);
}

function drawFractionTape(x, y, width, height, numerator, denominator, label) {
  let sectionWidth = width / denominator;

  // Draw sections
  for (let i = 0; i < denominator; i++) {
    if (i < numerator) {
      fill(255, 153, 51);  // Orange for shaded
    } else {
      fill(255);  // White for unshaded
    }

    stroke(0);
    strokeWeight(2);
    rect(x + i * sectionWidth, y, sectionWidth, height);
  }

  // Label on left
  fill(230, 57, 70);
  noStroke();
  textAlign(RIGHT, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(label, x - 10, y + height/2);
}`,
  },
];
