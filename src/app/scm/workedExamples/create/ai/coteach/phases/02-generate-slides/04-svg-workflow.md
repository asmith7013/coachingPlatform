# SVG Graph Workflow

**What this file covers:** Complete workflow for creating SVG coordinate graphs, pixel formulas, pre-calculated tables, and validation rules.

**Only read this file if Visual Type = "SVG visual" (coordinate graphs).**

For non-graph diagrams (tape diagrams, hangers, etc.), see `reference/diagram-patterns.md`.

---

## CRITICAL: You Must Calculate Pixel Coordinates Yourself

In the standard app workflow, pixel coordinates are pre-calculated by TypeScript code and injected into the prompt. **In Coteach, YOU must calculate these yourself.**

### The Formulas

```
pixelX = 40 + (dataX / X_MAX) * 220
pixelY = 170 - (dataY / Y_MAX) * 150
```

Where:

- 40 = ORIGIN_X (left edge of plot)
- 170 = ORIGIN_Y (bottom edge of plot)
- 220 = PLOT_WIDTH
- 150 = PLOT_HEIGHT
- X_MAX and Y_MAX come from your graph plan

### Worked Example: Calculating Pixel Coordinates

**Given:** Line 1: y = 5x (blue), Line 2: y = 5x + 20 (green), X_MAX = 8, Y_MAX = 80

**Step 1: Calculate data coordinates for each line**

```
Line 1 (y = 5x):
  Start: (0, 0)           — y-intercept
  End:   (8, 5×8) = (8, 40)

Line 2 (y = 5x + 20):
  Start: (0, 20)          — y-intercept
  End:   (8, 5×8+20) = (8, 60)
```

**Step 2: Convert to pixel coordinates**

```
Line 1 start: pixelX = 40 + (0/8)×220 = 40.0    pixelY = 170 - (0/80)×150 = 170.0
Line 1 end:   pixelX = 40 + (8/8)×220 = 260.0   pixelY = 170 - (40/80)×150 = 95.0

Line 2 start: pixelX = 40 + (0/8)×220 = 40.0    pixelY = 170 - (20/80)×150 = 132.5
Line 2 end:   pixelX = 40 + (8/8)×220 = 260.0   pixelY = 170 - (60/80)×150 = 57.5
```

**Step 3: Write SVG line elements**

```html
<line
  x1="40"
  y1="170"
  x2="260"
  y2="95"
  stroke="#60a5fa"
  stroke-width="3"
  marker-end="url(#line-arrow-1)"
/>
<line
  x1="40"
  y1="132.5"
  x2="260"
  y2="57.5"
  stroke="#22c55e"
  stroke-width="3"
  marker-end="url(#line-arrow-2)"
/>
```

**Step 4: Calculate key point pixels**

```
Y-intercept Line 1 at (0, 0):  pixel(40, 170)
Y-intercept Line 2 at (0, 20): pixel(40, 132.5)
Solution at (4, 40):           pixelX = 40 + (4/8)×220 = 150.0
                               pixelY = 170 - (40/80)×150 = 95.0
                               → pixel(150, 95)
```

**Step 5: Validate**

- All pixelX values must be between 40–260 ✓
- All pixelY values must be between 20–170 ✓

### For Each Scenario's Graph

Remember: each scenario has its own graphPlan with different numbers. Calculate pixel coordinates separately for each:

- Slides 3-6: Use `scenarios[0].graphPlan` (Scenario 1 — worked example)
- Slide 7: Use `scenarios[1].graphPlan` (Scenario 2 — practice 1)
- Slide 8: Use `scenarios[2].graphPlan` (Scenario 3 — practice 2)
- Slide 9: Use both `scenarios[1]` and `scenarios[2]` graphPlans

---

## Workflow Overview

**SVG graphs are the ONLY component that requires the clone-and-modify workflow.** All other card-patterns use simple placeholder replacement.

```
Step 1: Reference graph-snippet.html       — Copy the complete SVG structure
Step 2: Reference this file                — Get formulas and tables
Step 3: CALCULATE pixel positions          — For your specific scale (using formulas above)
Step 4: MODIFY the copied SVG              — Replace values
Step 5: Reference annotation-snippet.html  — Add labels and annotations
Step 6: VERIFY grid alignment              — Run the checklist
```

**DO NOT create graphs from scratch.** Always copy and modify from `card-patterns/complex-patterns/graph-snippet.html`.

---

## SVG Graph Checklist (VERIFY BEFORE WRITING SLIDE)

**Structure:**

- [ ] Started from graph-snippet.html (NOT from scratch)
- [ ] SVG wrapped in container with `data-pptx-region="svg-container"`
- [ ] Container has position attributes: `data-pptx-x`, `data-pptx-y`, `data-pptx-w`, `data-pptx-h`

**Coordinate System:**

- [ ] X_MAX and Y_MAX set correctly for your data
- [ ] Grid lines align with axis labels (same pixel values)
- [ ] Single "0" at origin (not two separate zeros)
- [ ] Scale labels go to last tick before arrow

**Axes & Lines:**

- [ ] Axes have arrowheads (marker-end)
- [ ] Data lines extend to plot edges with arrows
- [ ] All lines use correct colors from styling guide

**Annotations:**

- [ ] All `<text>` elements have `font-family="Arial"`
- [ ] Annotations use `font-weight="normal"` (NOT bold)
- [ ] Annotation positions calculated using pixel formula

**PPTX Export:**

- [ ] Each line in its own `data-pptx-layer` group
- [ ] Each annotation in its own `data-pptx-layer` group
- [ ] Layer names follow convention: `line-1`, `label-b0`, `arrow-shift`, etc.

---

## Grid Alignment Rules (CRITICAL)

**The #1 problem with SVG graphs is misaligned grids.**

### Rule 1: Use Consistent Spacing Formula

All coordinate calculations MUST use the same linear interpolation formula:

```
pixelX = ORIGIN_X + (dataX / X_MAX) * PLOT_WIDTH
pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT
```

### Rule 2: Grid Lines Must Match Labels

If you place a label at x=40 for value "0", x=150 for value "5", and x=260 for value "10":

- Grid lines MUST be at x=40, 150, 260 (NOT different values)
- The spacing is (260-40)/(10-0) = 22 pixels per unit

### Rule 3: Define Constants First

Before writing any SVG, define these values:

```
ORIGIN_X = 40      // Left edge of plot (after Y-axis labels)
ORIGIN_Y = 170     // Bottom edge of plot (above X-axis labels)
PLOT_WIDTH = 220   // Width from origin to right edge
PLOT_HEIGHT = 150  // Height from origin to top edge
X_MAX = [your value]
Y_MAX = [your value]
```

---

## Axis Requirements

**Every coordinate plane MUST have all 5 elements:**

### 1. Tick Marks at Each Label Position

```html
<!-- X-axis ticks (5px below axis, from y=170 to y=175) -->
<g stroke="#1e293b" stroke-width="1.5">
  <line x1="40" y1="170" x2="40" y2="175" />
  <line x1="95" y1="170" x2="95" y2="175" />
  <line x1="150" y1="170" x2="150" y2="175" />
  <!-- ... one tick per label position -->
</g>

<!-- Y-axis ticks (5px left of axis, from x=35 to x=40) -->
<g stroke="#1e293b" stroke-width="1.5">
  <line x1="35" y1="170" x2="40" y2="170" />
  <line x1="35" y1="132.5" x2="40" y2="132.5" />
  <!-- ... one tick per label position -->
</g>
```

### 2. Arrowheads on Both Axes

```html
<defs>
  <marker
    id="axis-arrow"
    markerWidth="10"
    markerHeight="7"
    refX="9"
    refY="3.5"
    orient="auto"
  >
    <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b" />
  </marker>
</defs>

<!-- X-axis with arrow (extends 10px past last label) -->
<line
  x1="40"
  y1="170"
  x2="275"
  y2="170"
  stroke="#1e293b"
  stroke-width="2"
  marker-end="url(#axis-arrow)"
/>

<!-- Y-axis with arrow (extends 10px past last label) -->
<line
  x1="40"
  y1="180"
  x2="40"
  y2="5"
  stroke="#1e293b"
  stroke-width="2"
  marker-end="url(#axis-arrow)"
/>
```

### 3. Single "0" at Origin (NOT two separate zeros)

```html
<!-- ONE zero label at origin, positioned to serve both axes -->
<text
  x="33"
  y="182"
  fill="#64748b"
  font-family="Arial"
  font-size="11"
  text-anchor="end"
  >0</text
>
```

### 4. Complete Scale Labels (to the arrows)

Labels must go all the way to the last tick mark before the arrow:

- X-axis: 0, 10, 20, 30, 40, 50 (if X_MAX=50)
- Y-axis: 0, 10, 20, 30, 40, 50 (if Y_MAX=50)

**Scale must be consistent** — use increments of 5, 10, 20, 25, 50, or 100.

### 5. Axis Labels (Optional)

```html
<text
  x="280"
  y="175"
  fill="#64748b"
  font-family="Arial"
  font-size="12"
  font-style="italic"
  >x</text
>
<text
  x="45"
  y="8"
  fill="#64748b"
  font-family="Arial"
  font-size="12"
  font-style="italic"
  >y</text
>
```

---

## Line Extension Rules

**Lines must extend to the edges of the plot area** with arrows showing they continue beyond.

### How to Calculate Line Endpoints

For a line y = mx + b within plot area (0, 0) to (X_MAX, Y_MAX):

**Step 1: Calculate where line intersects plot boundaries**

```
Left edge (x=0):      y = b
Right edge (x=X_MAX): y = m * X_MAX + b
Top edge (y=Y_MAX):   x = (Y_MAX - b) / m
Bottom edge (y=0):    x = -b / m
```

**Step 2: Determine entry point**

- If 0 <= b <= Y_MAX: entry is **(0, b)** on left edge
- If b < 0: entry is **(-b/m, 0)** on bottom edge
- If b > Y_MAX: entry is **((Y_MAX-b)/m, Y_MAX)** on top edge

**Step 3: Determine exit point**

- Calculate y at x=X_MAX: `y_exit = m * X_MAX + b`
- If 0 <= y_exit <= Y_MAX: exit is **(X_MAX, y_exit)** on right edge
- If y_exit > Y_MAX: exit is **((Y_MAX-b)/m, Y_MAX)** on top edge
- If y_exit < 0: exit is **(-b/m, 0)** on bottom edge

**Step 4: Convert data coordinates to pixels and draw**

### Line Arrow Marker

```html
<defs>
  <marker
    id="line-arrow"
    markerWidth="6"
    markerHeight="4"
    refX="5"
    refY="2"
    orient="auto"
  >
    <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
  </marker>
</defs>
```

---

## Quick Reference: Pixel Calculations

### Standard Plot Area (viewBox 280x200)

| Constant       | Value | Purpose                   |
| -------------- | ----- | ------------------------- |
| ORIGIN_X       | 40    | X pixel of origin         |
| ORIGIN_Y       | 170   | Y pixel of origin         |
| PLOT_WIDTH     | 220   | Pixels from x=0 to x=max  |
| PLOT_HEIGHT    | 150   | Pixels from y=0 to y=max  |
| LABEL_Y_OFFSET | 185   | Y pixel for X-axis labels |
| LABEL_X_OFFSET | 35    | X pixel for Y-axis labels |

### Conversion Formulas

```
pixelX = 40 + (dataX / X_MAX) * 220
pixelY = 170 - (dataY / Y_MAX) * 150

Example: Point (6, 45) with X_MAX=10, Y_MAX=100
  pixelX = 40 + (6/10)*220 = 40 + 132 = 172
  pixelY = 170 - (45/100)*150 = 170 - 67.5 = 102.5
```

---

## Common X-Axis Scales

Pre-calculated values for common scales (ORIGIN_X=40, PLOT_WIDTH=220):

### X: 0 to 4 (spacing = 55px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 1    | 95    |
| 2    | 150   |
| 3    | 205   |
| 4    | 260   |

### X: 0 to 5 (spacing = 44px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 1    | 84    |
| 2    | 128   |
| 3    | 172   |
| 4    | 216   |
| 5    | 260   |

### X: 0 to 8 (spacing = 27.5px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 2    | 95    |
| 4    | 150   |
| 6    | 205   |
| 8    | 260   |

### X: 0 to 10 (spacing = 22px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 2    | 84    |
| 4    | 128   |
| 5    | 150   |
| 6    | 172   |
| 8    | 216   |
| 10   | 260   |

### X: 0 to 12 (spacing = 18.33px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 3    | 95    |
| 6    | 150   |
| 9    | 205   |
| 12   | 260   |

### X: 0 to 20 (spacing = 11px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 40    |
| 5    | 95    |
| 10   | 150   |
| 15   | 205   |
| 20   | 260   |

---

## Common Y-Axis Scales

Pre-calculated values (ORIGIN_Y=170, PLOT_HEIGHT=150):

### Y: 0 to 100 (spacing = 1.5px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 170   |
| 25   | 132.5 |
| 50   | 95    |
| 75   | 57.5  |
| 100  | 20    |

### Y: 0 to 80 (spacing = 1.875px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 170   |
| 20   | 132.5 |
| 40   | 95    |
| 60   | 57.5  |
| 80   | 20    |

### Y: 0 to 200 (spacing = 0.75px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 170   |
| 50   | 132.5 |
| 100  | 95    |
| 150  | 57.5  |
| 200  | 20    |

### Y: 0 to 400 (spacing = 0.375px per unit)

| Data | Pixel |
| ---- | ----- |
| 0    | 170   |
| 100  | 132.5 |
| 200  | 95    |
| 300  | 57.5  |
| 400  | 20    |

---

## Scale Selection Reference

**Target: 10 or fewer ticks per axis**

**X-AXIS (ORIGIN_X=40, PLOT_WIDTH=220):**
| X_MAX | Increment | Ticks | Pixel positions |
|-------|-----------|-------|-----------------|
| 4 | 1 | 5 | 0->40, 1->95, 2->150, 3->205, 4->260 |
| 5 | 1 | 6 | 0->40, 1->84, 2->128, 3->172, 4->216, 5->260 |
| 6 | 1 | 7 | 0->40, 1->77, 2->113, 3->150, 4->187, 5->223, 6->260 |
| 8 | 2 | 5 | 0->40, 2->95, 4->150, 6->205, 8->260 |
| 10 | 2 | 6 | 0->40, 2->84, 4->128, 6->172, 8->216, 10->260 |

**Y-AXIS (ORIGIN_Y=170, PLOT_HEIGHT=150):**
| Y_MAX | Increment | Ticks | Notes |
|-------|-----------|-------|-------|
| 9 | 1 | 10 | Max for counting by 1s |
| 18 | 2 | 10 | Max for counting by 2s |
| 36 | 4 | 10 | Count by 4s |
| 45 | 5 | 10 | Count by 5s |
| 72 | 8 | 10 | Count by 8s |
| 90 | 10 | 10 | Count by 10s |

**RULE: Grid lines at EVERY tick position. Never skip values!**

---

## Preventing Element Overlap (CRITICAL)

**The #2 problem with SVG graphs is overlapping elements.**

### Recommended Element Sizes

| Element            | Recommended Size                 | Max Size                         |
| ------------------ | -------------------------------- | -------------------------------- |
| Data point circles | r="4" to r="5"                   | r="6"                            |
| Point labels       | font-size="9" to "10"            | font-size="11"                   |
| Arrow stroke width | stroke-width="2"                 | stroke-width="3"                 |
| Arrow markers      | markerWidth="6" markerHeight="4" | markerWidth="8" markerHeight="5" |
| Annotation text    | font-size="9"                    | font-size="11"                   |

### Label Positioning Strategy

**Point labels** — Position AWAY from other elements:

- If point is in upper area: place label ABOVE (y - 10px)
- If point is in lower area: place label BELOW (y + 15px)
- If two points are close horizontally: stagger labels (one above, one below)
- Never place labels directly on the axes

**Annotation labels** (rise/run, change in y/x):

- Position to the LEFT of vertical arrows (x - 25px)
- Position BELOW horizontal arrows (y + 15px)
- Use smaller font-size="9" for annotations

### Minimum Spacing Guidelines

| Between                        | Minimum Distance |
| ------------------------------ | ---------------- |
| Point label and point center   | 10px             |
| Point label and axis           | 15px             |
| Two point labels               | 20px             |
| Arrow end and target point     | 5px gap          |
| Annotation text and arrow line | 3px              |

---

## Common Mistakes to Avoid

### WRONG: Hardcoded unrelated grid positions

```html
<!-- BAD: Grid lines don't match labels -->
<line x1="100" y1="20" x2="100" y2="170" />
<!-- Grid at x=100 -->
<text x="95" y="185">2</text>
<!-- Label at x=95 - MISMATCH! -->
```

### CORRECT: Grid and labels use same positions

```html
<!-- GOOD: Grid lines match labels -->
<line x1="95" y1="20" x2="95" y2="170" />
<!-- Grid at x=95 -->
<text x="95" y="185">2</text>
<!-- Label at x=95 - ALIGNED! -->
```

### WRONG: Inconsistent spacing

```html
<!-- BAD: Spacing not uniform -->
<text x="40">0</text>
<!-- 0 at 40 -->
<text x="100">2</text>
<!-- 2 at 100 (60px from 0) -->
<text x="150">4</text>
<!-- 4 at 150 (50px from 2) - WRONG! -->
```

### CORRECT: Uniform spacing

```html
<!-- GOOD: Each tick is 55px apart -->
<text x="40">0</text>
<!-- 0 at 40 -->
<text x="95">2</text>
<!-- 2 at 95 (55px from 0) -->
<text x="150">4</text>
<!-- 4 at 150 (55px from 2) -->
```

---

## PPTX Layer System

Each SVG element that should be independently selectable needs `data-pptx-layer`:

| Prefix    | Use For                     | Example                          |
| --------- | --------------------------- | -------------------------------- |
| `line-N`  | Data lines and their points | `line-1`, `line-2`               |
| `label-X` | Text annotations            | `label-b0`, `label-shift20`      |
| `arrow-X` | Arrow annotations           | `arrow-shift`, `arrow-highlight` |
| `eq-N`    | Equation labels             | `eq-line-1`, `eq-line-2`         |

See `card-patterns/complex-patterns/graph-snippet.html` for the complete layer structure implementation.

---

## Printable Worksheet SVG

For printable slides, use smaller dimensions and monochrome colors. See `card-patterns/complex-patterns/printable-slide-snippet.html` for complete example.

**Key differences from projection SVG:**

- Smaller viewBox (200x150 vs 280x200)
- Black on white colors only
- No arrows/animation

---

## Colors Reference

| Use        | Color | Hex     |
| ---------- | ----- | ------- |
| Line 1     | Blue  | #60a5fa |
| Line 2     | Green | #22c55e |
| Line 3     | Red   | #ef4444 |
| Axis/Grid  | Slate | #1e293b |
| Labels     | Gray  | #64748b |
| Light grid | Slate | #e2e8f0 |
