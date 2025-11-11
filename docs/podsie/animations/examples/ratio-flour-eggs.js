// Ratio: 3 cups flour 🥛 for every 2 eggs 🥚
// Shows base ratio 3:2, then reveals equivalent ratios 6:4 and 9:6
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
  text('Flour : Eggs', 200, 40);

  // Draw ratios - each group is 110px wide
  let startX = 20;
  let startY = 120;
  let groupWidth = 110;
  let groupGap = 15;

  // Row 1: 3:2 (always visible)
  if (phase >= 0) {
    drawRatioGroup(startX, startY, 3, 2);
    drawRatioLabel(startX + groupWidth/2, startY + 95, '3:2');
  }

  // Row 2: 3:2 again
  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 3, 2);
  }

  // Show 6:4 label
  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth/2, startY + 95, '6:4');
  }

  // Row 3: Add third group
  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 3, 2);
  }

  // Show 9:6 label
  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth/2, startY + 95, '9:6');
  }

  // Summary at bottom
  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 200, 290);

    textSize(24);
    textStyle(BOLD);
    fill(255, 153, 51); // orange for emphasis
    text('3:2  =  6:4  =  9:6', 200, 330);
  }

  // Advance phases
  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
  }
}

function drawRatioGroup(x, y, flourCount, eggCount) {
  let circleSize = 32;
  let spacing = 36; // Fixed spacing between circles

  // Flour (top row) - white circles with gray outline
  for (let i = 0; i < flourCount; i++) {
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
    text('🥛', cx, cy);
  }

  // Colon separator (centered in purple)
  fill(75, 50, 120);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text(':', x + 52, y + 35);

  // Eggs (bottom row) - white circles with gray outline
  for (let i = 0; i < eggCount; i++) {
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
    text('🥚', cx, cy);
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
