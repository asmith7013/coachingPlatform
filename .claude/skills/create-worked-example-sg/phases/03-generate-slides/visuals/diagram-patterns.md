# Diagram Patterns for Middle School Math

Visual structure reference for common math representations used in Illustrative Mathematics (IM) curriculum.

**This is the PRIMARY REFERENCE for all non-graph SVG diagrams.** When creating SVG visuals for worked examples, match these patterns to ensure students see familiar representations.

---

## ⚠️ CRITICAL: Simple Visuals That Speak for Themselves

**The visual should be immediately understandable WITHOUT text explanation.**

### What This Means:
- A tape diagram showing `? × 6 = 30` is self-explanatory
- A graph with labeled axes and plotted points is self-explanatory
- NO "Reading the graph: At point (6,12)..." info boxes needed
- NO text boxes inside the SVG explaining what's already shown

### The "Delete Test"
If you can delete a text element and the visual still makes sense → delete it.

### Labels vs. Explanations
| ✅ ALLOWED (Labels) | ❌ NOT ALLOWED (Explanations) |
|---------------------|-------------------------------|
| "6" inside a box | "Each box represents 6 nuggets" |
| "?" at start of tape | "The question mark shows what we're solving for" |
| "y = 2x" next to line | "This line represents the equation y = 2x" |
| Axis labels: "Time (sec)" | "The x-axis shows time in seconds" |

### Size Within Column
Visuals should **FILL their column** - use the full available width/height. Don't create small, cramped diagrams with excessive whitespace.

---

## Double Number Line
**Use for:** Ratios, percentages, proportional reasoning, unit rates
**IM Grade Level:** Grade 6 Unit 2 (introduced), used through Grade 7

```
 0        3        6        9       12   ← Quantity A (e.g., cups of flour)
 |--------|--------|--------|--------|
 |--------|--------|--------|--------|
 0        2        4        6        8   ← Quantity B (e.g., pints of water)
```

**Key features (from IM):**
- Two parallel horizontal lines with **aligned tick marks**
- Zero aligned on both lines (critical!)
- **Distances are proportional**: distance from 0 to 12 is 3× distance from 0 to 4
- Each line labeled with its quantity name
- At least 6 equally spaced tick marks
- Equivalent ratios line up **vertically**

**IM context:** Students use this to find equivalent ratios, unit rates, and "how many of X per one Y"

---

## Tape Diagram (Bar Model)
**Use for:** Part-whole relationships, fractions, ratio comparison, "times as many", division with fractions
**IM Grade Level:** Introduced Grade 2, used through middle school

### Single tape (parts of a whole):
```
┌──────────────┬──────────────┬──────────────┐
│    Part A    │    Part B    │    Part C    │
│      2x      │      3x      │      5x      │
└──────────────┴──────────────┴──────────────┘
├──────────────────── Total: 60 ────────────────┤
```

### Comparison tape (two quantities):
```
Maria:  ┌────────┬────────┬────────┐
        │   x    │   x    │   x    │  ← 3 units
        └────────┴────────┴────────┘

Juan:   ┌────────┐
        │   x    │  ← 1 unit
        └────────┘
```

### Compare problem (bigger/smaller/difference):
```
Bigger:   ┌────────────────────────────────┐
          │              45                │
          └────────────────────────────────┘

Smaller:  ┌────────────────────┐
          │         28         │
          └────────────────────┘
                               ├─ ? ─┤  ← Difference
```

**Key features (from IM):**
- Rectangular bars (like bars in a bar graph)
- **Same-length pieces = same value** (even if drawing is sloppy, label them)
- Label pieces with numbers OR letters (x, y) to show known/relative values
- Total or difference shown with bracket
- For Compare problems: shows bigger amount, smaller amount, and difference

**IM context:** Students see tape diagrams as a tool to "quickly visualize story problems" and connect to equations

---

## Hanger Diagram (Balance)
**Use for:** Equation solving, showing balance/equality, reasoning about operations
**IM Grade Level:** Grade 6 Unit 6, Grade 7 Unit 6

### Balanced hanger (equation):
```
              ╱╲
             ╱  ╲
            ╱    ╲
     ┌─────┴──────┴─────┐
     │                  │
  ┌──┴──┐            ┌──┴──┐
  │     │            │     │
  │ 3x  │            │ 12  │
  │ +1  │            │     │
  └─────┘            └─────┘
   Left               Right
   side               side
```

### With shapes (for visual weight):
```
              ╱╲
             ╱  ╲
            ╱    ╲
     ┌─────┴──────┴─────┐
     │                  │
  ┌──┴──┐            ┌──┴──┐
  │ △ △ │            │ □□□ │
  │     │            │     │
  └─────┘            └─────┘

  △ = triangle (unknown x)
  □ = square (value of 1)
```

**Key features (from IM):**
- Triangle fulcrum at top shows balance point
- **Balanced = both sides equal** (like equal sign)
- **Unbalanced = one side heavier** (inequality)
- Shapes represent values: △ (triangles) for variables, □ (squares) for units
- "What you do to one side, you do to the other side"

**IM solving strategy:**
- **Addition equations**: Solve by subtracting from both sides (remove equal weights)
- **Multiplication equations**: Solve by dividing both sides (split into equal groups)
- Students match hanger diagrams to equations, then solve

**IM context:** Visualizes the rule "what you do to one side of the equation you have to do to the other side"

---

## Number Line
**Use for:** Integers, absolute value, inequalities, operations

### Basic number line:
```
  ←──┼────┼────┼────┼────┼────┼────┼────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
```

### With points marked:
```
  ←──┼────┼────┼────●────┼────┼────○────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
                    ↑              ↑
                   -1              2
     ● = closed (included)    ○ = open (excluded)
```

### With jump arrows (for operations):
```
                    +5
              ┌──────────────┐
              ↓              ↓
  ←──┼────┼────┼────┼────┼────┼────┼────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
```

**Key features:**
- Arrows on both ends (extends infinitely)
- Evenly spaced tick marks
- Zero clearly marked
- Points: ● for included, ○ for excluded

---

## Area Model
**Use for:** Multiplication, distributive property a(b+c) = ab + ac, factoring
**IM Grade Level:** Introduced in elementary, used through Algebra 1

### For multiplication (23 × 15):
```
              20          3
         ┌──────────┬─────────┐
      10 │   200    │   30    │
         │          │         │
         ├──────────┼─────────┤
       5 │   100    │   15    │
         │          │         │
         └──────────┴─────────┘

    Total: 200 + 30 + 100 + 15 = 345
```

### For distributive property 6(40 + 7):
```
                40           7
         ┌──────────────┬─────────┐
       6 │     240      │   42    │
         │              │         │
         └──────────────┴─────────┘

    6(40 + 7) = 6×40 + 6×7 = 240 + 42 = 282
```

### For algebra (x + 3)(x + 2):
```
               x           3
         ┌──────────┬─────────┐
       x │    x²    │   3x    │
         │          │         │
         ├──────────┼─────────┤
       2 │    2x    │    6    │
         │          │         │
         └──────────┴─────────┘

    Total: x² + 3x + 2x + 6 = x² + 5x + 6
```

**Key features (from IM):**
- Rectangle divided into smaller rectangles (partial products)
- **Dimensions on outside edges** (factors being multiplied)
- **Products inside each section** (partial products)
- Total shown below as sum of all sections
- Shows that a(b + c) = ab + ac visually

**IM context:** "The area of a rectangle can be found in two ways: a(b + c) or ab + ac. The equality of these two expressions is the distributive property."

---

## Input-Output Table (Function Table)
**Use for:** Functions, patterns, rules, describing relationships
**IM Grade Level:** Grade 8 Functions (8.F.A.1)

### Horizontal table (primary format):
```
┌───────┬─────┬─────┬─────┬─────┬─────┐
│ Input │  1  │  2  │  3  │  4  │  5  │
├───────┼─────┼─────┼─────┼─────┼─────┤
│Output │  5  │  8  │ 11  │ 14  │  ?  │
└───────┴─────┴─────┴─────┴─────┴─────┘
               Rule: ×3 + 2
```

### With function machine visualization:
```
                    Rule: ×3 + 2
          ┌─────────────────────────────┐
          │                             │
Input →   │      [ FUNCTION MACHINE ]   │   → Output
          │                             │
          └─────────────────────────────┘

┌───────┬─────┬─────┬─────┬─────┐
│ Input │  1  │  2  │  3  │  ?  │
├───────┼─────┼─────┼─────┼─────┤
│Output │  5  │  8  │ 11  │ 20  │
└───────┴─────┴─────┴─────┴─────┘
```

**Key features (from IM):**
- **Horizontal layout** with Input row on top, Output row below
- Rule stated explicitly (as equation or in words)
- At least 3-4 examples showing the pattern
- One cell with "?" for student to solve
- "A function is a rule that assigns to each input exactly one output"

**IM context:** Students describe function rules in words, fill tables, and understand that each input produces exactly one output

---

## Ratio Table
**Use for:** Equivalent ratios, scaling, finding unknown values
**IM Grade Level:** Grade 6 Unit 2 (alongside double number lines)

```
┌────────────┬─────┬─────┬─────┬─────┐
│  Apples    │  2  │  4  │  6  │  ?  │
├────────────┼─────┼─────┼─────┼─────┤
│  Oranges   │  3  │  6  │  9  │ 15  │
└────────────┴─────┴─────┴─────┴─────┘
               ×2    ×3    ×?
```

### With scaling arrows:
```
          ×2         ×3
       ┌──────┐   ┌──────┐
       │      │   │      │
       ▼      │   ▼      │
┌────────┬────┼───┬────┼───┬─────┐
│ Miles  │ 5  │   │ 10 │   │ 15  │
├────────┼────┴───┼────┴───┼─────┤
│ Hours  │ 2  │   │  4 │   │  6  │
└────────┴────────┴────────┴─────┘
```

**Key features (from IM):**
- Two rows (one per quantity in the ratio)
- Columns show **equivalent ratios**
- Scale factors can be shown with arrows between columns
- At least one unknown to solve
- More abstract than double number line (no visual proportions)

**IM context:** Ratio tables are "more abstract and more general" than double number lines. Students progress from double number lines → ratio tables → equations

---

## Grid Diagram
**Use for:** Decomposing shapes into unit squares, finding area by counting
**IM Grade Level:** Grade 6 Unit 1 (Area and Surface Area)

### Basic grid (for area):
```
┌───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │
├───┼───┼───┼───┼───┤
│ 6 │ 7 │ 8 │ 9 │10 │
├───┼───┼───┼───┼───┤
│11 │12 │13 │14 │15 │
└───┴───┴───┴───┴───┘
     Area = 15 square units
```

### Decomposed shape (L-shape):
```
┌───┬───┬───┐
│   │   │   │  ← 3 units
├───┼───┼───┤
│   │   │   │  ← 3 units
├───┼───┴───┘
│   │          ← 2 units
├───┤
│   │
└───┘
  Total: 3 + 3 + 2 = 8 square units
```

**Key features:**
- Each cell represents 1 square unit
- Can number cells for counting
- Show decomposition into rectangles
- Label dimensions on edges

---

## Net Diagram
**Use for:** Surface area of prisms and pyramids, visualizing 3D shapes unfolded
**IM Grade Level:** Grade 6 Unit 1 (Area and Surface Area)

### Net of rectangular prism:
```
        ┌─────────┐
        │   TOP   │
        │  4 × 3  │
┌───────┼─────────┼───────┬─────────┐
│ LEFT  │  FRONT  │ RIGHT │  BACK   │
│ 3 × 2 │  4 × 2  │ 3 × 2 │  4 × 2  │
└───────┼─────────┼───────┴─────────┘
        │ BOTTOM  │
        │  4 × 3  │
        └─────────┘
```

### Net of triangular prism:
```
        ╱╲
       ╱  ╲
      ╱ △  ╲   ← triangular face
     ╱──────╲
┌────────────────┐
│                │
│   RECTANGLE    │  ← rectangular face
│                │
└────────────────┘
```

**Key features:**
- Show all faces laid flat
- Label each face with dimensions
- Indicate which edges connect when folded
- Use dotted lines for fold lines

---

## Measurement Diagram
**Use for:** Showing base, height, and other measurements on geometric shapes
**IM Grade Level:** Grade 6 Unit 1 (Area and Surface Area)

### Parallelogram with height:
```
    ┌──────────────────┐
   ╱│                 ╱
  ╱ │ h = 4         ╱
 ╱  │              ╱
╱   ↓             ╱
└──────────────────┘
    b = 8
```

### Triangle with base and height:
```
        ╱╲
       ╱  ╲
      ╱    ╲
     ╱   │  ╲
    ╱    │h  ╲
   ╱     │    ╲
  ╱      ↓     ╲
 ╱───────────────╲
        b
```

### Rectangle with dimensions:
```
      6 cm
  ┌──────────┐
  │          │
4 │          │ 4
  │          │
  └──────────┘
      6 cm
```

**Key features:**
- Clearly mark base (b) and height (h)
- Height is PERPENDICULAR to base (show right angle)
- Use arrows to indicate measurements
- Label with units when applicable

---

## Discrete Diagram
**Use for:** Showing objects/groups for ratio problems, "for every" relationships
**IM Grade Level:** Grade 6 Unit 2 (Introducing Ratios)

### Objects in groups:
```
Apples:   🍎 🍎 🍎 🍎 🍎    (5 apples)

Oranges:  🍊 🍊 🍊          (3 oranges)

Ratio: 5 apples for every 3 oranges
```

### With grouping brackets:
```
┌─────────────┐  ┌─────────────┐
│ ● ● ●       │  │ ● ● ●       │
│    Group 1  │  │    Group 2  │
└─────────────┘  └─────────────┘

3 per group × 2 groups = 6 total
```

### Array format:
```
○ ○ ○ ○ ○   ← 5 circles
○ ○ ○ ○ ○   ← 5 circles
○ ○ ○ ○ ○   ← 5 circles
─────────
   15 total (3 rows × 5 columns)
```

**Key features:**
- Use simple shapes (●, ○, □) or emoji icons
- Group related items visually
- Show "for every" relationships clearly
- Can use arrays for multiplication

---

## Base-Ten Diagram
**Use for:** Place value operations, addition/subtraction/multiplication with regrouping
**IM Grade Level:** Grade 5-6 Unit 5 (Arithmetic in Base Ten)

### Place value blocks:
```
Hundreds (100)     Tens (10)      Ones (1)
┌─────────┐       ┌─┐ ┌─┐        ●  ●
│         │       │ │ │ │        ●
│   100   │       │ │ │ │
│         │       └─┘ └─┘
└─────────┘        20             3

         Number: 123
```

### Addition with regrouping:
```
    Tens    Ones
    ┌─┐     ●●●●●
    │ │     ●●●      = 38
    └─┘

  + ┌─┐     ●●●●
    │ │     ●●●●●    = 29
    └─┘

  ──────────────────
    ┌─┐┌─┐  ●●●●●
    │ ││ │  ●●       = 67
    └─┘└─┘

(10 ones → 1 ten)
```

### Expanded form:
```
347 = 300 + 40 + 7

┌─────────┐ ┌─────────┐ ┌─────────┐   ┌─┐┌─┐┌─┐┌─┐   ●●●●
│   100   │ │   100   │ │   100   │   │ ││ ││ ││ │   ●●●
└─────────┘ └─────────┘ └─────────┘   └─┘└─┘└─┘└─┘
     3 hundreds              4 tens       7 ones
```

**Key features:**
- Large squares = hundreds (100)
- Tall rectangles = tens (10)
- Small dots/squares = ones (1)
- Show regrouping with arrows
- Label place values clearly

---

## Creating Custom Diagrams

If your problem doesn't fit these patterns, create a custom SVG following these rules:

1. **Use the SVG container wrapper:**
```html
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360">
  <svg viewBox="0 0 280 200">
    <!-- your diagram here -->
  </svg>
</div>
```

2. **Use layers for animations:**
```html
<g data-pptx-layer="base"><!-- always visible --></g>
<g data-pptx-layer="step-1"><!-- appears on click --></g>
```

3. **Text requirements:**
- All `<text>` must have `font-family="Arial"`
- Use readable font sizes (12-16px for labels)

4. **Colors from styling guide:**
- Primary: `#1791e8`
- Success: `#22c55e`
- Warning: `#f59e0b`
- Text: `#1d1d1d`
