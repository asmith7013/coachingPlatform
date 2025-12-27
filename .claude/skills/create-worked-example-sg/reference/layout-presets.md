# Layout Presets - Declarative Slide Composition

## Overview

Slides are composed using **atomic components** placed in **regions** defined by **layout presets**.

```
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
```

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
| `full-width` | 100% | Text-only slides, summaries |
| `two-column` | 40% / 60% | Text + visual side-by-side |
| `graph-heavy` | 35% / 65% | Narrow text + large graph |
| `with-cfu` | 100% + overlay | Full-width + CFU question |
| `two-column-with-cfu` | 40% / 60% + overlay | Two-column + CFU |

## Pixel Dimensions (960×540)

### Fixed Positions

```
TITLE ZONE (y: 0-130)
├── Badge:    x=20,  y=16,  w=180, h=35
├── Title:    x=20,  y=55,  w=920, h=40
├── Subtitle: x=20,  y=100, w=920, h=30
└── Footnote: x=700, y=8,   w=240, h=25 (top-right)

CFU/ANSWER OVERLAY (absolute positioned)
└── x=653, y=40, w=280, h=115
```

### Content Zone Variations

```
Full-Width:
└── x=20, y=140, w=920, h=360

Two-Column (40/60):
├── Left:  x=20,  y=140, w=368, h=370
└── Right: x=408, y=140, w=532, h=370

Graph-Heavy (35/65):
├── Left:  x=20,  y=140, w=316, h=370
└── Right: x=356, y=140, w=584, h=370
```

## Slide Composition Flow

### Step 1: Choose Layout Preset

Based on slide content needs:
- Text only → `full-width`
- Text + graph → `two-column` or `graph-heavy`
- Needs CFU → add `-with-cfu`

### Step 2: Fill Title Zone

Every slide has:
```html
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
```

### Step 3: Place Content in Regions

**Full-width example:**
```html
<div data-pptx-region="content"
     data-pptx-x="20" data-pptx-y="140" data-pptx-w="920" data-pptx-h="360">
  <!-- Any content: paragraphs, lists, equations, tables -->
</div>
```

**Two-column example:**
```html
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
```

### Step 4: Add Overlays (if needed)

**CFU/Answer boxes use PPTX animation** - they appear on click, no duplicate slides needed.

Insert BEFORE `</body>`:
```html
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
```

## Content Composition

Within content boxes, compose freely using:

| Element | HTML Pattern |
|---------|--------------|
| Prose | `<p style="...">Text here</p>` |
| Header | `<h3 style="...">Header</h3>` |
| Bullet list | `<ul><li>Item</li></ul>` |
| Numbered list | `<ol><li>Step</li></ol>` |
| Equation | `<p style="font-family: Georgia; text-align: center;">y = mx + b</p>` |
| Table | `<table><thead>...</thead><tbody>...</tbody></table>` |
| Bold/highlight | `<strong style="color: #1791e8;">Think:</strong>` |

See [content-box.html](../phases/03-generate-slides/card-patterns/simple-patterns/content-box.html) for complete patterns.

## PPTX Export Compatibility

Every positioned element needs `data-pptx-*` attributes:

```html
<div data-pptx-region="region-type"
     data-pptx-x="X" data-pptx-y="Y"
     data-pptx-w="W" data-pptx-h="H">
```

Region types recognized by PPTX export:
- `badge`, `title`, `subtitle`, `footnote`
- `content`, `left-column`, `right-column`
- `content-box`, `problem-statement`
- `svg-container`
- `cfu-box`, `answer-box`
