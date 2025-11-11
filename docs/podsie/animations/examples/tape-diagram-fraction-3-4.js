// Tape Diagram: Fraction 3/4
// Animated - each section fills one at a time

let currentShaded = 0;
let timer = 0;
let fillDelay = 60;  // 1 second per section
let sections = 4;
let target = 3;

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);
  
  // Title - just the fraction
  fill(75, 50, 120);
  textAlign(CENTER, CENTER);
  textSize(48);
  textStyle(BOLD);
  text('3/4', 200, 60);
  
  // Draw tape diagram
  let tapeX = 50;
  let tapeY = 180;
  let tapeWidth = 300;
  let tapeHeight = 80;
  let sectionWidth = tapeWidth / sections;
  
  for (let i = 0; i < sections; i++) {
    // Shade based on animation progress
    if (i < currentShaded) {
      fill(255, 153, 51);  // Orange for shaded parts
    } else {
      fill(255);  // White for unshaded
    }
    
    stroke(0);
    strokeWeight(3);
    rect(tapeX + i * sectionWidth, tapeY, sectionWidth, tapeHeight);
  }
  
  // Animate filling
  timer++;
  if (timer > fillDelay && currentShaded < target) {
    currentShaded++;
    timer = 0;
  }
}

function mousePressed() {
  // Reset on click
  currentShaded = 0;
  timer = 0;
}
