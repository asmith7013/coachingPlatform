# Auto/Manual Toggle Pattern - Standard Implementation

## Overview

All multi-phase animations in the p5.js playground should support both auto-play and manual click-through modes via a toggle button in the bottom right corner.

## Standard Pattern

### Template Code

```javascript
let phase = 0;
let maxPhase = 3;  // Set to the highest phase number (0-indexed)

function setup() {
  createCanvas(500, 500);
  textFont('Arial');
}

function draw() {
  background(255);

  // Phase 0
  if (phase === 0) {
    // Draw first phase content
  }

  // Phase 1
  if (phase === 1) {
    // Draw second phase content
  }

  // Phase 2
  if (phase === 2) {
    // Draw third phase content
  }

  // Phase 3 (final phase)
  if (phase >= 3) {
    // Draw final phase content
  }

  // Auto-advance logic (only in auto mode)
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
    }
    // Loop back to start after final phase
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
    }
  }
}

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
    } else {
      phase = 0;  // Loop back to start
    }
  }
}
```

## Key Components

### 1. Variables
```javascript
let phase = 0;           // Current phase (starts at 0)
let maxPhase = 3;        // Highest phase number (adjust per animation)
```

### 2. Auto-Advance Logic (in draw())
```javascript
// Auto-advance logic (only in auto mode)
if (window.animationMode === 'auto') {
  window.animationTimer++;
  if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
    phase++;
    window.animationTimer = 0;
  }
  // Loop back to start after final phase
  if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
    phase = 0;
    window.animationTimer = 0;
  }
}
```

**Important:** This block should be placed at the END of the `draw()` function, after all phase rendering.

### 3. Manual Click Handler
```javascript
function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    if (phase < maxPhase) {
      phase++;
    } else {
      phase = 0;  // Loop back to start
    }
  }
}
```

## Global Variables (Provided by Iframe)

These are automatically available in all animations:

- `window.animationMode` - String: `'auto'` or `'manual'`
- `window.animationTimer` - Number: Frame counter for auto-advance
- `window.animationPhaseDelay` - Number: Frames per phase (default: 120 = 2 seconds at 60fps)

## UI Elements

### Toggle Button (Automatic)
- Position: Bottom right corner (fixed)
- Displays: 🔄 Auto or 👆 Manual
- Automatically injected by iframe wrapper
- **DO NOT** add toggle button in your p5.js code

### NO On-Canvas Instructions Needed
- **DO NOT** add "Click to continue →" text
- **DO NOT** add "Click to restart ↻" text
- The toggle button provides all necessary UI

## Phase Numbering

- Phases are **0-indexed**: 0, 1, 2, 3, etc.
- `maxPhase` should equal the highest phase number
- Example: 4 phases → `maxPhase = 3` (phases 0, 1, 2, 3)

## Conversion Checklist

When updating an existing animation:

- [ ] Add `let maxPhase = N;` (where N is highest phase)
- [ ] Remove auto-advance timer variables (`timer`, `phaseDelay`)
- [ ] Remove all "Click to continue" text
- [ ] Add auto-advance logic block at end of `draw()`
- [ ] Replace `mousePressed()` with manual-mode version
- [ ] Test both auto and manual modes

## Examples

### 2-Phase Animation
```javascript
let phase = 0;
let maxPhase = 1;  // 2 phases: 0 and 1

// In draw()
if (phase === 0) { /* ... */ }
if (phase >= 1) { /* ... */ }
```

### 4-Phase Animation
```javascript
let phase = 0;
let maxPhase = 3;  // 4 phases: 0, 1, 2, 3

// In draw()
if (phase === 0) { /* ... */ }
if (phase === 1) { /* ... */ }
if (phase === 2) { /* ... */ }
if (phase >= 3) { /* ... */ }
```

### 5-Phase Animation
```javascript
let phase = 0;
let maxPhase = 4;  // 5 phases: 0, 1, 2, 3, 4

// In draw()
if (phase === 0) { /* ... */ }
if (phase === 1) { /* ... */ }
if (phase === 2) { /* ... */ }
if (phase === 3) { /* ... */ }
if (phase >= 4) { /* ... */ }
```

## Common Mistakes

### ❌ Wrong: Adding UI Text
```javascript
// DON'T DO THIS
text('Click to continue →', 480, 490);
```

### ✅ Correct: No UI Text Needed
```javascript
// Just render your content
drawGrid10x10(x, y, size, size, 20);
```

### ❌ Wrong: Manual Timer Variables
```javascript
// DON'T DO THIS
let timer = 0;
let phaseDelay = 120;
```

### ✅ Correct: Use Global Variables
```javascript
// Use window.animationTimer and window.animationPhaseDelay
if (window.animationMode === 'auto') {
  window.animationTimer++;
  // ...
}
```

### ❌ Wrong: Off-by-One maxPhase
```javascript
// If you have 4 phases (0, 1, 2, 3)
let maxPhase = 4;  // WRONG!
```

### ✅ Correct: maxPhase = Last Phase Number
```javascript
// If you have 4 phases (0, 1, 2, 3)
let maxPhase = 3;  // CORRECT
```

## Testing

After implementing the pattern:

1. **Auto mode**: Animation should loop automatically every 2 seconds per phase
2. **Manual mode**: Click canvas to advance phases at your own pace
3. **Toggle**: Button should switch between modes smoothly
4. **Loop**: Animation should restart from phase 0 after final phase

## Benefits

- **Consistent UX**: All animations work the same way
- **User control**: Choose between auto-play and step-through
- **Clean code**: No inline UI text cluttering visuals
- **Maintainable**: Central toggle button, not per-animation
