import { ExampleSketch } from "../../types";

export const TAPE_DIAGRAM_3_4: ExampleSketch = {
  id: "tape-diagram-fraction-3-4",
  name: "Tape Diagram: 3/4",
  description: "Animated fraction visualization",
  code: `// Tape Diagram: Fraction 3/4
// Animated - each section fills one at a time

let phase = 0;
let maxPhase = 3;  // 4 phases: 0, 1, 2, 3 (filling each of 3 sections + final)
let sections = 4;

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title - just the fraction
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(48);
  textStyle(BOLD);
  text('3/4', 250, 60);

  // Draw tape diagram
  let tapeX = 100;
  let tapeY = 200;
  let tapeWidth = 300;
  let tapeHeight = 80;
  let sectionWidth = tapeWidth / sections;

  for (let i = 0; i < sections; i++) {
    // Shade based on phase (phase 0 = none, phase 1 = first, phase 2 = two, phase 3 = three)
    if (i < phase) {
      fill(255, 153, 51);  // Orange for shaded parts
    } else {
      fill(255);  // White for unshaded
    }

    stroke(0);
    strokeWeight(3);
    rect(tapeX + i * sectionWidth, tapeY, sectionWidth, tapeHeight);
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
}`,
};
