/**
 * Styling guide for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/styling.md
 * To update: Edit the markdown file in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS:
 * - Theme: Light (white background, dark text)
 * - Dimensions: 960×540px
 * - Fonts: Arial, Georgia only
 */

/**
 * Color palette for light theme slides (PPTX-compatible)
 */
export const COLOR_PALETTE = `
## Color Palette (PPTX-Compatible)

Use HEX colors directly (not CSS variables on text elements):

| Color | Hex | Usage |
|
`;

/**
 * Typography guidelines (web-safe fonts)
 */
export const TYPOGRAPHY = `
## Typography Hierarchy

\`\`\`
Step Badge:      13px bold uppercase (in pill)
Title (h1):      28px bold (primary color #1791e8)
Subtitle (p):    16px regular (dark text #1d1d1d)
Section Header:  15px bold
Body Text:       14px regular
Supporting:      13px regular
Footnotes:       10pt (use pt not px)
\`\`\`
`;

/**
 * Slide container structure (960×540px)
 */
export const SLIDE_CONTAINER = `
## Basic Slide Structure

\`\`\`html
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">STEP 1</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">IDENTIFY the slope and y-intercept</h1>
    <!-- Instruction Text -->
    <p style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">Look at the equation and find the values of m and b.</p>
  </div>

  <!-- Content Zone: 120-500px (380px height) -->
  <div class="fill-height col" style="padding: 10px 20px;">
    <!-- Main content here -->
  </div>

  <!-- Footnote Zone: 500-540px -->
  <p style="position: absolute; bottom: 8px; left: 20px; font-size: 10pt; color: #666666; margin: 0;">
    Lesson 4: Graphing Linear Equations
  </p>

</body>
\`\`\`
`;

/**
 * Content box styling (CFU, Answer boxes)
 */
export const CONTENT_BOXES = `

`;

/**
 * Complete styling guide for prompts
 */
export const STYLING_GUIDE = `
# Slide Styling Guide (PPTX-Compatible)

This document provides styling patterns for PPTX-compatible HTML slides.

**CRITICAL**: All slides must be compatible with html2pptx conversion.

## Core Principles

1. **Light backgrounds** (white #ffffff) for projection/printing
2. **High contrast text** (dark text #1d1d1d on light backgrounds)
3. **Blue accent color** (#1791e8) for emphasis and step headers
4. **Prominent step questions** - the main action/question is bold and colored
5. **Fixed dimensions** - exactly 960×540px
6. **Web-safe fonts only** - Arial, Georgia, Courier New
7. **Graphs on the right** - Text/tables on LEFT, graphs/visuals on RIGHT

## Two-Column Layout Rule (MANDATORY for graphs)

**When a slide contains a graph or coordinate plane:**

| Left Column (35-40%) | Right Column (60-65%) |
|---------------------|----------------------|
| Problem text | Graph/SVG visual |
| Tables | Coordinate plane |
| Bullets | Diagrams |
| CFU/Answer boxes | Images |

**Why graphs ALWAYS go on the right:**
- Consistent visual anchoring across all step slides
- Left-to-right reading flow: read problem → see visual
- Avoids tight vertical spacing when graph is below text
- PPTX export works better with side-by-side layout

**NEVER place graphs below the text column - always use side-by-side layout.**

---

## Layout Zones (All Slides)

Every slide follows this vertical structure:

| Zone | Y Position | Height | Purpose |
|------|-----------|--------|---------|
| **Title** | 0-100px | 100px | Slide title (\`<h1>\`) + subtitle |
| **Buffer** | 100-110px | 10px | Separation space |
| **Content** | 110-490px | 380px | Main content area |
| **Buffer** | 490-500px | 10px | Separation space |
| **Footnote** | 500-540px | 40px | Sources, page info (10pt font) |

---

## Basic Slide Structure

\`\`\`html
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">STEP 1</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">IDENTIFY the slope and y-intercept</h1>
    <!-- Instruction Text -->
    <p style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">Look at the equation and find the values of m and b.</p>
  </div>

  <!-- Content Zone: 120-500px (380px height) -->
  <div class="fill-height col" style="padding: 10px 20px;">
    <!-- Main content here -->
  </div>

  <!-- Footnote Zone: 500-540px -->
  <p style="position: absolute; bottom: 8px; left: 20px; font-size: 10pt; color: #666666; margin: 0;">
    Lesson 4: Graphing Linear Equations
  </p>

</body>
\`\`\`

## Color Palette (PPTX-Compatible)

Use HEX colors directly (not CSS variables on text elements):

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Blue) | #1791e8 | Step badges, h1 titles, accents |
| Surface (White) | #ffffff | Slide background |
| Foreground (Dark) | #1d1d1d | Body text |
| Muted (Light Gray) | #f5f5f5 | Content boxes, subtle backgrounds |
| Muted Text | #737373 | Secondary text, footnotes |
| CFU (Amber) | #fef3c7 | Check for understanding boxes |
| Answer (Green) | #dcfce7 | Answer reveal boxes |
| Border | #e5e7eb | Subtle borders |

## Typography Hierarchy

\`\`\`
Step Badge:      13px bold uppercase (in pill)
Title (h1):      28px bold (primary color #1791e8)
Subtitle (p):    16px regular (dark text #1d1d1d)
Section Header:  15px bold
Body Text:       14px regular
Supporting:      13px regular
Footnotes:       10pt (use pt not px)
\`\`\`

## Title Zone Pattern (MANDATORY)

**Every step slide MUST have this structure:**

\`\`\`html
<!-- Title Zone: 0-120px -->
<div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
  <!-- Step Badge -->
  <div class="row items-center gap-md" style="margin-bottom: 8px;">
    <div style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
      <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
    </div>
  </div>
  <!-- Main Question/Action - PROMINENT -->
  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
  <!-- Instruction Text -->
  <p style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
</div>
\`\`\`

**Why this matters:**
- The step question IS the learning focus - it must be prominent
- 28px bold blue makes it immediately visible
- Step badge provides context without competing
- Instruction text is secondary (smaller, neutral color)

## CFU (Check for Understanding) Box

\`\`\`html
<div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 12px; border-left: 4px solid #f59e0b;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">Why did I identify the slope first?</p>
</div>
\`\`\`

## Answer Box

\`\`\`html
<div style="background: #dcfce7; border-radius: 8px; padding: 16px; margin-top: 12px; border-left: 4px solid #22c55e;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">The slope (m = 2) tells us how steep the line is.</p>
</div>
\`\`\`

## SVG Graph Constraints

**CRITICAL for graph alignment:**

1. **Fixed container dimensions**: SVG container should be exactly 560×360px
2. **Use viewBox**: Always set \`viewBox="0 0 560 360"\` (or appropriate dimensions)
3. **Explicit width/height**: Set both on the \`<svg>\` element
4. **Center in container**: Use \`.center\` class on parent div
5. **Coordinate system**:
   - Origin at top-left of viewBox
   - Y-axis increases downward
   - For math graphs, transform to flip Y-axis

\`\`\`html
<div class="col center" style="width: 60%; background: #f5f5f5; border-radius: 8px; padding: 12px;">
  <svg viewBox="0 0 560 360" style="width: 540px; height: 340px;">
    <!-- Grid lines -->
    <!-- Axes -->
    <!-- Points and lines -->
  </svg>
</div>
\`\`\`

**Graph coordinate mapping:**
- Graph units should map consistently to pixels
- Example: if x-axis spans -10 to 10, that's 20 units
- With 540px width and 40px margins: 460px / 20 units = 23px per unit
- ALWAYS calculate: \`pixelX = marginLeft + (x - xMin) * pixelsPerUnit\`

## Layout Classes (Required for PPTX)

Use these classes instead of inline flexbox:

| Class | CSS Equivalent |
|-------|----------------|
| \`.row\` | \`display: flex; flex-direction: row;\` |
| \`.col\` | \`display: flex; flex-direction: column;\` |
| \`.fit\` | \`flex: 0 0 auto;\` |
| \`.fill-height\` | \`flex: 1 1 auto;\` |
| \`.fill-width\` | \`flex: 1 1 auto; width: 100%;\` |
| \`.center\` | \`display: flex; align-items: center; justify-content: center;\` |
| \`.items-center\` | \`align-items: center;\` |
| \`.gap-sm\` | \`gap: 8px;\` |
| \`.gap-md\` | \`gap: 12px;\` |
| \`.gap-lg\` | \`gap: 20px;\` |

**❌ NEVER use:**
\`\`\`html
<div style="display: flex; flex-direction: row;">
\`\`\`

**✅ ALWAYS use:**
\`\`\`html
<div class="row">
\`\`\`

## Common Mistakes to Avoid

1. **Text outside proper tags**: All text MUST be in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\`
2. **Manual bullets**: Never use \`•\`, \`-\`, \`*\` - use \`<ul><li>\`
3. **CSS variables on text**: Use hex colors directly (\`#1791e8\` not \`var(--color-primary)\`)
4. **Inline flexbox**: Use \`.row\`/\`.col\` classes
5. **Backgrounds on text elements**: Only use on \`<div>\`, not on \`<p>\` or \`<h1>\`
6. **Wrong dimensions**: Body MUST be exactly 960×540px
7. **Custom fonts**: Only Arial, Georgia, Courier New

## Annotation Techniques

When showing steps on slides, use these techniques to highlight changes:

| Technique | Use For | CSS Example |
|-----------|---------|-------------|
| **Highlight row** | Emphasizing table data | \`background: rgba(23, 145, 232, 0.1);\` |
| **Border/outline** | Circling elements | \`border: 2px solid #1791e8;\` |
| **Strike-through** | Removed items | \`text-decoration: line-through; opacity: 0.5;\` |
| **Color change** | Before/after states | Different background colors |

**Remember:** Keep the main visual in the SAME position across slides. Add annotations around it.

---

## Printable Worksheet (Different from Slides)

The printable worksheet uses DIFFERENT styling:

- **White background** (#ffffff)
- **Black text** (#000000)
- **Times New Roman font** for print
- **8.5in × 11in** page size
- **@media print** CSS rules
- **page-break-after: always** between pages

See \`printable-slide-snippet.html\` for the template.
`;

/**
 * SVG Coordinate Planes Reference
 *
 * CRITICAL: This contains the formulas and pre-calculated pixel tables
 * that ensure grid lines, labels, and data points align correctly.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/svg-graphs.md
 */
export const SVG_COORDINATE_PLANES = `
# SVG Coordinate Plane Reference

This document covers **grid alignment and pixel calculations** for SVG graphs.

---

## ⚠️ ANNOTATION DIRECTIVE

**When adding annotations to graphs (y-intercept labels, arrows, line equations):**

\`\`\`
Read: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/annotation-snippet.html
\`\`\`

That HTML file contains copy-paste snippets with:
- Correct font styling (\`font-weight="normal"\`, \`font-size="9"\`)
- Zone positions (where each annotation type goes)
- Arrow marker template with proper sizing

**Do NOT create annotations without reading that file first.**

---

## CRITICAL: Grid Alignment Rules

**The #1 problem with SVG graphs is misaligned grids.** Follow these rules:

### Rule 1: Use Consistent Spacing Formula

All coordinate calculations MUST use the same linear interpolation formula:

\`\`\`
pixelX = ORIGIN_X + (dataX / X_MAX) * PLOT_WIDTH
pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT
\`\`\`

Where:
- \`ORIGIN_X\`, \`ORIGIN_Y\` = pixel coordinates of the origin (0,0) point
- \`PLOT_WIDTH\` = width of the plot area in pixels
- \`PLOT_HEIGHT\` = height of the plot area in pixels
- \`X_MAX\`, \`Y_MAX\` = maximum data values on each axis

### Rule 2: Grid Lines Must Match Labels

If you place a label at x=40 for value "0", x=150 for value "5", and x=260 for value "10":
- Grid lines MUST be at x=40, 150, 260 (NOT different values)
- The spacing is (260-40)/(10-0) = 22 pixels per unit

### Rule 3: Define Constants First

Before writing any SVG, define these values:

\`\`\`
ORIGIN_X = 40      // Left edge of plot (after Y-axis labels)
ORIGIN_Y = 170     // Bottom edge of plot (above X-axis labels)
PLOT_WIDTH = 220   // Width from origin to right edge
PLOT_HEIGHT = 150  // Height from origin to top edge
X_MAX = 10         // Maximum X value
Y_MAX = 100        // Maximum Y value
\`\`\`

---

## CRITICAL: Axis Requirements

**Every coordinate plane MUST have all 5 elements:**

### 1. Tick Marks at Each Label Position

\`\`\`html
<!-- X-axis ticks (5px below axis, from y=170 to y=175) -->
<g stroke="#1e293b" stroke-width="1.5">
    <line x1="40" y1="170" x2="40" y2="175"/>
    <line x1="95" y1="170" x2="95" y2="175"/>
    <line x1="150" y1="170" x2="150" y2="175"/>
    <!-- ... one tick per label position -->
</g>

<!-- Y-axis ticks (5px left of axis, from x=35 to x=40) -->
<g stroke="#1e293b" stroke-width="1.5">
    <line x1="35" y1="170" x2="40" y2="170"/>
    <line x1="35" y1="132.5" x2="40" y2="132.5"/>
    <!-- ... one tick per label position -->
</g>
\`\`\`

### 2. Arrowheads on Both Axes

\`\`\`html
<defs>
  <marker id="axis-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b"/>
  </marker>
</defs>

<!-- X-axis with arrow (extends 10px past last label) -->
<line x1="40" y1="170" x2="275" y2="170" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow)"/>

<!-- Y-axis with arrow (extends 10px past last label) -->
<line x1="40" y1="180" x2="40" y2="5" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow)"/>
\`\`\`

### 3. Single "0" at Origin (NOT two separate zeros)

\`\`\`html
<!-- ONE zero label at origin, positioned to serve both axes -->
<text x="33" y="182" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">0</text>
\`\`\`

**WRONG:**
\`\`\`html
<!-- DON'T do this - two separate zeros -->
<text x="40" y="185">0</text>  <!-- X-axis zero -->
<text x="35" y="174">0</text>  <!-- Y-axis zero - WRONG! -->
\`\`\`

### 3. Complete Scale Labels (to the arrows)

Labels must go all the way to the last tick mark before the arrow:
- X-axis: 0, 10, 20, 30, 40, 50 (if X_MAX=50)
- Y-axis: 0, 10, 20, 30, 40, 50 (if Y_MAX=50)

**Scale must be consistent** - use increments of 5, 10, 20, 25, 50, or 100.

### 4. Axis Labels (Optional)

If including axis labels like "x" and "y":
\`\`\`html
<text x="280" y="175" fill="#64748b" font-family="Arial" font-size="12" font-style="italic">x</text>
<text x="45" y="8" fill="#64748b" font-family="Arial" font-size="12" font-style="italic">y</text>
\`\`\`

---

## CRITICAL: Line Extension Rules

**Lines must extend to the edges of the plot area** with arrows showing they continue beyond.

### How to Calculate Line Endpoints

For a line y = mx + b within plot area (0, 0) to (X_MAX, Y_MAX):

**Step 1: Calculate where line intersects plot boundaries**
\`\`\`
Left edge (x=0):    y = b
Right edge (x=X_MAX): y = m × X_MAX + b
Top edge (y=Y_MAX):   x = (Y_MAX - b) / m
Bottom edge (y=0):    x = -b / m
\`\`\`

**Step 2: Determine entry point (where line enters plot area)**
- If 0 ≤ b ≤ Y_MAX: entry is **(0, b)** on left edge
- If b < 0: entry is **(-b/m, 0)** on bottom edge
- If b > Y_MAX: entry is **((Y_MAX-b)/m, Y_MAX)** on top edge

**Step 3: Determine exit point (where line exits plot area)**
- Calculate y at x=X_MAX: \`y_exit = m × X_MAX + b\`
- If 0 ≤ y_exit ≤ Y_MAX: exit is **(X_MAX, y_exit)** on right edge
- If y_exit > Y_MAX: exit is **((Y_MAX-b)/m, Y_MAX)** on top edge
- If y_exit < 0: exit is **(-b/m, 0)** on bottom edge

**Step 4: Draw line with arrow at exit point**
- Use \`marker-end="url(#line-arrow)"\` to show line continues

### Line Arrow Marker (separate from axis arrows)

\`\`\`html
<defs>
    <marker id="line-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="currentColor"/>
    </marker>
</defs>
\`\`\`

### Examples

**Example 1: y = 10x (steep, hits top before right edge)**
- X_MAX=8, Y_MAX=80
- Entry: (0, 0) — starts at origin
- At x=8: y=80 — exactly at corner
- Exit: (8, 80) — right-top corner
- Draw: \`<line x1="40" y1="170" x2="260" y2="20" ... marker-end="url(#line-arrow)"/>\`

**Example 2: y = 5x + 20 (moderate slope, y-intercept at 20)**
- X_MAX=8, Y_MAX=80
- Entry: (0, 20) — left edge at y=20
- At x=8: y=60 — still within Y_MAX
- Exit: (8, 60) — right edge at y=60
- Draw: from (0,20) to (8,60) with arrow

**Example 3: y = 20x (very steep, exits through top)**
- X_MAX=8, Y_MAX=80
- Entry: (0, 0) — origin
- At x=4: y=80 — hits top
- Exit: (4, 80) — top edge at x=4
- Draw: from (0,0) to (4,80) with arrow pointing up-right

### Pixel Conversion for Line Endpoints

After calculating data coordinates, convert to pixels:
\`\`\`
pixelX = 40 + (dataX / X_MAX) * 220
pixelY = 170 - (dataY / Y_MAX) * 150
\`\`\`

---

## ⚠️ START HERE: Graph Snippet Template

**For a complete, copy-paste ready coordinate plane:**
\`\`\`
READ: ../templates/graph-snippet.html
\`\`\`

That HTML file is your **starting point** for all SVG graphs. It contains:
- Arrow marker definitions for both axes and lines
- Complete grid with proper alignment
- Single "0" at origin
- Complete scale labels to the arrows
- Example data lines with extension arrows

**DO NOT create graphs from scratch.** Copy and modify from graph-snippet.html.

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

\`\`\`javascript
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
\`\`\`

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

**Grid Alignment:**
- [ ] **Grid vertical lines** use the same X values as the X-axis labels
- [ ] **Grid horizontal lines** use the same Y values as the Y-axis labels
- [ ] **Data points** are calculated using the same formula as grid lines
- [ ] **Origin point** (data 0,0) renders at pixel (40, 170)
- [ ] **Max point** (data X_MAX, Y_MAX) renders at pixel (260, 20)
- [ ] **All intermediate points** lie exactly on grid intersections when they should

**Element Overlap Prevention:**
- [ ] **Arrow markers** use small size (markerWidth="6" markerHeight="4")
- [ ] **Arrow stroke** uses stroke-width="2" (not 3)
- [ ] **Point labels** don't overlap data points, axes, or each other
- [ ] **Annotation text** is positioned away from arrows and points
- [ ] **No elements** overlap the axis lines or labels

---

## Common Mistakes to Avoid

### WRONG: Hardcoded unrelated grid positions
\`\`\`html
<!-- BAD: Grid lines don't match labels -->
<line x1="100" y1="20" x2="100" y2="170"/>  <!-- Grid at x=100 -->
<text x="95" y="185">2</text>                 <!-- Label at x=95 - MISMATCH! -->
\`\`\`

### CORRECT: Grid and labels use same positions
\`\`\`html
<!-- GOOD: Grid lines match labels -->
<line x1="95" y1="20" x2="95" y2="170"/>   <!-- Grid at x=95 -->
<text x="95" y="185">2</text>               <!-- Label at x=95 - ALIGNED! -->
\`\`\`

### WRONG: Inconsistent spacing
\`\`\`html
<!-- BAD: Spacing not uniform -->
<text x="40">0</text>   <!-- 0 at 40 -->
<text x="100">2</text>  <!-- 2 at 100 (60px from 0) -->
<text x="150">4</text>  <!-- 4 at 150 (50px from 2) - WRONG! -->
\`\`\`

### CORRECT: Uniform spacing
\`\`\`html
<!-- GOOD: Each tick is 55px apart -->
<text x="40">0</text>   <!-- 0 at 40 -->
<text x="95">2</text>   <!-- 2 at 95 (55px from 0) -->
<text x="150">4</text>  <!-- 4 at 150 (55px from 2) -->
\`\`\`

---

## CRITICAL: Preventing Element Overlap

**The #2 problem with SVG graphs is overlapping elements** - labels covering points, arrows blocking axes, annotations colliding with each other. Follow these rules:

### Rule 1: Use Smaller Element Sizes

Default sizes that prevent most overlaps:

| Element | Recommended Size | Max Size |
|---------|-----------------|----------|
| Data point circles | r="4" to r="5" | r="6" |
| Point labels | font-size="9" to "10" | font-size="11" |
| Arrow stroke width | stroke-width="2" | stroke-width="3" |
| Arrow markers | markerWidth="6" markerHeight="4" | markerWidth="8" markerHeight="5" |
| Annotation text | font-size="9" | font-size="11" |

### Rule 2: Arrow Marker Template (Small)

Use this smaller arrow marker definition to prevent overlap:

\`\`\`html
<defs>
    <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
    </marker>
</defs>
<line x1="100" y1="50" x2="100" y2="100" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowhead)"/>
\`\`\`

**NOT this (too large):**
\`\`\`html
<!-- BAD: Oversized markers overlap nearby elements -->
<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
</marker>
\`\`\`

### Rule 3: Label Positioning Strategy

**Point labels** - Position AWAY from other elements:
- If point is in upper area: place label ABOVE (y - 10px)
- If point is in lower area: place label BELOW (y + 15px)
- If two points are close horizontally: stagger labels (one above, one below)
- Never place labels directly on the axes

**Annotation labels** (rise/run, change in y/x):
- Position to the LEFT of vertical arrows (x - 25px)
- Position BELOW horizontal arrows (y + 15px)
- Use smaller font-size="9" for annotations

### Rule 4: Check These Common Overlap Scenarios

Before finalizing, verify NO overlaps between:

- [ ] Point labels and data points
- [ ] Point labels and axis labels
- [ ] Point labels and grid lines (especially at intersections)
- [ ] Arrow markers and data points
- [ ] Arrow markers and axes
- [ ] Annotation text and arrows
- [ ] Two point labels (when points are close together)

### Rule 5: Minimum Spacing Guidelines

Maintain these minimum pixel distances:

| Between | Minimum Distance |
|---------|-----------------|
| Point label and point center | 10px |
| Point label and axis | 15px |
| Two point labels | 20px |
| Arrow end and target point | 5px gap |
| Annotation text and arrow line | 3px |

### Example: Properly Spaced Annotations

\`\`\`html
<!-- Good: Small arrows with offset labels -->
<defs>
    <marker id="arrow-y" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
    </marker>
</defs>

<!-- Vertical arrow with label to the left -->
<line x1="113" y1="57" x2="113" y2="108" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-y)"/>
<text x="90" y="85" fill="#ef4444" font-size="9" font-weight="bold">Change in y</text>
<text x="90" y="95" fill="#ef4444" font-size="9">= −75</text>

<!-- Point with label above (not overlapping arrow) -->
<circle cx="113" cy="57" r="5" fill="#60a5fa"/>
<text x="113" y="47" fill="#60a5fa" font-size="10" text-anchor="middle">(2, 150)</text>
\`\`\`

---

## Printable Worksheet SVG (Smaller, B&W)

For printable worksheets, use a smaller viewBox and monochrome colors:

\`\`\`html
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
\`\`\`

---

## Integration with Slides

When creating slides with coordinate planes:

1. **Define your data range first** (X: 0-10, Y: 0-400)
2. **Calculate pixel positions** using the formulas above
3. **Write grid lines** at calculated positions
4. **Write labels** at the SAME calculated positions
5. **Plot data points** using the SAME formula
6. **Verify alignment** by checking that grid intersections match labeled values
`;

/**
 * Graph Planning Reference
 *
 * Semantic guidance for planning coordinate plane graphs:
 * - How to calculate X_MAX and Y_MAX from equations
 * - How to choose appropriate scales
 * - How to plan annotations (y-intercept shifts, parallel labels, etc.)
 *
 * This should be used BEFORE pixel implementation (SVG_COORDINATE_PLANES).
 *
 * Source: .claude/skills/create-worked-example-sg/phases/01-collect-and-analyze/graph-planning.md
 */
export const GRAPH_PLANNING = `
# Graph Planning (Required for Coordinate Planes)

**When to read this file:** You identified "SVG graphs" or "coordinate planes" as your visual type in Step 1.3e.

**Purpose:** Complete semantic planning for your graph BEFORE any pixel-level implementation.

---

## MANDATORY: Complete All Steps Below

If you skip this planning, your graph will have incorrect scales or misplaced annotations.

---

## Step 1: List Your Equations/Data

Write out every line or data series that will appear on the graph:

\`\`\`
Line 1: [equation, e.g., y = 3x]
Line 2: [equation, e.g., y = 3x + 50]
Line 3: [if applicable]
\`\`\`

---

## Step 2: Calculate Data Ranges

### Find X_MAX
Choose the rightmost x-value you need to show. Common values: 4, 5, 6, 8, 10

\`\`\`
X_MAX = [your value]
\`\`\`

### Find Y_MAX
For EACH line, calculate Y at x=0 and x=X_MAX:

\`\`\`
Line 1: y = [equation]
  - At x=0: y = [calculate]
  - At x=X_MAX: y = [calculate]

Line 2: y = [equation]
  - At x=0: y = [calculate]
  - At x=X_MAX: y = [calculate]

Largest Y value across all lines: [value]
\`\`\`

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

\`\`\`
Y_MAX = [your rounded value]
\`\`\`

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

\`\`\`
X-axis labels: [your labels]
X scale: [increment between labels]
\`\`\`

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

\`\`\`
Y-axis labels: [your labels]
Y scale: [increment between labels]
\`\`\`

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

\`\`\`
Key relationship: [what to emphasize]
Annotation type: [from table above]
\`\`\`

---

## Step 5: Plan Annotation Position

### For Y-Intercept Shift (Parallel Lines)

The vertical arrow showing the shift goes **LEFT of the y-axis**:

\`\`\`
Arrow X position: ORIGIN_X - 15 pixels (left of axis)
Arrow starts at: pixelY of first y-intercept
Arrow ends at: pixelY of second y-intercept
Label: the numerical difference (e.g., "50 units")
\`\`\`

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

\`\`\`
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
\`\`\`

---

## Example: Comparing y = 3x and y = 3x + 50

\`\`\`
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
\`\`\`

---

## Add Graph Plan to Your PROBLEM ANALYSIS

After completing this planning, add the GRAPH PLAN section to your PROBLEM ANALYSIS output in Phase 1.

This plan will be referenced in Phase 3 when you implement the SVG.

---

## Pixel Implementation

When you reach Phase 3 and need to convert your graph plan to actual SVG pixels, reference:

\`\`\`
Read: .claude/skills/create-worked-example-sg/reference/svg-pixel-tables.md
\`\`\`

That file contains the pixel lookup tables for converting your planned scale to actual SVG coordinates.
`;
