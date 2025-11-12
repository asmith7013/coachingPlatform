// Equivalent Fractions: 2/10 = 20/100
// Animated demonstration that 2/10 and 20/100 are the same

let phase = 0;
let timer = 0;
let phaseDelay = 90;  // 1.5 seconds per phase

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);

  // Title
  fill(75, 50, 120);
  textAlign(CENTER, TOP);
  textSize(32);
  textStyle(BOLD);
  text('Equivalent Fractions', 200, 20);

  // Show equation
  fill(0);
  textSize(24);
  textStyle(NORMAL);
  text('2/10 = 20/100', 200, 60);

  let tapeX = 50;
  let tapeWidth = 300;
  let tapeHeight = 70;

  // Phase 0: Show 2/10
  if (phase >= 0) {
    drawFractionTape(tapeX, 110, tapeWidth, tapeHeight, 2, 10, '2/10');
  }

  // Phase 1: Show 20/100 below
  if (phase >= 1) {
    drawFractionTape(tapeX, 200, tapeWidth, tapeHeight, 20, 100, '20/100');
  }

  // Phase 2: Highlight that they're equal
  if (phase >= 2) {
    // Draw connecting lines
    stroke(6, 167, 125);
    strokeWeight(3);
    noFill();

    // Arrows showing alignment
    line(tapeX, 185, tapeX + 60, 195);
    line(tapeX + 240, 185, tapeX + 240, 195);

    // "Same amount" text
    fill(6, 167, 125);
    noStroke();
    textSize(18);
    textStyle(BOLD);
    text('✓ Same shaded amount!', 200, 290);
  }

  // Explanation text
  fill(0);
  textSize(14);
  textAlign(CENTER, TOP);
  textStyle(NORMAL);

  if (phase === 0) {
    text('Start with 2/10 (2 out of 10 parts shaded)', 200, 320);
  } else if (phase === 1) {
    text('Split each tenth into 10 parts → 20/100', 200, 320);
    text('(2 tenths × 10 = 20 hundredths)', 200, 340);
  } else if (phase >= 2) {
    text('Both fractions show the same amount.', 200, 320);
    text('Multiplying numerator and denominator', 200, 340);
    text('by the same number creates equivalent fractions.', 200, 360);
  }

  // Auto-advance phases
  timer++;
  if (timer > phaseDelay && phase < 2) {
    phase++;
    timer = 0;
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
  textSize(22);
  textStyle(BOLD);
  text(label, x - 10, y + height/2);
}

function mousePressed() {
  // Reset animation on click
  phase = 0;
  timer = 0;
}
