import { ExampleSketch } from "../../types";

export const RATIO_APPLES_ORANGES: ExampleSketch = {
  id: "ratio-apples-oranges",
  name: "Ratio: Apples & Oranges (3:4)",
  description: "Equivalent ratios 3:4 = 6:8 = 9:12",
  code: `// Ratio: 3 apples for every 4 oranges
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
  text('Apples : Oranges', 250, 60);

  let startX = 20;
  let startY = 150;
  let groupWidth = 140;
  let groupGap = 10;

  if (phase >= 0) {
    drawRatioGroup(startX, startY, 3, 4, '🍎', '🍊');
    drawRatioLabel(startX + groupWidth / 2, startY + 95, '3:4');
  }

  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 3, 4, '🍎', '🍊');
  }

  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth / 2, startY + 95, '6:8');
  }

  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 3, 4, '🍎', '🍊');
  }

  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth / 2, startY + 95, '9:12');
  }

  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 250, 320);

    textSize(22);
    textStyle(BOLD);
    fill(255, 153, 51);
    text('3:4  =  6:8  =  9:12', 250, 360);
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

function drawRatioGroup(x, y, count1, count2, emoji1, emoji2) {
  let circleSize = 32;
  let spacing = 36;

  for (let i = 0; i < count1; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + circleSize / 2;

    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(emoji1, cx, cy);
  }

  fill(75, 50, 120);
  noStroke();
  textSize(28);
  textStyle(BOLD);
  text(':', x + 52, y + 35);

  for (let i = 0; i < count2; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + 50 + circleSize / 2;

    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(emoji2, cx, cy);
  }
}

function drawRatioLabel(x, y, label) {
  fill(100, 100, 100);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  textStyle(NORMAL);
  text(label, x, y);
}

function drawEquivalentLabel(x, y, label) {
  fill(255, 153, 51);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(16);
  textStyle(BOLD);
  text(label, x, y);
}

function mousePressed() {
  phase = 0;
  timer = 0;
}`,
};
