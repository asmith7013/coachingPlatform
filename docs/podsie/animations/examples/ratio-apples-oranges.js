// Ratio: 3 apples 🍎 for every 4 oranges 🍊
// Shows base ratio 3:4, then reveals equivalent ratios 6:8 and 9:12
// Animated phased sequence revealing groups
// Uses circle containers for consistent emoji spacing

let phase = 0;
let timer = 0;
let phaseDelay = 120; // 2 seconds per phase (120 frames at 60fps)

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240); // lightGray background

  // Title in purple
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text('Apples : Oranges', 200, 40);

  // Draw ratios - each group is 140px wide
  let startX = 10;
  let startY = 120;
  let groupWidth = 140;
  let groupGap = 10;

  // Row 1: 3:4 (always visible)
  if (phase >= 0) {
    drawRatioGroup(startX, startY, 3, 4);
    drawRatioLabel(startX + groupWidth / 2, startY + 95, '3:4');
  }

  // Row 2: 3:4 again
  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 3, 4);
  }

  // Show 6:8 label
  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth / 2, startY + 95, '6:8');
  }

  // Row 3: Add third group
  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 3, 4);
  }

  // Show 9:12 label
  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth / 2, startY + 95, '9:12');
  }

  // Summary at bottom
  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 200, 290);

    textSize(22);
    textStyle(BOLD);
    fill(255, 153, 51); // orange for emphasis
    text('3:4  =  6:8  =  9:12', 200, 330);
  }

  // Advance phases
  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
  }
}

function drawRatioGroup(x, y, appleCount, orangeCount) {
  let circleSize = 32;
  let spacing = 36; // Fixed spacing between circles

  // Apples (top row) - white circles with gray outline
  for (let i = 0; i < appleCount; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + circleSize / 2;

    // Circle container
    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    // Emoji centered inside
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text('🍎', cx, cy);
  }

  // Colon separator (centered in purple)
  fill(75, 50, 120);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text(':', x + 52, y + 35);

  // Oranges (bottom row) - white circles with gray outline
  for (let i = 0; i < orangeCount; i++) {
    let cx = x + i * spacing + circleSize / 2;
    let cy = y + 50 + circleSize / 2;

    // Circle container
    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    // Emoji centered inside
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text('🍊', cx, cy);
  }
}

function drawRatioLabel(x, y, label) {
  fill(100, 100, 100); // gray
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  textStyle(NORMAL);
  text(label, x, y);
}

function drawEquivalentLabel(x, y, label) {
  fill(255, 153, 51); // orange for emphasis
  noStroke();
  textAlign(CENTER, TOP);
  textSize(16);
  textStyle(BOLD);
  text(label, x, y);
}

function mousePressed() {
  // Reset animation
  phase = 0;
  timer = 0;
}
