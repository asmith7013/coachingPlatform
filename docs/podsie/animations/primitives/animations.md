# Animation Techniques

## Core Animation Patterns

### 1. Variable-Based Animation
Change variables in `draw()` loop:

```javascript
let x = 0;
let speed = 2;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  circle(x, 200, 50);
  x += speed;  // Update position each frame
  
  // Wrap around
  if (x > 450) {
    x = -50;
  }
}
```

### 2. Phased Animation
Show different states over time:

```javascript
let phase = 0;
let timer = 0;
let phaseDelay = 120;  // 2 seconds at 60fps

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  
  // Show different content based on phase
  if (phase === 0) {
    drawPhase1();
  } else if (phase === 1) {
    drawPhase2();
  } else if (phase === 2) {
    drawPhase3();
  }
  
  // Auto-advance timer
  timer++;
  if (timer > phaseDelay && phase < 2) {
    phase++;
    timer = 0;
  }
}
```

### 3. Fade In/Out
Use transparency:

```javascript
let opacity = 0;
let fadeSpeed = 3;

function draw() {
  background(255);
  
  // Fade in
  if (opacity < 255) {
    opacity += fadeSpeed;
  }
  
  fill(255, 153, 51, opacity);
  circle(200, 200, 100);
}
```

### 4. Sequential Fill
Fill array elements one by one:

```javascript
let fillCount = 0;
let fillDelay = 0;

function draw() {
  background(255);
  
  let rows = 3;
  let cols = 8;
  
  for (let i = 0; i < rows * cols; i++) {
    let row = floor(i / cols);
    let col = i % cols;
    
    // Filled if index < fillCount
    if (i < fillCount) {
      fill(255, 153, 51);
    } else {
      fill(255);
    }
    
    rect(50 + col * 45, 100 + row * 45, 40, 40);
  }
  
  // Increment fill count
  fillDelay++;
  if (fillDelay > 10 && fillCount < rows * cols) {
    fillCount++;
    fillDelay = 0;
  }
}
```

### 5. Movement
Move objects smoothly:

```javascript
let x = 0;
let targetX = 300;
let easeSpeed = 0.1;  // Slower = smoother

function draw() {
  background(255);
  
  // Ease towards target
  x += (targetX - x) * easeSpeed;
  
  circle(x, 200, 50);
}
```

### 6. Scaling
Grow or shrink objects:

```javascript
let size = 10;
let growing = true;

function draw() {
  background(255);
  
  circle(200, 200, size);
  
  if (growing) {
    size += 2;
    if (size > 100) growing = false;
  } else {
    size -= 2;
    if (size < 10) growing = true;
  }
}
```

### 7. Rotation
Rotate shapes:

```javascript
let angle = 0;

function draw() {
  background(255);
  
  push();  // Save state
  translate(200, 200);  // Move to center
  rotate(angle);
  rectMode(CENTER);
  rect(0, 0, 80, 80);
  pop();  // Restore state
  
  angle += 0.05;  // Increment rotation
}
```

### 8. Color Change
Animate colors:

```javascript
let colorValue = 0;
let colorDirection = 1;

function draw() {
  background(255);
  
  fill(colorValue, 153, 51);
  circle(200, 200, 100);
  
  colorValue += colorDirection * 2;
  
  if (colorValue > 255 || colorValue < 0) {
    colorDirection *= -1;
  }
}
```

## Easing Functions

### Linear (constant speed)
```javascript
x += speed;
```

### Ease Out (fast then slow)
```javascript
x += (targetX - x) * 0.1;
```

### Ease In (slow then fast)
```javascript
speed += acceleration;
x += speed;
```

### Ease In-Out (slow-fast-slow)
```javascript
// Use sine wave for smooth motion
let t = frameCount / 120;  // 0 to 1 over 2 seconds
let eased = sin(t * PI) * 0.5 + 0.5;
x = lerp(startX, endX, eased);
```

## Timing Control

### Frame-Based
```javascript
if (frameCount % 60 === 0) {
  // Happens every second (60 frames)
}
```

### Timer-Based
```javascript
let timer = 0;

function draw() {
  timer++;
  if (timer > 120) {  // 2 seconds
    // Do something
    timer = 0;
  }
}
```

### Duration-Based
```javascript
let startFrame = frameCount;
let duration = 180;  // 3 seconds

function draw() {
  let elapsed = frameCount - startFrame;
  let progress = min(elapsed / duration, 1.0);  // 0 to 1
  
  // Use progress to animate (0% to 100%)
  x = lerp(startX, endX, progress);
}
```

## Common Math Manipulative Animations

### Array Fill (Left to Right)
```javascript
let fillIndex = 0;

// In draw()
for (let i = 0; i < totalCells; i++) {
  if (i <= fillIndex) {
    fill(255, 153, 51);  // Filled
  } else {
    fill(255);  // Empty
  }
  // Draw cell
}

if (frameCount % 5 === 0 && fillIndex < totalCells) {
  fillIndex++;
}
```

### Array Fill (Top to Bottom)
```javascript
// Fill by rows
let fillRow = 0;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    if (row <= fillRow) {
      fill(255, 153, 51);
    } else {
      fill(255);
    }
    // Draw cell
  }
}
```

### Tape Diagram Build
```javascript
let sections = [
  { width: 0, targetWidth: 150, label: 'w' },
  { width: 0, targetWidth: 100, label: '8' }
];

function draw() {
  for (let section of sections) {
    if (section.width < section.targetWidth) {
      section.width += 5;
    }
    // Draw section
  }
}
```

### Count Up
```javascript
let displayValue = 0;
let targetValue = 24;

function draw() {
  if (displayValue < targetValue) {
    displayValue += 0.5;
  }
  
  text(floor(displayValue), 200, 200);
}
```

## Animation Best Practices

1. **Keep it simple** - One animation at a time
2. **Use consistent timing** - Similar durations for related elements
3. **Provide visual feedback** - Show state changes clearly
4. **Allow control** - Let users pause/reset if needed
5. **Test different speeds** - Adjust for comprehension

## Performance Tips

1. **Avoid creating objects in draw()** - causes lag
2. **Use variables for animation** - not new objects
3. **Limit simultaneous animations** - 2-3 max
4. **Use frameRate()** to control speed if needed

```javascript
function setup() {
  createCanvas(400, 400);
  frameRate(30);  // Slower animation, less processing
}
```