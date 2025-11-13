import { ExampleSketch } from "../../types";

export const BALLOON_WEIGHT_RATIOS: ExampleSketch = {
  id: "balloon-weight-ratios",
  name: "Balloon Weight Ratios",
  description: "How many balloons to lift different objects?",
  code: `// Balloon Weight Ratios
// Shows proportional relationships: lighter objects need fewer balloons

let phase = 0;
let maxPhase = 3;  // 4 phases: show each object one at a time, then all together

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(200, 220, 240);

  // Draw ground
  fill(100, 150, 80);
  noStroke();
  rect(0, 450, 500, 50);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(24);
  textStyle(BOLD);
  text('Balloon Weight Ratios', 250, 20);

  fill(0);
  textSize(14);
  textStyle(NORMAL);
  text('How many balloons to lift each object?', 250, 50);

  // Phase 0: Show duck with 3 balloons (lightest)
  if (phase >= 0) {
    drawBalloonSet(80, 320, 3, '🐤', 'Duck');
  }

  // Phase 1: Show teddy bear with 5 balloons (medium)
  if (phase >= 1) {
    drawBalloonSet(250, 320, 5, '🧸', 'Bear');
  }

  // Phase 2: Show carrot with 8 balloons (heaviest)
  if (phase >= 2) {
    drawBalloonSet(420, 320, 8, '🥕', 'Carrot');
  }

  // Phase 3: Show ratio comparison
  if (phase >= 3) {
    fill(230, 57, 70);
    textAlign(CENTER, CENTER);
    textSize(18);
    textStyle(BOLD);
    text('Ratio: 3 : 5 : 8', 250, 85);

    fill(0);
    textSize(12);
    textStyle(NORMAL);
    text('Lighter objects need fewer balloons', 250, 105);
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

function drawBalloonSet(x, baseY, balloonCount, emoji, label) {
  let balloonRadius = 16;
  let stringLength = 150;
  let balloonSpacing = 6;
  let balloonsPerRow = 3;

  // Draw balloons in rows of 3
  for (let i = 0; i < balloonCount; i++) {
    let row = floor(i / balloonsPerRow);
    let col = i % balloonsPerRow;

    // Center each row
    let balloonsInThisRow = min(balloonsPerRow, balloonCount - row * balloonsPerRow);
    let rowWidth = balloonsInThisRow * (balloonRadius * 2 + balloonSpacing) - balloonSpacing;
    let rowStartX = x - rowWidth / 2;

    let bx = rowStartX + col * (balloonRadius * 2 + balloonSpacing) + balloonRadius;
    let by = baseY - stringLength - row * (balloonRadius * 2 + balloonSpacing + 10) - balloonRadius;

    // Add slight vertical variation for natural look
    let yOffset = sin((i * 0.5 + frameCount * 0.02)) * 4;
    by += yOffset;

    // Draw balloon
    fill(255, 100, 100);
    stroke(200, 80, 80);
    strokeWeight(2);
    ellipse(bx, by, balloonRadius * 2, balloonRadius * 2.2);

    // Balloon knot
    fill(220, 90, 90);
    ellipse(bx, by + balloonRadius * 1.1, 4, 6);

    // String from balloon to object
    stroke(50);
    strokeWeight(1);
    line(bx, by + balloonRadius * 1.2, x, baseY);
  }

  // Draw platform/stand
  fill(100, 120, 150);
  stroke(70, 90, 120);
  strokeWeight(2);
  rect(x - 30, baseY, 60, 10, 5);
  rect(x - 4, baseY + 10, 8, 40);
  rect(x - 25, baseY + 50, 50, 8);

  // Draw object circle
  fill(220, 230, 250);
  stroke(100, 120, 150);
  strokeWeight(3);
  circle(x, baseY - 20, 50);

  // Draw emoji in circle
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text(emoji, x, baseY - 20);

  // Label below
  fill(0);
  textSize(12);
  textStyle(BOLD);
  text(label, x, baseY + 75);

  textStyle(NORMAL);
  textSize(11);
  text(balloonCount + ' balloon' + (balloonCount > 1 ? 's' : ''), x, baseY + 90);
}`,
};
