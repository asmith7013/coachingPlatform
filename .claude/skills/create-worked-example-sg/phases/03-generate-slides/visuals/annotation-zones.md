# SVG Annotation Guide

**This file covers annotation positioning and styling. For grid alignment and pixel calculations, see `svg-graphs.md`.**

---

## Annotation Zones

Use these predefined zones to prevent overlapping annotations:

```
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
```

| Zone | Use For |
|------|---------|
| A | Title, legend |
| B | Y-intercept labels, vertical arrows |
| C | Line labels (equations), endpoint annotations |
| D | X-axis labels, horizontal annotations |
| Plot | Data lines and points ONLY |

---

## Annotation Snippet (Copy This)

```html
<!-- ANNOTATION TEMPLATE -->
<!-- Use font-weight="normal" for readable text -->
<text
  x="5"
  y="100"
  fill="#1791e8"
  font-family="Arial"
  font-size="9"
  font-weight="normal"
>b = 20</text>
```

**Key styling rules:**
- `font-weight="normal"` - NOT bold (bold is hard to read at small sizes)
- `font-size="9"` - Smaller than axis labels (which use 11)
- `font-family="Arial"` - Required for PPTX compatibility
- Colors: Use line color for its annotation (#60a5fa blue, #22c55e green)

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

## Arrow Snippet (Small, Non-Overlapping)

```html
<defs>
  <marker id="arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
    <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
  </marker>
</defs>

<!-- Vertical arrow (y-intercept shift) -->
<line x1="25" y1="140" x2="25" y2="85" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow)"/>
```

**Arrow rules:**
- `stroke-width="2"` (not 3)
- `markerWidth="6"` and `markerHeight="4"` (small arrowhead)
- Position in Zone B (x=25) or Zone C (x=265)

---

## Stacking Multiple Annotations

When multiple annotations compete for Zone B:

1. First annotation: natural y-position
2. Second annotation: offset by 15px
3. Third annotation: offset by 30px

```html
<!-- Two y-intercept labels in Zone B -->
<text x="5" y="84" fill="#22c55e" font-family="Arial" font-size="9">b = 60</text>
<text x="5" y="144" fill="#60a5fa" font-family="Arial" font-size="9">b = 20</text>
```

---

## Quick Checklist

Before finalizing annotations:
- [ ] All annotations use `font-weight="normal"` (not bold)
- [ ] Y-intercept labels are in Zone B (x < 38)
- [ ] Line labels are in Zone C (x > 262)
- [ ] No text overlaps axes (x=40 or y=170)
- [ ] Stacked annotations have 15px minimum spacing
