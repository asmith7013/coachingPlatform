# Phase 5: Updating Existing Decks

## Purpose
Guide for making changes to existing worked example decks without breaking the established formats. This phase is used INSTEAD of rerunning the full skill when only specific updates are needed.

## Output Format: PPTX-Compatible HTML
All slides are **960×540px, light theme** (14-16 slides). See `03-generate-slides/protocol.md` for technical specs.

---

## When to Use This Guide

**Use this guide when:**
- Changing practice problem content (scenarios, numbers, context)
- Fixing typos or errors in existing slides
- Updating graphs or visuals
- Modifying questions or answers

**Rerun the full skill when:**
- Changing the core strategy or learning goal
- Restructuring the worked example flow
- Adding/removing slides from the deck
- Starting a completely new lesson

---

## Critical: Format Preservation Rules

### Rule 1: Never Change the Slide Structure
When updating content, preserve ALL structural elements:
- Keep the same `style` attributes on containers
- Keep the same class names (especially `print-page`)
- Keep the same CSS `<style>` blocks
- Only modify the TEXT CONTENT within elements

### Rule 2: PPTX Slide Dimensions (960×540px)

For all projection slides (slide-1 through slide-14):
- **MUST be exactly 960×540px** (NOT 100vw/100vh)
- Use `width: 960px; height: 540px` on the body
- Use light theme (white background, dark text)
- Use `.row`/`.col` classes for layout (NOT inline flexbox)
- Use web-safe fonts only (Arial, Georgia)

See `03-generate-slides/protocol.md` for complete specs.

### Rule 3: Printable Slide Format (slide-15.html)

**The printable slide MUST use this structure:**

```html
<div class="slide-container" style="width: 100%; min-height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">

    <!-- Page 1: Problem 1 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Content here -->
    </div>

    <!-- Page 2: Problem 2 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 20px auto 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Content here -->
    </div>
</div>

<!-- Print-specific styles - NEVER REMOVE -->
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
```

**CRITICAL elements that MUST be preserved:**
1. `overflow-y: auto` on `.slide-container`
2. `width: 8.5in; height: 11in` on `.print-page`
3. `flex-shrink: 0` on `.print-page`
4. The entire `<style>` block with `@media print` and `@page` rules
5. `page-break-after: always` in the print styles

---

## Update Procedures

### Procedure A: Updating Practice Problem Content

**Step 1: Read the existing slide**
```
Read: src/app/presentations/{slug}/slide-15.html
```

**Step 2: Identify what to change**
- Problem scenario text
- Table values
- Graph data points
- Question wording

**Step 3: Use Edit tool with EXACT string matching**
Only change the specific content, NOT the surrounding structure.

**Example - Changing a scenario name:**
```
old_string: <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: The Gaming Upgrade</h3>
new_string: <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: The Music Download</h3>
```

**Example - Changing table values:**
```
old_string: <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">50</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">200</td></tr>
new_string: <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">25</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">100</td></tr>
```

**Step 4: Sync to database**
```bash
source .env.local && node .claude/skills/create-worked-example-sg/scripts/sync-to-db.js {slug}
```

### Procedure B: Updating SVG Graphs

**CRITICAL: When updating graph data, you must recalculate pixel positions**

Use the formula from `03-generate-slides/visuals/svg-graphs.md`:
```
pixelX = ORIGIN_X + (dataX / X_MAX) * PLOT_WIDTH
pixelY = ORIGIN_Y - (dataY / Y_MAX) * PLOT_HEIGHT
```

**Steps:**
1. Read the existing slide
2. Identify the current graph parameters (ORIGIN, MAX values, dimensions)
3. Calculate new pixel positions for changed data points
4. Update ONLY the data-related SVG elements (lines, circles, text labels)
5. Do NOT change grid lines, axes, or axis labels unless the scale changes

### Procedure C: Replacing an Entire Practice Problem

If you need to completely replace a problem, copy the structure from the working reference:

**Step 1: Read the reference format**
```
Read: src/app/presentations/turtle-race-v2-g8u3l1/slide-11.html
```

**Step 2: Copy ONE print-page div structure**
Use the exact structure including:
- Header with Name/Date fields
- Learning Goal box
- Strategy reminder box
- Problem container with gray header
- "Your Task" section
- "Show your work" box

**Step 3: Replace content while preserving structure**
Fill in your new content within the established elements.

---

## Common Mistakes to Avoid

### ❌ WRONG: Creating separate slide files for each problem
```
slide-15.html (Problem 1)
slide-16.html (Problem 2)  ← WRONG
```

### ✅ CORRECT: All problems in one file with print-page divs
```
slide-15.html contains:
  - <div class="print-page"> Problem 1 </div>
  - <div class="print-page"> Problem 2 </div>
```

### ❌ WRONG: Using direct padding instead of print-page wrapper
```html
<div class="slide-container" style="padding: 40px 60px;">  ← WRONG
```

### ✅ CORRECT: Using overflow-y: auto and nested print-page divs
```html
<div class="slide-container" style="overflow-y: auto;">
    <div class="print-page" style="width: 8.5in; height: 11in;">  ← CORRECT
```

### ❌ WRONG: Removing or modifying the @page CSS rule
The `@page { size: letter portrait; margin: 0; }` rule is REQUIRED for proper printing.

### ❌ WRONG: Removing page-break-after from print styles
Each `.print-page` needs `page-break-after: always` in the print media query.

---

## Verification Checklist

After making updates, verify:

**For projection slides (slide-1 through slide-14):**
- [ ] All slides are exactly 960×540px
- [ ] All text is in `<p>`, `<h1-6>`, `<ul>`, `<ol>` tags
- [ ] Using `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Web-safe fonts only: Arial, Georgia
- [ ] No JavaScript, no onclick, no CSS animations

**For printable slide (slide-15):**
- [ ] `slide-15.html` has `overflow-y: auto` on `.slide-container`
- [ ] Each problem is wrapped in `<div class="print-page">`
- [ ] Each `.print-page` has `width: 8.5in; height: 11in`
- [ ] The `<style>` block contains `@media print` rules
- [ ] The `<style>` block contains `@page { size: letter portrait; margin: 0; }`
- [ ] No separate `slide-16.html` exists for a second practice problem
- [ ] Database sync completed successfully

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| **Per-slide protocol** | `.claude/skills/create-worked-example-sg/phases/03-generate-slides/protocol.md` |
| Styling reference | `.claude/skills/create-worked-example-sg/reference/styling.md` |
| Slide templates | `.claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/*.html` |
| Print template | `.claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/printable-slide-snippet.html` |
| SVG coordinate reference | `.claude/skills/create-worked-example-sg/phases/03-generate-slides/visuals/svg-graphs.md` |
| Sync script | `.claude/skills/create-worked-example-sg/scripts/sync-to-db.js` |

---

## When in Doubt

If you're unsure whether an update will break the format:

1. **Read the turtle-race reference** - It's the canonical correct format
2. **Compare structures** - Diff your changes against the reference
3. **Test print preview** - Check in browser before syncing to database
4. **Preserve, don't replace** - Use Edit tool to change content, not Write tool to replace entire files

The safest approach is to use the Edit tool with small, targeted changes rather than rewriting entire slides.
