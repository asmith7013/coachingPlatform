# Common Code Snippets

Quick reference index for reusable code patterns. All code is in `../examples/snippets/`.

## Card Components

All card-related components are in the `cards/` subfolder.

### Standard Card

**File:** [../examples/snippets/cards/standard-card.js](../examples/snippets/cards/standard-card.js)

- **Standard card with title** - `createStandardCard()` with options
- **Two-column layout** - `createTwoColumnLayout()` for side-by-side content
- **Intro cards (emoji + text)** - Small card grid pattern for scenario intro

**When to use:**
- Start with two-column when showing context + interaction side-by-side
- Use intro cards for engaging scenario presentation
- Standard cards for any content sections

### Video Player

**File:** [../examples/snippets/cards/video-player.js](../examples/snippets/cards/video-player.js)

- **Video player** - `createVideoPlayer()` for inline videos with optional description

**When to use:**
- Required instructional videos (always visible)
- Welcome/intro videos that students should watch immediately
- Videos that are core to understanding the question

### Video Accordion

**File:** [../examples/snippets/cards/video-accordion.js](../examples/snippets/cards/video-accordion.js)

- **Video accordion** - `createVideoAccordion()` for collapsible help videos

**When to use:**
- Optional worked examples (collapsible to avoid distraction)
- "If you're stuck" help videos
- Supplementary content that students can access on demand

### Explanation Card

**File:** [../examples/snippets/cards/explanation-card.js](../examples/snippets/cards/explanation-card.js)

- **Explanation card** - `createExplanationCard()` for text responses

**When to use:**
- "Explain your thinking" sections
- Student written explanations and reasoning
- Open-ended text responses

---

## Form Inputs & Controls

**File:** [../examples/snippets/form-inputs.js](../examples/snippets/form-inputs.js)

- **Custom textarea** - Manual textarea with state binding
- **Text input** - Single-line input (numeric or text)
- **+/- buttons** - Increment/decrement controls
- **Primary action button** - Styled button for main actions
- **Clickable card selection** - Cards that act as radio buttons

**When to use:**
- Use +/- buttons for adjusting counts/values
- Use clickable cards for visual option selection
- Use text inputs for numeric or short text entries

---

## Tables

**File:** [../examples/snippets/tables.js](../examples/snippets/tables.js)

- **Custom D3 table** - Full table with headers and data rows
- **Table with input cells** - Mix of static cells and editable inputs

**When to use:**
- Custom D3 tables when you need special styling or complex interactions
- Tables with mixed static/editable cells
- Tables requiring dynamic row/column manipulation

---

## Drag & Match

**File:** [../examples/snippets/drag-match.js](../examples/snippets/drag-match.js)

- **Drag and drop matching** - Interactive drag-to-match pattern

**When to use:**
- Matching tables to equations/graphs
- Ordering or categorization tasks
- Interactive pairing exercises

---

## SVG & D3 Visualizations

**File:** [../examples/snippets/svg-basics.js](../examples/snippets/svg-basics.js)

- **Basic SVG setup** - Responsive SVG container with viewBox
- **Rectangle** - Filled and stroked rectangles
- **Circle** - Circles for points or indicators
- **Text label** - Positioned text with styling
- **Line** - Lines connecting elements

**When to use:**
- Build custom diagrams and visualizations
- Show proportional relationships visually
- Create interactive graph elements

---

## Usage Pattern

1. **Identify what you need** from the index above
2. **Open the corresponding file** in `examples/snippets/`
3. **Copy the component implementation** (full function code)
4. **Inline it into your chart.js** IIFE under "REUSABLE COMPONENTS"
5. **Use the component** in your question-specific code
6. **Test** locally with chart.html

⚠️ **CRITICAL**: All components must be inlined directly into chart.js. External script imports will fail in production.

---

## Quick Links

### Card Components
- [Standard Card](../examples/snippets/cards/standard-card.js)
- [Video Player](../examples/snippets/cards/video-player.js)
- [Video Accordion](../examples/snippets/cards/video-accordion.js)
- [Explanation Card](../examples/snippets/cards/explanation-card.js)

### Other Snippets
- [Form Inputs](../examples/snippets/form-inputs.js)
- [Tables](../examples/snippets/tables.js)
- [Drag & Match](../examples/snippets/drag-match.js)
- [SVG Basics](../examples/snippets/svg-basics.js)
