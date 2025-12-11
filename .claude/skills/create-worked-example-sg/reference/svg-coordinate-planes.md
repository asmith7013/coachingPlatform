# SVG Coordinate Plane Reference

This document provides templates and guidelines for creating SVG coordinate planes that properly align grid lines with axis labels and data points.

---

## CRITICAL: Grid Alignment Rules

**The #1 problem with SVG graphs is misaligned grids.** Follow these rules:

### Rule 1: Use Consistent Spacing Formula

All coordinate calculations MUST use the same linear interpolation formula:

```
pixelX = ORIGIN_X + (dataX / X_MAX) * PLOT_WIDTH
pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT
```

Where:
- `ORIGIN_X`, `ORIGIN_Y` = pixel coordinates of the origin (0,0) point
- `PLOT_WIDTH` = width of the plot area in pixels
- `PLOT_HEIGHT` = height of the plot area in pixels
- `X_MAX`, `Y_MAX` = maximum data values on each axis

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
X_MAX = 10         // Maximum X value
Y_MAX = 100        // Maximum Y value
```

---

## Standard SVG Template (4x4 Grid)

This template creates a properly aligned coordinate plane with 5 tick marks on each axis:

```html
<svg viewBox="0 0 280 200" style="width: 100%; max-height: 160px;">
    <!--
    COORDINATE SYSTEM CONSTANTS:
    Origin (0,0) at pixel: (40, 170)
    Plot area: 220px wide x 150px tall
    X range: 0 to X_MAX
    Y range: 0 to Y_MAX

    FORMULA:
    pixelX = 40 + (dataX / X_MAX) * 220
    pixelY = 170 - (dataY / Y_MAX) * 150

    For X_MAX=8: each unit = 27.5px → ticks at 40, 67.5, 95, 122.5, 150, 177.5, 205, 232.5, 260
    For Y_MAX=80: each unit = 1.875px → ticks at 170, 132.5, 95, 57.5, 20
    -->

    <!-- Grid lines (4 vertical, 4 horizontal for 5 tick marks each) -->
    <g stroke="#334155" stroke-width="0.5">
        <!-- Vertical grid lines at x = 1/4, 2/4, 3/4, 4/4 of X_MAX -->
        <line x1="95" y1="20" x2="95" y2="170"/>
        <line x1="150" y1="20" x2="150" y2="170"/>
        <line x1="205" y1="20" x2="205" y2="170"/>
        <line x1="260" y1="20" x2="260" y2="170"/>
        <!-- Horizontal grid lines at y = 1/4, 2/4, 3/4, 4/4 of Y_MAX -->
        <line x1="40" y1="132.5" x2="260" y2="132.5"/>
        <line x1="40" y1="95" x2="260" y2="95"/>
        <line x1="40" y1="57.5" x2="260" y2="57.5"/>
        <line x1="40" y1="20" x2="260" y2="20"/>
    </g>

    <!-- Axes -->
    <line x1="40" y1="170" x2="260" y2="170" stroke="#94a3b8" stroke-width="2"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="#94a3b8" stroke-width="2"/>

    <!-- X-axis labels (MUST match grid line X positions) -->
    <text x="40" y="185" fill="#94a3b8" font-size="11" text-anchor="middle">0</text>
    <text x="95" y="185" fill="#94a3b8" font-size="11" text-anchor="middle">2</text>
    <text x="150" y="185" fill="#94a3b8" font-size="11" text-anchor="middle">4</text>
    <text x="205" y="185" fill="#94a3b8" font-size="11" text-anchor="middle">6</text>
    <text x="260" y="185" fill="#94a3b8" font-size="11" text-anchor="middle">8</text>

    <!-- Y-axis labels (MUST match grid line Y positions) -->
    <text x="35" y="174" fill="#94a3b8" font-size="11" text-anchor="end">0</text>
    <text x="35" y="136" fill="#94a3b8" font-size="11" text-anchor="end">20</text>
    <text x="35" y="99" fill="#94a3b8" font-size="11" text-anchor="end">40</text>
    <text x="35" y="61" fill="#94a3b8" font-size="11" text-anchor="end">60</text>
    <text x="35" y="24" fill="#94a3b8" font-size="11" text-anchor="end">80</text>

    <!-- Data line example: from (0,0) to (8,80) -->
    <line x1="40" y1="170" x2="260" y2="20" stroke="#60a5fa" stroke-width="3"/>

    <!-- Data point at (4, 40) - MUST use same formula -->
    <!-- pixelX = 40 + (4/8)*220 = 40 + 110 = 150 -->
    <!-- pixelY = 170 - (40/80)*150 = 170 - 75 = 95 -->
    <circle cx="150" cy="95" r="5" fill="#60a5fa"/>
</svg>
```

---

## Quick Reference: Pixel Calculations

### Standard Plot Area (viewBox 280x200)

| Constant | Value | Purpose |
|----------|-------|---------|
| ORIGIN_X | 40 | X pixel of origin |
| ORIGIN_Y | 170 | Y pixel of origin |
| PLOT_WIDTH | 220 | Pixels from x=0 to x=max |
| PLOT_HEIGHT | 150 | Pixels from y=0 to y=max |
| LABEL_Y_OFFSET | 185 | Y pixel for X-axis labels |
| LABEL_X_OFFSET | 35 | X pixel for Y-axis labels |

### Conversion Formulas

```javascript
// Data to Pixel
function dataToPixelX(dataX, xMax) {
    return 40 + (dataX / xMax) * 220;
}

function dataToPixelY(dataY, yMax) {
    return 170 - (dataY / yMax) * 150;
}

// Example: Point (6, 45) with X_MAX=10, Y_MAX=100
// pixelX = 40 + (6/10)*220 = 40 + 132 = 172
// pixelY = 170 - (45/100)*150 = 170 - 67.5 = 102.5
```

---

## Common X-Axis Scales

Use these pre-calculated values for common scales (ORIGIN_X=40, PLOT_WIDTH=220):

### X: 0 to 4 (spacing = 55px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 1 | 95 |
| 2 | 150 |
| 3 | 205 |
| 4 | 260 |

### X: 0 to 5 (spacing = 44px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 1 | 84 |
| 2 | 128 |
| 3 | 172 |
| 4 | 216 |
| 5 | 260 |

### X: 0 to 8 (spacing = 27.5px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 2 | 95 |
| 4 | 150 |
| 6 | 205 |
| 8 | 260 |

### X: 0 to 10 (spacing = 22px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 2 | 84 |
| 4 | 128 |
| 5 | 150 |
| 6 | 172 |
| 8 | 216 |
| 10 | 260 |

### X: 0 to 12 (spacing = 18.33px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 3 | 95 |
| 6 | 150 |
| 9 | 205 |
| 12 | 260 |

### X: 0 to 20 (spacing = 11px per unit)
| Data | Pixel |
|------|-------|
| 0 | 40 |
| 5 | 95 |
| 10 | 150 |
| 15 | 205 |
| 20 | 260 |

---

## Common Y-Axis Scales

Use these pre-calculated values (ORIGIN_Y=170, PLOT_HEIGHT=150):

### Y: 0 to 100 (spacing = 1.5px per unit)
| Data | Pixel |
|------|-------|
| 0 | 170 |
| 25 | 132.5 |
| 50 | 95 |
| 75 | 57.5 |
| 100 | 20 |

### Y: 0 to 80 (spacing = 1.875px per unit)
| Data | Pixel |
|------|-------|
| 0 | 170 |
| 20 | 132.5 |
| 40 | 95 |
| 60 | 57.5 |
| 80 | 20 |

### Y: 0 to 200 (spacing = 0.75px per unit)
| Data | Pixel |
|------|-------|
| 0 | 170 |
| 50 | 132.5 |
| 100 | 95 |
| 150 | 57.5 |
| 200 | 20 |

### Y: 0 to 400 (spacing = 0.375px per unit)
| Data | Pixel |
|------|-------|
| 0 | 170 |
| 100 | 132.5 |
| 200 | 95 |
| 300 | 57.5 |
| 400 | 20 |

---

## Checklist Before Finalizing

Before finishing any SVG coordinate plane, verify:

- [ ] **Grid vertical lines** use the same X values as the X-axis labels
- [ ] **Grid horizontal lines** use the same Y values as the Y-axis labels
- [ ] **Data points** are calculated using the same formula as grid lines
- [ ] **Origin point** (data 0,0) renders at pixel (40, 170)
- [ ] **Max point** (data X_MAX, Y_MAX) renders at pixel (260, 20)
- [ ] **All intermediate points** lie exactly on grid intersections when they should

---

## Common Mistakes to Avoid

### WRONG: Hardcoded unrelated grid positions
```html
<!-- BAD: Grid lines don't match labels -->
<line x1="100" y1="20" x2="100" y2="170"/>  <!-- Grid at x=100 -->
<text x="95" y="185">2</text>                 <!-- Label at x=95 - MISMATCH! -->
```

### CORRECT: Grid and labels use same positions
```html
<!-- GOOD: Grid lines match labels -->
<line x1="95" y1="20" x2="95" y2="170"/>   <!-- Grid at x=95 -->
<text x="95" y="185">2</text>               <!-- Label at x=95 - ALIGNED! -->
```

### WRONG: Inconsistent spacing
```html
<!-- BAD: Spacing not uniform -->
<text x="40">0</text>   <!-- 0 at 40 -->
<text x="100">2</text>  <!-- 2 at 100 (60px from 0) -->
<text x="150">4</text>  <!-- 4 at 150 (50px from 2) - WRONG! -->
```

### CORRECT: Uniform spacing
```html
<!-- GOOD: Each tick is 55px apart -->
<text x="40">0</text>   <!-- 0 at 40 -->
<text x="95">2</text>   <!-- 2 at 95 (55px from 0) -->
<text x="150">4</text>  <!-- 4 at 150 (55px from 2) -->
```

---

## Printable Worksheet SVG (Smaller, B&W)

For printable worksheets, use a smaller viewBox and monochrome colors:

```html
<svg viewBox="0 0 200 150" style="width: 100%; max-height: 120px;">
    <!-- Smaller plot area: origin at (30, 120), width 150, height 100 -->

    <!-- Grid -->
    <g stroke="#ccc" stroke-width="0.5">
        <line x1="67.5" y1="20" x2="67.5" y2="120"/>
        <line x1="105" y1="20" x2="105" y2="120"/>
        <line x1="142.5" y1="20" x2="142.5" y2="120"/>
        <line x1="180" y1="20" x2="180" y2="120"/>
        <line x1="30" y1="95" x2="180" y2="95"/>
        <line x1="30" y1="70" x2="180" y2="70"/>
        <line x1="30" y1="45" x2="180" y2="45"/>
        <line x1="30" y1="20" x2="180" y2="20"/>
    </g>

    <!-- Axes -->
    <line x1="30" y1="120" x2="180" y2="120" stroke="#000" stroke-width="1"/>
    <line x1="30" y1="20" x2="30" y2="120" stroke="#000" stroke-width="1"/>

    <!-- Labels (black for print) -->
    <text x="30" y="135" fill="#000" font-size="9" text-anchor="middle">0</text>
    <text x="67.5" y="135" fill="#000" font-size="9" text-anchor="middle">2</text>
    <text x="105" y="135" fill="#000" font-size="9" text-anchor="middle">4</text>
    <text x="142.5" y="135" fill="#000" font-size="9" text-anchor="middle">6</text>
    <text x="180" y="135" fill="#000" font-size="9" text-anchor="middle">8</text>

    <!-- Data line -->
    <line x1="30" y1="120" x2="180" y2="20" stroke="#000" stroke-width="2"/>
</svg>
```

---

## Integration with Slides

When creating slides with coordinate planes:

1. **Define your data range first** (X: 0-10, Y: 0-400)
2. **Calculate pixel positions** using the formulas above
3. **Write grid lines** at calculated positions
4. **Write labels** at the SAME calculated positions
5. **Plot data points** using the SAME formula
6. **Verify alignment** by checking that grid intersections match labeled values
