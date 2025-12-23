# Plan: Convert Worked Example Skill to PPTX-Compatible HTML

## Overview

Update the `create-worked-example-sg` skill to generate **PPTX-compatible HTML** as the baseline format. Slides will be viewable on web AND convertible to PowerPoint/Google Slides without modification.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Output format | **Single source** - PPTX-compatible HTML that works on web |
| Theme | **Light** - White/light backgrounds for projection |
| CFU/Answers | **Separate slides** - Preserves "predict before reveal" pedagogy |
| Interactivity | **Progressive enhancement** - Web adds click handlers that don't affect PPTX |

## Key Principle

Generate HTML that is **PPTX-compatible first, web-enhanced second**:
- Base HTML follows all pptx.md constraints (960×540, web-safe fonts, no inline flexbox, etc.)
- JavaScript for web viewing is added as external progressive enhancement
- Same HTML file works for both web preview and PPTX conversion

---

## Single Source of Truth Architecture

### Folder Structure & Usage

```
.claude/skills/create-worked-example-sg/    ← SOURCE OF TRUTH
├── prompts/                                ← LLM instructions (USED BY BOTH CLI + BROWSER)
│   ├── analyze-problem.md                  ← Problem analysis instructions
│   └── generate-slides.md                  ← PPTX slide generation instructions (PRIMARY SPEC)
├── phases/                                 ← CLI WORKFLOW ONLY (not used by browser)
│   ├── 01-collect-and-analyze.md           ← Phase 1 workflow guidance
│   ├── 02-confirm-and-plan.md              ← Phase 2 workflow guidance
│   ├── 03-generate-slides.md               ← Phase 3 workflow (references prompts/)
│   ├── 04-save-to-database.md              ← Phase 4 workflow guidance
│   └── 05-updating-decks.md                ← Phase 5 workflow guidance
├── reference/                              ← Pedagogy & styling (SYNCED TO BROWSER)
├── templates/                              ← HTML templates (SYNCED TO BROWSER)
├── scripts/                                ← PPTX conversion tools
└── pptx.md                                 ← Full PPTX constraints reference

src/skills/worked-example/                  ← AUTO-GENERATED (synced from source)
├── content/
│   ├── prompts.ts                          ← Generated from prompts/*.md
│   ├── pedagogy.ts                         ← Generated from reference/pedagogy.md
│   ├── styling.ts                          ← Generated from reference/styling.md
│   └── templates.ts                        ← Generated from templates/*.html
└── index.ts

src/app/scm/workedExamples/create/          ← BROWSER WIZARD
├── lib/prompts.ts                          ← Imports from @/skills/worked-example
├── actions/
│   ├── analyze-problem.ts                  ← Uses ANALYZE_PROBLEM_SYSTEM_PROMPT
│   └── generate-slides.ts                  ← Uses GENERATE_SLIDES_SYSTEM_PROMPT
└── components/                             ← Wizard UI components
```

### How Updates Propagate

| Source File | CLI Skill | Browser Wizard |
|-------------|-----------|----------------|
| `prompts/*.md` | Read directly by Claude | Synced to `src/skills/worked-example/content/prompts.ts` |
| `phases/*.md` | Read directly by Claude | **NOT USED** |
| `reference/*.md` | Read directly by Claude | Synced to `src/skills/worked-example/content/*.ts` |
| `templates/*.html` | Read directly by Claude | Synced to `src/skills/worked-example/content/templates.ts` |

### Sync Process

After editing source files, run:
```bash
npm run sync-skill-content
```

This regenerates the TypeScript module (`src/skills/worked-example/`) which the browser wizard imports.

### Key Insight: phases/*.md vs prompts/*.md

| Folder | Purpose | Used By |
|--------|---------|---------|
| `phases/*.md` | **Workflow guidance** - step-by-step process for each phase | CLI only (Claude reads directly) |
| `prompts/*.md` | **Technical specs** - LLM instructions for analysis/generation | Both CLI + Browser |

The `phases/*.md` files tell Claude *what to do* (workflow). The `prompts/*.md` files tell Claude *how to do it* (technical instructions).

---

## Key Constraints from pptx.md

### Dimensions & Layout
| Current HTML | PPTX Requirement |
|--------------|------------------|
| 100vw × 100vh viewport | 960×540px fixed dimensions |
| Fluid layouts | Fixed layout zones (Title: 0-100px, Content: 110-490px, Footnote: 500-540px) |
| Any padding/margins | 4px base unit system (4, 8, 12, 16, 20px) |

### Typography
| Current HTML | PPTX Requirement |
|--------------|------------------|
| Custom fonts (Rajdhani, Roboto) | Web-safe only (Arial, Georgia, Courier New, Verdana) |
| Large font sizes (48-72px) | Smaller hierarchy (Title: 32-40px, Headers: 13-15px, Body: 11-13px) |

### Interactivity & Styling
| Current HTML | PPTX Requirement |
|--------------|------------------|
| JavaScript toggles | No interactivity - static slides |
| CSS animations | No animations |
| Inline flexbox | `.row`/`.col` classes only |
| Inset shadows | Outer shadows only |

### Critical HTML Rules
| Current HTML | PPTX Requirement |
|--------------|------------------|
| Text in bare `<div>` | Text MUST be in `<p>`, `<h1-6>`, `<ul>/<ol>` (text disappears otherwise!) |
| Manual bullets (•, -, *) | Use `<ul>/<ol>` lists only |
| Styles on `<p>`, `<h1>` | Backgrounds/borders only on `<div>`, `<section>` block elements |
| `white-space: nowrap` | Not supported - make containers wide enough |

### Color & Graphics
| Current HTML | PPTX Requirement |
|--------------|------------------|
| Complex gradients | Simple linear/radial gradients on block elements |
| Any image placement | Images via `<img>` tag |
| Charts in HTML | Use `class="placeholder"` + pptxgenjs API |

---

## Changes Required

### 1. Template Files (`.claude/skills/create-worked-example-sg/templates/`)

#### A. Replace Toggle Templates with Multi-Slide Approach
The toggle interaction becomes **slide advancement**:

| Current (Interactive) | New (PPTX-Compatible) |
|----------------------|----------------------|
| Slide with hidden CFU, click to reveal | Slide 1: Question only → Slide 2: Question + CFU visible |
| Slide with hidden answer, click to reveal | Slide 1: Problem only → Slide 2: Problem + Answer visible |

This preserves "predict before reveal" pedagogy - teacher advances slides instead of clicking toggles.

#### B. New PPTX-Compatible Templates (Light Theme)

**New: `slide-base.html`** - Base slide structure (aligned with pptx.md Quick Start)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --color-primary: #1791e8;
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
    .fill-height { flex: 1 1 auto; }
    .bg-surface { background: var(--color-surface); }
    .gap-lg { gap: 20px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif;">
  <!-- Title Zone: 0-100px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 20px;" class="fit">
    <h1 style="margin: 0; font-size: 36px;">{{title}}</h1>
    <p style="margin-top: 4px; color: var(--color-muted-foreground); font-size: 14px;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 110-490px -->
  <div class="fill-height" style="padding: 10px 20px;">
    {{content}}
  </div>

  <!-- Footnote Zone: 500-540px -->
  <p style="position: absolute; bottom: 8px; left: 20px; font-size: 10pt; color: #666; margin: 0;">
    {{footnote}}
  </p>
</body>
</html>
```

**New: `slide-with-cfu.html`** - Slide with static CFU box visible
```html
<!-- Same as base, but Content Zone includes: -->
<div style="background: var(--color-cfu); border-radius: 8px; padding: 16px; margin-top: 12px;">
  <p style="font-weight: bold; margin: 0 0 8px 0;">❓ CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0;">{{cfu_question}}</p>
</div>
```

**New: `slide-with-answer.html`** - Slide with static answer box visible
```html
<!-- Same as base, but Content Zone includes: -->
<div style="background: var(--color-answer); border-radius: 8px; padding: 16px; margin-top: 12px;">
  <p style="font-weight: bold; margin: 0 0 8px 0;">✅ ANSWER</p>
  <p style="margin: 0;">{{answer}}</p>
</div>
```

**New: `slide-two-column.html`** - For visual + text layouts (aligned with pptx.md section 17)
```html
<!-- Content Zone uses row layout -->
<div class="row gap-lg fill-height" style="padding: 10px 20px;">
  <div class="col" style="width: 40%;">
    <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">{{section_header}}</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>{{bullet_1}}</li>
      <li>{{bullet_2}}</li>
      <li>{{bullet_3}}</li>
    </ul>
  </div>
  <div class="col" style="width: 60%;">
    <img src="{{image_path}}" style="max-width: 100%; max-height: 100%;" />
  </div>
</div>
```

**Update: `printable-slide-snippet.html`**
- Keep for print output (separate from PPTX)
- No changes needed (already static)

#### C. Template Summary

| Template | Purpose | Action |
|----------|---------|--------|
| `cfu-toggle-snippet.html` | Old interactive toggle | **Replace** with static CFU box |
| `answer-toggle-snippet.html` | Old interactive toggle | **Replace** with static answer box |
| `slide-base.html` | Base slide structure | **Create** (960×540, light theme) |
| `slide-with-cfu.html` | Slide with CFU box visible | **Create** |
| `slide-with-answer.html` | Slide with answer box visible | **Create** |
| `slide-two-column.html` | Visual + text layout | **Create** |
| `printable-slide-snippet.html` | Print worksheet | **Keep** (already static) |

---

### 2. Skill Documentation (`skill.md`)

#### Update Output Format Section
- Add PPTX generation workflow
- Document new template usage
- Add pptxgenjs script generation step

#### Add New Phase: PPTX Conversion
- After HTML generation, run conversion script
- Validate output with PDF conversion
- Check for visual issues

---

### 3. Reference Files (`reference/`)

#### Update `slide-patterns.md`
- Replace interactive patterns with static patterns
- Add PPTX-specific layout zones
- Document 960×540 coordinate system
- Add typography hierarchy for PPTX

#### Add `pptx-styles.css` (or inline in templates)
```css
:root {
  --color-primary: #1791e8;
  --color-surface: #ffffff;
  --color-muted: #f5f5f5;
}
/* Layout classes */
.row { display: flex; flex-direction: row; }
.col { display: flex; flex-direction: column; }
.fit { flex: 0 0 auto; }
.fill-height { flex: 1 1 auto; }
```

---

### 4. Prompts (`prompts/`)

#### Update `generate-slides.md`
Major changes needed:

1. **Dimensions**: Change from viewport units to 960×540px
2. **Fonts**: Restrict to Arial, Georgia, Courier New only
3. **Remove interactivity instructions**: No onclick, no toggles
4. **Update slide structure**:
   - Ask slides: Show CFU question as static box at bottom
   - Reveal slides: Show answer as static box at bottom
5. **Add PPTX validation checklist**

#### Key Prompt Updates

**Before (interactive):**
```
Create a toggle button that reveals the CFU question on click
```

**After (static):**
```
Add a static CFU box at the bottom of the slide with the question visible
```

---

### 5. Slide Structure Changes

#### Current Flow (Interactive HTML)
1. Learning Goal (dark)
2. Problem Setup (dark)
3-8. Ask → Reveal pairs with hidden toggles
9-10. Practice Problems (dark)
11. Printable Worksheet

#### New Flow (Static PPTX)
1. Learning Goal
2. Problem Setup
3-8. Ask → Reveal pairs (CFU/answer visible, not hidden)
9-10. Practice Problems
11. **Separate**: Printable worksheet (stays HTML, not in PPTX)

---

### 6. New Files to Create

#### `scripts/generate-pptx.js` (aligned with pptx.md section 19)
```javascript
const pptxgen = require("pptxgenjs");
const { html2pptx } = require("./html2pptx");  // Relative path per pptx.md

async function createPresentation(slidePaths, outputPath, metadata) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";  // Must match 960×540 HTML dimensions
  pptx.author = metadata.author || "AI Coaching Platform";
  pptx.title = metadata.title;

  for (const slidePath of slidePaths) {
    await html2pptx(slidePath, pptx);
  }

  await pptx.writeFile(outputPath);
  console.log(`Created: ${outputPath}`);
}

module.exports = { createPresentation };
```

**Run command (from pptx.md):**
```bash
NODE_PATH="$(npm root -g)" node scripts/generate-pptx.js 2>&1
```

#### Prerequisites (from pptx.md section 19)
```bash
# Extract html2pptx library first
mkdir -p html2pptx && tar -xzf skills/public/pptx/html2pptx.tgz -C html2pptx
```

#### `scripts/validate-pptx.sh` (from pptx.md section 16)
```bash
#!/bin/bash
# Visual validation - required step per pptx.md
soffice --headless --convert-to pdf "$1"
pdftoppm -jpeg -r 150 "${1%.pptx}.pdf" slide
# Creates: slide-1.jpg, slide-2.jpg, etc.
```

---

### 7. Browser UI Updates (`src/app/scm/workedExamples/`)

#### Update Slide Preview
- Preview now shows PPTX-compatible slides (light theme, 960×540)
- Add "Export to PPTX" button that runs conversion script
- Slide count increases (toggles → additional slides)
- No format selection needed - single unified format

---

## Implementation Checklist

### Phase 1: Templates ✅ COMPLETE

- [x] **1.1** Archive `cfu-toggle-snippet.html` (handled via legacy exports in sync)
- [x] **1.2** Archive `answer-toggle-snippet.html` (handled via legacy exports in sync)
- [x] **1.3** Create `slide-base.html` ✅
- [x] **1.4** Create `slide-with-cfu.html` ✅
- [x] **1.5** Create `slide-with-answer.html` ✅
- [x] **1.6** Create `slide-two-column.html` ✅
- [x] **1.7** Create `slide-learning-goal.html` ✅
- [x] **1.8** Create `slide-practice.html` ✅
- [x] **BONUS** Create `slide-with-svg.html` ✅

### Phase 2: Reference Documentation ✅ COMPLETE

- [x] **2.1** Update `reference/slide-patterns.md` for PPTX ✅
- [x] **2.2** Reference `pptx.md` as canonical source (exists at skill root)

### Phase 3: Prompts ✅ COMPLETE

- [x] **3.1** Update `prompts/generate-slides.md`:
  - [x] 960×540px dimensions
  - [x] Arial, Georgia fonts only
  - [x] No onclick/toggle instructions
  - [x] No CSS animation instructions
  - [x] Multi-slide reveal pattern
  - [x] PPTX pre-flight checklist
  - [x] .row/.col classes
  - [x] Text in proper tags
  - [x] Light theme color palette
  - [x] SVG visual pattern with data-svg-region

### Phase 4: Scripts ✅ COMPLETE

- [x] **4.1** `scripts/generate-pptx.js` exists ✅ (requires html2pptx library)
- [x] **4.2** `scripts/validate-pptx.sh` exists ✅
- [x] **4.3** Update `scripts/sync-skill-content.ts` for PPTX templates ✅

### Phase 5: Skill Documentation ✅ COMPLETE

- [x] **5.1** Phase files updated (01-05) for PPTX format
- [x] **5.2** Updated `examples/example1.html` to PPTX format (trimmed to 4 patterns)

### Phase 6: Browser UI - DEFERRED

- [ ] **6.1** Update slide preview styling (future work)
- [ ] **6.2** Add "Export to PPTX" button (future work)
- [x] **6.3** Sync script updated - browser now imports PPTX templates ✅

### Phase 7: Testing & Validation - PENDING

**Note:** Existing presentations use the OLD format (dark theme, 100vw/100vh).
The skill is now configured to generate NEW presentations in PPTX format.
Old presentations can be regenerated or manually converted.

- [ ] **7.1** Generate NEW worked example using `create worked example` skill
- [ ] **7.2** Verify all slides are 960×540px
- [ ] **7.3** Verify all text is in proper tags (p, h1-6, ul, ol)
- [ ] **7.4** Verify no inline flexbox (only .row/.col classes)
- [ ] **7.5** Verify web-safe fonts only (Arial, Georgia)
- [ ] **7.6** Verify light theme (white background, dark text)
- [ ] **7.7** Verify no JavaScript, no onclick handlers

---

## Files to Modify (Quick Reference)

| # | File | Action | Checklist |
|---|------|--------|-----------|
| 1 | `templates/cfu-toggle-snippet.html` | Archive | 1.1 |
| 2 | `templates/answer-toggle-snippet.html` | Archive | 1.2 |
| 3 | `templates/slide-base.html` | Create | 1.3 |
| 4 | `templates/slide-with-cfu.html` | Create | 1.4 |
| 5 | `templates/slide-with-answer.html` | Create | 1.5 |
| 6 | `templates/slide-two-column.html` | Create | 1.6 |
| 7 | `templates/slide-learning-goal.html` | Create | 1.7 |
| 8 | `templates/slide-practice.html` | Create | 1.8 |
| 9 | `reference/slide-patterns.md` | Update | 2.1 |
| 10 | `prompts/generate-slides.md` | Update | 3.1 |
| 11 | `scripts/generate-pptx.js` | Create | 4.1 |
| 12 | `scripts/validate-pptx.sh` | Create | 4.2 |
| 13 | `skill.md` | Update | 5.1 |
| 14 | `src/app/scm/workedExamples/create/` | Update | 6.1-6.4 |
| 15 | `examples/example1.html` | **Update** | Convert to PPTX format |
| 16 | `phases/01-collect-and-analyze.md` | Update | Workflow + PPTX refs |
| 17 | `phases/02-confirm-and-plan.md` | Update | Workflow + slide count |
| 18 | `phases/03-generate-slides.md` | **Major Update** | Reference prompts/generate-slides.md |
| 19 | `phases/04-save-to-database.md` | Update | Slide count update |
| 20 | `phases/05-updating-decks.md` | Update | PPTX format rules |
| 21 | `scripts/sync-skill-content.ts` | Update | New PPTX templates |

---

## Light Theme Color Palette (PPTX)

```css
:root {
  --color-primary: #1791e8;        /* Blue accent */
  --color-primary-foreground: #ffffff;
  --color-surface: #ffffff;        /* White background */
  --color-surface-foreground: #1d1d1d;  /* Dark text */
  --color-muted: #f5f5f5;          /* Light gray boxes */
  --color-muted-foreground: #737373;
  --color-cfu: #fef3c7;            /* Amber-100 for CFU boxes */
  --color-answer: #dcfce7;         /* Green-100 for answer boxes */
  --color-border: #e5e7eb;         /* Gray-200 */
}
```

## Slide Structure (PPTX)

Toggles become additional slides. Each worked example generates ~14-16 slides:

1. **Learning Goal** - Strategy name + summary
2. **Problem Setup** - Scenario introduction with visual
3. **Step 1 Question** - Shows the question/prompt
4. **Step 1 + CFU** - Same slide + CFU box appears (advance to reveal)
5. **Step 1 Answer** - Shows the answer
6. **Step 1 + Answer Box** - Same slide + answer box appears (advance to reveal)
7-12. **Steps 2-3** - Same pattern (question → +CFU → answer → +answer box)
13. **Practice Problem 1** - Zero scaffolding
14. **Practice Problem 2** - Zero scaffolding

**Key insight**: Each "toggle reveal" becomes a new slide with the revealed content visible. The base content stays the same, just with the CFU/answer box added.

(Printable worksheet remains separate HTML, not in PPTX)

---

## Pre-Flight Checklist (from pptx.md)

Before generating any slide, verify:

- [ ] Body dimensions: `width: 960px; height: 540px`
- [ ] All text in proper tags: `<p>`, `<h1-6>`, `<ul>`, `<ol>` (NOT bare text in divs!)
- [ ] Using `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Web-safe fonts only: Arial, Georgia, Courier New, Verdana
- [ ] Backgrounds/borders on `<div>` elements only (NOT on `<p>`, `<h1>`)
- [ ] No manual bullet symbols (•, -, *)
- [ ] No `white-space: nowrap`
- [ ] Title wrapped in full-width container (920px)
- [ ] Spacing uses 4px units (4, 8, 12, 16, 20px)
- [ ] No JavaScript, no `onclick`, no CSS animations

## Visual Validation Process

After generating PPTX:
```bash
# Convert to PDF for visual check
soffice --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Check for:
- Text cutoff or overflow
- Text overlap with other elements
- Poor contrast
- Alignment issues
