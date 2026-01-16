# Plan: Enable D3/p5.js for Diagram Generation

## Background

The current system generates **static inline SVG** with manual positioning for diagrams. This was implemented for "PPTX compatibility" but the export pipeline actually **screenshots** the rendered content using Puppeteer, meaning JavaScript CAN execute before capture.

**The only blocker is the 50ms timeout** in `renderers.ts` - insufficient for D3/p5 to complete rendering.

| Library | Minimum Render Time | Current Timeout | Status |
|---------|-------------------|-----------------|--------|
| Static SVG | 0-10ms | 50ms | Works |
| D3 (simple) | 100-200ms | 50ms | Fails |
| p5.js | 200-500ms | 50ms | Fails |

---

## Scope Clarification

### What This Plan DOES Cover (D3/p5 Targets)

These `svgSubtype` values currently use manual SVG from `reference/diagram-patterns.md`:

| svgSubtype | Diagram Types | D3/p5 Benefit |
|------------|---------------|---------------|
| `diagram` | Double number lines, Tape diagrams, Hanger diagrams, Area models, Ratio tables, Input-output tables | Programmatic layout, automatic spacing |
| `shape` | Geometric shapes, polygons | Accurate angles, proportions |
| `number-line` | Number lines, bar models | Automatic tick placement |
| `other` | Custom visuals | Flexible rendering |

### What This Plan Does NOT Cover

| svgSubtype | Current Approach | Status |
|------------|------------------|--------|
| `coordinate-graph` | `graph-snippet.html` + `graph-planning.md` | **Keep as-is** - already has dedicated workflow |

**Coordinate graphs have their own system** with pre-calculated pixel positions, scale tables, and graph planning. This plan does NOT change that workflow.

---

## Benefits of D3/p5 for Diagrams

| Aspect | Current (Manual SVG) | With D3/p5 |
|--------|---------------------|------------|
| Tape diagrams | Manual box positioning | Automatic equal-width boxes |
| Double number lines | Manual tick alignment | Programmatic proportional spacing |
| Hanger diagrams | Manual balance positioning | Automatic centering/balancing |
| Scaling | Recalculate all positions | Change config, auto-rerender |
| Consistency | Varies by implementation | Standardized templates |

---

## Files to Modify

### 1. Renderer Pipeline (Core Change)

**File:** `src/app/api/scm/worked-examples/export-pptx/helpers/renderers.ts`

**Current code (~line 167):**
```typescript
await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
await new Promise((resolve) => setTimeout(resolve, 50));
```

**Proposed changes:**

#### A. Increase timeout and add D3 CDN

```typescript
// Add D3 to the HTML template
const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      /* existing styles */
    </style>
  </head>
  <body>${svgHtml}</body>
  </html>
`;

await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

// Wait for D3/p5 to complete rendering
await waitForVisualizationRender(page);
```

#### B. Add smart render detection function

```typescript
/**
 * Wait for D3/p5.js visualizations to complete rendering.
 * Falls back to timeout for static SVG content.
 */
async function waitForVisualizationRender(page: Page, maxWait = 500): Promise<void> {
  await page.evaluate((timeout) => {
    return new Promise<void>((resolve) => {
      // Check for D3 and wait for transitions to complete
      if (typeof (window as any).d3 !== 'undefined') {
        const d3 = (window as any).d3;
        const checkD3Complete = () => {
          // Check if any D3 transitions are still active
          let hasActiveTransitions = false;
          d3.selectAll('*').each(function() {
            if (d3.active(this)) hasActiveTransitions = true;
          });

          if (!hasActiveTransitions) {
            resolve();
          } else {
            setTimeout(checkD3Complete, 50);
          }
        };
        // Give D3 time to start transitions
        setTimeout(checkD3Complete, 100);
      }
      // Check for p5.js completion flag
      else if ((window as any)._p5RenderComplete) {
        resolve();
      }
      // Fallback timeout for static content
      else {
        setTimeout(resolve, timeout);
      }
    });
  }, maxWait);
}
```

---

### 2. Skill Documentation Updates

#### A. `phases/03-generate-slides/02-technical-rules.md`

**Current (line 17):**
```markdown
| Interactivity | NO JavaScript, NO onclick, NO CSS animations |
```

**Change to:**
```markdown
| Interactivity | NO onclick handlers, NO CSS animations. **D3.js allowed** for diagrams in `data-pptx-layer` elements |
```

**Add new section after line 20:**
```markdown
---

## JavaScript Policy

### Prohibited (breaks PPTX interactivity)
- `onclick` handlers
- Event listeners
- CSS animations/transitions
- Interactive toggles

### Allowed (gets screenshotted before export)
- **D3.js** for diagram rendering (tape diagrams, number lines, hanger diagrams, etc.)
- **p5.js** for canvas-based diagrams (experimental)

**Why this works:** The PPTX export uses Puppeteer to screenshot each slide. JavaScript executes fully before the screenshot is captured, so D3/p5 visualizations render correctly.

**Requirement:** All D3/p5 content must be wrapped in `<g data-pptx-layer="...">` for proper layer export.

**Note:** Coordinate graphs (`svgSubtype: coordinate-graph`) continue to use the existing `graph-snippet.html` workflow - D3 is NOT required for those.
```

#### B. `reference/diagram-patterns.md`

**Add new section at the top, after the intro:**
```markdown
---

## Two Approaches: Manual SVG vs D3.js

### Option 1: Manual SVG (Current Default)
- Copy patterns from this document
- Position elements manually
- Best for: Simple diagrams, quick edits

### Option 2: D3.js (Recommended for Complex Diagrams)
- Use D3 templates from `card-patterns/complex-patterns/d3-*.html`
- D3 calculates all positions programmatically
- Best for: Variable-length tape diagrams, proportional number lines, balanced hangers

**When to use D3:**
- Tape diagrams with 5+ boxes
- Double number lines with non-integer ratios
- Hanger diagrams requiring precise balance
- Any diagram where manual positioning is tedious

**D3 still requires `data-pptx-layer` attributes** for each element group.
```

#### C. `phases/03-generate-slides/checklists/pre-flight.md`

**Update line 48:**
```markdown
# Before
- [ ] No JavaScript, onclick, or animations

# After
- [ ] No onclick handlers or CSS animations
- [ ] If using D3/p5: visualization code is inside `data-pptx-layer` elements
```

---

### 3. Prompt Updates

**File:** `src/app/scm/workedExamples/create/lib/prompts.ts`

#### A. Update `GENERATE_SLIDES_SYSTEM_PROMPT` (~line 459)

**Current:**
```typescript
// - **No JavaScript**: No onclick handlers, no toggles, no animations
```

**Change to:**
```typescript
// - **No interactive JavaScript**: No onclick handlers, no toggles, no CSS animations
// - **D3.js IS allowed** for diagram rendering (tape diagrams, number lines, etc.)
//   inside data-pptx-layer elements (these get screenshotted before PPTX export)
// - **Coordinate graphs** continue using graph-snippet.html (no D3 needed)
```

#### B. Update `TECHNICAL_RULES` section

Add after the PPTX constraints:
```typescript
## JavaScript for Diagram Visualizations

D3.js may be used for non-graph diagrams (tape diagrams, double number lines, hanger diagrams, etc.).

Requirements:
1. Include D3 via CDN: \`<script src="https://d3js.org/d3.v7.min.js"></script>\`
2. All D3-generated elements must have \`data-pptx-layer\` attributes
3. Use D3 templates from card-patterns/complex-patterns/
4. No animations or transitions (static render only)

**Note:** Coordinate graphs (svgSubtype: coordinate-graph) do NOT need D3 - continue using graph-snippet.html with manual pixel positions.
```

---

### 4. New D3 Diagram Templates

Create templates for each diagram type in `phases/03-generate-slides/card-patterns/complex-patterns/`:

#### A. `d3-tape-diagram.html`

```html
<!--
  ============================================================
  D3 TAPE DIAGRAM - Programmatic Bar Model Template
  ============================================================
  Use for: Part-whole relationships, division, "times as many"

  D3 automatically:
  - Creates equal-width boxes
  - Centers labels
  - Handles any number of boxes
  - Positions total/unknown brackets
  ============================================================
-->

<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="200"
     data-svg-region="true"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 12px;">

  <svg id="tape-diagram" viewBox="0 0 500 120" style="width: 100%; height: 120px;"></svg>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
(function() {
  // ============================================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ============================================================
  const config = {
    boxes: [
      { value: '?', isUnknown: true },
      { value: '6' },
      { value: '6' },
      { value: '6' },
      { value: '6' }
    ],
    total: { value: '30', label: 'total nuggets' },
    boxHeight: 50,
    boxSpacing: 2,
    colors: {
      unknown: '#fef3c7',  // Amber for unknown
      known: '#e0f2fe',    // Light blue for known
      border: '#1e293b',
      text: '#1d1d1d'
    }
  };

  // ============================================================
  // D3 RENDERING
  // ============================================================
  const svg = d3.select('#tape-diagram');
  const margin = { top: 10, right: 20, bottom: 40, left: 20 };
  const width = 500 - margin.left - margin.right;
  const height = 120 - margin.top - margin.bottom;

  const boxWidth = (width - (config.boxes.length - 1) * config.boxSpacing) / config.boxes.length;

  // Base layer
  const baseLayer = svg.append('g')
    .attr('data-pptx-layer', 'tape-base')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Draw boxes
  config.boxes.forEach((box, i) => {
    const boxLayer = svg.append('g')
      .attr('data-pptx-layer', `box-${i}`)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = i * (boxWidth + config.boxSpacing);

    // Box rectangle
    boxLayer.append('rect')
      .attr('x', x)
      .attr('y', 0)
      .attr('width', boxWidth)
      .attr('height', config.boxHeight)
      .attr('fill', box.isUnknown ? config.colors.unknown : config.colors.known)
      .attr('stroke', config.colors.border)
      .attr('stroke-width', 2);

    // Box label
    boxLayer.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', config.boxHeight / 2 + 6)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial')
      .attr('font-size', box.isUnknown ? '20px' : '16px')
      .attr('font-weight', box.isUnknown ? 'bold' : 'normal')
      .attr('fill', config.colors.text)
      .text(box.value);
  });

  // Total bracket layer
  const totalLayer = svg.append('g')
    .attr('data-pptx-layer', 'total-bracket')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Bracket line
  totalLayer.append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', config.boxHeight + 15)
    .attr('y2', config.boxHeight + 15)
    .attr('stroke', config.colors.border)
    .attr('stroke-width', 1.5);

  // Bracket ends
  [0, width].forEach(x => {
    totalLayer.append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', config.boxHeight + 10)
      .attr('y2', config.boxHeight + 20)
      .attr('stroke', config.colors.border)
      .attr('stroke-width', 1.5);
  });

  // Total label
  totalLayer.append('text')
    .attr('x', width / 2)
    .attr('y', config.boxHeight + 35)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial')
    .attr('font-size', '14px')
    .attr('fill', config.colors.text)
    .text(`= ${config.total.value} ${config.total.label}`);

})();
</script>
```

#### B. `d3-double-number-line.html`

```html
<!--
  ============================================================
  D3 DOUBLE NUMBER LINE - Proportional Reasoning Template
  ============================================================
  Use for: Ratios, percentages, unit rates

  D3 automatically:
  - Aligns tick marks proportionally
  - Ensures zero alignment
  - Handles any ratio values
  - Highlights equivalent pairs
  ============================================================
-->

<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="180"
     data-svg-region="true"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 12px;">

  <svg id="double-number-line" viewBox="0 0 500 140" style="width: 100%; height: 140px;"></svg>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
(function() {
  // ============================================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ============================================================
  const config = {
    lineA: {
      label: 'cups of flour',
      values: [0, 3, 6, 9, 12],
      color: '#60a5fa'
    },
    lineB: {
      label: 'servings',
      values: [0, 2, 4, 6, 8],
      color: '#22c55e'
    },
    highlight: { indexA: 2, indexB: 2 },  // Highlight 6 cups = 4 servings
    spacing: 50  // Vertical space between lines
  };

  // ============================================================
  // D3 RENDERING
  // ============================================================
  const svg = d3.select('#double-number-line');
  const margin = { top: 30, right: 30, bottom: 30, left: 100 };
  const width = 500 - margin.left - margin.right;
  const height = 140 - margin.top - margin.bottom;

  const maxA = Math.max(...config.lineA.values);
  const scale = d3.scaleLinear().domain([0, maxA]).range([0, width]);

  // Line A (top)
  const lineALayer = svg.append('g')
    .attr('data-pptx-layer', 'line-a')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Line A axis
  lineALayer.append('line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', 0).attr('y2', 0)
    .attr('stroke', config.lineA.color)
    .attr('stroke-width', 2);

  // Line A label
  lineALayer.append('text')
    .attr('x', -10)
    .attr('y', 5)
    .attr('text-anchor', 'end')
    .attr('font-family', 'Arial')
    .attr('font-size', '12px')
    .attr('fill', config.lineA.color)
    .text(config.lineA.label);

  // Line A ticks and labels
  config.lineA.values.forEach((val, i) => {
    const x = scale(val);
    lineALayer.append('line')
      .attr('x1', x).attr('x2', x)
      .attr('y1', -8).attr('y2', 8)
      .attr('stroke', config.lineA.color)
      .attr('stroke-width', 1.5);

    lineALayer.append('text')
      .attr('x', x)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial')
      .attr('font-size', '12px')
      .attr('fill', config.lineA.color)
      .text(val);
  });

  // Line B (bottom)
  const lineBLayer = svg.append('g')
    .attr('data-pptx-layer', 'line-b')
    .attr('transform', `translate(${margin.left},${margin.top + config.spacing})`);

  // Line B axis
  lineBLayer.append('line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', 0).attr('y2', 0)
    .attr('stroke', config.lineB.color)
    .attr('stroke-width', 2);

  // Line B label
  lineBLayer.append('text')
    .attr('x', -10)
    .attr('y', 5)
    .attr('text-anchor', 'end')
    .attr('font-family', 'Arial')
    .attr('font-size', '12px')
    .attr('fill', config.lineB.color)
    .text(config.lineB.label);

  // Line B ticks and labels (proportionally aligned)
  const maxB = Math.max(...config.lineB.values);
  config.lineB.values.forEach((val, i) => {
    // Use proportional position based on Line A
    const proportionalX = scale(config.lineA.values[i]);

    lineBLayer.append('line')
      .attr('x1', proportionalX).attr('x2', proportionalX)
      .attr('y1', -8).attr('y2', 8)
      .attr('stroke', config.lineB.color)
      .attr('stroke-width', 1.5);

    lineBLayer.append('text')
      .attr('x', proportionalX)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial')
      .attr('font-size', '12px')
      .attr('fill', config.lineB.color)
      .text(val);
  });

  // Highlight layer (vertical dashed line connecting equivalent values)
  if (config.highlight) {
    const highlightLayer = svg.append('g')
      .attr('data-pptx-layer', 'highlight')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const highlightX = scale(config.lineA.values[config.highlight.indexA]);

    highlightLayer.append('line')
      .attr('x1', highlightX).attr('x2', highlightX)
      .attr('y1', 0).attr('y2', config.spacing)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');
  }

})();
</script>
```

#### C. `d3-hanger-diagram.html`

```html
<!--
  ============================================================
  D3 HANGER DIAGRAM - Balance Equation Template
  ============================================================
  Use for: Equation solving, balance concepts

  D3 automatically:
  - Centers the hanger
  - Balances left and right sides visually
  - Positions shapes and values
  ============================================================
-->

<div id="svg-container"
     data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="250"
     data-svg-region="true"
     class="col center"
     style="background: #f5f5f5; border-radius: 8px; padding: 12px;">

  <svg id="hanger-diagram" viewBox="0 0 400 200" style="width: 100%; height: 200px;"></svg>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
(function() {
  // ============================================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ============================================================
  const config = {
    leftSide: {
      triangles: 3,      // Number of x's (triangles)
      squares: 1,        // Number of constants (squares)
      triangleValue: 'x',
      squareValue: '1'
    },
    rightSide: {
      value: '10'
    },
    colors: {
      hanger: '#1e293b',
      triangle: '#60a5fa',
      square: '#22c55e',
      text: '#1d1d1d'
    }
  };

  // ============================================================
  // D3 RENDERING
  // ============================================================
  const svg = d3.select('#hanger-diagram');
  const width = 400;
  const height = 200;
  const centerX = width / 2;

  // Hanger structure layer
  const hangerLayer = svg.append('g')
    .attr('data-pptx-layer', 'hanger-structure');

  // Top bar
  hangerLayer.append('rect')
    .attr('x', centerX - 100)
    .attr('y', 20)
    .attr('width', 200)
    .attr('height', 10)
    .attr('fill', config.colors.hanger)
    .attr('rx', 3);

  // Center hook
  hangerLayer.append('line')
    .attr('x1', centerX).attr('x2', centerX)
    .attr('y1', 0).attr('y2', 20)
    .attr('stroke', config.colors.hanger)
    .attr('stroke-width', 3);

  // Balance bar
  hangerLayer.append('line')
    .attr('x1', centerX - 120).attr('x2', centerX + 120)
    .attr('y1', 60).attr('y2', 60)
    .attr('stroke', config.colors.hanger)
    .attr('stroke-width', 4);

  // Left string
  hangerLayer.append('line')
    .attr('x1', centerX - 80).attr('x2', centerX - 80)
    .attr('y1', 60).attr('y2', 100)
    .attr('stroke', config.colors.hanger)
    .attr('stroke-width', 2);

  // Right string
  hangerLayer.append('line')
    .attr('x1', centerX + 80).attr('x2', centerX + 80)
    .attr('y1', 60).attr('y2', 100)
    .attr('stroke', config.colors.hanger)
    .attr('stroke-width', 2);

  // Left side layer
  const leftLayer = svg.append('g')
    .attr('data-pptx-layer', 'left-side');

  // Draw triangles (x's)
  const totalLeftItems = config.leftSide.triangles + config.leftSide.squares;
  const leftStartX = centerX - 80 - (totalLeftItems * 15);

  for (let i = 0; i < config.leftSide.triangles; i++) {
    const x = leftStartX + i * 30;
    leftLayer.append('polygon')
      .attr('points', `${x},140 ${x+12},115 ${x+24},140`)
      .attr('fill', config.colors.triangle)
      .attr('stroke', config.colors.hanger)
      .attr('stroke-width', 1);
  }

  // Draw squares (constants)
  for (let i = 0; i < config.leftSide.squares; i++) {
    const x = leftStartX + (config.leftSide.triangles + i) * 30;
    leftLayer.append('rect')
      .attr('x', x)
      .attr('y', 115)
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', config.colors.square)
      .attr('stroke', config.colors.hanger)
      .attr('stroke-width', 1);

    leftLayer.append('text')
      .attr('x', x + 12)
      .attr('y', 132)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial')
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .text(config.leftSide.squareValue);
  }

  // Left label
  leftLayer.append('text')
    .attr('x', centerX - 80)
    .attr('y', 170)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial')
    .attr('font-size', '14px')
    .attr('fill', config.colors.text)
    .text(`${config.leftSide.triangles}x + ${config.leftSide.squares}`);

  // Right side layer
  const rightLayer = svg.append('g')
    .attr('data-pptx-layer', 'right-side');

  // Right value box
  rightLayer.append('rect')
    .attr('x', centerX + 55)
    .attr('y', 110)
    .attr('width', 50)
    .attr('height', 35)
    .attr('fill', '#fef3c7')
    .attr('stroke', config.colors.hanger)
    .attr('stroke-width', 2)
    .attr('rx', 4);

  rightLayer.append('text')
    .attr('x', centerX + 80)
    .attr('y', 135)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')
    .attr('fill', config.colors.text)
    .text(config.rightSide.value);

  // Equals sign layer
  const equalsLayer = svg.append('g')
    .attr('data-pptx-layer', 'equals-sign');

  equalsLayer.append('text')
    .attr('x', centerX)
    .attr('y', 135)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial')
    .attr('font-size', '24px')
    .attr('font-weight', 'bold')
    .attr('fill', config.colors.hanger)
    .text('=');

})();
</script>
```

---

### 5. Update Card Patterns README

**File:** `phases/03-generate-slides/card-patterns/README.md`

Add to the complex patterns section:
```markdown
### Complex Patterns (Clone & Modify)

| Pattern | Use Case | Notes |
|---------|----------|-------|
| `graph-snippet.html` | Coordinate graphs | Manual SVG with pixel formulas |
| `annotation-snippet.html` | Graph annotations | Use with graph-snippet |
| `d3-tape-diagram.html` | **NEW** Tape diagrams | D3.js, auto-spacing |
| `d3-double-number-line.html` | **NEW** Double number lines | D3.js, proportional alignment |
| `d3-hanger-diagram.html` | **NEW** Hanger/balance diagrams | D3.js, auto-centering |
| `visual-card-layers.html` | Multi-element right column | Manual positioning |
| `printable-slide-snippet.html` | Slide 9 printable worksheet | Special format |

**Note:** Coordinate graphs continue using `graph-snippet.html` (no D3). D3 templates are for other diagram types where programmatic layout is beneficial.
```

---

## Testing Plan

### Unit Tests

1. **Renderer timeout test**
   - Verify D3 content renders before screenshot
   - Test with tape diagram, double number line, hanger diagram

2. **PPTX layer extraction test**
   - Verify `data-pptx-layer` attributes work with D3-generated content
   - Each layer should export as separate image

### Integration Tests

1. **Full slide generation**
   - Generate a worked example with D3 tape diagram
   - Export to PPTX
   - Verify all layers are editable in PowerPoint

2. **Performance test**
   - Measure export time with 50ms vs 500ms timeout
   - Verify acceptable for 9-slide deck

### Visual Tests

1. **Compare D3 vs manual SVG**
   - Same tape diagram, both approaches
   - Verify visual parity and alignment

---

## Performance Impact

| Metric | Before (50ms) | After (500ms) | Impact |
|--------|--------------|---------------|--------|
| Per-SVG render | ~100ms | ~600ms | +500ms |
| 9-slide deck (3 SVG) | ~1.5s | ~3s | +1.5s |
| Serverless timeout | 120s | 120s | OK |

**Conclusion:** Acceptable tradeoff for improved visual quality and maintainability.

---

## Rollout Plan

### Phase 1: Enable D3 Support (Low Risk)
1. Update `renderers.ts` timeout to 500ms
2. Add D3 CDN to render template
3. Update documentation to allow D3 for diagrams
4. Create D3 diagram templates (tape, double number line, hanger)
5. Test with non-coordinate-graph slides

### Phase 2: Expand D3 Templates (Medium Risk)
1. Add D3 templates for remaining diagram types:
   - Area models
   - Ratio tables
   - Number lines
   - Discrete diagrams
2. Update prompts to suggest D3 for complex diagrams

### Phase 3: p5.js Support (If Needed)
- p5.js uses `<canvas>` which has different screenshot behavior
- May require canvas-to-image conversion
- Only pursue if D3 doesn't meet all visual needs

---

## Success Criteria

- [ ] D3 diagrams render correctly in browser preview
- [ ] PPTX export captures all D3-rendered content
- [ ] Each `data-pptx-layer` exports as separate, editable image
- [ ] Export time remains under 30 seconds for full deck
- [ ] No regression in coordinate graph rendering (graph-snippet.html)
- [ ] No regression in static SVG rendering
