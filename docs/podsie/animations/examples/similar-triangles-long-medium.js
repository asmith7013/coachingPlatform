// Similar Triangles: Long ÷ Medium Side Ratio
// Shows 4 triangles with long/medium ratio

let currentTriangle = 0;
let timer = 0;
let displayDelay = 180;  // 3 seconds per triangle

// Triangle data: [name, scaleFactor, short, medium, long]
let triangles = [
  { name: 'ABC', scale: 1, short: 4, medium: 5, long: 7 },
  { name: 'DEF', scale: 2, short: 8, medium: 10, long: 14 },
  { name: 'GHI', scale: 3, short: 12, medium: 15, long: 21 },
  { name: 'JKL', scale: 0.5, short: 2, medium: 2.5, long: 3.5 }
];

function setup() {
  createCanvas(400, 400);
  textFont('Arial');
}

function draw() {
  background(255);
  
  // Current triangle info
  let tri = triangles[currentTriangle];
  fill(0);
  textAlign(CENTER, TOP);
  textSize(16);
  text(`Triangle ${tri.name} (scale factor: ${tri.scale})`, 200, 20);
  
  // Draw the triangle
  drawTriangle(tri);
  
  // Show ratio calculation
  showRatio(tri);
  
  // Progress indicator
  fill(150);
  textSize(12);
  text(`${currentTriangle + 1} of ${triangles.length}`, 200, 380);
  text('Click to advance', 200, 395);
  
  // Auto-advance
  timer++;
  if (timer > displayDelay) {
    currentTriangle = (currentTriangle + 1) % triangles.length;
    timer = 0;
  }
}

function drawTriangle(tri) {
  // Scale for display (multiply by 10 for visibility)
  let displayScale = 10;
  let short = tri.short * displayScale;
  let medium = tri.medium * displayScale;
  let long = tri.long * displayScale;
  
  // Position triangle (centered, base at bottom)
  let baseX = 200;
  let baseY = 280;
  
  // Calculate height using Heron's formula
  let s = (short + medium + long) / 2;
  let area = sqrt(s * (s - short) * (s - medium) * (s - long));
  let height = (2 * area) / long;
  
  // Triangle vertices
  let x1 = baseX - long / 2;
  let y1 = baseY;
  let x2 = baseX + long / 2;
  let y2 = baseY;
  let x3 = baseX - long / 2 + short;
  let y3 = baseY - height;
  
  // Draw triangle
  fill(255, 153, 51, 150);
  stroke(0);
  strokeWeight(2);
  triangle(x1, y1, x2, y2, x3, y3);
  
  // Label sides
  fill(0);
  noStroke();
  textSize(14);
  textStyle(BOLD);
  
  // Short side (left)
  textAlign(CENTER, CENTER);
  text(tri.short, (x1 + x3) / 2 - 15, (y1 + y3) / 2);
  
  // Medium side (hypotenuse/right)
  text(tri.medium, (x2 + x3) / 2 + 15, (y2 + y3) / 2);
  
  // Long side (base)
  text(tri.long, (x1 + x2) / 2, y1 + 15);
}

function showRatio(tri) {
  // Show the long/medium ratio calculation
  fill(6, 167, 125);  // Green
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  
  let ratio = tri.long / tri.medium;
  
  text(`long side ÷ medium side`, 200, 320);
  text(`${tri.long} ÷ ${tri.medium} = ${ratio.toFixed(2)}`, 200, 345);
}

function mousePressed() {
  // Advance to next triangle
  currentTriangle = (currentTriangle + 1) % triangles.length;
  timer = 0;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    currentTriangle = 0;
    timer = 0;
  }
}
