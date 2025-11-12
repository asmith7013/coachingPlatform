import { ExampleSketch } from "../types";

export const BASIC_EXAMPLES: ExampleSketch[] = [
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
];
