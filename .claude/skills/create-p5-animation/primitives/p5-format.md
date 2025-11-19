# P5.js Format Requirements

## Required Structure

All math manipulatives MUST follow this exact structure:

```javascript
// Global variables (if needed)
let myVariable = 0;

function setup() {
  createCanvas(400, 400);  // ALWAYS 400x400
  textFont('Arial');       // Recommended
  // Other one-time initialization
}

function draw() {
  background(220);  // Clear canvas each frame
  // Drawing code that runs every frame (60fps)
}

// Optional: interaction
function keyPressed() {
  // Handle keyboard input
}

function mousePressed() {
  // Handle mouse clicks
}
```

## Critical Requirements

### 1. Canvas Size
```javascript
createCanvas(400, 400);  // ALWAYS use 400x400
```
- **Never** use other dimensions
- All visual elements must fit within 400x400
- Plan spacing accordingly

### 2. Global Mode
```javascript
// ✅ CORRECT - Global mode
rect(100, 100, 50, 50);
fill(255, 0, 0);

// ❌ WRONG - Instance mode (do not use)
p.rect(100, 100, 50, 50);
p.fill(255, 0, 0);
```

### 3. Variable Declaration
```javascript
// ✅ CORRECT - Variables at top, outside functions
let count = 0;
let speed = 2;

function setup() {
  createCanvas(400, 400);
}

// ❌ WRONG - Variables inside setup
function setup() {
  createCanvas(400, 400);
  let count = 0;  // Will reset every frame!
}
```

### 4. Required Functions
- `setup()` - MUST exist, runs once
- `draw()` - MUST exist, runs continuously
- `createCanvas(400, 400)` - MUST be in setup()

## Common Patterns

### Static Display
```javascript
function setup() {
  createCanvas(400, 400);
  noLoop();  // Only draw once
}

function draw() {
  background(255);
  // Draw static content
}
```

### Animation
```javascript
let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  circle(x, 200, 50);
  x += 2;  // Move each frame
}
```

### Phased Animation
```javascript
let phase = 0;
let timer = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  
  if (phase === 0) {
    // Draw phase 1
  } else if (phase === 1) {
    // Draw phase 2
  }
  
  // Auto-advance
  timer++;
  if (timer > 120 && phase < 2) {  // 2 seconds at 60fps
    phase++;
    timer = 0;
  }
}
```

### Interactive
```javascript
let count = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  text('Count: ' + count, 200, 200);
}

function mousePressed() {
  count++;
}

function keyPressed() {
  if (key === 'r') {
    count = 0;  // Reset
  }
}
```

## Coordinate System

```
(0,0) -------- (400,0)
  |              |
  |    CENTER    |
  |   (200,200)  |
  |              |
(0,400) ------ (400,400)
```

- Origin (0,0) is **top-left**
- X increases right
- Y increases down
- Center is (200, 200)

## Performance Tips

1. **Avoid creating objects in draw()** - pre-create in setup()
2. **Use noLoop()** for static content
3. **Minimize fill/stroke calls** - set once per shape type
4. **Use frameRate()** if 60fps is too fast