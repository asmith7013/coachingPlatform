# Math Manipulative Animation System

## Directory Structure

### 📁 `/primitives/`
Core building blocks and constraints for p5.js manipulatives:
- **shapes.md** - Available shapes (rect, circle, array, etc.)
- **colors.md** - Color palette and RGB values
- **animations.md** - Animation patterns and techniques
- **p5-format.md** - Required p5.js global mode format

### 📄 `AUTO-MANUAL-TOGGLE-PATTERN.md`
**REQUIRED READING** - Standard pattern for all multi-phase animations:
- Auto-play mode (default): Phases advance automatically
- Manual mode: User clicks to advance phases
- Toggle button in bottom right corner
- Universal pattern applied to all animations

### 📁 `/scenarios/`
Flexible AI prompts for specific math concepts:
- **multiplication.md** - Arrays, groups, repeated addition
- **division.md** - Partitive and quotative division models
- **fractions.md** - Part-whole, number line, area models
- **algebra.md** - Tape diagrams, balance scales, equations
- **geometry.md** - Transformations, shapes, measurements
- **number-sense.md** - Counting, place value, number lines

### 📁 `/examples/`
Working p5.js code examples for each scenario:
- **multiplication-array.js**
- **tape-diagram-solver.js**
- **fraction-circles.js**
- etc.

## How to Use

### For LLMs:
1. Read `AUTO-MANUAL-TOGGLE-PATTERN.md` for animation structure (REQUIRED)
2. Read `/primitives/` to understand constraints
3. Read relevant scenario from `/scenarios/` for the math concept
4. Reference `/examples/` for working code patterns
5. Generate p5.js code following the format

### For Developers:
1. Start with a scenario template
2. Customize for specific problem
3. Test in p5.js playground
4. Save successful examples

## Philosophy

**Constrained Creativity**: By limiting the vocabulary (shapes, colors, motions), we increase reliability while maintaining flexibility for diverse math concepts.

**Scenario-Based**: Each math concept has its own prompt template that guides the LLM toward appropriate visual representations.

**Example-Driven**: Working code examples serve as references and training data for better LLM output.