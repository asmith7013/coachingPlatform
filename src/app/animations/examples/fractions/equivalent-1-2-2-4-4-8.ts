import { ExampleSketch } from "../../types";

export const EQUIVALENT_1_2_2_4_4_8: ExampleSketch = {
  id: "tape-diagram-equivalent-fractions",
  name: "Tape Diagram: Equivalent Fractions",
  description: "Shows 1/2 = 2/4 = 4/8",
  code: `// Tape Diagram: Equivalent Fractions
// Shows 1/2 = 2/4 = 4/8 using aligned tapes

let phase = 0;
let maxPhase = 3;  // 4 phases: 0 (1/2), 1 (+ 2/4), 2 (+ 4/8), 3 (all with explanation)

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(28);
  textStyle(BOLD);
  text('Equivalent Fractions', 250, 30);

  fill(0);
  textSize(16);
  textStyle(NORMAL);
  text('1/2 = 2/4 = 4/8', 250, 70);

  // Draw three tapes of equal length
  let tapeX = 100;
  let tapeWidth = 300;
  let tapeHeight = 60;

  // Phase 0: Show 1/2
  if (phase >= 0) {
    drawFractionTape(tapeX, 120, tapeWidth, tapeHeight, 1, 2, '1/2');
  }

  // Phase 1: Show 2/4
  if (phase >= 1) {
    drawFractionTape(tapeX, 200, tapeWidth, tapeHeight, 2, 4, '2/4');
  }

  // Phase 2: Show 4/8
  if (phase >= 2) {
    drawFractionTape(tapeX, 280, tapeWidth, tapeHeight, 4, 8, '4/8');
  }

  // Phase 3: Show explanation
  if (phase >= 3) {
    fill(0);
    textSize(14);
    textAlign(CENTER, TOP);
    text('All three tapes show the same shaded amount.', 250, 370);
    text('They are equivalent (equal) fractions.', 250, 395);
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
};
