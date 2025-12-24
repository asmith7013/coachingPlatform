# Generate Slides Protocol

**This is the primary technical spec for generating PPTX-compatible HTML slides.**

---

## ⚠️ API MODE vs CLI MODE

**API Mode (browser wizard):** Your response is collected as a single stream.
- Output ONLY HTML slides separated by `===SLIDE_SEPARATOR===`
- NO preamble, NO announcements, NO "I'll generate..." text
- First characters of response MUST be `<!DOCTYPE html>`

**CLI Mode (file-by-file):** You write individual files with the Write tool.
- Announce checkpoints as conversational text between file writes
- Each file starts with `<!DOCTYPE html>`

---

## 🔄 PER-SLIDE PROTOCOL (MANDATORY for EVERY Slide)

**For each slide you generate, follow this exact sequence.**

### Step 1: Announce Checkpoint (CLI MODE ONLY - NOT for API mode)

**⚠️ CRITICAL: Skip this step entirely in API mode. Only do this in CLI mode.**

**CLI Mode:** Before writing each slide file, announce what you're about to do:

```
SLIDE [N]: [Type Name]
Paired: [Yes/No] | Base: [Slide # or N/A]
Action: [generate-new | copy-and-add-cfu | copy-and-add-answer]
```

**Example announcements (plain text, NOT HTML):**
```
SLIDE 3: Step 1 Question
Paired: No | Base: N/A
Action: generate-new using slide-base.html template

SLIDE 4: Step 1 + CFU
Paired: Yes | Base: Slide 3
Action: copy-and-add-cfu (copy slide 3 verbatim, insert CFU box)
```

**If slide contains an SVG graph, add graph workflow to checkpoint:**
```
SLIDE 2: Problem Setup
Paired: No | Base: N/A
Action: generate-new using slide-two-column.html template
Graph: READ templates/graph-snippet.html → copy → modify for X_MAX=10, Y_MAX=100
Annotations: READ templates/annotation-snippet.html → add y-intercept labels
```

**⚠️ CRITICAL: What goes IN the slide HTML file:**
- The file starts with `<!DOCTYPE html>` - NOTHING before it
- NO checkpoint announcements (those are conversational only)
- NO protocol notes or comments
- NO explanatory text like "Paired: Yes" or "Action: copy-and-add-answer"
- ONLY valid HTML content starting with `<!DOCTYPE html>`

**The checkpoint announcement is what you SAY to the user, NOT what you WRITE to the file.**

---

### Step 2: Determine Slide Type and Template

| Slide # | Type | Is Paired? | Action | Template to Use |
|---------|------|------------|--------|-----------------|
| 1 | Learning Goal | No | generate-new | `templates/slide-learning-goal.html` |
| 2 | Problem Setup | No | generate-new | `templates/slide-two-column.html` |
| 3 | Step 1 Question | No | generate-new | `templates/slide-base.html` |
| 4 | Step 1 + CFU | **YES** | copy-and-add-cfu | **COPY Slide 3** |
| 5 | Step 1 Answer | No | generate-new | `templates/slide-base.html` |
| 6 | Step 1 + Answer | **YES** | copy-and-add-answer | **COPY Slide 5** |
| 7 | Step 2 Question | No | generate-new | `templates/slide-base.html` |
| 8 | Step 2 + CFU | **YES** | copy-and-add-cfu | **COPY Slide 7** |
| 9 | Step 2 Answer | No | generate-new | `templates/slide-base.html` |
| 10 | Step 2 + Answer | **YES** | copy-and-add-answer | **COPY Slide 9** |
| 11-12 | Step 3 | Pattern repeats | Same logic | Same templates |
| 13 | Practice 1 | No | generate-new | `templates/slide-practice.html` |
| 14 | Practice 2 | No | generate-new | `templates/slide-practice.html` |
| 15 | Printable | No | generate-new | `templates/printable-slide-snippet.html` |

---

### Step 3a: If Paired Slide → COPY + ADD (Fast Path)

**For slides 4, 6, 8, 10, 12 (all paired slides):**

1. **ANNOUNCE** checkpoint to user (plain text, see Step 1)
2. **COPY** the previous slide's ENTIRE HTML verbatim (from `<!DOCTYPE html>` to `</html>`)
3. **FIND** the closing `</body>` tag
4. **INSERT** the appropriate box IMMEDIATELY BEFORE `</body>` (see below)
5. **WRITE** slide file using Write tool (file starts with `<!DOCTYPE html>`)
6. **STOP** - Do NOT change anything else

**CFU Box (for slides 4, 8, 12) - ABSOLUTE POSITIONED TOP RIGHT:**
```html
<div data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[CFU question using strategy verb]</p>
</div>
```

**Answer Box (for slides 6, 10) - ABSOLUTE POSITIONED TOP RIGHT:**
```html
<div data-pptx-region="answer-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Answer explanation]</p>
</div>
```

---

### Step 3b: If New Slide → READ Template and Generate

**For slides 1, 2, 3, 5, 7, 9, 11, 13, 14, 15:**

1. **ANNOUNCE** checkpoint to user (plain text, see Step 1)
2. **READ** the template file specified in the table above
3. **FILL** the template placeholders:
   - `{{title}}` → Slide title
   - `{{step_badge}}` → "STEP N: [VERB]" (use exact verb from strategy)
   - `{{content}}` → Main content (visual, table, etc.)
   - `{{cfu_question}}` → CFU question (must reference strategy verb)
4. **IF Visual Type = "SVG graphs"**: Read `visuals/svg-graphs.md` FIRST
5. **VERIFY** the Pre-Flight Checklist below
6. **WRITE** slide file using Write tool (file starts with `<!DOCTYPE html>`)

---

### Step 4: Repeat Protocol

For each slide N from 1 to 15:
1. Return to Step 1
2. Announce checkpoint (plain text to user)
3. Follow Step 3a or 3b based on paired status
4. Write slide file (starts with `<!DOCTYPE html>`, no other content before it)
5. Continue until all slides complete

---

## ⚠️ PAIRED SLIDE CONSISTENCY (CRITICAL)

**This is the most important rule for student learning.**

When students advance from slide 3 to slide 4, they should see **ZERO visual changes** except the CFU box appearing.

**The Test:** If you diff paired slides, the ONLY difference should be the added box `<div>`.

**Common Mistakes (NEVER DO THESE):**
- Regenerating the graph (different appearance)
- Changing text (even a period or space)
- Moving elements (even 1px)
- Changing colors or styles
- Reordering HTML attributes

---

## Reference Files to Read

**Before generating slides, read the appropriate files:**

| Visual Type | Files to Read |
|-------------|---------------|
| All slides | `../../reference/styling.md` (colors, fonts, spacing) |
| All slides | `../../reference/pptx-requirements.md` (constraints) |
| SVG graphs | `visuals/svg-graphs.md` (MANDATORY) |

**Template files for each slide type:**
- `templates/slide-learning-goal.html` → Slide 1
- `templates/slide-two-column.html` → Slide 2 (40%/60% layout)
- `templates/slide-base.html` → Step Question/Answer slides
- `templates/slide-with-cfu.html` → Example of base + CFU
- `templates/slide-with-answer.html` → Example of base + Answer
- `templates/slide-practice.html` → Practice problems (zero scaffolding)
- `templates/printable-slide-snippet.html` → Printable worksheet

---

## ⚠️ SVG Graph Creation (MANDATORY WORKFLOW)

**When a slide requires an SVG coordinate plane, you MUST follow this workflow:**

### Step 1: Read the Graph Snippet
```
READ: templates/graph-snippet.html
```

This HTML file is your **starting point**. It contains:
- Arrow marker definitions for axes and lines
- Complete coordinate plane with proper alignment
- Single "0" at origin (not two separate zeros)
- Complete scale labels to the arrows
- Example data lines with extension arrows

### Step 2: Copy and Modify
1. **COPY** the entire `<svg>...</svg>` block from graph-snippet.html
2. **ADJUST** X_MAX and Y_MAX for your specific data
3. **RECALCULATE** grid and label positions using the formulas in the snippet
4. **ADD** your specific data lines and points
5. **ADD** annotations using `templates/annotation-snippet.html`

### Step 3: Verify Requirements
- [ ] Axes have arrowheads (marker-end)
- [ ] Single "0" at origin
- [ ] Scale labels go to last tick before arrow
- [ ] Data lines extend to plot edges with arrows
- [ ] Annotations use `font-weight="normal"` (not bold)
- [ ] **GRANULAR LAYERS**: Each line and annotation in its own `data-pptx-layer` group (see graph-snippet.html for examples)

### Step 4: Layer Structure (for PPTX Export)
Each SVG element you want to be independently selectable in PowerPoint/Google Slides needs its own layer:
```html
<g data-pptx-layer="line-1"><!-- Blue line + point --></g>
<g data-pptx-layer="line-2"><!-- Green line + point --></g>
<g data-pptx-layer="label-b0"><!-- Y-intercept label --></g>
```
See `graph-snippet.html` and `annotation-snippet.html` for the full layer naming convention.

**DO NOT create graphs from scratch.** Always start from graph-snippet.html.

---

## CFU Question Requirements

**Questions MUST reference the strategy verb:**
- ✅ "Why did I [VERB] first?"
- ✅ "How did I know to [VERB] here?"
- ✅ "What does [VERB]ing accomplish?"

**Questions must NOT be computational:**
- ❌ "What is 6 ÷ 2?"
- ❌ "What's the answer?"

---

## ⚠️ COLOR FORMAT (CRITICAL)

**ALWAYS use 6-digit hex colors. NEVER use rgb(), rgba(), hsl(), or named colors.**

| ✅ CORRECT | ❌ WRONG |
|-----------|----------|
| `#ffffff` | `white` |
| `#1d1d1d` | `rgb(29, 29, 29)` |
| `#f59e0b` | `rgba(245, 158, 11, 1)` |
| `#000000` | `black` |

**Why?** The PPTX export parser only understands hex colors. Any other format will cause rendering errors or be ignored.

**For shadows:** Use a simple border instead of box-shadow, or omit shadows entirely. PPTX doesn't support shadows.

---

## Pre-Flight Checklist (Verify EVERY Slide)

- [ ] File starts with `<!DOCTYPE html>` (NO checkpoint, NO comments before it)
- [ ] Body: `width: 960px; height: 540px`
- [ ] All text in `<p>`, `<h1-6>`, `<ul>`, `<ol>` (NOT bare text in divs)
- [ ] Layout uses `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Fonts: Arial, Georgia, Courier New only
- [ ] **Colors: 6-digit hex ONLY (e.g., #ffffff) - NEVER rgb/rgba/named colors**
- [ ] Backgrounds/borders on `<div>` only (NOT on `<p>`, `<h1>`)
- [ ] No JavaScript, onclick, or animations
- [ ] Light theme (white #ffffff, dark text #1d1d1d)

**PPTX Export (data-pptx attributes):**
- [ ] Key regions have `data-pptx-region`, `data-pptx-x/y/w/h` attributes
- [ ] Badge: `data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"`
- [ ] Title: `data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"`
- [ ] Subtitle: `data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"`
- [ ] CFU/Answer boxes: `data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"`

**If SVG visual:**
- [ ] Read `visuals/svg-graphs.md` first
- [ ] SVG wrapped in container with `data-pptx-region="svg-container"` and position attributes
- [ ] All `<text>` elements have `font-family="Arial"`
- [ ] SVG container in SAME position as other step slides

**If paired slide:**
- [ ] HTML is IDENTICAL to base slide except for added box

---

## Completion Checklist

- [ ] All 14-16 slides generated with checkpoints
- [ ] Paired slides are truly identical (diff test passes)
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position (slides 2-12)
- [ ] Practice slides have zero scaffolding
- [ ] Printable uses white theme + Times New Roman

---

## Context-Aware Generation Modes

### Mode: Full (Default)
Generate all slides from scratch.

### Mode: Continue
Resume from where generation was interrupted.
- DO NOT regenerate existing slides
- Match style of existing slides exactly
- Start from next slide number

### Mode: Update
Regenerate only specific slides with targeted changes.
- Output ONLY the slides marked for update
- Maintain same structure as existing slides
- Use original slide numbers

---

## Output Format

**Each slide file must:**
- Start with `<!DOCTYPE html>` as the very first characters
- Contain ONLY valid HTML (no checkpoint comments, no protocol notes)
- End with `</html>`

**⚠️ NEVER include in slide files:**
- Checkpoint announcements (those are conversational text to user)
- Protocol comments or notes
- Any text before `<!DOCTYPE html>`

When outputting multiple slides in conversation, separate with:
```
===SLIDE_SEPARATOR===
```
