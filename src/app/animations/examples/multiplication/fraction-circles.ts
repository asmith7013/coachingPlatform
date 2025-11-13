import { ExampleSketch } from "../../types";

export const FRACTION_CIRCLES: ExampleSketch = {
  id: "fraction-circles",
  name: "Fraction Circles",
  description: "Visual representation of fractions",
  code: `function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(220);

  let centerX = width / 2;
  let centerY = height / 2;
  let radius = 140;
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
  textSize(24);
  textAlign(CENTER);
  text("1/" + slices + " slices", width/2, height - 60);
}`,
};
