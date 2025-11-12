import { ExampleSketch } from "../../types";

export const RATIO_DOLLARS_HOURS: ExampleSketch = {
  id: "ratio-dollars-hours",
  name: "Ratio: $10 per Hour",
  description: "Unit rate and equivalent ratios",
  code: `// Ratio: $10 per hour
let phase = 0;
let maxPhase = 5;  // 6 phases total

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240);

  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text('Dollars : Hours', 250, 60);

  fill(0, 0, 0);
  textSize(18);
  textStyle(NORMAL);
  text('$10 per hour', 250, 100);

  let startX = 30;
  let startY = 150;
  let groupWidth = 120;
  let groupGap = 10;

  if (phase >= 0) {
    drawRatioGroup(startX, startY, 10, 1);
    drawRatioLabel(startX + groupWidth / 2, startY + 95, '$10:1hr');
  }

  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 10, 1);
  }

  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth / 2, startY + 95, '$20:2hr');
  }

  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 10, 1);
  }

  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth / 2, startY + 95, '$30:3hr');
  }

  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 250, 310);

    textSize(20);
    textStyle(BOLD);
    fill(255, 153, 51);
    text('$10:1  =  $20:2  =  $30:3', 250, 345);

    fill(6, 167, 125);
    textSize(16);
    textStyle(NORMAL);
    text('Unit Rate: $10 per hour', 250, 380);
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

function drawRatioGroup(x, y, dollarCount, hourCount) {
  let circleSize = 28;
  let spacing = 32;

  let dollarsPerRow = 5;
  for (let i = 0; i < dollarCount; i++) {
    let row = Math.floor(i / dollarsPerRow);
    let col = i % dollarsPerRow;
    let cx = x + col * spacing + circleSize / 2;
    let cy = y + row * spacing + circleSize / 2;

    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('💵', cx, cy);
  }

  fill(75, 50, 120);
  noStroke();
  textSize(28);
  textStyle(BOLD);
  text(':', x + 80, y + 50);

  for (let i = 0; i < hourCount; i++) {
    let cx = x + 95 + i * spacing + circleSize / 2;
    let cy = y + 40 + circleSize / 2;

    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('⏰', cx, cy);
  }
}

function drawRatioLabel(x, y, label) {
  fill(100, 100, 100);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(13);
  textStyle(NORMAL);
  text(label, x, y);
}

function drawEquivalentLabel(x, y, label) {
  fill(255, 153, 51);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  textStyle(BOLD);
  text(label, x, y);
}

function mousePressed() {
  phase = 0;
  timer = 0;
}`,
};
