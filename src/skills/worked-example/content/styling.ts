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

## PPTX Export Attributes (REQUIRED)

Every slide element that needs precise positioning in PowerPoint must have \`data-pptx-*\` attributes:

\`\`\`html
<div data-pptx-region="badge"
     data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35">
\`\`\`

| Attribute | Purpose |
|-----------|---------|
| \`data-pptx-region\` | Region type (badge, title, subtitle, content, cfu-box, answer-box, svg-container, footnote) |
| \`data-pptx-x\` | X position in pixels (0-960) |
| \`data-pptx-y\` | Y position in pixels (0-540) |
| \`data-pptx-w\` | Width in pixels |
| \`data-pptx-h\` | Height in pixels |

**Standard positions:**

| Region | x | y | w | h |
|--------|---|---|---|---|
| Badge | 20 | 16 | 180 | 35 |
| Title | 20 | 55 | 920 | 40 |
| Subtitle | 20 | 100 | 920 | 30 |
| Content | 20 | 130 | 920 | 370 |
| CFU/Answer Box | 653 | 40 | 280 | 115 |
| Footnote | 700 | 8 | 240 | 25 |

**SVG Layer Attributes (for multi-layer export):**

Each \`data-pptx-layer\` group becomes a separate, tightly-cropped PNG image that can be moved independently in PowerPoint/Google Slides.

**GRANULAR LAYER APPROACH** - Use separate layers for each element you want to be independently movable:

\`\`\`html
<!-- Base graph is usually one layer -->
<g data-pptx-layer="base-graph"><!-- Grid, axes, labels --></g>

<!-- Each data line should be its own layer -->
<g data-pptx-layer="line-1"><!-- Blue line + point --></g>
<g data-pptx-layer="line-2"><!-- Green line + point --></g>

<!-- Each annotation element should be its own layer -->
<g data-pptx-layer="label-b0"><!-- Y-intercept label --></g>
<g data-pptx-layer="label-b20"><!-- Y-intercept label --></g>
<g data-pptx-layer="arrow-shift"><!-- Shift arrow --></g>
<g data-pptx-layer="eq-line-1"><!-- Equation label --></g>
\`\`\`

**Naming Convention:**
- \`line-N\` for data lines and their associated points
- \`label-X\` for text annotations (X = descriptive suffix like "b0", "shift20")
- \`arrow-X\` for arrows (X = descriptive suffix like "shift", "highlight")
- \`eq-N\` for equation labels (N = line number)
- \`point-X\` for point labels (X = coordinates like "3,9")

Export automatically crops each layer to its tight bounding box, making small elements easy to select and manipulate.

---

## Common Mistakes to Avoid

1. **Text outside proper tags**: All text MUST be in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\`
2. **Manual bullets**: Never use \`•\`, \`-\`, \`*\` - use \`<ul><li>\`
3. **CSS variables on text**: Use hex colors directly (\`#1791e8\` not \`var(--color-primary)\`)
4. **Inline flexbox**: Use \`.row\`/\`.col\` classes
5. **Backgrounds on text elements**: Only use on \`<div>\`, not on \`<p>\` or \`<h1>\`
6. **Wrong dimensions**: Body MUST be exactly 960×540px
7. **Custom fonts**: Only Arial, Georgia, Courier New
8. **Missing data-pptx attributes**: Every positioned element needs \`data-pptx-region\` and position attributes

## Annotation Techniques

When showing steps on slides, use these techniques to highlight changes:

| Technique | Use For | CSS Example |
|-----------|---------|-------------|
| **Highlight row** | Emphasizing table data | \`background: #e8f4fd;\` |
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

**Responsibility:** Pixel formulas, pre-calculated tables, and validation rules.

---

## ⚠️ REQUIRED: Read the HTML Files First

**Before using this reference, you MUST read these files:**

\`\`\`
READ: ../card-patterns/complex-patterns/graph-snippet.html
READ: ../card-patterns/complex-patterns/annotation-snippet.html
\`\`\`

**This markdown file does NOT contain HTML code.** It contains only formulas and tables for calculating pixel positions. The HTML patterns you will copy and modify are in the files above.

---

## Document Roles

| File | Role | When to Read |
|------|------|--------------|
| **graph-snippet.html** | SOURCE OF TRUTH for SVG structure | READ FIRST, then COPY |
| **annotation-snippet.html** | SOURCE OF TRUTH for annotation patterns | READ when adding labels |
| **svg-graphs.md** (this file) | Calculation reference | READ when you need formulas |
| **annotation-zones.md** | Zone diagram | QUICK LOOKUP for placement |

**Workflow:**
1. \`READ graph-snippet.html\` → COPY the SVG
2. \`READ this file\` → Calculate your scale's pixel positions
3. \`MODIFY\` the copied SVG with calculated values
4. \`READ annotation-snippet.html\` → COPY annotation patterns

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

## ⚠️ REMINDER: Start from graph-snippet.html

**For a complete, copy-paste ready coordinate plane:**
\`\`\`
READ: ../card-patterns/complex-patterns/graph-snippet.html
\`\`\`

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

### Rule 2: Arrow Marker Sizes

Use small markers (defined in \`graph-snippet.html\` and \`annotation-snippet.html\`):
- \`markerWidth="6" markerHeight="4"\` ✅ (correct)
- \`markerWidth="10" markerHeight="7"\` ❌ (too large, overlaps)

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

### Example

See \`annotation-snippet.html\` for properly spaced annotation examples with correct sizing.

---

## Printable Worksheet SVG

For printable slides, use smaller dimensions and monochrome colors. See \`printable-slide-snippet.html\` for complete example.

**Key differences from projection SVG:**
- Smaller viewBox (200×150 vs 280×200)
- Black on white colors only
- No arrows/animation

---

## PPTX Layer System

Each SVG element that should be independently selectable needs \`data-pptx-layer\`:

| Prefix | Use For | Example |
|--------|---------|---------|
| \`line-N\` | Data lines and their points | \`line-1\`, \`line-2\` |
| \`label-X\` | Text annotations | \`label-b0\`, \`label-shift20\` |
| \`arrow-X\` | Arrow annotations | \`arrow-shift\`, \`arrow-highlight\` |
| \`eq-N\` | Equation labels | \`eq-line-1\`, \`eq-line-2\` |

See \`graph-snippet.html\` for the complete layer structure implementation.

---

## Workflow Summary

1. **COPY** \`graph-snippet.html\` as your starting point
2. **READ** this file for formulas and pre-calculated tables
3. **CALCULATE** pixel positions for your specific scale
4. **MODIFY** the copied HTML with calculated values
5. **ADD** annotations from \`annotation-snippet.html\`
6. **VERIFY** grid lines align with axis labels
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

**Choose the smallest Y_MAX that fits your data AND keeps ticks ≤10.**

| If largest Y is... | Use Y_MAX | Increment | Ticks |
|-------------------|-----------|-----------|-------|
| ≤ 6 | 6 | 1 | 7 |
| 7-8 | 8 | 1 | 9 |
| 9 | 9 | 1 | 10 |
| 10-16 | 16 | 2 | 9 |
| 17-18 | 18 | 2 | 10 |
| 19-36 | 36 | 4 | 10 |
| 37-45 | 45 | 5 | 10 |
| 46-72 | 72 | 8 | 10 |
| 73-90 | 90 | 10 | 10 |
| 91-180 | 180 | 20 | 10 |

**Note:** These Y_MAX values are chosen to give exactly 9-10 ticks with clean increments.

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

Based on your Y_MAX, use these labels. **Target: ≤10 ticks** (never exceed 10).

**Priority:** Use smallest whole-number increment possible. Count by 1s or 2s when Y_MAX allows.

**If you need more than 10 ticks, reduce Y_MAX slightly** to hit exactly 9-10 ticks.

| Y_MAX | Y-axis labels (bottom to top) | Y scale (increment) | Ticks |
|-------|------------------------------|---------------------|-------|
| 6 | 0, 1, 2, 3, 4, 5, 6 | 1 | 7 |
| 8 | 0, 1, 2, 3, 4, 5, 6, 7, 8 | 1 | 9 |
| 9 | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 | 1 | 10 |
| 16 | 0, 2, 4, 6, 8, 10, 12, 14, 16 | 2 | 9 |
| 18 | 0, 2, 4, 6, 8, 10, 12, 14, 16, 18 | 2 | 10 |
| 36 | 0, 4, 8, 12, 16, 20, 24, 28, 32, 36 | 4 | 10 |
| 45 | 0, 5, 10, 15, 20, 25, 30, 35, 40, 45 | 5 | 10 |
| 72 | 0, 8, 16, 24, 32, 40, 48, 56, 64, 72 | 8 | 10 |
| 90 | 0, 10, 20, 30, 40, 50, 60, 70, 80, 90 | 10 | 10 |
| 180 | 0, 20, 40, 60, 80, 100, 120, 140, 160, 180 | 20 | 10 |

**Formula:** For increment I, max Y_MAX = I × 9 (to get 10 ticks including 0)

| Increment | Max Y_MAX for 10 ticks |
|-----------|------------------------|
| 1 | 9 |
| 2 | 18 |
| 4 | 36 |
| 5 | 45 |
| 8 | 72 |
| 10 | 90 |
| 20 | 180 |

\`\`\`
Y-axis labels: [your labels]
Y scale: [increment between labels]
\`\`\`

---

## Step 4: Calculate Line Endpoints (CRITICAL)

**This step ensures mathematically accurate line drawing.**

For each line equation y = mx + b, calculate:
- **Start point**: Where the line enters the plot (usually at x=0, the y-intercept)
- **End point**: Where the line exits the plot (usually at x=X_MAX)

### Formula

\`\`\`
Start Point: (x=0, y=b)              -- where b is the y-intercept
End Point:   (x=X_MAX, y=m*X_MAX+b)  -- plug X_MAX into the equation
\`\`\`

### Example Calculations

**Given:** Line 1: y = 5x, Line 2: y = 5x + 20, X_MAX = 8

\`\`\`
Line 1: y = 5x (slope=5, y-intercept=0)
  - Start point: (0, 0)
  - End point: (8, 5*8 + 0) = (8, 40)

Line 2: y = 5x + 20 (slope=5, y-intercept=20)
  - Start point: (0, 20)
  - End point: (8, 5*8 + 20) = (8, 60)
\`\`\`

### Edge Cases

If a line exits through the TOP of the plot before reaching X_MAX:
- Calculate where y = Y_MAX: x = (Y_MAX - b) / m
- Use that x value as the end point's x coordinate

\`\`\`
Example: y = 20x with X_MAX=8, Y_MAX=80
  - At x=8: y = 160 (exceeds Y_MAX=80!)
  - Line exits at top: x = (80 - 0) / 20 = 4
  - End point: (4, 80) instead of (8, 160)
\`\`\`

### Record Your Line Endpoints

\`\`\`
Line 1: y = [equation]
  - Start point: ([x], [y])
  - End point: ([x], [y])

Line 2: y = [equation]
  - Start point: ([x], [y])
  - End point: ([x], [y])
\`\`\`

**⚠️ These values will be used DIRECTLY in the SVG line element as x1, y1, x2, y2 coordinates (after pixel conversion).**

---

## Step 5: Identify the Mathematical Relationship to Annotate

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

## Example: Comparing y = 3x and y = 3x + 15

\`\`\`
GRAPH PLAN
==========
Equations:
- Line 1: y = 3x (blue)
- Line 2: y = 3x + 15 (green)

Scale:
- X range: 0 to 6
- X-axis labels: 0, 1, 2, 3, 4, 5, 6
- X scale: 1
- Calculations:
  - Line 1 at x=6: y = 18
  - Line 2 at x=6: y = 33
  - Largest Y = 33 → use Y_MAX = 36 (from table: 19-36 → 36)
- Y range: 0 to 36
- Y-axis labels: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36
- Y scale: 4 (gives exactly 10 ticks)

Annotation:
- Relationship to show: Y-intercept shift (parallel lines)
- Annotation type: Vertical double-arrow between y-intercepts
- Position: Left of y-axis (x = ORIGIN_X - 15)
- Arrow from: y=0 to y=15
- Label: "+15"

Visual notes:
- Both lines should be clearly visible
- 10 ticks on Y-axis for clear reading
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

/**
 * Diagram Patterns Reference (PRIMARY REFERENCE for non-graph SVGs)
 *
 * Visual structure reference for common middle school math representations:
 * - Double Number Lines (ratios, percentages)
 * - Tape Diagrams (part-whole, comparisons)
 * - Hanger Diagrams (equation solving, balance)
 * - Area Models (multiplication, distributive property)
 * - Input-Output Tables (functions, patterns)
 * - Ratio Tables (equivalent ratios)
 *
 * Based on Illustrative Mathematics (IM) curriculum representations.
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/diagram-patterns.md
 */
export const DIAGRAM_PATTERNS = `
# Diagram Patterns for Middle School Math

Visual structure reference for common math representations used in Illustrative Mathematics (IM) curriculum.

**This is the PRIMARY REFERENCE for all non-graph SVG diagrams.** When creating SVG visuals for worked examples, match these patterns to ensure students see familiar representations.

---

## Double Number Line
**Use for:** Ratios, percentages, proportional reasoning, unit rates
**IM Grade Level:** Grade 6 Unit 2 (introduced), used through Grade 7

\`\`\`
 0        3        6        9       12   ← Quantity A (e.g., cups of flour)
 |--------|--------|--------|--------|
 |--------|--------|--------|--------|
 0        2        4        6        8   ← Quantity B (e.g., pints of water)
\`\`\`

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
\`\`\`
┌──────────────┬──────────────┬──────────────┐
│    Part A    │    Part B    │    Part C    │
│      2x      │      3x      │      5x      │
└──────────────┴──────────────┴──────────────┘
├──────────────────── Total: 60 ────────────────┤
\`\`\`

### Comparison tape (two quantities):
\`\`\`
Maria:  ┌────────┬────────┬────────┐
        │   x    │   x    │   x    │  ← 3 units
        └────────┴────────┴────────┘

Juan:   ┌────────┐
        │   x    │  ← 1 unit
        └────────┘
\`\`\`

### Compare problem (bigger/smaller/difference):
\`\`\`
Bigger:   ┌────────────────────────────────┐
          │              45                │
          └────────────────────────────────┘

Smaller:  ┌────────────────────┐
          │         28         │
          └────────────────────┘
                               ├─ ? ─┤  ← Difference
\`\`\`

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
\`\`\`
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
\`\`\`

### With shapes (for visual weight):
\`\`\`
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
\`\`\`

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
\`\`\`
  ←──┼────┼────┼────┼────┼────┼────┼────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
\`\`\`

### With points marked:
\`\`\`
  ←──┼────┼────┼────●────┼────┼────○────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
                    ↑              ↑
                   -1              2
     ● = closed (included)    ○ = open (excluded)
\`\`\`

### With jump arrows (for operations):
\`\`\`
                    +5
              ┌──────────────┐
              ↓              ↓
  ←──┼────┼────┼────┼────┼────┼────┼────┼────┼──→
    -4   -3   -2   -1    0    1    2    3    4
\`\`\`

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
\`\`\`
              20          3
         ┌──────────┬─────────┐
      10 │   200    │   30    │
         │          │         │
         ├──────────┼─────────┤
       5 │   100    │   15    │
         │          │         │
         └──────────┴─────────┘

    Total: 200 + 30 + 100 + 15 = 345
\`\`\`

### For distributive property 6(40 + 7):
\`\`\`
                40           7
         ┌──────────────┬─────────┐
       6 │     240      │   42    │
         │              │         │
         └──────────────┴─────────┘

    6(40 + 7) = 6×40 + 6×7 = 240 + 42 = 282
\`\`\`

### For algebra (x + 3)(x + 2):
\`\`\`
               x           3
         ┌──────────┬─────────┐
       x │    x²    │   3x    │
         │          │         │
         ├──────────┼─────────┤
       2 │    2x    │    6    │
         │          │         │
         └──────────┴─────────┘

    Total: x² + 3x + 2x + 6 = x² + 5x + 6
\`\`\`

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
\`\`\`
┌───────┬─────┬─────┬─────┬─────┬─────┐
│ Input │  1  │  2  │  3  │  4  │  5  │
├───────┼─────┼─────┼─────┼─────┼─────┤
│Output │  5  │  8  │ 11  │ 14  │  ?  │
└───────┴─────┴─────┴─────┴─────┴─────┘
               Rule: ×3 + 2
\`\`\`

### With function machine visualization:
\`\`\`
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
\`\`\`

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

\`\`\`
┌────────────┬─────┬─────┬─────┬─────┐
│  Apples    │  2  │  4  │  6  │  ?  │
├────────────┼─────┼─────┼─────┼─────┤
│  Oranges   │  3  │  6  │  9  │ 15  │
└────────────┴─────┴─────┴─────┴─────┘
               ×2    ×3    ×?
\`\`\`

### With scaling arrows:
\`\`\`
          ×2         ×3
       ┌──────┐   ┌──────┐
       │      │   │      │
       ▼      │   ▼      │
┌────────┬────┼───┬────┼───┬─────┐
│ Miles  │ 5  │   │ 10 │   │ 15  │
├────────┼────┴───┼────┴───┼─────┤
│ Hours  │ 2  │   │  4 │   │  6  │
└────────┴────────┴────────┴─────┘
\`\`\`

**Key features (from IM):**
- Two rows (one per quantity in the ratio)
- Columns show **equivalent ratios**
- Scale factors can be shown with arrows between columns
- At least one unknown to solve
- More abstract than double number line (no visual proportions)

**IM context:** Ratio tables are "more abstract and more general" than double number lines. Students progress from double number lines → ratio tables → equations

---

## Creating Custom Diagrams

If your problem doesn't fit these patterns, create a custom SVG following these rules:

1. **Use the SVG container wrapper:**
\`\`\`html
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360">
  <svg viewBox="0 0 280 200">
    <!-- your diagram here -->
  </svg>
</div>
\`\`\`

2. **Use layers for animations:**
\`\`\`html
<g data-pptx-layer="base"><!-- always visible --></g>
<g data-pptx-layer="step-1"><!-- appears on click --></g>
\`\`\`

3. **Text requirements:**
- All \`<text>\` must have \`font-family="Arial"\`
- Use readable font sizes (12-16px for labels)

4. **Colors from styling guide:**
- Primary: \`#1791e8\`
- Success: \`#22c55e\`
- Warning: \`#f59e0b\`
- Text: \`#1d1d1d\`
`;

/**
 * Annotation Zones Reference
 *
 * Guide for placing annotations on graphs:
 * - Y-intercept labels and shift arrows
 * - Slope triangles
 * - Line equation labels
 * - Point labels
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/annotation-zones.md
 */
export const ANNOTATION_ZONES = `
# SVG Annotation Zones

**Responsibility:** Quick zone reference for annotation placement.

---

## ⚠️ REQUIRED: Read the HTML File First

**Before using this reference, you MUST read:**

\`\`\`
READ: ../card-patterns/complex-patterns/annotation-snippet.html
\`\`\`

This markdown file contains ONLY the zone diagram and placement rules. The actual HTML patterns you will copy are in \`annotation-snippet.html\`.

---

## Zone Diagram

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    ZONE A (Top)                      │
│                    y: 0-15                           │
├─────┬───────────────────────────────────────┬───────┤
│     │                                       │       │
│  B  │          PLOT AREA                    │   C   │
│     │          (data only)                  │       │
│ x:  │          40-260, 20-170               │  x:   │
│ 0-38│                                       │262-280│
│     │                                       │       │
├─────┴───────────────────────────────────────┴───────┤
│                    ZONE D (Bottom)                   │
│                    y: 175-200                        │
└─────────────────────────────────────────────────────┘
\`\`\`

| Zone | Use For |
|------|---------|
| A | Title, legend |
| B | Y-intercept labels, vertical arrows |
| C | Line labels (equations), endpoint annotations |
| D | X-axis labels, horizontal annotations |
| Plot | Data lines and points ONLY |

---

## Zone Assignment

| Annotation Type | Zone | X Position | Notes |
|-----------------|------|------------|-------|
| Y-intercept label | B | x="5" | Left-align, use line color |
| Y-intercept arrow | B | x="25" | Points to y-axis |
| Line equation | C | x="265" | Right side of graph |
| Slope (rise) | B | x="5" to x="38" | Label left of arrow |
| Slope (run) | D | y="180" to y="195" | Label below arrow |
| Point label (upper) | Plot | y - 12 | Above point, centered |
| Point label (lower) | Plot | y + 15 | Below point, centered |

---

## Stacking Rules

When multiple annotations compete for the same zone:
- First annotation: natural y-position
- Second annotation: offset by 15px
- Third annotation: offset by 30px

---

## Checklist

- [ ] Y-intercept labels in Zone B (x < 38)
- [ ] Line labels in Zone C (x > 262)
- [ ] No text overlaps axes (x=40 or y=170)
- [ ] Stacked annotations have 15px minimum spacing

**For styling rules and HTML patterns, see \`annotation-snippet.html\`.**
`;

/**
 * Layout Presets Reference
 *
 * Standard slide layout patterns:
 * - full-width (learning goal slides)
 * - two-column (step slides with visual)
 * - graph-heavy (graph on right, minimal text)
 *
 * Source: .claude/skills/create-worked-example-sg/reference/layout-presets.md
 */
export const LAYOUT_PRESETS = `
# Layout Presets - Declarative Slide Composition

## Overview

Slides are composed using **atomic components** placed in **regions** defined by **layout presets**.

\`\`\`
┌──────────────────────────────────────────────────┐
│                    TITLE ZONE                     │
│  ┌─────────────────────────────┐ ┌─────────────┐ │
│  │ Badge + Title + Subtitle    │ │  CFU/Answer │ │
│  └─────────────────────────────┘ └─────────────┘ │
├──────────────────────────────────────────────────┤
│                   CONTENT ZONE                    │
│  ┌─────────────────┐ ┌─────────────────────────┐ │
│  │   Content Box   │ │       SVG Card          │ │
│  │  (text/lists/   │ │   (graphs/diagrams)     │ │
│  │   equations)    │ │                         │ │
│  └─────────────────┘ └─────────────────────────┘ │
└──────────────────────────────────────────────────┘
\`\`\`

## Atomic Components

| Component | Purpose | Reference |
|-----------|---------|-----------|
| **Title Zone** | Badge + Title + Subtitle | [simple-patterns/title-zone.html](../phases/03-generate-slides/card-patterns/simple-patterns/title-zone.html) |
| **Content Box** | Any text content | [simple-patterns/content-box.html](../phases/03-generate-slides/card-patterns/simple-patterns/content-box.html) |
| **SVG Card** | Graphs/diagrams | [complex-patterns/graph-snippet.html](../phases/03-generate-slides/card-patterns/complex-patterns/graph-snippet.html) |
| **CFU/Answer** | Overlay boxes (animated) | [simple-patterns/cfu-answer-card.html](../phases/03-generate-slides/card-patterns/simple-patterns/cfu-answer-card.html) |

## Layout Presets

| Preset | Content Zone Split | Use When |
|--------|-------------------|----------|
| \`full-width\` | 100% | Text-only slides, summaries |
| \`two-column\` | 40% / 60% | Text + visual side-by-side |
| \`graph-heavy\` | 35% / 65% | Narrow text + large graph |
| \`with-cfu\` | 100% + overlay | Full-width + CFU question |
| \`two-column-with-cfu\` | 40% / 60% + overlay | Two-column + CFU |

## Pixel Dimensions (960×540)

**Source of truth:** [region-defaults.md](./region-defaults.md)

Run \`npm run sync-skill-content\` to propagate changes to TypeScript.

### Layout Presets

| Preset | Left Column | Right Column |
|--------|-------------|--------------|
| \`full-width\` | x=20, y=150, w=920 | — |
| \`two-column\` | x=20, y=150, w=368 | x=408, y=150, w=532 |
| \`graph-heavy\` | x=20, y=150, w=316 | x=356, y=150, w=584 |

## Slide Composition Flow

### Step 1: Choose Layout Preset

Based on slide content needs:
- Text only → \`full-width\`
- Text + graph → \`two-column\` or \`graph-heavy\`
- Needs CFU → add \`-with-cfu\`

### Step 2: Fill Title Zone

Every slide has:
\`\`\`html
<!-- Badge (STRATEGY, STEP 1, SUMMARY, etc.) -->
<div data-pptx-region="badge" data-pptx-x="20" data-pptx-y="16" ...>
  {{badge_text}}
</div>

<!-- Title -->
<h1 data-pptx-region="title" data-pptx-x="20" data-pptx-y="55" ...>
  {{title}}
</h1>

<!-- Subtitle -->
<p data-pptx-region="subtitle" data-pptx-x="20" data-pptx-y="100" ...>
  {{subtitle}}
</p>
\`\`\`

### Step 3: Place Content in Regions

**Full-width example:**
\`\`\`html
<div data-pptx-region="content"
     data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="360">
  <!-- Any content: paragraphs, lists, equations, tables -->
</div>
\`\`\`

**Two-column example:**
\`\`\`html
<!-- Left: Text content -->
<div data-pptx-region="left-column"
     data-pptx-x="20" data-pptx-y="140" data-pptx-w="368" data-pptx-h="370">
  <h3>Problem</h3>
  <p>Problem statement...</p>
  <ul>
    <li>Key point 1</li>
    <li>Key point 2</li>
  </ul>
</div>

<!-- Right: Visual -->
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="140" data-pptx-w="532" data-pptx-h="370">
  <svg viewBox="0 0 520 360">
    <!-- Graph content -->
  </svg>
</div>
\`\`\`

### Step 4: Add Overlays (if needed)

**CFU/Answer boxes use PPTX animation** - they appear on click, no duplicate slides needed.

Insert BEFORE \`</body>\`:
\`\`\`html
<!-- CFU (slides 3, 5, 7 - animated, appears on click) -->
<div data-pptx-region="cfu-box"
     data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
     style="position: absolute; top: 40px; right: 20px; ...">
  <p style="font-weight: bold;">CHECK FOR UNDERSTANDING</p>
  <p>{{cfu_question}}</p>
</div>

<!-- Answer (slides 4, 6, 8 - animated, appears on click) -->
<div data-pptx-region="answer-box"
     data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
     style="position: absolute; top: 40px; right: 20px; ...">
  <p style="font-weight: bold;">ANSWER</p>
  <p>{{answer_explanation}}</p>
</div>
\`\`\`

## Content Composition

Within content boxes, compose freely using:

| Element | HTML Pattern |
|---------|--------------|
| Prose | \`<p style="...">Text here</p>\` |
| Header | \`<h3 style="...">Header</h3>\` |
| Bullet list | \`<ul><li>Item</li></ul>\` |
| Numbered list | \`<ol><li>Step</li></ol>\` |
| Equation | \`<p style="font-family: Georgia; text-align: center;">y = mx + b</p>\` |
| Table | \`<table><thead>...</thead><tbody>...</tbody></table>\` |
| Bold/highlight | \`<strong style="color: #1791e8;">Think:</strong>\` |

See [content-box.html](../phases/03-generate-slides/card-patterns/simple-patterns/content-box.html) for complete patterns.

## PPTX Export Compatibility

Every positioned element needs \`data-pptx-*\` attributes:

\`\`\`html
<div data-pptx-region="region-type"
     data-pptx-x="X" data-pptx-y="Y"
     data-pptx-w="W" data-pptx-h="H">
\`\`\`

Region types recognized by PPTX export:
- \`badge\`, \`title\`, \`subtitle\`, \`footnote\`
- \`content\`, \`left-column\`, \`right-column\`
- \`content-box\`, \`problem-statement\`
- \`svg-container\`
- \`cfu-box\`, \`answer-box\`
`;

/**
 * PPTX Requirements Reference
 *
 * Complete PPTX export constraints:
 * - Slide dimensions (960×540px)
 * - Supported fonts (Arial, Georgia)
 * - Color palette
 * - Region positioning
 * - Animation/layer system
 *
 * Source: .claude/skills/create-worked-example-sg/reference/pptx-requirements.md
 */
export const PPTX_REQUIREMENTS = `
# HTML to PPTX Best Practices Guide

A comprehensive reference for converting HTML to PowerPoint presentations using pptxgenjs and the html2pptx library.

---

## Table of Contents

1. [HTML Canvas Dimensions](#1-html-canvas-dimensions)
2. [Slide Layout Zones](#2-slide-layout-zones)
3. [Typography Constraints](#3-typography-constraints)
4. [Supported HTML Elements](#4-supported-html-elements)
5. [Layout Best Practices](#5-layout-best-practices)
6. [Color Best Practices](#6-color-best-practices)
7. [Content Guidelines](#7-content-guidelines)
8. [Charts and Tables](#8-charts-and-tables)
9. [Critical Text Rules](#9-critical-text-rules)
10. [Flexbox Rules](#10-flexbox-rules)
11. [Styling Restrictions](#11-styling-restrictions)
12. [Color Format in PptxGenJS](#12-color-format-in-pptxgenjs)
13. [Gradient & Background Support](#13-gradient--background-support)
14. [Box Shadows](#14-box-shadows)
15. [Aspect Ratios](#15-aspect-ratios)
16. [Visual Validation](#16-visual-validation)
17. [Chart/Table Layout](#17-charttable-layout)
18. [Icons](#18-icons)
19. [Running Scripts](#19-running-scripts)
20. [Common Pitfalls](#20-common-pitfalls)

---

## 1. HTML Canvas Dimensions

**Standard dimensions for 16:9 aspect ratio:**
- **Width:** 960px
- **Height:** 540px

Set explicitly on the body element:

\`\`\`html
<body class="col" style="width: 960px; height: 540px; overflow: hidden;">
  <!-- Slide content -->
</body>
\`\`\`

This maps cleanly to PowerPoint's standard widescreen layout (\`LAYOUT_16x9\`).

---

## 2. Slide Layout Zones

Structure your HTML with these vertical zones for consistent, professional layouts:

| Zone | Y Position | Height | Purpose |
|------|-----------|--------|---------|
| **Title** | 0-100px | 100px | Slide title only (\`<h1>\`) |
| **Buffer** | 100-110px | 10px | Separation space |
| **Content** | 110-490px | 380px | Main content area |
| **Buffer** | 490-500px | 10px | Separation space |
| **Footnote** | 500-540px | 40px | Sources, disclaimers (10pt font) |

### Example Structure

\`\`\`html
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative;">
  <!-- Title zone: use fit class to shrink to content height -->
  <div style="width: 920px; margin: 0 20px; padding-top: 20px;" class="fit">
    <h1 style="margin: 0;">Slide Title</h1>
    <p class="text-muted-foreground" style="margin-top: 4px;">Optional subtitle</p>
  </div>

  <!-- Content zone: fill-height takes remaining space -->
  <div class="row gap-lg fill-height" style="padding: 10px 20px;">
    <div class="col" style="width: 45%;"><!-- Left column --></div>
    <div class="col" style="width: 55%;"><!-- Right column --></div>
  </div>

  <!-- Footnote zone: absolute positioning for fixed bottom -->
  <p style="position: absolute; bottom: 8px; left: 20px; font-size: 10pt; color: #666; margin: 0;">
    Source: Data from Q4 2024 report
  </p>
</body>
\`\`\`

### Critical Title Rule

**ALWAYS wrap titles in a full-width container** to prevent text box shrinking:

\`\`\`html
<!-- ✅ Correct -->
<div style="width: 920px; margin: 0 20px;">
  <h1>Title Text</h1>
</div>

<!-- ❌ Wrong - text box will shrink to fit content -->
<h1 style="width: 920px;">Title Text</h1>
\`\`\`

---

## 3. Typography Constraints

### Web-Safe Fonts Only

PowerPoint requires universally available fonts. **Only use these:**

| Category | Fonts |
|----------|-------|
| Sans-serif | Arial, Helvetica, Verdana, Tahoma, Trebuchet MS |
| Serif | Times New Roman, Georgia |
| Monospace | Courier New |
| Display | Impact |

**Never use:** Segoe UI, SF Pro, Roboto, or any custom/Google fonts.

### Font Size Hierarchy

For information-dense slides:

\`\`\`
Title:           32-40px (one size, prominent)
Section headers: 13-15px (small but bold)
Body text:       11-13px (readable at this size)
Supporting text: 10-11px (fine print, lists)
Footnotes:       10px (minimal footprint)
\`\`\`

**Rule:** Each level should be ~2-3px smaller than the previous.

---

## 4. Supported HTML Elements

### Block Elements (with background/border support)
- \`<div>\`, \`<section>\`, \`<header>\`, \`<footer>\`
- \`<main>\`, \`<article>\`, \`<nav>\`, \`<aside>\`

### Text Elements
- \`<p>\` - Paragraphs
- \`<h1>\` through \`<h6>\` - Headings

### Lists
- \`<ul>\`, \`<ol>\` - Lists (never use manual bullets)

### Inline Formatting
- \`<b>\`, \`<strong>\` - Bold
- \`<i>\`, \`<em>\` - Italic
- \`<u>\` - Underline
- \`<br>\` - Line breaks

### Media
- \`<img>\` - Images

### Special Features
- \`class="placeholder"\` - Reserved space for charts (returns position data)
- \`data-balance\` - Auto-balance text line lengths

---

## 5. Layout Best Practices

### The 4px Base Unit System

Use multiples of 4px for all spacing:

| Size | Use Case |
|------|----------|
| 4px | Tight: between related lines of text |
| 8px | Compact: elements within a group |
| 12px | Standard: between content blocks |
| 16px | Comfortable: section padding |
| 20px | Generous: slide margins |

### Container Padding

\`\`\`
Dense information boxes:  12-14px padding
Standard content cards:   14-16px padding
Spacious hero sections:   20-24px padding
\`\`\`

### Gap vs Padding

- **Gap:** Between siblings (cards, columns, list items)
- **Padding:** Inside containers (breathing room within a box)

\`\`\`html
<!-- ✅ Correct: gap for sibling spacing -->
<div class="col" style="gap: 12px;">
  <div style="padding: 14px;">Box 1</div>
  <div style="padding: 14px;">Box 2</div>
</div>

<!-- ❌ Wrong: margin on children -->
<div class="col">
  <div style="margin-bottom: 12px; padding: 14px;">Box 1</div>
  <div style="padding: 14px;">Box 2</div>
</div>
\`\`\`

### Width Patterns

\`\`\`html
<!-- Columns: percentage -->
<div style="width: 35%;">Sidebar</div>
<div style="width: 65%;">Main</div>

<!-- Accent bars: fixed -->
<div style="width: 12px; height: 100%;">Accent</div>

<!-- Padding/margins: fixed -->
<div style="padding: 20px 32px;">Content</div>
\`\`\`

---

## 6. Color Best Practices

### General Principles

- Use hex colors **without** the \`#\` prefix in pptxgenjs APIs
- Ensure strong contrast (dark text on light backgrounds or vice versa)
- One color should dominate (60-70% visual weight)
- Use 1-2 supporting tones and one sharp accent

### CSS Variables (Override in \`:root\`)

\`\`\`css
:root {
  --color-primary: #1791e8;
  --color-primary-foreground: #fafafa;
  --color-surface: #ffffff;
  --color-surface-foreground: #1d1d1d;
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  --color-border: #c8c8c8;
}
\`\`\`

### Utility Classes

- **Background:** \`.bg-surface\`, \`.bg-primary\`, \`.bg-secondary\`, \`.bg-muted\`
- **Text:** \`.text-surface-foreground\`, \`.text-primary\`, \`.text-muted-foreground\`

---

## 7. Content Guidelines

### Brevity Rules

- Paragraphs: 1 sentence, maybe 2
- Bullet points: 3-5 per list maximum
- Cards: Short statements/fragments only

### Visual Hierarchy

- No more than 2-3 text sizes per slide
- Use weight (bold) or opacity for additional distinction
- Center headlines only; left-align paragraphs and lists

### What to Avoid

- Content overflow beyond 960×540
- Long paragraphs
- More than 5 bullet points per list
- Centered body text
- Multiple font families on one slide

---

## 8. Charts and Tables

### Use PptxGenJS APIs (Not HTML)

Don't render charts/tables in HTML. Use placeholders:

\`\`\`html
<div class="placeholder" id="chart-area"></div>
\`\`\`

Then add via JavaScript:

\`\`\`javascript
const { slide, placeholders } = await html2pptx("slide.html", pptx);
slide.addChart(pptx.charts.BAR, chartData, placeholders[0]);
\`\`\`

### Chart Data Format

\`\`\`javascript
// Single series
[{
  name: "Sales",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [4500, 5500, 6200, 7100]
}]

// Multiple series
[
  { name: "Product A", labels: ["Q1", "Q2"], values: [10, 20] },
  { name: "Product B", labels: ["Q1", "Q2"], values: [15, 25] }
]
\`\`\`

### Required Chart Options

\`\`\`javascript
slide.addChart(pptx.charts.BAR, data, {
  ...placeholders[0],
  showCatAxisTitle: true,
  catAxisTitle: "Quarter",
  showValAxisTitle: true,
  valAxisTitle: "Sales ($000s)",
  chartColors: ["4472C4", "ED7D31"]  // NO # prefix
});
\`\`\`

---

## 9. Critical Text Rules

### All Text Must Be in Proper Tags

\`\`\`html
<!-- ✅ Correct -->
<div><p>Text here</p></div>
<div><h2>Heading</h2></div>

<!-- ❌ WRONG - Text will NOT appear in PowerPoint -->
<div>Text here</div>
\`\`\`

### Never Use Manual Bullet Symbols

\`\`\`html
<!-- ✅ Correct -->
<ul>
  <li>Item one</li>
  <li>Item two</li>
</ul>

<!-- ❌ WRONG -->
<p>• Item one</p>
<p>- Item two</p>
<p>* Item three</p>
\`\`\`

### Never Use white-space: nowrap

PowerPoint ignores this property. Instead:
- Make containers wide enough for content
- Use full-width text boxes (920px) for titles

---

## 10. Flexbox Rules

**Use CSS classes, not inline flexbox:**

\`\`\`html
<!-- ✅ Correct -->
<div class="row"><p>Horizontal layout</p></div>
<div class="col"><p>Vertical layout</p></div>

<!-- ❌ WRONG -->
<div style="display: flex;"><p>Text</p></div>
<div style="display: flex; flex-direction: column;"><p>Text</p></div>
\`\`\`

### Available Layout Classes

| Class | Purpose |
|-------|---------|
| \`.row\` | Horizontal layout (flex-direction: row) |
| \`.col\` | Vertical layout (flex-direction: column) |
| \`.fill-width\` | Expand to fill available width |
| \`.fill-height\` | Expand to fill available height |
| \`.fit\` | Maintain natural size |
| \`.center\` | Center content both ways |
| \`.items-center\` | Align items center |
| \`.justify-center\` | Justify content center |

---

## 11. Styling Restrictions

### Backgrounds, Borders, Shadows ONLY Work on Block Elements

**✅ Supported elements:**
- \`<div>\`, \`<section>\`, \`<header>\`, \`<footer>\`
- \`<main>\`, \`<article>\`, \`<nav>\`, \`<aside>\`

**❌ NOT supported on:**
- \`<p>\`, \`<h1>\`-\`<h6>\`, \`<ul>\`, \`<ol>\`

\`\`\`html
<!-- ✅ Correct -->
<div style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
  <p>Styled content inside a div</p>
</div>

<!-- ❌ WRONG - styling will be ignored -->
<p style="background: #f5f5f5; border-radius: 8px;">Styled text</p>
<h2 style="background: blue; color: white;">Styled heading</h2>
\`\`\`

---

## 12. Color Format in PptxGenJS

**CRITICAL: Never use \`#\` prefix with hex colors in PptxGenJS APIs.**

Using \`#\` causes file corruption.

\`\`\`javascript
// ✅ Correct
color: "FF0000"
fill: { color: "0066CC" }
chartColors: ["4472C4", "ED7D31", "A5A5A5"]
line: { color: "000000", width: 2 }

// ❌ WRONG - causes file corruption
color: "#FF0000"
fill: { color: "#0066CC" }
chartColors: ["#4472C4", "#ED7D31"]
\`\`\`

---

## 13. Gradient & Background Support

Gradients and backgrounds are supported on block elements:

\`\`\`css
/* Linear gradient */
background: linear-gradient(135deg, #color1 0%, #color2 100%);

/* Radial gradient */
background: radial-gradient(circle, #color1 0%, #color2 100%);

/* Background image */
background: url(path/to/image.png);

/* Solid color */
background: var(--color-primary);
background-color: #f5f5f5;
\`\`\`

### Border Support

\`\`\`css
/* Uniform borders */
border: 1px solid var(--color-border);

/* Partial borders */
border-left: 4px solid var(--color-primary);
border-bottom: 2px solid #333;
\`\`\`

### Border Radius

\`\`\`html
<!-- Standard radius -->
<div class="rounded">...</div>

<!-- Pill shape (fully rounded) -->
<div class="pill">...</div>

<!-- Custom radius -->
<div style="border-radius: 12px;">...</div>
\`\`\`

---

## 14. Box Shadows

**Only outer shadows are supported.** PowerPoint does not support inset shadows.

\`\`\`css
/* ✅ Supported - outer shadow */
box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* ❌ NOT supported - inset shadow */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
\`\`\`

---

## 15. Aspect Ratios

| Aspect Ratio | HTML Dimensions | PptxGenJS Layout |
|--------------|-----------------|------------------|
| 16:9 (default) | 960 × 540px | \`LAYOUT_16x9\` |
| 4:3 | 960 × 720px | \`LAYOUT_4x3\` |
| 16:10 | 960 × 600px | \`LAYOUT_16x10\` |

**HTML and JavaScript must match:**

\`\`\`html
<!-- For 16:9 -->
<body style="width: 960px; height: 540px;">
\`\`\`

\`\`\`javascript
const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";  // Must match HTML dimensions
\`\`\`

---

## 16. Visual Validation

**Required step after generating PPTX.** Do not skip.

### Validation Process

\`\`\`bash
# 1. Convert PPTX to PDF
soffice --headless --convert-to pdf output.pptx

# 2. Convert PDF to images
pdftoppm -jpeg -r 150 output.pdf slide
# Creates: slide-1.jpg, slide-2.jpg, etc.

# 3. For specific pages only
pdftoppm -jpeg -r 150 -f 2 -l 5 output.pdf slide
\`\`\`

### What to Check

- **Text cutoff:** Text being cut off by shapes or slide edges
- **Text overlap:** Text overlapping with other text or shapes
- **Positioning issues:** Content too close to boundaries
- **Contrast issues:** Insufficient contrast between text and backgrounds
- **Alignment problems:** Elements not properly aligned
- **Visual hierarchy:** Important content properly emphasized

### Fix Priority Order

1. **Increase margins** - Add more padding/spacing
2. **Adjust font size** - Reduce text size to fit
3. **Rethink layout** - Redesign the slide if above fixes don't work

---

## 17. Chart/Table Layout

### Recommended Layouts

**Two-column layout (PREFERRED):**
- Header spanning full width
- Text/bullets in one column (40%)
- Chart/table in other column (60%)

\`\`\`html
<body class="col">
  <div class="fit" style="width: 920px; margin: 0 20px;">
    <h1>Quarterly Results</h1>
  </div>
  <div class="row gap-lg fill-height" style="padding: 10px 20px;">
    <div class="col" style="width: 40%;">
      <h3>Key Highlights</h3>
      <ul>
        <li>Revenue up 15%</li>
        <li>New markets entered</li>
      </ul>
    </div>
    <div class="placeholder" style="width: 60%;"></div>
  </div>
</body>
\`\`\`

**Full-slide layout:**
- Chart/table takes entire slide for maximum impact

**NEVER do:**
- Vertically stack charts below text in single column
- Place charts/tables in narrow spaces

---

## 18. Icons

Use react-icons for consistent, high-quality SVG icons.

### Setup

\`\`\`javascript
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { FaHome, FaChartBar, FaUsers } = require("react-icons/fa");
\`\`\`

### Generate SVG String

\`\`\`javascript
function renderIconSvg(IconComponent, color, size = "48") {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: color, size: size })
  );
}

const homeIcon = renderIconSvg(FaHome, "#4472c4", "48");
const chartIcon = renderIconSvg(FaChartBar, "#ed7d31", "32");
\`\`\`

### Use in HTML

\`\`\`html
<div style="width: 48px; height: 48px;">
  \${homeIcon}
</div>
\`\`\`

### Icon Best Practices

- Use consistent icon set (all outline OR all filled)
- Keep icons small (24-48px typical, 64px max)
- Choose immediately recognizable icons
- Use color strategically - monochrome with one accent
- Maximum 3-5 icons per slide
- Never use icons as pure decoration

---

## 19. Running Scripts

### Prerequisites

\`\`\`bash
# 1. Extract the html2pptx library
mkdir -p html2pptx && tar -xzf skills/public/pptx/html2pptx.tgz -C html2pptx
\`\`\`

### Script Structure

\`\`\`javascript
const pptxgen = require("pptxgenjs");
const { html2pptx } = require("./html2pptx");  // Relative path!

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Your Name";
  pptx.title = "Presentation Title";

  // Add slides
  await html2pptx("slide1.html", pptx);
  
  const { slide, placeholders } = await html2pptx("slide2.html", pptx);
  slide.addChart(pptx.charts.BAR, chartData, placeholders[0]);

  // Save
  await pptx.writeFile("output.pptx");
}

createPresentation().catch(console.error);
\`\`\`

### Run Command

\`\`\`bash
NODE_PATH="$(npm root -g)" node your-script.js 2>&1
\`\`\`

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Module not found | Library not extracted | Run the tar extraction command |
| \`require("@ant/html2pptx")\` | Wrong import path | Use \`require("./html2pptx")\` |
| Timeout | Wrong arguments to html2pptx | Pass (htmlFilePath, pptx) |

---

## 20. Common Pitfalls

### Quick Reference Table

| Issue | Cause | Fix |
|-------|-------|-----|
| Text missing in PPTX | Text not in \`<p>\`, \`<h1-6>\`, \`<ul>\`, \`<ol>\` | Wrap all text in proper tags |
| Layout broken | Using \`display: flex\` inline | Use \`.row\` / \`.col\` classes |
| Colors wrong/corrupt | Using \`#\` prefix in pptxgenjs | Remove \`#\` from all hex colors |
| Background ignored | Applied to text element | Apply to wrapping \`<div>\` |
| Title wrapping unexpectedly | Narrow text box | Use full-width container (920px) |
| Font rendering issues | Non-web-safe fonts | Use Arial, Georgia, etc. only |
| Styling not applied | Styles on \`<p>\`, \`<h1>\`, etc. | Move styles to parent \`<div>\` |
| Content cut off | Overflow beyond 960×540 | Reduce content or font sizes |
| Manual bullets appear | Using •, -, * characters | Use \`<ul>\` or \`<ol>\` lists |
| nowrap not working | PowerPoint ignores it | Make container wide enough |
| Inset shadow missing | Not supported | Use outer shadows only |
| Chart colors wrong | \`#\` prefix in chartColors | Use \`["4472C4"]\` not \`["#4472C4"]\` |

### Pre-Flight Checklist

Before generating your PPTX:

- [ ] Body dimensions set to 960×540 (or appropriate aspect ratio)
- [ ] All text wrapped in \`<p>\`, \`<h1-6>\`, \`<ul>\`, or \`<ol>\`
- [ ] Using \`.row\`/\`.col\` classes instead of inline flexbox
- [ ] Web-safe fonts only (Arial, Georgia, etc.)
- [ ] Backgrounds/borders only on block elements
- [ ] No \`#\` prefix in any pptxgenjs color values
- [ ] No manual bullet symbols (•, -, *)
- [ ] No \`white-space: nowrap\`
- [ ] Charts use placeholders, not HTML rendering
- [ ] Title in full-width container (920px)

---

## Quick Start Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Slide Template</title>
  <style>
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
    }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px;">
  <!-- Title Zone -->
  <div style="width: 920px; margin: 0 20px; padding-top: 20px;" class="fit">
    <h1 style="margin: 0;">Slide Title Here</h1>
  </div>
  
  <!-- Content Zone -->
  <div class="fill-height row gap-lg" style="padding: 10px 20px;">
    <div class="col" style="width: 50%;">
      <h3>Section Header</h3>
      <ul>
        <li>First point</li>
        <li>Second point</li>
        <li>Third point</li>
      </ul>
    </div>
    <div class="col" style="width: 50%;">
      <div class="placeholder"></div>
    </div>
  </div>
  
  <!-- Footnote Zone -->
  <p style="position: absolute; bottom: 8px; left: 20px; font-size: 10pt; color: #666; margin: 0;">
    Source: Your data source
  </p>
</body>
</html>
\`\`\`

\`\`\`javascript
// create-presentation.js
const pptxgen = require("pptxgenjs");
const { html2pptx } = require("./html2pptx");

async function main() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  
  await html2pptx("slide.html", pptx);
  
  await pptx.writeFile("presentation.pptx");
  console.log("Done!");
}

main().catch(console.error);
\`\`\`

\`\`\`bash
# Run
NODE_PATH="$(npm root -g)" node create-presentation.js 2>&1
\`\`\`

---

## Dependencies

Required packages (should be pre-installed):

- **pptxgenjs:** \`npm install -g pptxgenjs\`
- **playwright:** \`npm install -g playwright\`
- **react-icons:** \`npm install -g react-icons react react-dom\`
- **LibreOffice:** For PDF conversion (validation step)
- **Poppler:** \`sudo apt-get install poppler-utils\` (for pdftoppm)
`;
