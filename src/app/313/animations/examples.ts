export interface ExampleSketch {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const EXAMPLE_SKETCHES: ExampleSketch[] = [
  {
    id: "basic-shapes",
    name: "Basic Shapes",
    description: "Simple geometric shapes",
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Rectangle
  fill(255, 153, 51);
  rect(30, 30, 100, 70);

  // Circle
  fill(51, 153, 255);
  circle(270, 70, 80);

  // Triangle
  fill(153, 255, 51);
  triangle(200, 170, 270, 270, 130, 270);
}`,
  },
  {
    id: "bouncing-ball",
    name: "Bouncing Ball",
    description: "Animated ball that bounces",
    code: `let x = 200;
let y = 200;
let xSpeed = 3;
let ySpeed = 2;
let diameter = 50;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Draw ball
  fill(255, 153, 51);
  noStroke();
  circle(x, y, diameter);

  // Move ball
  x += xSpeed;
  y += ySpeed;

  // Bounce off edges
  if (x > width - diameter/2 || x < diameter/2) {
    xSpeed *= -1;
  }
  if (y > height - diameter/2 || y < diameter/2) {
    ySpeed *= -1;
  }
}`,
  },
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
    id: "mouse-follow",
    name: "Mouse Follower",
    description: "Circle that follows your mouse",
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220, 220, 220, 25); // Fade effect

  // Draw circle at mouse position
  fill(255, 153, 51);
  noStroke();
  circle(mouseX, mouseY, 40);

  // Draw line from center to mouse
  stroke(51, 153, 255);
  strokeWeight(2);
  line(width/2, height/2, mouseX, mouseY);

  // Center dot
  fill(51, 153, 255);
  noStroke();
  circle(width/2, height/2, 10);
}`,
  },
  {
    id: "color-wave",
    name: "Color Wave",
    description: "Animated color gradient",
    code: `let angle = 0;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB);
}

function draw() {
  background(220);
  noStroke();

  let barWidth = 20;
  let numBars = width / barWidth;

  for (let i = 0; i < numBars; i++) {
    let hue = (i * 10 + angle) % 360;
    fill(hue, 80, 90);
    rect(i * barWidth, 0, barWidth, height);
  }

  angle += 2;
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
