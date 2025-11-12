// Ratio: $10 per hour 💵⏰
// Shows base ratio 10:1, then reveals equivalent ratios 20:2 and 30:3
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
  text('Dollars : Hours', 200, 40);

  // Subtitle
  fill(0, 0, 0);
  textSize(18);
  textStyle(NORMAL);
  text('$10 per hour', 200, 75);

  // Draw ratios - each group is 120px wide
  let startX = 20;
  let startY = 120;
  let groupWidth = 120;
  let groupGap = 10;

  // Row 1: 10:1 (always visible)
  if (phase >= 0) {
    drawRatioGroup(startX, startY, 10, 1);
    drawRatioLabel(startX + groupWidth / 2, startY + 95, '$10:1hr');
  }

  // Row 2: 10:1 again
  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 10, 1);
  }

  // Show 20:2 label
  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth / 2, startY + 95, '$20:2hr');
  }

  // Row 3: Add third group
  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 10, 1);
  }

  // Show 30:3 label
  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth / 2, startY + 95, '$30:3hr');
  }

  // Summary at bottom
  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 200, 280);

    textSize(20);
    textStyle(BOLD);
    fill(255, 153, 51); // orange for emphasis
    text('$10:1  =  $20:2  =  $30:3', 200, 315);

    // Unit rate
    fill(6, 167, 125); // green for success/answer
    textSize(16);
    textStyle(NORMAL);
    text('Unit Rate: $10 per hour', 200, 350);
  }

  // Advance phases
  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
  }
}

function drawRatioGroup(x, y, dollarCount, hourCount) {
  let circleSize = 28;
  let spacing = 32; // Fixed spacing between circles

  // Dollars (top row) - white circles with gray outline
  // Arrange in two rows for 10 items
  let dollarsPerRow = 5;
  for (let i = 0; i < dollarCount; i++) {
    let row = Math.floor(i / dollarsPerRow);
    let col = i % dollarsPerRow;
    let cx = x + col * spacing + circleSize / 2;
    let cy = y + row * spacing + circleSize / 2;

    // Circle container
    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    // Emoji centered inside
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('💵', cx, cy);
  }

  // Colon separator (centered in purple)
  fill(75, 50, 120);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text(':', x + 80, y + 50);

  // Hours (bottom right) - white circles with gray outline
  for (let i = 0; i < hourCount; i++) {
    let cx = x + 95 + i * spacing + circleSize / 2;
    let cy = y + 40 + circleSize / 2;

    // Circle container
    fill(255, 255, 255);
    stroke(204, 204, 204);
    strokeWeight(2);
    circle(cx, cy, circleSize);

    // Emoji centered inside
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('⏰', cx, cy);
  }
}

function drawRatioLabel(x, y, label) {
  fill(100, 100, 100); // gray
  noStroke();
  textAlign(CENTER, TOP);
  textSize(13);
  textStyle(NORMAL);
  text(label, x, y);
}

function drawEquivalentLabel(x, y, label) {
  fill(255, 153, 51); // orange for emphasis
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  textStyle(BOLD);
  text(label, x, y);
}

function mousePressed() {
  // Reset animation
  phase = 0;
  timer = 0;
}
