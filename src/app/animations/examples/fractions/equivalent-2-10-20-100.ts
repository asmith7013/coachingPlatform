import { ExampleSketch } from "../../types";

export const EQUIVALENT_2_10_20_100: ExampleSketch = {
  id: "equivalent-fractions-2-10-20-100",
  name: "Equivalent: 2/10 = 20/100",
  description: "Shows 2/10 and 20/100 are equal using grids",
  code: `// Equivalent Fractions: 2/10 = 20/100
// Shows conversion from 10×10 grid (20/100) to 10×1 grid (2/10)

let phase = 0;
let maxPhase = 3;

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(40);
  textStyle(BOLD);
  text('Equivalent Fractions', 250, 25);

  // Show equation
  fill(0);
  textSize(30);
  textStyle(NORMAL);
  text('20/100 = 2/10', 250, 75);

  let gridSize = 280;  // Larger grid for 500x500 canvas
  let gridX = 110;
  let gridY = 130;

  // Phase 0: Show 10×10 grid (20/100)
  if (phase === 0) {
    drawGrid10x10(gridX, gridY, gridSize, gridSize, 20);

    // Label
    fill(230, 57, 70);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(28);
    textStyle(BOLD);
    text('20/100', 250, 425);

    fill(0);
    textSize(18);
    textStyle(NORMAL);
    text('20 out of 100 squares shaded', 250, 460);
  }

  // Phase 1: Show 10×1 grid (2/10) - same size as 10×10
  if (phase === 1) {
    drawGrid10x1(gridX, gridY, gridSize, gridSize, 2);

    // Label
    fill(230, 57, 70);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(28);
    textStyle(BOLD);
    text('2/10', 250, 425);

    fill(0);
    textSize(18);
    textStyle(NORMAL);
    text('2 out of 10 columns shaded', 250, 460);
  }

  // Phase 2: Overlay - show 10×1 on top of 10×10
  if (phase === 2) {
    // Draw 10×10 grid first
    drawGrid10x10(gridX, gridY, gridSize, gridSize, 20);

    // Draw 10×1 grid on top with transparency
    drawGrid10x1Overlay(gridX, gridY, gridSize, gridSize, 2);

    // Labels
    fill(230, 57, 70);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(26);
    textStyle(BOLD);
    text('20/100', 180, 430);

    fill(15, 35, 65);
    text('2/10', 320, 430);

    fill(0);
    textSize(18);
    textStyle(NORMAL);
    text('Same shaded area!', 250, 465);
  }

  // Phase 3: Show both side by side
  if (phase >= 3) {
    // 10×10 grid on left
    drawGrid10x10(30, 150, 200, 200, 20);

    fill(230, 57, 70);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(22);
    textStyle(BOLD);
    text('20/100', 130, 365);

    // 10×1 grid on right - same height
    drawGrid10x1(270, 150, 200, 200, 2);

    fill(230, 57, 70);
    textAlign(CENTER, TOP);
    text('2/10', 370, 365);

    // Equal sign
    fill(6, 167, 125);
    textSize(40);
    text('=', 250, 235);

    // Explanation
    fill(0);
    textSize(16);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);
    text('Each column in 10×1 equals 10 squares in 10×10', 250, 415);
    text('2 columns = 20 squares', 250, 440);
  }

  // Auto-advance logic (only in auto mode)
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
    }
    // Loop back to start after final phase
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
    }
  }
}

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
    } else {
      phase = 0;  // Loop back to start
    }
  }
}

function drawGrid10x10(x, y, width, height, shadedCount) {
  let cellSize = width / 10;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      // Shade columns from left to right (2 full columns = 20 squares)
      let isShaded = col < (shadedCount / 10);

      if (isShaded) {
        fill(255, 153, 51);  // Orange for shaded
      } else {
        fill(255);  // White for unshaded
      }

      stroke(0);
      strokeWeight(1.5);
      rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
    }
  }
}

function drawGrid10x1(x, y, width, height, shadedCount) {
  let colWidth = width / 10;

  for (let col = 0; col < 10; col++) {
    if (col < shadedCount) {
      fill(255, 153, 51);  // Orange for shaded
    } else {
      fill(255);  // White for unshaded
    }

    stroke(0);
    strokeWeight(2);
    rect(x + col * colWidth, y, colWidth, height);
  }
}

function drawGrid10x1Overlay(x, y, width, height, shadedCount) {
  let colWidth = width / 10;

  for (let col = 0; col < 10; col++) {
    if (col < shadedCount) {
      // Dark blue with transparency for shaded
      fill(15, 35, 65, 180);
    } else {
      // Light transparency for unshaded
      fill(255, 255, 255, 120);
    }

    stroke(15, 35, 65);
    strokeWeight(3);
    rect(x + col * colWidth, y, colWidth, height);
  }
}

function mousePressed() {
  // Advance to next phase on click
  if (phase < 3) {
    phase++;
  } else {
    phase = 0;  // Loop back to start
  }
}`,
};
