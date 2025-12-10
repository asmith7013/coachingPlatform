# Slide Patterns Reference

This file contains HTML patterns for each slide type. Use these as starting points and customize for your specific problem.

---

## Pattern 1: Learning Goal Slide (Slide 1)

The title slide establishes the strategy name and one-sentence summary.

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">
    <h3 style="font-size: 32px; font-weight: 500; color: #94a3b8; margin: 0; text-transform: uppercase;">Unit [X] Lesson [Y]</h3>
    <h1 style="font-size: 72px; font-weight: 700; letter-spacing: 2px; color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); margin: 20px 0; text-transform: uppercase;">[STRATEGY NAME]</h1>
    <p style="font-size: 28px; line-height: 1.6; color: #cbd5e1; max-width: 800px; text-align: center; margin-top: 30px;">[ONE-SENTENCE STRATEGY SUMMARY from Phase 1]</p>
</div>
```

**Customize:**
- Replace `[X]` and `[Y]` with unit/lesson numbers
- Replace `[STRATEGY NAME]` with your defined strategy name
- Replace the summary with your one-sentence student-facing explanation

---

## Pattern 2: Problem Setup (Slide 2)

Structure depends on visual type (HTML table, P5.js hanger, D3.js graph).

**Must include:**
- Engaging scenario title
- Problem statement
- Visual representation
- Clear question

**Example structure for table-based problems:**

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">

    <h2 style="font-size: 48px; font-weight: 700; color: #fbbf24; margin-bottom: 20px;">[SCENARIO TITLE]</h2>

    <p style="font-size: 24px; color: #cbd5e1; max-width: 800px; text-align: center; margin-bottom: 30px;">
        [Problem description in engaging context]
    </p>

    <!-- Visual goes here (table, diagram, etc.) -->
    <div style="margin: 30px 0;">
        <!-- YOUR VISUAL -->
    </div>

    <p style="font-size: 28px; font-weight: 600; color: #f8fafc; margin-top: 20px;">
        [THE QUESTION]
    </p>
</div>
```

---

## Pattern 3: Ask Slide with CFU Toggle

**USE THE TEMPLATE:** `templates/cfu-toggle-snippet.html`

The template provides the toggle mechanism. Customize by:

1. **Add step header** before your content:
   ```html
   <h2 style="font-size: 42px; font-weight: 700; color: #e2e8f0; margin-bottom: 30px; text-transform: uppercase;">STEP 1: [VERB]</h2>
   ```

2. **Replace** `[YOUR SLIDE CONTENT HERE]` with your visual + annotations

3. **Replace** `[YOUR QUESTION HERE]` with a strategy-referencing question

**CFU Question Examples:**
- "Why did I [VERB] first?"
- "How did I know to [VERB] here?"
- "What does [VERB]ing accomplish?"

**Key requirements:**
- Use inline onclick handlers (works with React's dangerouslySetInnerHTML)
- CFU question MUST reference strategy verb
- Bottom padding of 120px leaves room for toggle

---

## Pattern 4: Reveal Slide with Answer Toggle

**USE THE TEMPLATE:** `templates/answer-toggle-snippet.html`

**Differences from Ask slides:**

| Element | CFU (Ask) | Answer (Reveal) |
|---------|-----------|-----------------|
| Button text | "↓ Show Question" | "↓ Show Answer" |
| Box ID | `cfu-box` | `answer-box` |
| Background | `#f59e0b` (orange) | `#4ade80` (green) |
| Border | `#fbbf24` | `#22c55e` |
| Badge | "❓ CHECK FOR UNDERSTANDING" | "✅ ANSWER" |

**Customize by:**
1. Adding step header showing completion
2. Showing completed visual (items crossed out, values filled in)
3. Replacing `[YOUR ANSWER HERE]` with the explanation

---

## Pattern 5: Practice Problem (NO Scaffolding)

Same structure as Problem Setup (Pattern 2), but:
- Different scenario (from Phase 2)
- **NO** annotations
- **NO** CFU boxes
- **NO** step indicators
- Just the raw problem setup

Students must apply the strategy independently without hints.

---

## Pattern 6: Printable Worksheet (Final Slide)

**USE THE TEMPLATE:** `templates/printable-slide-snippet.html`

Portrait orientation, print-friendly layout with:
- White background, black text
- Name/Date fields
- Learning goal box
- Problem sections for each practice problem

**Key requirements:**
- Only include practice problems (NOT the worked example)
- Use `class="print-page"` for page breaks
- No inline print button (handled by PresentationModal)

**Basic structure:**

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">

    <!-- Page 1 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">

        <!-- Header -->
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

        <!-- Learning Goal -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 20px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [GOAL]</p>
        </div>

        <!-- Problem 1 -->
        <div style="border: 2px solid #333; padding: 20px; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: [SCENARIO]</h3>
            </div>
            <!-- Problem content -->
        </div>
    </div>

    <!-- Page 2 - Problem 2 with same structure -->
</div>
```

---

## Visual Type Selection Guide

Choose based on the problem type:

| Visual Type | When to Use | Example |
|-------------|-------------|---------|
| **HTML/CSS** | Tables, text problems, static equations | Unit rates, proportions |
| **P5.js** | Hanger diagrams, shapes, balance problems | Equation balance, geometry |
| **D3.js** | Coordinate planes, graphs, data viz | Linear relationships, functions |

For P5.js/D3.js implementation, see `examples/example1.html`.

---

## Annotation Techniques

When showing steps on Ask/Reveal slides:

| Technique | Use For | CSS Example |
|-----------|---------|-------------|
| **Highlight row** | Emphasizing table data | `background: rgba(251, 191, 36, 0.15);` |
| **Border/outline** | Circling elements | `border: 3px solid #fbbf24;` |
| **Strike-through** | Removed items | `text-decoration: line-through; opacity: 0.5;` |
| **Arrow** | Pointing to changes | SVG or CSS triangle |
| **Color change** | Before/after states | Different background colors |

**Remember:** Keep the main visual in the SAME position. Add annotations around it.
