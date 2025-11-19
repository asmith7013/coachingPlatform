# Quick Reference: Math Manipulative System

## 🎯 Quick Start

### For LLMs generating code:
1. Read `/primitives/p5-format.md` → Learn structure
2. Read relevant `/scenarios/*.md` → Get concept guidance  
3. Generate code following the templates

### For humans:
1. Pick a scenario from `/scenarios/`
2. Follow the prompt template
3. Reference `/primitives/` for constraints
4. Test in p5.js playground

## 📋 File Cheat Sheet

| File | Purpose | Read When |
|------|---------|-----------|
| `primitives/p5-format.md` | Required code structure | Always - every manipulative |
| `primitives/shapes.md` | How to draw shapes | Need to know what shapes exist |
| `primitives/colors.md` | Color palette | Styling any element |
| `primitives/animations.md` | Animation patterns | Adding motion/interactivity |
| `scenarios/multiplication.md` | Multiplication visuals | Creating mult. manipulative |
| `scenarios/algebra.md` | Tape diagrams | Solving equations visually |
| `scenarios/division.md` | Division models | TBD - not created yet |
| `scenarios/fractions.md` | Fraction models | TBD - not created yet |

## 🎨 Essential Constraints

### Canvas
```javascript
createCanvas(400, 400);  // ALWAYS
```

### Colors (RGB)
```javascript
fill(255, 153, 51);   // orange - blocks
fill(75, 50, 120);     // purple - titles
fill(15, 35, 65);      // darkBlue - alternate
fill(230, 57, 70);     // red - variables
fill(255, 220, 80);    // yellow - highlights
```

### Structure
```javascript
// Variables first
let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  // Drawing code
}
```

## 🔄 Common Patterns

### Static Array
```javascript
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    fill(255, 153, 51);
    rect(x + col * width, y + row * height, width, height);
  }
}
```

### Emojis (⚠️ CRITICAL)
```javascript
// WRONG: text('🥛🥛🥛', x, y);
// RIGHT: Draw individually in circles
let circleSize = 32;
let spacing = 36;

for (let i = 0; i < count; i++) {
  let cx = x + i * spacing + circleSize/2;
  let cy = y + circleSize/2;

  fill(255);
  stroke(204);
  strokeWeight(2);
  circle(cx, cy, circleSize);

  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text('🥛', cx, cy);
}
```

### Auto/Manual Toggle Animation (PREFERRED)
```javascript
let phase = 0;
let maxPhase = 2;

function draw() {
  background(255);

  if (phase === 0) drawPhase1();
  if (phase === 1) drawPhase2();
  if (phase === 2) drawFinalPhase();

  // Auto-advance (only in auto mode)
  if (window.animationMode === 'auto') {
    window.animationTimer++;
    if (window.animationTimer > window.animationPhaseDelay && phase < maxPhase) {
      phase++;
      window.animationTimer = 0;
    }
    if (phase === maxPhase && window.animationTimer > window.animationPhaseDelay) {
      phase = 0;
      window.animationTimer = 0;
    }
  }
}

function mousePressed() {
  // Manual advance (only in manual mode)
  if (window.animationMode === 'manual') {
    phase = (phase < maxPhase) ? phase + 1 : 0;
  }
}
```
**Toggle button (bottom right) switches between 🔄 Auto and 👆 Manual modes**

### Auto-Advance Animation (LEGACY)
```javascript
let phase = 0;
let timer = 0;

if (phase === 0) drawPhase1();
if (phase === 1) drawPhase2();

timer++;
if (timer > 120 && phase < 2) {
  phase++;
  timer = 0;
}
```

### Interactive
```javascript
function keyPressed() {
  if (keyCode === UP_ARROW) {
    value++;
  }
}
```

## 📚 Scenario Quick Picks

**Multiplication?** → `scenarios/multiplication.md`
- Arrays, groups, skip counting
- Use orange blocks in rows×cols

**Algebra?** → `scenarios/algebra.md`
- Tape diagrams
- Use red for variables, yellow for highlights

**Want to add new concept?**
- Copy structure from existing scenario
- Add to `/scenarios/`
- Create 1-2 examples

## ⚡ Fast Workflow

### Creating New Manipulative
```
1. Choose concept → Find scenario file
2. Copy code template from scenario
3. Customize values
4. Test in playground
5. (Optional) Save to /examples/
```

### Prompting an LLM
```
"Read primitives/p5-format.md, primitives/shapes.md, 
primitives/colors.md, and scenarios/multiplication.md.

Then generate a p5.js manipulative for: 3 × 8 = 24
Use an array model with animated fill sequence."
```

## 🚀 Next: Build These

Priority scenarios to create:
1. ✅ Multiplication
2. ✅ Algebra (tape diagrams)
3. ⏭️ Division (partitive & quotative)
4. ⏭️ Fractions (part-whole, area, number line)
5. ⏭️ Geometry (transformations, shapes)
6. ⏭️ Number sense (place value, counting)

## 🎓 Key Principles

1. **Constrained = Reliable** - Limited shapes/colors = predictable output
2. **Modular = Flexible** - Primitives combine for any concept
3. **Scenario-Driven** - Each math concept has specific visual needs
4. **Example-Rich** - Working code guides future generation

## 📞 When Stuck

- **LLM generating wrong structure?** → Check p5-format.md compliance
- **Colors look off?** → Verify against colors.md palette
- **Animation choppy?** → Review animations.md patterns
- **Math model unclear?** → Read relevant scenario file
- **Need inspiration?** → Browse /examples/