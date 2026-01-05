/**
 * HTML templates for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth (Atomic Card-Patterns System):
 *   .claude/skills/create-worked-example-sg/phases/03-generate-slides/card-patterns/
 *     - simple-patterns/ → title-zone, content-box, cfu-answer-card (fill placeholders)
 *     - complex-patterns/ → graph-snippet, annotation-snippet, printable (copy & modify)
 *
 * To update: Edit the HTML files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS (from pptx.md):
 * - Dimensions: 960×540px (fixed)
 * - Fonts: Arial, Georgia only (no custom fonts)
 * - Layout: .row/.col classes (no inline flexbox)
 * - Theme: Light (white background, dark text)
 * - No JavaScript, no onclick, no animations
 *
 * Shared between:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 */

// ============================================================================
// ATOMIC CARD-PATTERNS (New System - 11 slides with PPTX animation)
// ============================================================================

/**
 * Title Zone - Top section of every slide
 * Contains: Badge + Title + Subtitle
 * Workflow: Fill placeholders ({{badge_text}}, {{title}}, {{subtitle}})
 *
 * Source: card-patterns/simple-patterns/title-zone.html
 */
export const TITLE_ZONE = `
<!--
  ============================================================
  TITLE ZONE - Top section of every slide
  ============================================================
  Contains: Badge + Title + Subtitle
  Position: Fixed at top (y: 0-146px, includes 16px bottom padding)

  Data attributes for PPTX export:
  - data-pptx-region: "badge" | "title" | "subtitle"
  - data-pptx-x, y, w, h: Position in pixels

  POSITION VALUES: See reference/region-defaults.md for current values.
  ============================================================
-->

<!-- Title Zone Container -->
<div style="width: 920px; margin: 0 20px; padding-top: 16px; padding-bottom: 16px;" class="fit">

  <!-- Badge + Title Row (same line) -->
  <div class="row items-center gap-md" style="margin-bottom: 8px;">
    <!-- Step Badge (position FIXED: 20, 16, 100, 30) -->
    <div data-pptx-region="badge"
         data-pptx-x="20" data-pptx-y="16"
         data-pptx-w="100" data-pptx-h="30"
         style="background: #1791e8; color: #ffffff; padding: 4px 12px; border-radius: 16px; display: inline-block; flex-shrink: 0;">
      <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
        {{badge_text}}
      </p>
    </div>

    <!-- Main Title (position FIXED: 130, 16, 810, 30) - same row as badge -->
    <h1 data-pptx-region="title"
        data-pptx-x="130" data-pptx-y="16"
        data-pptx-w="810" data-pptx-h="30"
        style="margin: 0; font-size: 22px; font-weight: bold; color: #1791e8; line-height: 1.2;">
      {{title}}
    </h1>
  </div>

  <!-- Subtitle / Instruction (position FIXED: 20, 55, 920, 30) -->
  <p data-pptx-region="subtitle"
     data-pptx-x="20" data-pptx-y="55"
     data-pptx-w="920" data-pptx-h="30"
     style="margin: 0; color: #1d1d1d; font-size: 16px; line-height: 1.4;">
    {{subtitle}}
  </p>

</div>

<!-- Footnote (position FIXED: 700, 8, 240, 25) -->
<p data-pptx-region="footnote"
   data-pptx-x="700" data-pptx-y="8"
   data-pptx-w="240" data-pptx-h="25"
   style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
  {{footnote}}
</p>


<!--
  ============================================================
  BADGE VARIATIONS
  ============================================================
-->

<!-- Badge text variations (all use same position from region-defaults.md) -->

<!-- STRATEGY - Slide 1 -->
<p style="...">STRATEGY</p>

<!-- STEP 1, STEP 2, STEP 3 - Slides 2-12 -->
<p style="...">STEP 1</p>

<!-- SUMMARY - Slide 13 -->
<p style="...">SUMMARY</p>

<!-- PRACTICE - Slides 14-15 -->
<p style="...">PRACTICE</p>
`;

/**
 * Content Box - Main content area
 * Contains: Text, lists, equations, tables
 * Workflow: Fill placeholders
 *
 * Source: card-patterns/simple-patterns/content-box.html
 */
export const CONTENT_BOX = `
<!--
  ============================================================
  CONTENT BOX - Flexible container for text content
  ============================================================
  The universal container for ALL text-based content types.
  Mix and match paragraphs, lists, equations, tables inside.

  Data attributes for PPTX export:
  - data-pptx-region: "content-box" | "left-column" | "problem-statement"
  - data-pptx-x, y, w, h: Position in pixels (960x540 coordinate system)
  - data-pptx-bg: Optional background color override

  POSITION VALUES: See reference/region-defaults.md for current values.
  Run \`npm run sync-skill-content\` to propagate changes to TypeScript.
  ============================================================
-->

<!-- PATTERN: Basic container with background -->
<div data-pptx-region="content-box"
     data-pptx-x="{{x}}" data-pptx-y="{{y}}" data-pptx-w="{{w}}" data-pptx-h="{{h}}"
     style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
  <!-- Content goes here: paragraphs, lists, equations, tables -->
</div>

<!-- PATTERN: Container without background (for left/right columns) -->
<!-- Left column position FIXED: 20, 150, 368, 360 -->
<div data-pptx-region="left-column"
     data-pptx-x="20" data-pptx-y="150"
     data-pptx-w="368" data-pptx-h="360"
     class="col" style="padding: 0;">
  <!-- Column content -->
</div>


<!--
  ============================================================
  CONTENT TYPES (use inside content box)
  ============================================================
-->

<!-- PROSE: Simple paragraph -->
<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
  Prose content here...
</p>

<!-- PROSE with header -->
<h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: bold; color: #1d1d1d;">Section Header</h3>
<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
  Content after header...
</p>

<!-- PROSE with inline formatting -->
<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
  <strong style="color: #1791e8;">Think:</strong> What operation does this describe?
</p>

<!-- BULLET LIST -->
<ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
  <li>First point</li>
  <li>Second point</li>
  <li style="color: #1791e8; font-weight: bold;">Highlighted point</li>
</ul>

<!-- NUMBERED LIST -->
<ol style="margin: 0; padding-left: 24px; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
  <li>Step one</li>
  <li>Step two</li>
  <li>Step three</li>
</ol>

<!-- EQUATION (centered, Georgia font) -->
<p style="margin: 16px 0; font-family: Georgia, serif; font-size: 24px; font-style: italic; color: #1d1d1d; text-align: center;">
  y = mx + b
</p>

<!-- EQUATION with work shown -->
<div style="text-align: center; margin: 12px 0;">
  <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 18px; color: #737373;">
    36 ÷ 4 = ?
  </p>
  <p style="margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #1791e8;">
    Answer: 9
  </p>
</div>

<!-- TABLE - Simple inline table (use only in left-column/content areas) -->
<!-- For tables in the right visual area, use TABLE_SVG_CONTAINER below instead -->
<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
  <thead>
    <tr style="background: #f5f5f5;">
      <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-weight: bold;">Hours</th>
      <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-weight: bold;">Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #e5e7eb; padding: 8px;">1</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px;">$25</td>
    </tr>
    <tr style="background: #fef3c7;">
      <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: bold; color: #92400e;">2</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: bold; color: #92400e;">$30</td>
    </tr>
  </tbody>
</table>


<!--
  ============================================================
  COMPOSING CONTENT TYPES
  ============================================================
  Mix and match content types in a single box.
  Use margin/spacing between elements.
-->

<!-- Example: Composed content box (values from reference/region-defaults.md) -->
<div data-pptx-region="content-box"
     data-pptx-x="{{left-column.x}}" data-pptx-y="{{left-column.y}}"
     data-pptx-w="{{left-column.w}}" data-pptx-h="{{left-column.h}}"
     style="background: #f5f5f5; border-radius: 8px; padding: 16px;">

  <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: bold; color: #1d1d1d;">Problem</h3>

  <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1d1d1d;">
    A phone plan charges $20 base plus $5 per hour of usage.
  </p>

  <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 20px; text-align: center; color: #1d1d1d;">
    C = $20 + $5 × h
  </p>

  <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #1d1d1d;">
    <li>C = total cost</li>
    <li>h = hours used</li>
  </ul>

</div>
`;

/**
 * CFU/Answer Card - Animated overlays
 * Appears on click in PPTX (PPTX animation)
 * Workflow: Fill placeholders, add data-pptx-region attribute
 *
 * Source: card-patterns/simple-patterns/cfu-answer-card.html
 */
export const CFU_ANSWER_CARD = `
<!--
  ============================================================
  CFU / ANSWER CARDS - Overlay boxes with PPTX ANIMATION
  ============================================================
  CFU (Check for Understanding): Yellow accent, appears on click
  Answer: Green accent, appears on click

  PPTX ANIMATION BEHAVIOR:
  ========================
  These boxes are ANIMATED in the exported PPTX/Google Slides:
  - Box starts INVISIBLE when slide first displays
  - Box APPEARS ON CLICK (teacher clicks to reveal)
  - No duplicate slides needed - animation handles reveal

  Data attributes for PPTX export:
  - data-pptx-region: "cfu-box" | "answer-box" (triggers animation)
  - data-pptx-x, y, w, h: Position in pixels

  POSITION VALUES: See reference/region-defaults.md for current values.
  ============================================================
-->

<!-- CFU Box (Check for Understanding) - Yellow accent -->
<!-- Position is FIXED: always top-right corner (653, 40, 280, 115) -->
<div data-pptx-region="cfu-box"
     data-pptx-x="653" data-pptx-y="40"
     data-pptx-w="280" data-pptx-h="115"
     style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">
    {{cfu_question}}
  </p>
</div>

<!-- Answer Box - Green accent -->
<!-- Position is FIXED: always top-right corner (653, 40, 280, 115) -->
<div data-pptx-region="answer-box"
     data-pptx-x="653" data-pptx-y="40"
     data-pptx-w="280" data-pptx-h="115"
     style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">
    {{answer_explanation}}
  </p>
</div>

<!--
  ============================================================
  HOW TO ADD CFU/ANSWER TO A SLIDE:
  ============================================================
  1. Add the CFU or Answer box BEFORE the closing </body> tag
  2. The position is ABSOLUTE - it floats over existing content
  3. In PPTX export, this box will be ANIMATED (appears on click)

  ANIMATION IN PPTX:
  - The data-pptx-region="cfu-box" or "answer-box" triggers animation
  - Box starts hidden, appears when teacher clicks
  - No duplicate slides needed - one slide handles question + reveal

  NOTE: A slide can have EITHER a cfu-box OR an answer-box (not both).
  - Question slides: use cfu-box
  - Answer slides: use answer-box
  ============================================================
-->
`;

/**
 * SVG Card - Container for graphs and diagrams
 * Includes layering system for PPTX animations
 * Workflow: Fill placeholders, add SVG content inside layers
 *
 * Source: card-patterns/svg-card.html
 */
export const SVG_CARD = `
<!--
  ============================================================
  SVG CARD - Graphs, diagrams, and visual content
  ============================================================
  Use for: Coordinate plane graphs, diagrams, visual representations

  Data attributes for PPTX export:
  - data-pptx-region: "svg-container"
  - data-pptx-x, y, w, h: Position in pixels (960x540 coordinate system)
  - data-svg-region: "true" (marks this for SVG rendering)

  Layering for animations:
  - Use data-layer="base" for static elements (axes, grid)
  - Use data-layer="layer-1", "layer-2" for progressive reveal
  - Layers render as separate images for PPTX animation

  POSITION VALUES: See reference/region-defaults.md for svg-container position.
  ============================================================
-->

<!-- SVG container (standard two-column right) -->
<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="{{svg-container.x}}" data-pptx-y="{{svg-container.y}}"
     data-pptx-w="{{svg-container.w}}" data-pptx-h="{{svg-container.h}}"
     data-svg-region="true"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 12px;">
  <svg viewBox="0 0 520 350" style="width: 520px; height: 350px;">
    <!-- Base layer: Axes and grid (always visible) -->
    <g data-layer="base">
      <!-- Grid, axes, labels -->
    </g>

    <!-- Layer 1: First data series (appears on click) -->
    <g data-layer="layer-1">
      <!-- Line, points, labels -->
    </g>

    <!-- Layer 2: Second data series (appears on next click) -->
    <g data-layer="layer-2">
      <!-- Line, points, labels -->
    </g>
  </svg>
</div>

<!-- Full-width SVG (for content layout) -->
<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="{{content.x}}" data-pptx-y="{{content.y}}"
     data-pptx-w="{{content.w}}" data-pptx-h="{{content.h}}"
     data-svg-region="true"
     class="center"
     style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
  <svg viewBox="0 0 880 320" style="width: 880px; height: 320px;">
    <!-- Full-width graph content -->
  </svg>
</div>
`;

/**
 * Image Region Container - Renders ANY HTML content as an image in PPTX
 *
 * Use this to wrap complex HTML (tables, styled content) that needs pixel-perfect
 * PPTX export. The SVG foreignObject triggers the image renderer.
 *
 * When to use:
 * - Tables with styled headers/borders
 * - Complex styled layouts
 * - Any content that doesn't render well as native PPTX elements
 */
export const IMAGE_REGION_CONTAINER = `
<!--
  ============================================================
  IMAGE REGION - Renders HTML as screenshot for PPTX export
  ============================================================
  Wrap ANY HTML content in this container to render it as a PNG image.
  The SVG foreignObject triggers the Puppeteer screenshot renderer.

  USAGE: Replace the inner content with your HTML (tables, styled divs, etc.)
  POSITION: Adjust data-pptx-x/y/w/h and viewBox/width/height to match your content.

  Default position (two-column right): x=408, y=150, w=532, h=360
  ============================================================
-->
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 20px;">
  <svg viewBox="0 0 492 320" width="492" height="320" xmlns="http://www.w3.org/2000/svg">
    <foreignObject x="0" y="0" width="492" height="320">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; font-family: Arial, sans-serif;">
        <!-- YOUR HTML CONTENT HERE (tables, styled divs, etc.) -->
      </div>
    </foreignObject>
  </svg>
</div>
`;

/**
 * Graph Snippet - Complete coordinate plane template
 * Workflow: Copy entire file, modify values, recalculate pixel positions
 *
 * Contains:
 * - Arrow marker definitions for axes and lines
 * - Complete grid with proper alignment
 * - Single "0" at origin
 * - Complete scale labels to the arrows
 * - Example data lines with extension arrows
 * - Layer structure for PPTX export
 *
 * HOW TO USE:
 * 1. Copy the <svg>...</svg> block
 * 2. Adjust X_MAX and Y_MAX for your data
 * 3. Recalculate positions using: pixelX = 40 + (dataX/X_MAX)*220, pixelY = 170 - (dataY/Y_MAX)*150
 *
 * Source: card-patterns/complex-patterns/graph-snippet.html
 */
export const GRAPH_SNIPPET = `
<!--
  ============================================================
  GRAPH SNIPPET - Complete Coordinate Plane Template
  ============================================================
  Use this as the starting point for ALL SVG coordinate planes.

  THIS IS A "COMPLEX PATTERN" - COPY AND MODIFY, DON'T FILL PLACEHOLDERS

  WORKFLOW:
  1. COPY the entire <svg>...</svg> block below
  2. SET your scale values (replace example values):
     - {{X_MAX}} = your x-axis maximum (e.g., 6, 8, 10)
     - {{Y_MAX}} = your y-axis maximum (e.g., 18, 50, 100)
     - {{X_INCREMENT}} = tick spacing for x (e.g., 1, 2, 5)
     - {{Y_INCREMENT}} = tick spacing for y (e.g., 2, 5, 10)
  3. RECALCULATE all pixel positions using formulas below
  4. REPLACE data lines with your equations:
     - {{LINE_1_EQUATION}} = first line equation (e.g., "y = 3x")
     - {{LINE_2_EQUATION}} = second line equation (e.g., "y = 2x + 3")
  5. VERIFY grid lines align with axis labels

  FORMULAS:
    pixelX = 40 + (dataX / X_MAX) * 220
    pixelY = 170 - (dataY / Y_MAX) * 150

  QUICK CALC for any scale:
    - Per-unit spacing = 220 / X_MAX (for X) or 150 / Y_MAX (for Y)
    - Example: X_MAX=6 → 220/6 = 36.67px per unit
    - Then: x=1 → 40 + 36.67 = 76.67
            x=2 → 40 + 73.33 = 113.33
            etc.

  CONSTANTS (DO NOT CHANGE):
    ORIGIN = (40, 170)
    PLOT_WIDTH = 220px
    PLOT_HEIGHT = 150px
    viewBox = "0 0 280 200"

  AXIS REQUIREMENTS (all mandatory):
    - Arrowheads on both axes
    - Single "0" at origin (NOT two separate zeros)
    - Complete scale labels to last tick before arrow
    - Lines extend to plot edges with arrows

  PLACEHOLDERS TO REPLACE:
    {{X_MAX}}           - Maximum x-axis value
    {{Y_MAX}}           - Maximum y-axis value
    {{X_INCREMENT}}     - X-axis tick increment
    {{Y_INCREMENT}}     - Y-axis tick increment
    {{LINE_1_EQUATION}} - First line equation text
    {{LINE_2_EQUATION}} - Second line equation text
    {{LINE_1_B}}        - Y-intercept value for line 1
    {{LINE_2_B}}        - Y-intercept value for line 2
  ============================================================
-->

<!-- SVG Container - Required wrapper for PPTX export -->
<!-- Position can be svg-container (two-column right) or content (full-width) -->
<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360"
     data-svg-region="true"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 12px;">

<svg viewBox="0 0 280 200" style="width: 100%; height: 340px;">
    <!--
    ============================================================
    PPTX LAYER STRUCTURE - For multi-layer export
    ============================================================
    Each layer becomes a SEPARATE IMAGE in the exported PPTX/Google Slides,
    tightly cropped to its bounding box. Use granular layers for elements
    that should be independently movable.

    CRITICAL: Points and labels must be in SEPARATE layers!

    REQUIRED LAYERS:
      data-pptx-layer="base-graph"   → Grid, axes, ticks, axis labels

    DATA LINE LAYERS:
      data-pptx-layer="line-1"       → First data line + y-intercept point
      data-pptx-layer="line-2"       → Second data line + y-intercept point

    ANNOTATION LAYERS (one element per layer):
      data-pptx-layer="label-b0"     → Y-intercept label for line 1
      data-pptx-layer="label-b20"    → Y-intercept label for line 2
      data-pptx-layer="eq-line-1"    → Equation label for line 1
      data-pptx-layer="eq-line-2"    → Equation label for line 2
      data-pptx-layer="arrow-shift"  → Shift arrow annotation
      data-pptx-layer="label-shift"  → Shift amount label

    KEY POINTS - ALWAYS SEPARATE DOT FROM LABEL:
      data-pptx-layer="point-solution"  → Solution point DOT only
      data-pptx-layer="label-solution"  → Solution point LABEL only
      data-pptx-layer="point-q"         → Named point DOT only
      data-pptx-layer="label-q"         → Named point LABEL only
      data-pptx-layer="reading-path"    → Dashed reading lines

    NAMING CONVENTION:
      - "line-N" for data lines (with their y-intercept points)
      - "point-X" for point DOTS only (X = descriptive suffix)
      - "label-X" for text LABELS only (X = descriptive suffix)
      - "eq-N" for equation labels
      - "arrow-X" for arrow annotations

    Export automatically crops each layer to its tight bounding box.
    ============================================================

    This example uses X_MAX=6, Y_MAX=18 (counting by 1s on X, by 2s on Y)

    FORMULAS:
      pixelX = 40 + (dataX / X_MAX) * 220
      pixelY = 170 - (dataY / Y_MAX) * 150

    X tick positions (X_MAX=6, counting by 1s = 7 ticks):
      x=0: 40, x=1: 76.67, x=2: 113.33, x=3: 150, x=4: 186.67, x=5: 223.33, x=6: 260

    Y tick positions (Y_MAX=18, counting by 2s = 10 ticks):
      y=0: 170, y=2: 153.33, y=4: 136.67, y=6: 120, y=8: 103.33,
      y=10: 86.67, y=12: 70, y=14: 53.33, y=16: 36.67, y=18: 20
    -->

    <!-- ===== MARKER DEFINITIONS (required) ===== -->
    <defs>
        <!-- X-axis arrow (points right) -->
        <marker id="axis-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b"/>
        </marker>
        <!-- Y-axis arrow (points up - explicit orientation to avoid orient="auto" issues) -->
        <marker id="axis-arrow-up" markerWidth="7" markerHeight="10" refX="3.5" refY="1" orient="0">
            <polygon points="0 10, 3.5 0, 7 10" fill="#1e293b"/>
        </marker>

        <!-- Line arrows (colored, inherits from stroke) -->
        <marker id="line-arrow-blue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#60a5fa"/>
        </marker>
        <marker id="line-arrow-green" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#22c55e"/>
        </marker>
        <marker id="line-arrow-red" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
        </marker>
    </defs>

    <!-- ===== BASE GRAPH LAYER: Grid, Axes, Labels ===== -->
    <g data-pptx-layer="base-graph">
        <!-- Grid at EVERY tick position (consistent spacing, no gaps) -->
        <g stroke="#e2e8f0" stroke-width="0.5">
            <!-- Vertical grid lines (at every X tick, excluding origin) -->
            <line x1="76.67" y1="20" x2="76.67" y2="170"/>   <!-- x=1 -->
            <line x1="113.33" y1="20" x2="113.33" y2="170"/> <!-- x=2 -->
            <line x1="150" y1="20" x2="150" y2="170"/>       <!-- x=3 -->
            <line x1="186.67" y1="20" x2="186.67" y2="170"/> <!-- x=4 -->
            <line x1="223.33" y1="20" x2="223.33" y2="170"/> <!-- x=5 -->
            <line x1="260" y1="20" x2="260" y2="170"/>       <!-- x=6 -->

            <!-- Horizontal grid lines (at every Y tick, excluding origin) -->
            <line x1="40" y1="153.33" x2="260" y2="153.33"/> <!-- y=2 -->
            <line x1="40" y1="136.67" x2="260" y2="136.67"/> <!-- y=4 -->
            <line x1="40" y1="120" x2="260" y2="120"/>       <!-- y=6 -->
            <line x1="40" y1="103.33" x2="260" y2="103.33"/> <!-- y=8 -->
            <line x1="40" y1="86.67" x2="260" y2="86.67"/>   <!-- y=10 -->
            <line x1="40" y1="70" x2="260" y2="70"/>         <!-- y=12 -->
            <line x1="40" y1="53.33" x2="260" y2="53.33"/>   <!-- y=14 -->
            <line x1="40" y1="36.67" x2="260" y2="36.67"/>   <!-- y=16 -->
            <line x1="40" y1="20" x2="260" y2="20"/>         <!-- y=18 -->
        </g>

        <!-- Axes with arrowheads (extend 15px past last label position) -->
        <line x1="40" y1="170" x2="275" y2="170" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow)"/>
        <line x1="40" y1="180" x2="40" y2="5" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow-up)"/>

        <!-- X-axis ticks (at every integer from 0-6) -->
        <g stroke="#1e293b" stroke-width="1.5">
            <line x1="40" y1="170" x2="40" y2="175"/>        <!-- x=0 -->
            <line x1="76.67" y1="170" x2="76.67" y2="175"/> <!-- x=1 -->
            <line x1="113.33" y1="170" x2="113.33" y2="175"/> <!-- x=2 -->
            <line x1="150" y1="170" x2="150" y2="175"/>      <!-- x=3 -->
            <line x1="186.67" y1="170" x2="186.67" y2="175"/> <!-- x=4 -->
            <line x1="223.33" y1="170" x2="223.33" y2="175"/> <!-- x=5 -->
            <line x1="260" y1="170" x2="260" y2="175"/>      <!-- x=6 -->
        </g>
        <!-- Y-axis ticks (at every even number from 0-18) -->
        <g stroke="#1e293b" stroke-width="1.5">
            <line x1="35" y1="170" x2="40" y2="170"/>        <!-- y=0 -->
            <line x1="35" y1="153.33" x2="40" y2="153.33"/> <!-- y=2 -->
            <line x1="35" y1="136.67" x2="40" y2="136.67"/> <!-- y=4 -->
            <line x1="35" y1="120" x2="40" y2="120"/>        <!-- y=6 -->
            <line x1="35" y1="103.33" x2="40" y2="103.33"/> <!-- y=8 -->
            <line x1="35" y1="86.67" x2="40" y2="86.67"/>   <!-- y=10 -->
            <line x1="35" y1="70" x2="40" y2="70"/>          <!-- y=12 -->
            <line x1="35" y1="53.33" x2="40" y2="53.33"/>   <!-- y=14 -->
            <line x1="35" y1="36.67" x2="40" y2="36.67"/>   <!-- y=16 -->
            <line x1="35" y1="20" x2="40" y2="20"/>          <!-- y=18 -->
        </g>

        <!-- Axis labels -->
        <!-- SINGLE "0" at origin (serves both axes) -->
        <text x="33" y="182" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">0</text>

        <!-- X-axis labels (counting by 1s: 0,1,2,3,4,5,6) -->
        <text x="76.67" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">1</text>
        <text x="113.33" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">2</text>
        <text x="150" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">3</text>
        <text x="186.67" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">4</text>
        <text x="223.33" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">5</text>
        <text x="260" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">6</text>

        <!-- Y-axis labels (counting by 2s: 0,2,4,6,8,10,12,14,16,18) -->
        <text x="35" y="157" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">2</text>
        <text x="35" y="140" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">4</text>
        <text x="35" y="124" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">6</text>
        <text x="35" y="107" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">8</text>
        <text x="35" y="90" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">10</text>
        <text x="35" y="74" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">12</text>
        <text x="35" y="57" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">14</text>
        <text x="35" y="40" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">16</text>
        <text x="35" y="24" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">18</text>
    </g>

    <!-- ===== DATA LAYERS: One layer per line for independent manipulation ===== -->

    <!-- Line 1: y = 3x (blue) - SEPARATE LAYER -->
    <g data-pptx-layer="line-1">
        <!-- Line from origin to (6,18): pixelY at x=6: 170 - (18/18)*150 = 20 -->
        <line x1="40" y1="170" x2="260" y2="20" stroke="#60a5fa" stroke-width="3" marker-end="url(#line-arrow-blue)"/>
        <!-- Y-intercept point at origin -->
        <circle cx="40" cy="170" r="5" fill="#60a5fa"/>
    </g>

    <!-- Line 2: y = 2x + 3 (green) - SEPARATE LAYER -->
    <g data-pptx-layer="line-2">
        <!-- Entry: pixelY = 170 - (3/18)*150 = 145 -->
        <!-- Exit: pixelY = 170 - (15/18)*150 = 45 -->
        <line x1="40" y1="145" x2="260" y2="45" stroke="#22c55e" stroke-width="3" marker-end="url(#line-arrow-green)"/>
        <!-- Y-intercept point at (0,3) -->
        <circle cx="40" cy="145" r="5" fill="#22c55e"/>
    </g>

    <!-- ===== ANNOTATION LAYERS: SEPARATE layer for each element ===== -->
    <!-- CRITICAL: Points and labels must be in SEPARATE layers for independent manipulation -->

    <!-- Y-intercept POINT for line 1 (already in line-1 layer above) -->
    <!-- Y-intercept LABEL for line 1 - SEPARATE from point -->
    <g data-pptx-layer="label-b0">
        <text x="5" y="170" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">b = 0</text>
    </g>

    <!-- Y-intercept LABEL for line 2 - SEPARATE from point -->
    <g data-pptx-layer="label-b3">
        <text x="5" y="145" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">b = 3</text>
    </g>

    <!-- Equation label for line 1 -->
    <g data-pptx-layer="eq-line-1">
        <text x="265" y="30" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">y = 3x</text>
    </g>

    <!-- Equation label for line 2 -->
    <g data-pptx-layer="eq-line-2">
        <text x="265" y="55" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">y = 2x + 3</text>
    </g>

    <!-- ===== KEY POINTS with SEPARATE layers for dot and label ===== -->
    <!-- Example: A solution point at (4, 12) -->

    <!-- Point DOT only -->
    <g data-pptx-layer="point-solution">
        <circle cx="186.67" cy="70" r="5" fill="#ef4444"/>
    </g>

    <!-- Point LABEL only - SEPARATE layer -->
    <g data-pptx-layer="label-solution">
        <text x="186.67" y="60" fill="#ef4444" font-family="Arial" font-size="10" font-weight="normal" text-anchor="middle">(4, 12)</text>
    </g>
</svg>

</div><!-- End svg-container -->


<!--
  ============================================================
  QUICK REFERENCE: Scale Selection (≤10 ticks target)
  ============================================================

  X-AXIS (ORIGIN_X=40, PLOT_WIDTH=220):
  | X_MAX | Increment | Ticks | Formula: pixelX = 40 + (dataX/X_MAX)*220 |
  |-------|-----------|-------|------------------------------------------|
  | 4     | 1         | 5     | 0→40, 1→95, 2→150, 3→205, 4→260         |
  | 5     | 1         | 6     | 0→40, 1→84, 2→128, 3→172, 4→216, 5→260  |
  | 6     | 1         | 7     | 0→40, 1→77, 2→113, 3→150, 4→187, 5→223, 6→260 |
  | 8     | 2         | 5     | 0→40, 2→95, 4→150, 6→205, 8→260         |
  | 10    | 2         | 6     | 0→40, 2→84, 4→128, 6→172, 8→216, 10→260 |

  Y-AXIS (ORIGIN_Y=170, PLOT_HEIGHT=150):
  | Y_MAX | Increment | Ticks | Formula: pixelY = 170 - (dataY/Y_MAX)*150 |
  |-------|-----------|-------|-------------------------------------------|
  | 9     | 1         | 10    | Count by 1s (max for counting by 1s)     |
  | 18    | 2         | 10    | Count by 2s (max for counting by 2s)     |
  | 36    | 4         | 10    | Count by 4s                              |
  | 45    | 5         | 10    | Count by 5s                              |
  | 72    | 8         | 10    | Count by 8s                              |
  | 90    | 10        | 10    | Count by 10s                             |

  RULE: Grid lines at EVERY tick position. Never skip values!

  COLORS:
  | Use          | Color   | Hex     |
  |--------------|---------|---------|
  | Line 1       | Blue    | #60a5fa |
  | Line 2       | Green   | #22c55e |
  | Line 3       | Red     | #ef4444 |
  | Axis/Grid    | Slate   | #1e293b |
  | Labels       | Gray    | #64748b |
  | Light grid   | Slate   | #e2e8f0 |
  ============================================================
-->
`;

/**
 * Annotation Snippet - Y-intercept labels, arrows, line equations
 * Workflow: Copy elements, recalculate pixel positions
 *
 * Contains:
 * - Font styling rules (font-weight="normal", font-size="9")
 * - Position calculation formula from data values
 * - Arrow marker definition
 * - Examples for y-intercept labels, shift arrows, line equations
 * - Layer structure for PPTX export
 *
 * Source: card-patterns/complex-patterns/annotation-snippet.html
 */
export const ANNOTATION_SNIPPET = `
<!--
  ============================================================
  ANNOTATION SNIPPET - Calculate positions from DATA VALUES
  ============================================================
  THIS IS A "COMPLEX PATTERN" - COPY AND MODIFY, DON'T FILL PLACEHOLDERS

  Annotations must use the SAME pixel formula as the graph.
  This ensures labels appear at the correct y-intercept positions.

  WORKFLOW:
  1. COPY the annotation elements you need
  2. SET your scale value:
     - {{Y_MAX}} = your y-axis maximum (must match graph-snippet)
  3. CALCULATE pixel positions for each annotation:
     - {{PIXEL_Y_LINE_1}} = 170 - ({{LINE_1_B}} / {{Y_MAX}}) * 150
     - {{PIXEL_Y_LINE_2}} = 170 - ({{LINE_2_B}} / {{Y_MAX}}) * 150
  4. REPLACE label text with your values:
     - {{LINE_1_B}} = y-intercept value for line 1
     - {{LINE_2_B}} = y-intercept value for line 2
     - {{SHIFT_AMOUNT}} = difference between y-intercepts
     - {{LINE_1_EQUATION}} = equation text for line 1
     - {{LINE_2_EQUATION}} = equation text for line 2

  PLACEHOLDERS TO REPLACE:
    {{Y_MAX}}            - Y-axis maximum (must match graph)
    {{LINE_1_B}}         - Y-intercept value for line 1
    {{LINE_2_B}}         - Y-intercept value for line 2
    {{LINE_1_COLOR}}     - Color for line 1 annotations (#60a5fa blue)
    {{LINE_2_COLOR}}     - Color for line 2 annotations (#22c55e green)
    {{SHIFT_AMOUNT}}     - Difference between y-intercepts
    {{LINE_1_EQUATION}}  - Equation text for line 1
    {{LINE_2_EQUATION}}  - Equation text for line 2
    {{PIXEL_Y_LINE_1}}   - Calculated pixel Y for line 1 y-intercept
    {{PIXEL_Y_LINE_2}}   - Calculated pixel Y for line 2 y-intercept

  PPTX LAYER SYSTEM - GRANULAR LAYERS FOR INDEPENDENT MANIPULATION
  ================================================================
  Each annotation element should have its OWN layer so it can be
  independently selected and moved in the exported PPTX/Google Slides.

  Use SEPARATE layers for each element:
    <g data-pptx-layer="label-b0">...y-intercept label 1...</g>
    <g data-pptx-layer="label-b20">...y-intercept label 2...</g>
    <g data-pptx-layer="arrow-shift">...shift arrow...</g>
    <g data-pptx-layer="eq-line-1">...equation label 1...</g>

  NAMING CONVENTION:
    - "label-X" for text labels (X = descriptive suffix like "b0", "shift20")
    - "arrow-X" for arrows (X = descriptive suffix like "shift", "highlight")
    - "eq-N" for equation labels (N = line number)
    - "point-X" for point labels (X = coordinates like "3,9")

  FONT RULES (apply to ALL annotations):
  - font-family="Arial"
  - font-size="9"
  - font-weight="normal" (NOT bold - too thick)
  ============================================================
-->


<!-- ========== Y-INTERCEPT ANNOTATION EXAMPLE ========== -->
<!--
  Example: Two lines with y-intercepts at 0 and 20, Y_MAX = 50

  Calculate pixel positions:
  - y-intercept 0:  pixelY = 170 - (0/50)*150 = 170
  - y-intercept 20: pixelY = 170 - (20/50)*150 = 110

  Label positions: x=5 (left margin), y=pixelY
  Arrow positions: x=25, from pixelY1 to pixelY2
-->

<!-- Arrow marker definition (add to <defs> section, use ONCE per SVG) -->
<defs>
  <marker id="annotation-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
    <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
  </marker>
</defs>

<!-- ===== GRANULAR ANNOTATION LAYERS - Each element is independently selectable ===== -->

<!-- Y-intercept label for line 1 at y=0 (pixelY=170) -->
<g data-pptx-layer="label-b0">
  <text x="5" y="170" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">b = 0</text>
</g>

<!-- Y-intercept label for line 2 at y=20 (pixelY=110) -->
<g data-pptx-layer="label-b20">
  <text x="5" y="110" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">b = 20</text>
</g>

<!-- Arrow showing shift from y=0 to y=20 -->
<g data-pptx-layer="arrow-shift">
  <line x1="25" y1="170" x2="25" y2="115" stroke="#ef4444" stroke-width="2" marker-end="url(#annotation-arrow)"/>
</g>

<!-- Arrow label showing shift amount (midpoint: (170+110)/2 = 140) -->
<g data-pptx-layer="label-shift">
  <text x="5" y="140" fill="#ef4444" font-family="Arial" font-size="9" font-weight="normal">+20</text>
</g>


<!-- ========== POSITION REFERENCE ========== -->
<!--
  X POSITIONS (fixed):
  | Position     | X value | Use for              |
  |--------------|---------|----------------------|
  | Left margin  | 5       | Y-intercept labels   |
  | Arrow line   | 25      | Vertical arrows      |
  | Right margin | 265     | Line equation labels |

  Y POSITIONS (calculated from data):
  | Data Y | Y_MAX=50 | Y_MAX=100 | Y_MAX=200 |
  |--------|----------|-----------|-----------|
  | 0      | 170      | 170       | 170       |
  | 10     | 140      | 155       | 162.5     |
  | 20     | 110      | 140       | 155       |
  | 25     | 95       | 132.5     | 151.25    |
  | 40     | 50       | 110       | 140       |
  | 50     | 20       | 95        | 132.5     |
  | 100    | -        | 20        | 95        |
  | 200    | -        | -         | 20        |

  Formula: pixelY = 170 - (dataY / Y_MAX) * 150
-->


<!-- ========== LINE EQUATION LABELS (right margin) ========== -->
<!--
  Position at x=265, y = line's ending pixelY (or stacked if multiple)
  Each equation label gets its own layer for independent manipulation
-->
<g data-pptx-layer="eq-line-1">
  <text x="265" y="30" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">y = 5x</text>
</g>
<g data-pptx-layer="eq-line-2">
  <text x="265" y="45" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">y = 5x + 20</text>
</g>


<!-- ========== KEY POINTS: SEPARATE DOT AND LABEL ========== -->
<!--
  CRITICAL: Always use SEPARATE layers for point dots and their labels.
  This allows independent manipulation in PPTX/Google Slides.

  Naming convention:
    - "point-X" for the dot/circle only
    - "label-X" for the text label only

  Label positioning:
    - Upper half (pixelY < 95): label ABOVE at pixelY - 12
    - Lower half (pixelY >= 95): label BELOW at pixelY + 15
    - Use text-anchor="middle" for centering
-->

<!-- Example: A point at (4, 20) with SEPARATE dot and label -->

<!-- Point DOT only -->
<g data-pptx-layer="point-4-20">
  <circle cx="150" cy="110" r="5" fill="#60a5fa"/>
</g>

<!-- Point LABEL only - SEPARATE layer -->
<g data-pptx-layer="label-4-20">
  <text x="150" y="98" fill="#60a5fa" font-family="Arial" font-size="10" font-weight="normal" text-anchor="middle">(4, 20)</text>
</g>

<!-- Example: A solution point at (10, 20) -->

<!-- Point DOT only -->
<g data-pptx-layer="point-solution">
  <circle cx="150" cy="103.33" r="6" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
</g>

<!-- Point LABEL only - SEPARATE layer -->
<g data-pptx-layer="label-solution">
  <text x="150" y="91" fill="#22c55e" font-family="Arial" font-size="10" font-weight="normal" text-anchor="middle">(10, 20)</text>
</g>

<!-- ========== READING PATH ANNOTATIONS ========== -->
<!-- Reading paths (dashed lines) should also be separate from points -->

<g data-pptx-layer="reading-path">
  <line x1="150" y1="170" x2="150" y2="103.33" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="150" y1="103.33" x2="40" y2="103.33" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,4"/>
</g>
`;

/**
 * Printable slide template - Use for worksheet slides
 * Workflow: Copy entire file, fill in problem content
 *
 * CRITICAL RULES:
 * 1. ALL practice problems go in ONE slide file with multiple print-page divs
 * 2. Each print-page div = one printed page (8.5in x 11in)
 * 3. Use white background, black text, Times New Roman font for printing
 * 4. Include ONLY: Header, Learning Goal, Problem content - NO strategy reminders
 * 5. NEVER create separate slide files for each problem
 *
 * Source: card-patterns/complex-patterns/printable-slide-snippet.html
 */
export const PRINTABLE_TEMPLATE = `
<!-- PRINTABLE WORKSHEET SLIDE TEMPLATE -->
<!-- This slide is designed for teachers to print and distribute to students -->
<!-- Uses white background, black text, and letter-sized pages for printing -->

<!-- ============================================================== -->
<!-- CRITICAL: ALL PRACTICE PROBLEMS GO IN ONE SLIDE FILE           -->
<!-- ============================================================== -->
<!-- Each problem gets its own print-page div within the slide      -->
<!-- DO NOT create separate slide files for each problem            -->
<!-- This single slide-9.html contains ALL printable problems       -->
<!-- Each print-page div = one printed page (8.5in x 11in)          -->
<!-- ============================================================== -->

<!-- ============================================================== -->
<!-- KEEP IT SIMPLE - ONLY INCLUDE WHAT'S LISTED BELOW              -->
<!-- ============================================================== -->
<!-- Goal: Reduce cognitive load. Include ONLY these elements:      -->
<!--   1. Header (lesson title, unit/lesson, name/date fields)      -->
<!--   2. Learning Goal box                                         -->
<!--   3. Problem content (scenario, visuals, task)                 -->
<!--                                                                -->
<!-- DO NOT ADD: Strategy reminders, hints, extra scaffolding, etc. -->
<!-- Students should apply the strategy independently at this point -->
<!-- ============================================================== -->

<div class="slide-container" style="width: 100vw; height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">

    <!-- Page 1: Problem 1 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Header with lesson info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #000;">[LESSON TITLE]</h1>
                <p style="font-size: 13px; color: #333; margin: 4px 0 0 0;">Unit [X] Lesson [Y] | Grade [Z]</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 13px; margin: 0;">Name: _______________________</p>
                <p style="font-size: 13px; margin: 4px 0 0 0;">Date: ________________________</p>
            </div>
        </div>

        <!-- Learning Goal Box -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 20px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [STUDENT-FACING LEARNING GOAL]</p>
        </div>

        <!-- Problem 1 -->
        <div style="border: 2px solid #333; padding: 20px; display: flex; flex-direction: column; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: [SCENARIO NAME]</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                [PROBLEM DESCRIPTION - Full context and setup]
            </p>

            <!-- Problem Content: Tables, Equations, Graphs as needed -->
            <!-- IMPORTANT: Do NOT use flex: 1 here - it causes overflow on tall content -->
            <!-- SVG graphs should have max-height: 360px to fit on page -->
            <div style="display: flex; gap: 30px; margin-bottom: 20px;">
                <!-- Example: Table -->
                <div style="flex: 1;">
                    <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">[Option A Name]</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #e0e0e0;">
                                <th style="border: 1px solid #666; padding: 8px; text-align: center;">[Column 1]</th>
                                <th style="border: 1px solid #666; padding: 8px; text-align: center;">[Column 2]</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td></tr>
                            <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Example: Equation -->
                <div style="flex: 1;">
                    <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">[Option B Name]</p>
                    <div style="border: 1px solid #666; padding: 15px; text-align: center; background: #fafafa;">
                        <p style="font-size: 18px; margin: 0; font-weight: bold;">y = [k]x</p>
                        <p style="font-size: 11px; margin: 8px 0 0 0; color: #666;">where x = [input], y = [output]</p>
                    </div>
                </div>
            </div>

            <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: auto;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Your Task:</p>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">
                    [SPECIFIC QUESTION - e.g., "If you [context], which option would give you MORE [outcome]? How much more?"]
                </p>
                <div style="margin-top: 15px; border: 1px solid #ccc; padding: 10px; min-height: 60px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Show your work:</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 2: Problem 2 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 20px auto 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Header with lesson info (repeated for each page) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #000;">[LESSON TITLE]</h1>
                <p style="font-size: 13px; color: #333; margin: 4px 0 0 0;">Unit [X] Lesson [Y] | Grade [Z]</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 13px; margin: 0;">Name: _______________________</p>
                <p style="font-size: 13px; margin: 4px 0 0 0;">Date: ________________________</p>
            </div>
        </div>

        <!-- Learning Goal Box (repeated for each page) -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 20px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [STUDENT-FACING LEARNING GOAL]</p>
        </div>

        <!-- Problem 2 -->
        <div style="border: 2px solid #333; padding: 20px; display: flex; flex-direction: column; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 2: [SCENARIO NAME]</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                [PROBLEM DESCRIPTION - Full context and setup]
            </p>

            <!-- Problem Content -->
            <!-- IMPORTANT: Do NOT use flex: 1 here - it causes overflow on tall content -->
            <div style="display: flex; gap: 30px; margin-bottom: 20px;">
                <!-- Add tables, equations, graphs as needed -->
            </div>

            <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: auto;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Your Task:</p>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">
                    [SPECIFIC QUESTION]
                </p>
                <div style="margin-top: 15px; border: 1px solid #ccc; padding: 10px; min-height: 60px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Show your work:</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Print-specific styles -->
<style>
@media print {
    .slide-container {
        overflow: visible !important;
        height: auto !important;
    }
    .print-page {
        width: 8.5in !important;
        height: 11in !important;
        margin: 0 !important;
        padding: 0.5in !important;
        box-sizing: border-box !important;
        page-break-after: always;
        border: none !important;
    }
    .print-page:last-child {
        page-break-after: auto;
    }
    svg line, svg path, svg text, svg circle {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
    div[style*="background"] {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
}
@page {
    size: letter portrait;
    margin: 0;
}
</style>
`;

// ============================================================================
// LEGACY TEMPLATES (Archived - for backward compatibility)
// ============================================================================

/**
 * @deprecated Use atomic card-patterns (TITLE_ZONE, CONTENT_BOX, etc.) instead
 * Base slide template - Foundation for all slides
 *
 * Source: archived/templates/slide-base.html
 */
export const SLIDE_BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!--
    ============================================================
    PPTX EXPORT DATA ATTRIBUTES
    ============================================================
    Each region has data-pptx-* attributes for reliable export:
    - data-pptx-region: region type (badge, title, subtitle, content, footnote)
    - data-pptx-x, y, w, h: position and size in pixels (960x540 coordinate system)
    ============================================================
  -->

  <!-- Title Zone: 0-110px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Title -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Subtitle/Instruction -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 140-500px (360px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="360"
       class="fill-height col" style="padding: 20px 20px;">
    {{content}}
  </div>

  <!-- Footnote (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * @deprecated Use CFU_ANSWER_CARD instead (with PPTX animation)
 * Slide with CFU (Check for Understanding) box visible
 *
 * Source: archived/templates/slide-with-cfu.html
 */
export const SLIDE_WITH_CFU_TEMPLATE = `
<!--
  ============================================================
  REFERENCE EXAMPLE: Slide with CFU Box (TOP RIGHT OVERLAY)
  ============================================================
  ⚠️  DO NOT use this template to generate new slides!

  HOW TO CREATE A CFU SLIDE (slides 4, 8, 12):
  1. COPY the ENTIRE previous slide verbatim (slide 3, 7, or 11)
  2. Find the closing </body> tag
  3. INSERT the CFU box IMMEDIATELY BEFORE </body>
  4. Change NOTHING else - not even a single character

  The CFU box to insert (ABSOLUTE POSITIONED TOP RIGHT):
  <div data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Your CFU question here]</p>
  </div>

  This positions the CFU box in the top right, ON TOP of all content.
  ============================================================
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 140-500px (360px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="360"
       class="fill-height col" style="padding: 20px 20px;">
    {{content}}
  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

  <!-- CFU Box (ABSOLUTE POSITIONED TOP RIGHT, ON TOP OF CONTENT) -->
  <div data-pptx-region="cfu-box"
       data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
       style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">{{cfu_question}}</p>
  </div>

</body>
</html>
`;

/**
 * @deprecated Use CFU_ANSWER_CARD instead (with PPTX animation)
 * Slide with Answer box visible
 *
 * Source: archived/templates/slide-with-answer.html
 */
export const SLIDE_WITH_ANSWER_TEMPLATE = `
<!--
  ============================================================
  REFERENCE EXAMPLE: Slide with Answer Box (TOP RIGHT OVERLAY)
  ============================================================
  ⚠️  DO NOT use this template to generate new slides!

  HOW TO CREATE AN ANSWER SLIDE (slides 6, 10):
  1. COPY the ENTIRE previous slide verbatim (slide 5 or 9)
  2. Find the closing </body> tag
  3. INSERT the Answer box IMMEDIATELY BEFORE </body>
  4. Change NOTHING else - not even a single character

  The Answer box to insert (ABSOLUTE POSITIONED TOP RIGHT):
  <div style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Your answer explanation here]</p>
  </div>

  This positions the Answer box in the top right, ON TOP of all content.
  ============================================================
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 140-500px (360px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="360"
       class="fill-height col" style="padding: 20px 20px;">
    {{content}}
  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

  <!-- Answer Box (ABSOLUTE POSITIONED TOP RIGHT, ON TOP OF CONTENT) -->
  <div data-pptx-region="answer-box"
       data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
       style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">{{answer}}</p>
  </div>

</body>
</html>
`;

/**
 * @deprecated Use atomic card-patterns instead
 * Two-column layout slide
 *
 * Source: archived/templates/slide-two-column.html
 */
export const SLIDE_TWO_COLUMN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!--
    ============================================================
    Content Zone: Two-column layout (40% text / 60% visual)
    ============================================================
    LAYOUT RULE: Text/tables on LEFT, graphs/visuals on RIGHT

    Why this matters:
    - Graphs on the right provide consistent visual anchoring
    - Left-to-right reading flow: read problem → see visual
    - Avoids tight vertical spacing when graph is below text
    - PPTX export works better with side-by-side layout
    ============================================================
  -->
  <div class="row gap-lg fill-height" style="padding: 20px 20px;">

    <!-- LEFT Column: Text/Tables (40%) - Always contains problem text, bullets, tables -->
    <div data-pptx-region="left-column"
         data-pptx-x="20" data-pptx-y="140" data-pptx-w="368" data-pptx-h="370"
         class="col" style="width: 40%;">
      <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0; color: #1d1d1d;">{{section_header}}</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #1d1d1d;">
        <li>{{bullet_1}}</li>
        <li>{{bullet_2}}</li>
        <li>{{bullet_3}}</li>
      </ul>
    </div>

    <!-- RIGHT Column: Visual (60%) - ALWAYS contains graphs/diagrams/images -->
    <!-- RULE: Graphs go HERE (right column), NEVER below the text -->
    <div data-pptx-region="right-column"
         data-pptx-x="408" data-pptx-y="140" data-pptx-w="532" data-pptx-h="370"
         class="col center" style="width: 60%;">
      <!-- For SVG: use viewBox + fixed dimensions -->
      <!-- <svg viewBox="0 0 420 380" style="width: 520px; height: 360px;"> -->
      <!-- For image: use max dimensions -->
      <img src="{{image_path}}" style="max-width: 520px; max-height: 360px; object-fit: contain;" />
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * @deprecated Use atomic card-patterns instead
 * Learning Goal slide template
 *
 * Source: archived/templates/slide-learning-goal.html
 */
export const SLIDE_LEARNING_GOAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Learning Goal</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Learning Goal Opening Slide -->
  <div class="col center fill-height" style="padding: 40px;">

    <!-- Strategy Badge -->
    <div data-pptx-region="strategy-badge"
         data-pptx-x="380" data-pptx-y="80" data-pptx-w="200" data-pptx-h="40"
         style="background: #1791e8; color: #ffffff; padding: 8px 24px; border-radius: 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{strategy_badge}}</p>
    </div>

    <!-- Strategy Name -->
    <h1 data-pptx-region="strategy-name"
        data-pptx-x="80" data-pptx-y="130" data-pptx-w="800" data-pptx-h="50"
        style="margin: 0 0 16px 0; font-size: 40px; color: #1d1d1d; text-align: center;">{{strategy_name}}</h1>

    <!-- Strategy Summary -->
    <p data-pptx-region="strategy-summary"
       data-pptx-x="130" data-pptx-y="190" data-pptx-w="700" data-pptx-h="60"
       style="margin: 0; font-size: 20px; color: #737373; text-align: center; max-width: 700px; line-height: 1.5;">{{strategy_summary}}</p>

    <!-- Learning Goal Box -->
    <div data-pptx-region="learning-goal-box"
         data-pptx-x="80" data-pptx-y="280" data-pptx-w="800" data-pptx-h="120"
         style="background: #f5f5f5; border-radius: 12px; padding: 20px 32px; margin-top: 32px; max-width: 800px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #737373; text-transform: uppercase; letter-spacing: 1px;">Learning Goal</p>
      <p style="margin: 0; font-size: 16px; color: #1d1d1d; line-height: 1.5;">{{learning_goal}}</p>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * @deprecated Use atomic card-patterns instead
 * Practice slide template
 *
 * Source: archived/templates/slide-practice.html
 */
export const SLIDE_PRACTICE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practice Problem</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Practice Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">PRACTICE</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: Practice problem with zero scaffolding -->
  <div class="fill-height col" style="padding: 20px 20px;">

    <!-- Problem Statement -->
    <div data-pptx-region="problem-statement"
         data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="80"
         style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 16px; color: #1d1d1d; line-height: 1.6;">{{problem_statement}}</p>
    </div>

    <!-- Visual/Diagram Area (if applicable) -->
    <div data-pptx-region="problem-visual"
         data-pptx-x="20" data-pptx-y="220" data-pptx-w="920" data-pptx-h="230"
         class="col center fill-height">
      {{problem_visual}}
    </div>

    <!-- Your Task Section -->
    <div data-pptx-region="task-instruction"
         data-pptx-x="20" data-pptx-y="460" data-pptx-w="920" data-pptx-h="50"
         style="background: #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-top: 12px;">
      <p style="margin: 0; font-size: 13px; color: #1d1d1d;">
        <strong>Your Task:</strong> {{task_instruction}}
      </p>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * @deprecated Use GRAPH_SNIPPET instead
 * Slide with SVG visual
 *
 * Source: archived/templates/slide-with-svg.html
 */
export const SLIDE_WITH_SVG_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!--
    ============================================================
    Content Zone: Two-column layout with SVG
    ============================================================
    LAYOUT RULE: Text/tables on LEFT (35%), SVG graph on RIGHT (65%)

    Why graphs ALWAYS go on the right:
    - Consistent visual anchoring across all step slides
    - Left-to-right reading flow: read problem → see graph
    - Avoids tight vertical spacing when graph is below text
    - PPTX export works better with side-by-side layout

    NEVER place graphs below the text column - always side-by-side.
    ============================================================
  -->
  <div class="row gap-lg" style="padding: 20px 20px; height: 390px;">

    <!-- LEFT Column: Text/Tables (35%) - Problem text, annotations, CFU/Answer boxes -->
    <div data-pptx-region="left-column"
         data-pptx-x="20" data-pptx-y="140" data-pptx-w="316" data-pptx-h="370"
         class="col" style="width: 35%;">
      <p style="font-size: 14px; line-height: 1.6; color: #1d1d1d; margin: 0;">
        {{problem_text}}
      </p>
      {{additional_content}}
    </div>

    <!--
      ============================================================
      RIGHT Column: SVG VISUAL REGION (65%)
      ============================================================
      RULE: Graphs ALWAYS go here (right column), NEVER below text.

      Fixed coordinates for screenshot capture:
      Position: x=356, y=88, width=584, height=392

      When generating SVGs:
      - Use viewBox that fits within 560x370 (with padding)
      - Set explicit width/height on <svg> element
      - SVG will be centered within this container
      ============================================================
    -->
    <div
      id="svg-container"
      data-pptx-region="svg-container"
      data-pptx-x="356" data-pptx-y="140" data-pptx-w="584" data-pptx-h="370"
      data-svg-region="true"
      class="col center"
      style="width: 65%; background: #f5f5f5; border-radius: 8px; padding: 12px;"
    >
      <!-- SVG goes here with explicit dimensions -->
      <svg
        viewBox="{{svg_viewbox}}"
        style="width: {{svg_width}}px; height: {{svg_height}}px;"
      >
        {{svg_content}}
      </svg>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

// Legacy aliases
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;
