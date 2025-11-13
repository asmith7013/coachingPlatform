import { ExampleSketch } from "../../types";

export const CARROT_BALANCE: ExampleSketch = {
  id: "carrot-balance",
  name: "Carrot Balance",
  description: "Exploring balance with carrots and balloons",
  code: `// Carrot Balance
// Shows different scenarios: balanced, falling, floating

let phase = 0;
let maxPhase = 1;  // 2 phases: held by rope, then rope fades while motion starts
let fallY = 0;
let floatY = 0;
let ropeOpacity = 255;

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
  text('Carrot Balance', 250, 20);

  // Phase 0: All three at same level with rope
  if (phase === 0) {
    // Draw single rope across full screen
    drawHoldingRopes(250, 320);

    drawCarrotSet(100, 320, 3, 0);
    drawCarrotSet(250, 320, 4, 0);
    drawCarrotSet(400, 320, 6, 0);
  }

  // Phase 1: Rope disappears and motion begins simultaneously
  if (phase === 1) {
    // Fade out rope
    ropeOpacity = max(ropeOpacity - 15, 0);

    if (ropeOpacity > 0) {
      drawHoldingRopes(250, 320);
    }

    // Start motion immediately as rope fades
    fallY = min(fallY + 0.5, 130);
    floatY = min(floatY + 0.5, 150);

    // Left: 3 balloons - falls
    drawCarrotSet(100, 320 + fallY, 3, fallY);

    // Center: 4 balloons - balanced
    drawCarrotSet(250, 320, 4, 0);

    // Right: 6 balloons - floats
    drawCarrotSet(400, 320 - floatY, 6, -floatY);
  }

  // Auto-advance logic (only in auto mode)
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
      // Reset animation states
      if (phase === 1) {
        ropeOpacity = 255;
        fallY = 0;
        floatY = 0;
      }
    }
    // Loop back to start after final phase
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
      fallY = 0;
      floatY = 0;
      ropeOpacity = 255;
    }
  }
}

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
      // Reset animation states
      if (phase === 1) {
        ropeOpacity = 255;
        fallY = 0;
        floatY = 0;
      }
    } else {
      phase = 0;  // Loop back to start
      fallY = 0;
      floatY = 0;
      ropeOpacity = 255;
    }
  }
}

function drawHoldingRopes(x, y) {
  // Draw horizontal rope across full screen at carrot level
  stroke(100, 80, 60, ropeOpacity);
  strokeWeight(3);

  // Single rope across full width
  line(0, y - 20, 500, y - 20);
}

function drawCarrotSet(x, baseY, balloonCount, displacement) {
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

  // Draw object circle
  fill(220, 230, 250);
  stroke(100, 120, 150);
  strokeWeight(3);
  circle(x, baseY - 20, 50);

  // Draw carrot emoji in circle
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text('🥕', x, baseY - 20);
}`,
};
