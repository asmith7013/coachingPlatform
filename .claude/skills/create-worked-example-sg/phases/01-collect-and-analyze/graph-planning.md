# Graph Planning (Required for Coordinate Planes)

**When to read this file:** You identified "SVG graphs" or "coordinate planes" as your visual type in Step 1.3e.

**Purpose:** Complete semantic planning for your graph BEFORE any pixel-level implementation.

---

## MANDATORY: Complete All Steps Below

If you skip this planning, your graph will have incorrect scales or misplaced annotations.

---

## Step 1: List Your Equations/Data

Write out every line or data series that will appear on the graph:

```
Line 1: [equation, e.g., y = 3x]
Line 2: [equation, e.g., y = 3x + 50]
Line 3: [if applicable]
```

---

## Step 2: Calculate Data Ranges

### Find X_MAX
Choose the rightmost x-value you need to show. Common values: 4, 5, 6, 8, 10

```
X_MAX = [your value]
```

### Find Y_MAX
For EACH line, calculate Y at x=0 and x=X_MAX:

```
Line 1: y = [equation]
  - At x=0: y = [calculate]
  - At x=X_MAX: y = [calculate]

Line 2: y = [equation]
  - At x=0: y = [calculate]
  - At x=X_MAX: y = [calculate]

Largest Y value across all lines: [value]
```

### Round Y_MAX Up

| If largest Y is... | Use Y_MAX |
|-------------------|-----------|
| ≤ 10 | 10 |
| 11-20 | 20 |
| 21-40 | 40 |
| 41-50 | 50 |
| 51-80 | 80 |
| 81-100 | 100 |
| 101-200 | 200 |
| 201-400 | 400 |
| 401-500 | 500 |
| 501-1000 | 1000 |

```
Y_MAX = [your rounded value]
```

---

## Step 3: Determine Axis Labels and Scales

### X-Axis Labels

Based on your X_MAX, use these labels:

| X_MAX | X-axis labels | X scale (increment) |
|-------|---------------|---------------------|
| 4 | 0, 1, 2, 3, 4 | 1 |
| 5 | 0, 1, 2, 3, 4, 5 | 1 |
| 6 | 0, 1, 2, 3, 4, 5, 6 | 1 |
| 8 | 0, 2, 4, 6, 8 | 2 |
| 10 | 0, 2, 4, 6, 8, 10 | 2 |
| 12 | 0, 3, 6, 9, 12 | 3 |
| 20 | 0, 5, 10, 15, 20 | 5 |

```
X-axis labels: [your labels]
X scale: [increment between labels]
```

### Y-Axis Labels

Based on your Y_MAX, use these labels:

| Y_MAX | Y-axis labels (bottom to top) | Y scale (increment) |
|-------|------------------------------|---------------------|
| 10 | 0, 2.5, 5, 7.5, 10 | 2.5 |
| 20 | 0, 5, 10, 15, 20 | 5 |
| 40 | 0, 10, 20, 30, 40 | 10 |
| 50 | 0, 12.5, 25, 37.5, 50 | 12.5 |
| 80 | 0, 20, 40, 60, 80 | 20 |
| 100 | 0, 25, 50, 75, 100 | 25 |
| 200 | 0, 50, 100, 150, 200 | 50 |
| 400 | 0, 100, 200, 300, 400 | 100 |

```
Y-axis labels: [your labels]
Y scale: [increment between labels]
```

---

## Step 4: Identify the Mathematical Relationship to Annotate

What is the KEY mathematical concept this graph should emphasize?

| If the problem involves... | Annotation type | What to show |
|---------------------------|-----------------|--------------|
| Two parallel lines (same slope, different y-intercepts) | Y-intercept shift | Vertical double-arrow between y-intercepts |
| Two parallel lines | Parallel indicator | "PARALLEL" label or "Same slope = m" |
| Two lines with different slopes | Slope comparison | Slope labels next to each line |
| Lines that intersect | Intersection point | Highlighted point with coordinates |
| Single line with slope focus | Slope triangle | Rise/run annotation |
| Single line with intercept focus | Y-intercept point | Highlighted point at (0, b) |

```
Key relationship: [what to emphasize]
Annotation type: [from table above]
```

---

## Step 5: Plan Annotation Position

### For Y-Intercept Shift (Parallel Lines)

The vertical arrow showing the shift goes **LEFT of the y-axis**:

```
Arrow X position: ORIGIN_X - 15 pixels (left of axis)
Arrow starts at: pixelY of first y-intercept
Arrow ends at: pixelY of second y-intercept
Label: the numerical difference (e.g., "50 units")
```

### For Parallel/Slope Labels

Place in **open space** away from:
- The lines themselves
- Axis labels
- Other annotations

Typical positions:
- Upper right quadrant for legend
- Near the lines but offset by 10-15px

### For Intersection Points

Highlight the intersection with:
- A larger circle (r=6 or r=8)
- Coordinate label offset by 10px

---

## Step 6: Write Your Complete Graph Plan

**Copy this template and fill it in:**

```
GRAPH PLAN
==========
Equations:
- Line 1: [equation] ([color])
- Line 2: [equation] ([color])

Scale:
- X range: 0 to [X_MAX]
- X-axis labels: [list]
- X scale: [increment between labels]
- Y range: 0 to [Y_MAX]
- Y-axis labels: [list]
- Y scale: [increment between labels]

Annotation:
- Relationship to show: [what mathematical concept]
- Annotation type: [from Step 4 table]
- Position: [from Step 5]

Visual notes:
- [any other visual elements needed]
```

---

## Example: Comparing y = 3x and y = 3x + 50

```
GRAPH PLAN
==========
Equations:
- Line 1: y = 3x (blue)
- Line 2: y = 3x + 50 (red)

Scale:
- X range: 0 to 6
- X-axis labels: 0, 1, 2, 3, 4, 5, 6
- X scale: 1
- Calculations:
  - Line 1 at x=6: y = 18
  - Line 2 at x=6: y = 68
  - Largest Y = 68
- Y range: 0 to 80 (rounded up from 68)
- Y-axis labels: 0, 20, 40, 60, 80
- Y scale: 20

Annotation:
- Relationship to show: Y-intercept shift (parallel lines)
- Annotation type: Vertical double-arrow between y-intercepts
- Position: Left of y-axis (x = ORIGIN_X - 15)
- Arrow from: y=0 (pixel 170) to y=50 (pixel 76.25)
- Label: "50 units up"

Visual notes:
- Both lines should be clearly visible
- Legend in upper right showing both equations
- "PARALLEL" label near the lines
```

---

## Add Graph Plan to Your PROBLEM ANALYSIS

After completing this planning, add the GRAPH PLAN section to your PROBLEM ANALYSIS output in Phase 1.

This plan will be referenced in Phase 3 when you implement the SVG.

---

## Pixel Implementation

When you reach Phase 3 and need to convert your graph plan to actual SVG pixels, reference:

```
Read: .claude/skills/create-worked-example-sg/reference/svg-pixel-tables.md
```

That file contains the pixel lookup tables for converting your planned scale to actual SVG coordinates.
