import { ExampleSketch } from "../../types";

export const MULTIPLICATION_GRID: ExampleSketch = {
  id: "multiplication-grid",
  name: "Multiplication Grid",
  description: "Visual array for multiplication",
  code: `function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(220);

  let rows = 5;
  let cols = 7;
  let cellSize = 50;
  let startX = 75;
  let startY = 150;

  // Draw grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(100, 150, 255);
      stroke(255);
      strokeWeight(2);
      rect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
    }
  }

  // Label
  fill(0);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text(rows + " × " + cols + " = " + (rows * cols), 250, 80);
}`,
};
