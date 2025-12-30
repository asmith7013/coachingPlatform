# Region Defaults

Single source of truth for slide region positions.
Run `npm run sync-skill-content` to propagate to parsers.ts.

## Slide Dimensions

```
SLIDE_WIDTH = 960
SLIDE_HEIGHT = 540
MARGIN = 20
```

## Region Positions

All values in pixels. Format: `region: x, y, w, h`

```
# Title Zone (badge + title on same line)
badge: 20, 16, 100, 30
title: 130, 16, 810, 30
subtitle: 20, 55, 920, 30
footnote: 700, 8, 240, 25

# Content Zone - Full Width
content: 20, 150, 920, 350

# Content Zone - Two Column
left-column: 20, 150, 368, 360
right-column: 408, 150, 532, 360

# SVG Container
svg-container: 408, 150, 532, 360

# Overlays
cfu-box: 653, 40, 280, 115
answer-box: 653, 40, 280, 115
```

## Bounds Validation

For each element, verify:
- `x + w ≤ 940` (fits width with margin)
- `y + h ≤ 540` (fits height)
- Stacked elements: `first.y + first.h ≤ second.y`
