import { ExampleSketch } from "../../types";

export const RATIO_EXAMPLES: ExampleSketch[] = [
  {
    id: "ratio-flour-eggs",
    name: "Ratio: Flour & Eggs (3:2)",
    description: "Equivalent ratios with emojis",
    code: `// Ratio: 3 cups flour for every 2 eggs
let phase = 0;
let timer = 0;
let phaseDelay = 120;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240);

  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text('Flour : Eggs', 200, 40);

  let startX = 20;
  let startY = 120;
  let groupWidth = 110;
  let groupGap = 15;

  if (phase >= 0) {
    drawRatioGroup(startX, startY, 3, 2, '🥛', '🥚');
    drawRatioLabel(startX + groupWidth/2, startY + 95, '3:2');
  }

  if (phase >= 1) {
    drawRatioGroup(startX + groupWidth + groupGap, startY, 3, 2, '🥛', '🥚');
  }

  if (phase >= 2) {
    drawEquivalentLabel(startX + groupWidth + groupGap + groupWidth/2, startY + 95, '6:4');
  }

  if (phase >= 3) {
    drawRatioGroup(startX + (groupWidth + groupGap) * 2, startY, 3, 2, '🥛', '🥚');
  }

  if (phase >= 4) {
    drawEquivalentLabel(startX + (groupWidth + groupGap) * 2 + groupWidth/2, startY + 95, '9:6');
  }

  if (phase >= 5) {
    fill(0, 0, 0);
    textSize(18);
    textStyle(NORMAL);
    text('Equivalent Ratios', 200, 290);

    textSize(24);
    textStyle(BOLD);
    fill(255, 153, 51);
    text('3:2  =  6:4  =  9:6', 200, 330);
  }

  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
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
  },
  {
    id: "ratio-apples-oranges",
    name: "Ratio: Apples & Oranges (3:4)",
    description: "Equivalent ratios 3:4 = 6:8 = 9:12",
    code: `// Ratio: 3 apples for every 4 oranges
let phase = 0;
let timer = 0;
let phaseDelay = 120;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240);

  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text('Apples : Oranges', 200, 40);

  let startX = 10;
  let startY = 120;
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
    text('Equivalent Ratios', 200, 290);

    textSize(22);
    textStyle(BOLD);
    fill(255, 153, 51);
    text('3:4  =  6:8  =  9:12', 200, 330);
  }

  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
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
  },
  {
    id: "ratio-dollars-hours",
    name: "Ratio: $10 per Hour",
    description: "Unit rate and equivalent ratios",
    code: `// Ratio: $10 per hour
let phase = 0;
let timer = 0;
let phaseDelay = 120;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(240, 240, 240);

  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text('Dollars : Hours', 200, 40);

  fill(0, 0, 0);
  textSize(18);
  textStyle(NORMAL);
  text('$10 per hour', 200, 75);

  let startX = 20;
  let startY = 120;
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
    text('Equivalent Ratios', 200, 280);

    textSize(20);
    textStyle(BOLD);
    fill(255, 153, 51);
    text('$10:1  =  $20:2  =  $30:3', 200, 315);

    fill(6, 167, 125);
    textSize(16);
    textStyle(NORMAL);
    text('Unit Rate: $10 per hour', 200, 350);
  }

  timer++;
  if (timer > phaseDelay && phase < 5) {
    phase++;
    timer = 0;
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
  },
];
