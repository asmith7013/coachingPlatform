# Technical Rules for PPTX-Compatible HTML

**What this file covers:** PPTX constraints, data attributes, color format, right-column layers.

---

## PPTX Constraints (Quick Reference)

| Rule | Requirement |
|------|-------------|
| Dimensions | `width: 960px; height: 540px` (EXACT) |
| Fonts | Arial, Georgia, Courier New ONLY (no Roboto, no custom fonts) |
| Layout | Use `.row`/`.col` classes (NEVER inline `display: flex`) |
| Text | ALL text in `<p>`, `<h1-6>`, `<ul>`, `<ol>` (text in `<div>` disappears!) |
| Backgrounds | Only on `<div>` elements (NOT on `<p>`, `<h1>`) |
| Bullets | Use `<ul>/<ol>` (NEVER manual bullet characters like •, -, *) |
| Interactivity | NO JavaScript, NO onclick, NO CSS animations |
| Theme | Light (white #ffffff background, dark #1d1d1d text) |
| **SVG Layers** | **⚠️ EVERY SVG element in `<g data-pptx-layer="...">` (or becomes ONE image!)** |

---

## Color Format (CRITICAL)

**ALWAYS use 6-digit hex colors. NEVER use rgb(), rgba(), hsl(), or named colors.**

| CORRECT | WRONG |
|---------|-------|
| `#ffffff` | `white` |
| `#1d1d1d` | `rgb(29, 29, 29)` |
| `#f59e0b` | `rgba(245, 158, 11, 1)` |
| `#000000` | `black` |

**Why?** The PPTX export parser only understands hex colors. Any other format will cause rendering errors or be ignored.

**For shadows:** Use a simple border instead of box-shadow, or omit shadows entirely. PPTX doesn't support shadows.

---

## Data-PPTX Attributes

Every element that should be positioned in PPTX needs these attributes:

```html
<div data-pptx-region="[region-name]"
     data-pptx-x="[x-position]"
     data-pptx-y="[y-position]"
     data-pptx-w="[width]"
     data-pptx-h="[height]">
```

### Standard Region Positions

| Region | x | y | w | h |
|--------|---|---|---|---|
| badge | 20 | 16 | 100 | 30 |
| title | 130 | 16 | 810 | 30 |
| subtitle | 20 | 55 | 920 | 30 |
| left-column | 20 | 150 | 368 | 360 |
| svg-container | 408 | 150 | 532 | 360 |
| cfu-box | 653 | 40 | 280 | 115 |
| answer-box | 653 | 40 | 280 | 115 |

---

## Right-Column Visual Layers (MANDATORY for PPTX Export)

**Every element in the right column MUST have its own `data-pptx-region="visual-*"` with coordinates.**

This ensures each visual element (table, equation card, comparison box, etc.) becomes an independent PPTX object that teachers can move and resize.

### Why This Matters

When multiple elements share one region, they become a single merged image in PowerPoint. Teachers can't adjust individual pieces. By giving each element its own region, they can:
- Reposition elements independently
- Resize individual components
- Delete/hide specific parts

### Pattern: Wrap Each Element

**See:** `card-patterns/complex-patterns/visual-card-layers.html` for complete examples.

**Right column bounds (standard two-column layout):**
- x: 408-940 (width: 532)
- y: 140-510 (height: 370)
- Content typically starts at x=420 with 12px margin

**Naming convention:** `data-pptx-region="visual-[name]"`
- `visual-table` - for data tables
- `visual-equation` - for equation cards
- `visual-comparison` - for comparison notes
- `visual-result` - for result/answer boxes
- `visual-1`, `visual-2`, etc. - when order matters

### Example: Right Column with Table + Equation Card

```html
<!-- Wrapper has NO data-pptx-region - just for layout -->
<div class="col center" style="width: 60%; padding: 12px; gap: 16px;">

  <!-- LAYER 1: Table - its own region -->
  <div data-pptx-region="visual-table"
       data-pptx-x="420" data-pptx-y="150"
       data-pptx-w="500" data-pptx-h="160"
       style="background: #ffffff; border-radius: 8px; padding: 12px;">
    <table>...</table>
  </div>

  <!-- LAYER 2: Equation card - its own region -->
  <div data-pptx-region="visual-equation"
       data-pptx-x="420" data-pptx-y="320"
       data-pptx-w="500" data-pptx-h="100"
       style="background: #e8f4fd; border-radius: 8px; padding: 16px; border-left: 4px solid #1791e8;">
    <p style="font-family: Georgia, serif; font-size: 18px;">y = 3x + 5</p>
  </div>

</div>
```

### Position Calculation (Vertical Stacking)

**Standard spacing:**
- Element 1: y=150, h=160 → bottom at y=310
- Gap: 10px
- Element 2: y=320, h=100 → bottom at y=420
- Gap: 10px
- Element 3: y=430, h=70 → bottom at y=500

### Checklist for Right-Column Content

- [ ] Each distinct visual element has its own `data-pptx-region="visual-*"`
- [ ] Each element has `data-pptx-x`, `data-pptx-y`, `data-pptx-w`, `data-pptx-h`
- [ ] Wrapper div has NO data-pptx-region (just for HTML layout)
- [ ] Coordinates don't overlap (stack with 10-16px gaps)
- [ ] Element backgrounds are set (they're preserved in screenshots)

---

## SVG-Specific Requirements

For SVG visuals, additional rules apply:

### ⚠️ Height Constraints (CRITICAL)

**Problem:** `data-pptx-*` attributes only affect PPTX export, NOT browser rendering. Without CSS constraints, SVGs overflow the slide boundary.

**Solution:** ALWAYS add CSS height constraints to BOTH the container AND the SVG element.

**Container requirements:**
```html
<div data-pptx-region="svg-container"
     data-pptx-x="408" data-pptx-y="150"
     data-pptx-w="532" data-pptx-h="360"
     data-svg-region="true"
     style="max-height: 360px; overflow: hidden;">
  <svg viewBox="0 0 520 350" style="width: 100%; height: 350px; max-height: 350px;">
    ...
  </svg>
</div>
```

**Height values by layout:**
| Layout | Container max-height | SVG height/max-height |
|--------|---------------------|----------------------|
| `two-column` | 360px | 350px |
| `graph-heavy` | 360px | 350px |
| `centered` | 200px | 180px |

**Common mistakes:**
- ❌ Only using `data-pptx-h` without CSS (works in PPTX, overflows in browser)
- ❌ Using `viewBox` alone without `height`/`max-height` style
- ❌ Setting SVG `height: 100%` without container constraint

### ⚠️ Layer Structure (CRITICAL for PPTX Export)

**Without `data-pptx-layer`, ALL SVG content becomes ONE image. With layers, each element becomes a separate clickable/editable image in PowerPoint.**

Every distinct visual element MUST be wrapped in `<g data-pptx-layer="...">`:

```html
<g data-pptx-layer="base-graph"><!-- Grid, axes --></g>
<g data-pptx-layer="line-1"><!-- First data line --></g>
<g data-pptx-layer="line-2"><!-- Second data line --></g>
<g data-pptx-layer="label-b0"><!-- Y-intercept label --></g>
<g data-pptx-layer="shape-1"><!-- Individual shape --></g>
<g data-pptx-layer="arrow-counting"><!-- Arrow annotation --></g>
```

**Layer naming convention:**
| Element Type | Pattern | Example |
|--------------|---------|---------|
| Base structure | `base`, `base-graph` | Grid, axes |
| Data lines | `line-N` | `line-1`, `line-2` |
| Shapes | `shape-N` | `shape-1`, `shape-2` |
| Labels | `label-X` | `label-b0`, `label-title` |
| Points | `point-X` | `point-solution` |
| Arrows | `arrow-X` | `arrow-counting` |

See `reference/diagram-patterns.md` for complete examples with layers.

**Text in SVG:**
- ALL `<text>` elements must have `font-family="Arial"`
- Use `font-weight="normal"` for annotations (NOT bold)

See `04-svg-workflow.md` for coordinate graph SVG rules.

---

## Layout Classes

Use these instead of inline flexbox:

| Class | Purpose |
|-------|---------|
| `.row` | Horizontal flex container |
| `.col` | Vertical flex container |
| `.center` | Center content |
| `.items-center` | Align items center |
| `.gap-sm` | Small gap (8px) |
| `.gap-md` | Medium gap (16px) |
| `.fit` | Fit content width |

**NEVER use inline `display: flex`** - always use `.row` or `.col` classes.

---

## File Format Requirements

**Each slide file must:**
- Start with `<!DOCTYPE html>` as the very first characters
- Have `<body>` with exact dimensions: `width: 960px; height: 540px`
- End with `</html>`
- Contain NO JavaScript
- Contain NO comments before `<!DOCTYPE html>`
