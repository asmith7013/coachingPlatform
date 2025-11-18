import { ExampleSketch } from "../../types";

export const TAPE_DIAGRAM_EQUIVALENT_RATIOS: ExampleSketch = {
  id: "tape-diagram-equivalent-ratios",
  name: "Tape Diagram: Equivalent Ratios",
  description: "Interactive tape diagram showing equivalent ratios with unit rate and slider control",
  code: `// Interactive Tape Diagram for Equivalent Ratios
// Shows unit rate and allows slider control to scale the ratio

let baseRatio1 = 3;  // Base ratio first number (e.g., 3 apples)
let baseRatio2 = 2;  // Base ratio second number (e.g., 2 dollars)
let multiplier = 1;  // Slider value (0.5, 1, 2, 3, 4, 5) - starts at 1 for 3:2
let label1 = 'Apples';
let label2 = 'Dollars';

function setup() {
  createCanvas(600, 500);
  textFont('Arial');
}

function draw() {
  background(250, 250, 250);

  // Current ratio and unit rate
  let currentRatio1 = baseRatio1 * multiplier;
  let currentRatio2 = baseRatio2 * multiplier;
  let unitRate = baseRatio2 / baseRatio1;

  // Display current ratio
  fill(0, 0, 0);
  textSize(24);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  // Format the ratio display
  let ratio1Display = currentRatio1 % 1 === 0 ? currentRatio1 : currentRatio1.toFixed(1);
  let ratio2Display = currentRatio2 % 1 === 0 ? currentRatio2 : currentRatio2.toFixed(1);
  text(ratio1Display + ' : ' + ratio2Display, 300, 60);

  // Display unit rate
  fill(6, 167, 125);
  textSize(18);
  textStyle(NORMAL);
  text('Unit Rate: $' + unitRate.toFixed(2) + ' per apple', 300, 95);

  // Tape diagram
  let tapeStartY = 160;
  let tapeHeight = 35;
  let unitWidth = 40;
  let tapePadding = 50;

  // Draw first quantity tape (apples)
  let wholeUnits1 = floor(currentRatio1);
  let fractionalPart1 = currentRatio1 - wholeUnits1;

  // Draw whole units
  for (let i = 0; i < wholeUnits1; i++) {
    let x = tapePadding + i * unitWidth;

    // Draw tape segment
    fill(255, 153, 51);
    stroke(255, 133, 31);
    strokeWeight(3);
    rect(x, tapeStartY, unitWidth - 5, tapeHeight, 5);

    // Draw emoji in segment
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('🍎', x + (unitWidth - 5) / 2, tapeStartY + tapeHeight / 2);
  }

  // Draw fractional unit if exists
  if (fractionalPart1 > 0) {
    let x = tapePadding + wholeUnits1 * unitWidth;
    let fractionalWidth = (unitWidth - 5) * fractionalPart1;

    // Draw partial tape segment
    fill(255, 153, 51);
    stroke(255, 133, 31);
    strokeWeight(3);
    rect(x, tapeStartY, fractionalWidth, tapeHeight, 5);

    // Draw partial emoji (clip the emoji)
    push();
    // Create clipping region for partial emoji
    fill(0, 0, 0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(24);
    // Position emoji and let the rect bounds clip it
    clip(() => {
      rect(x, tapeStartY, fractionalWidth, tapeHeight);
    });
    text('🍎', x, tapeStartY + tapeHeight / 2);
    pop();
  }

  // Draw second quantity tape (dollars)
  let tape2StartY = tapeStartY + tapeHeight + 20;
  let wholeUnits2 = floor(currentRatio2);
  let fractionalPart2 = currentRatio2 - wholeUnits2;

  // Draw whole units
  for (let i = 0; i < wholeUnits2; i++) {
    let x = tapePadding + i * unitWidth;

    // Draw tape segment
    fill(6, 167, 125);
    stroke(5, 137, 105);
    strokeWeight(3);
    rect(x, tape2StartY, unitWidth - 5, tapeHeight, 5);

    // Draw emoji in segment
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('💵', x + (unitWidth - 5) / 2, tape2StartY + tapeHeight / 2);
  }

  // Draw fractional unit if exists
  if (fractionalPart2 > 0) {
    let x = tapePadding + wholeUnits2 * unitWidth;
    let fractionalWidth = (unitWidth - 5) * fractionalPart2;

    // Draw partial tape segment
    fill(6, 167, 125);
    stroke(5, 137, 105);
    strokeWeight(3);
    rect(x, tape2StartY, fractionalWidth, tapeHeight, 5);

    // Draw partial emoji (clip the emoji)
    push();
    fill(255, 255, 255);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(24);
    // Position emoji and let the rect bounds clip it
    clip(() => {
      rect(x, tape2StartY, fractionalWidth, tapeHeight);
    });
    text('💵', x, tape2StartY + tapeHeight / 2);
    pop();
  }

  // Slider section
  let sliderY = 350;
  let sliderX = 150;
  let sliderWidth = 300;

  // Draw slider track
  stroke(180, 180, 180);
  strokeWeight(4);
  line(sliderX, sliderY, sliderX + sliderWidth, sliderY);

  // Draw slider handle (map multiplier 0.5-5 to slider position)
  // 0.5 = leftmost (1.5:1), 1 = starting position (3:2), 5 = rightmost (15:10)
  let normalizedPosition = (multiplier - 0.5) / 4.5;  // 0 to 1
  let handleX = sliderX + normalizedPosition * sliderWidth;
  fill(75, 50, 120);
  noStroke();
  circle(handleX, sliderY, 24);
}

// Mouse interaction for slider
function mousePressed() {
  updateSlider();
}

function mouseDragged() {
  updateSlider();
}

function updateSlider() {
  let sliderX = 150;
  let sliderWidth = 300;
  let sliderY = 350;

  // Check if mouse is near the slider
  if (mouseY > sliderY - 20 && mouseY < sliderY + 30) {
    // Map mouse position to multiplier (0.5 to 5)
    let normalizedX = constrain(mouseX - sliderX, 0, sliderWidth);
    let normalizedPosition = normalizedX / sliderWidth;  // 0 to 1

    // Map to multiplier values: 0.5, 1, 2, 3, 4, 5
    let continuousMultiplier = 0.5 + normalizedPosition * 4.5;

    // Snap to specific values
    let snapValues = [0.5, 1, 2, 3, 4, 5];
    let closestValue = snapValues[0];
    let minDistance = Math.abs(continuousMultiplier - snapValues[0]);

    for (let val of snapValues) {
      let distance = Math.abs(continuousMultiplier - val);
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = val;
      }
    }

    multiplier = closestValue;
  }
}`,
};
