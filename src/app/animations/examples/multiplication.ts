import { ExampleSketch } from "../types";

export const MATH_EXAMPLES: ExampleSketch[] = [
  {
    id: "multiplication-grid",
    name: "Multiplication Grid",
    description: "Visual array for multiplication",
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  let rows = 5;
  let cols = 7;
  let cellSize = 40;
  let startX = 50;
  let startY = 100;

  // Draw grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(100, 150, 255);
      stroke(255);
      rect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
    }
  }

  // Label
  fill(0);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  text(rows + " × " + cols + " = " + (rows * cols), width/2, 50);
}`,
  },
  {
    id: "fraction-circles",
    name: "Fraction Circles",
    description: "Visual representation of fractions",
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  let centerX = width / 2;
  let centerY = height / 2;
  let radius = 120;
  let slices = 8;

  // Draw pie slices
  for (let i = 0; i < slices; i++) {
    let angle = TWO_PI / slices;
    let startAngle = i * angle;
    let endAngle = (i + 1) * angle;

    // Alternate colors
    if (i % 2 === 0) {
      fill(100, 150, 255);
    } else {
      fill(255, 153, 51);
    }

    arc(centerX, centerY, radius * 2, radius * 2, startAngle, endAngle, PIE);
  }

  // Label
  fill(0);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  text("1/" + slices + " slices", width/2, height - 40);
}`,
  },
  {
    id: "number-line",
    name: "Animated Number Line",
    description: "Number line with moving point",
    code: `let position = 0;
let direction = 1;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  let startX = 50;
  let endX = width - 50;
  let y = height / 2;

  // Draw number line
  stroke(0);
  strokeWeight(2);
  line(startX, y, endX, y);

  // Draw tick marks and numbers
  for (let i = 0; i <= 10; i++) {
    let x = startX + (i / 10) * (endX - startX);
    line(x, y - 10, x, y + 10);

    fill(0);
    noStroke();
    textAlign(CENTER);
    textSize(14);
    text(i, x, y + 30);
  }

  // Draw moving point
  let currentX = startX + (position / 10) * (endX - startX);
  fill(255, 51, 51);
  noStroke();
  circle(currentX, y, 20);

  // Label
  fill(255, 51, 51);
  textSize(16);
  text(position.toFixed(1), currentX, y - 25);

  // Animate
  position += 0.05 * direction;
  if (position > 10 || position < 0) {
    direction *= -1;
  }
}`,
  },
];
