import { ExampleSketch } from "../../types";

export const NUMBER_LINE: ExampleSketch = {
  id: "number-line",
  name: "Animated Number Line",
  description: "Number line with moving point",
  code: `let position = 0;
let direction = 1;

function setup() {
  createCanvas(500, 500);
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
    textSize(16);
    text(i, x, y + 35);
  }

  // Draw moving point
  let currentX = startX + (position / 10) * (endX - startX);
  fill(255, 51, 51);
  noStroke();
  circle(currentX, y, 24);

  // Label
  fill(255, 51, 51);
  textSize(18);
  text(position.toFixed(1), currentX, y - 30);

  // Animate
  position += 0.05 * direction;
  if (position > 10 || position < 0) {
    direction *= -1;
  }
}`,
};
