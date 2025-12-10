# Phase 3: Generate Slides

## Purpose
Create 8-11 HTML slides following the established patterns, using the strategy defined in Phase 1 and scenarios confirmed in Phase 2.

## Prerequisites
- Phase 1 & 2 complete
- User has confirmed your understanding
- You have: PROBLEM ANALYSIS, STRATEGY DEFINITION, THREE SCENARIOS

---

## REQUIRED: Read Templates & Examples First

**BEFORE creating any slides, you MUST read these files using the Read tool:**

### Step 3.0: Read Reference Materials

Use the Read tool to read ALL of these files in order:

```
Read: .claude/skills/create-worked-example-sg/reference/styling.md
Read: .claude/skills/create-worked-example-sg/examples/example1.html
Read: .claude/skills/create-worked-example-sg/templates/cfu-toggle-snippet.html
Read: .claude/skills/create-worked-example-sg/templates/answer-toggle-snippet.html
Read: .claude/skills/create-worked-example-sg/templates/printable-slide-snippet.html
```

**What each file provides:**

| File | What It Contains | Use It For |
|------|-----------------|------------|
| `reference/styling.md` | Color palette, typography, layout patterns | All slides - consistent styling |
| `examples/example1.html` | Complete 9-slide hanger balance deck | See how a full worked example flows |
| `templates/cfu-toggle-snippet.html` | Interactive CFU toggle with onclick | Ask slides (Steps 1-3) |
| `templates/answer-toggle-snippet.html` | Interactive answer toggle with onclick | Reveal slides (Steps 1-3) |
| `templates/printable-slide-snippet.html` | Print-ready layout with header | Final printable worksheet slide |

**DO NOT create slides until you have read ALL 5 files above.**

After reading, update the progress file to confirm:
```json
{
  "phase": 3,
  "phaseName": "Generate Slides",
  "templatesRead": true,
  "updatedAt": "[ISO timestamp]"
}
```

---

## Slide Structure Overview

Create these slides in order:

| # | Slide Type | Content |
|---|------------|---------|
| 1 | Learning Goal | Title + strategy summary |
| 2 | Problem Setup | Scenario 1 (worked example) |
| 3 | Step 1 - Ask | Visual + CFU question |
| 4 | Step 1 - Reveal | Visual + answer |
| 5 | Step 2 - Ask | Updated visual + CFU |
| 6 | Step 2 - Reveal | Updated visual + answer |
| 7 | (Optional) Step 3 | If 3 steps needed |
| 8 | (Optional) Reasoning | If problem asks "explain" |
| 9 | Practice Problem 1 | Scenario 2 - NO scaffolding |
| 10 | Practice Problem 2 | Scenario 3 - NO scaffolding |
| 11 | Printable Worksheet | Print-friendly version |

---

## Critical Visual Rules

### Rule 1: Visual Stability
- Keep main visual (table/diagram) in the SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

### Rule 2: Fit on Screen
- All content must fit at 100vh height (no scrolling)
- Use bottom padding of 120px on Ask slides for CFU toggle
- Max content height: ~700px for main content

### Rule 3: Consistent Step Names
- Use the EXACT step verbs from your STRATEGY DEFINITION
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these verbs

---

## Visual Type Selection

Choose the right visual approach based on the problem:

**Use HTML/CSS when:**
- Simple tables with highlighting
- Text-based problems
- Static equations
- Minimal animation needed

**Use P5.js when:**
- Hanger diagrams
- Geometric shapes and transformations
- Balance/scale problems
- Interactive manipulatives
- Custom animations

**Use D3.js when:**
- Coordinate planes and graphs
- Data visualizations
- Complex charts
- Mathematical plots

For P5.js/D3.js problems, see `examples/example1.html` for how scripts are embedded.

---

## Slide Patterns

### Pattern 1: Learning Goal Slide (Slide 1)

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">
    <h3 style="font-size: 32px; font-weight: 500; color: #94a3b8; margin: 0; text-transform: uppercase;">Unit [X] Lesson [Y]</h3>
    <h1 style="font-size: 72px; font-weight: 700; letter-spacing: 2px; color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); margin: 20px 0; text-transform: uppercase;">[STRATEGY NAME]</h1>
    <p style="font-size: 28px; line-height: 1.6; color: #cbd5e1; max-width: 800px; text-align: center; margin-top: 30px;">[ONE-SENTENCE STRATEGY SUMMARY from Phase 1]</p>
</div>
```

### Pattern 2: Problem Setup (Slide 2)

Structure depends on visual type. Include:
- Engaging scenario title
- Problem statement
- Visual representation (table, hanger, graph)
- Clear question

### Pattern 3: Ask Slide with CFU Toggle

**USE THE TEMPLATE:** `templates/cfu-toggle-snippet.html` (you read this earlier)

Customize by:
1. Adding a step header: `<h2>STEP 1: [VERB]</h2>` before your content
2. Replacing `[YOUR SLIDE CONTENT HERE]` with your visual + annotations
3. Replacing `[YOUR QUESTION HERE]` with a strategy-referencing question like "Why did I [VERB] first?"

**Key points:**
- Use inline onclick handlers (works with React's dangerouslySetInnerHTML)
- CFU question MUST reference strategy verb, not ask for computation
- Bottom padding of 120px leaves room for the toggle

### Pattern 4: Reveal Slide with Answer Toggle

**USE THE TEMPLATE:** `templates/answer-toggle-snippet.html` (you read this earlier)

The differences from CFU slides:
- Button text: "↓ Show Answer"
- Box ID: `answer-box` (not `cfu-box`)
- Box background: `#4ade80` (green)
- Border: `#22c55e`
- Badge: "✅ ANSWER"

Customize by:
1. Adding step header showing completion: `<h2>STEP 1: [VERB]</h2>`
2. Showing completed visual (e.g., items crossed out, values filled in)
3. Replacing `[YOUR ANSWER HERE]` with the explanation

### Pattern 5: Practice Problem (NO Scaffolding)

Same structure as Problem Setup, but:
- Different scenario (from Phase 2)
- NO annotations
- NO CFU boxes
- NO step indicators
- Just the problem setup

### Pattern 6: Printable Worksheet (Final Slide)

Portrait orientation, print-friendly:

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

        <!-- Problem -->
        <div style="border: 2px solid #333; padding: 20px; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: [SCENARIO]</h3>
            </div>
            <!-- Problem content -->
        </div>
    </div>

    <!-- Page 2 - Same structure for Problem 2 -->
</div>
```

**Key points for printable:**
- Only practice problems (NOT worked example)
- `class="print-page"` required for page breaks
- White background, black text
- No inline print button (handled by PresentationModal)

---

## CFU Question Guidelines

**Questions MUST reference the strategy verb:**
- ✅ "Why did I [VERB] first?" (strategy question)
- ✅ "How did I know to [VERB] here?" (decision-making question)
- ✅ "What does [VERB]ing accomplish?" (conceptual question)
- ✅ "What operation should I use here and why?" (conceptual question)

**Questions must NOT be computational:**
- ❌ "What is 6 ÷ 2?" (computation question)
- ❌ "What's the answer?" (result question)
- ❌ "Calculate the unit rate" (task, not question)

---

## Core Pedagogical Principles

These rules are NON-NEGOTIABLE:

### The "Two-Slide" Rule
- NEVER show a question and its answer on the same slide
- Always separate Ask from Reveal
- Forces mental commitment before seeing solution

### The "Visual Stability" Rule
- Keep main visual (table, diagram) in SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard - problem stays put, annotations appear

### The "Scaffolding Removal" Rule
- Slides 2-6: Maximum scaffolding (step-by-step, highlighting, CFU)
- Practice slides: ZERO scaffolding (just the problem setup)
- Students must apply the strategy independently

### The "Real World" Rule
- Use engaging, age-appropriate contexts
- Avoid boring textbook scenarios (no "John has 5 apples")
- Each scenario needs a visual anchor (icon or theme)

**Good scenario contexts by grade:**
- Grade 6-7: Video game items, YouTube views, TikTok followers, sports stats
- Grade 8-9: Drone flight, crypto mining, streaming subscriptions, esports tournaments
- Grade 10+: Investment returns, data science, engineering projects, startup growth

---

## File Output & Progress Tracking

Write each slide to a separate file:
```
src/app/presentations/{slug}/
├── slide-1.html
├── slide-2.html
├── slide-3.html
├── slide-4.html
├── slide-5.html
├── slide-6.html
├── slide-7.html (practice 1)
├── slide-8.html (practice 2)
└── slide-9.html (printable)
```

Use the Write tool for each slide file.

### Track Progress After Each Slide

**After writing EACH slide file**, update the progress file:

```json
{
  "slidesCompleted": ["slide-1.html", "slide-2.html", ...],
  "updatedAt": "[ISO timestamp]"
}
```

This ensures:
1. If interrupted, you can resume from the last completed slide
2. The user can see progress
3. Phase 4 can verify all slides exist

---

## Phase 3 Completion Checklist

Before proceeding, verify:
- [ ] All slides written to files
- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] Visual stays in same position across slides 2-6
- [ ] Practice slides have zero scaffolding
- [ ] Printable worksheet includes both practice problems

---

## NEXT PHASE

**When all slides are written:**

Use the Read tool to read the Phase 4 instructions:
```
Read: .claude/skills/create-worked-example-sg/phases/04-save-to-database.md
```

Do NOT proceed until all slide files have been written.
