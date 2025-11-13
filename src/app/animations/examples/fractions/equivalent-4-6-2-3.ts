import { ExampleSketch } from "../../types";

export const EQUIVALENT_4_6_2_3: ExampleSketch = {
  id: "equivalent-fractions-4-6-2-3",
  name: "Equivalent: 4/6 = 2/3",
  description: "Shows 4/6 and 2/3 are equal using tape diagrams",
  code: `// Equivalent Fractions: 4/6 = 2/3
// Shows how grouping sections reveals the same fraction

let phase = 0;
let maxPhase = 4;  // 5 phases total

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(32);
  textStyle(BOLD);
  text('Equivalent Fractions', 250, 30);

  fill(0);
  textSize(18);
  textStyle(NORMAL);
  text('4/6 = 2/3', 250, 75);

  let tapeX = 75;
  let tapeWidth = 350;
  let tapeHeight = 70;

  // Phase 0: Show 4/6 tape
  if (phase >= 0) {
    drawFractionTape(tapeX, 130, tapeWidth, tapeHeight, 4, 6, '4/6', true);
  }

  // Phase 1: Show grouping lines on 4/6 (group by 2s)
  if (phase >= 1) {
    drawGroupingLines(tapeX, 130, tapeWidth, tapeHeight, 6, 3);
  }

  // Phase 2: Show 2/3 tape below
  if (phase >= 2) {
    drawFractionTape(tapeX, 240, tapeWidth, tapeHeight, 2, 3, '2/3', true);
  }

  // Phase 3: Align and show they're equal
  if (phase >= 3) {
    // Draw connecting lines
    stroke(6, 167, 125);
    strokeWeight(2);
    setLineDash([5, 5]);

    // Left edge
    line(tapeX, 200, tapeX, 240);
    // Right edge of shaded part
    let shadedWidth4_6 = (tapeWidth / 6) * 4;
    let shadedWidth2_3 = (tapeWidth / 3) * 2;
    line(tapeX + shadedWidth4_6, 200, tapeX + shadedWidth2_3, 240);

    setLineDash([]);
    noStroke();
  }

  // Phase 4: Show explanation
  if (phase >= 4) {
    fill(6, 167, 125);
    textSize(16);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);
    text('Group 4/6 into pairs: (2 + 2) / (3 + 3)', 250, 340);
    text('Same as 2/3!', 250, 365);

    fill(230, 57, 70);
    textSize(20);
    textStyle(BOLD);
    text('4/6 = 2/3', 250, 400);
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

function drawFractionTape(x, y, width, height, numerator, denominator, label, showLabel) {
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
  if (showLabel) {
    fill(230, 57, 70);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(24);
    textStyle(BOLD);
    text(label, x - 15, y + height/2);
  }
}

function drawGroupingLines(x, y, width, height, totalSections, groups) {
  // Draw vertical lines to show grouping
  stroke(6, 167, 125);
  strokeWeight(4);

  let sectionsPerGroup = totalSections / groups;
  let sectionWidth = width / totalSections;

  for (let i = 1; i < groups; i++) {
    let lineX = x + (i * sectionsPerGroup * sectionWidth);
    line(lineX, y, lineX, y + height);
  }

  noStroke();
}

function setLineDash(pattern) {
  drawingContext.setLineDash(pattern);
}`,
};
