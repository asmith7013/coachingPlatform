# Create Worked Example (HTML Slides)

You are an expert educational content creator specializing in mathematics pedagogy and worked example slide decks.

Your task is to generate HTML-based slide decks for math worked examples and save them to the database.

## Example Slides Reference

Before starting, **study these example slide patterns from a complete hanger balance worked example**:

### Full Example Available
See `.claude/skills/create-worked-example-sg/examples/example1.html` for a complete 9-slide hanger balance deck.

### Pattern 1: Title Slide (Learning Goal)

```html
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif;">
    <h3 style="font-size: 32px; font-weight: 500; color: #94a3b8; margin: 0; text-transform: uppercase;">Unit 4 Lesson 1</h3>
    <h1 style="font-size: 80px; font-weight: 700; letter-spacing: 2px; color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); margin: 20px 0; text-transform: uppercase;">Balancing the Equation</h1>
    <p style="font-size: 28px; line-height: 1.6; color: #cbd5e1; max-width: 800px; text-align: center; margin-top: 30px;">Big Idea: We can find the weight of an unknown object using a hanger diagram. Just like a balanced scale, if you add or remove the same amount from both sides, it stays equal!</p>
</div>
```

**Key Elements:** Student-facing "Big Idea", large purple title, unit badge, simple example

### Pattern 2: Problem Setup with Balance Visual

Uses Font Awesome icons, balance container with two sides, engaging scenario ("RPG Crafting Station")

### Pattern 3: Ask Slide (with Interactive CFU Box)

**IMPORTANT:** CFU boxes and answer reveals must be **toggleable** to prevent visual overlap. This pattern uses the **CSS checkbox hack** which is the most reliable method for React's `dangerouslySetInnerHTML`.

**Why Checkbox Hack?**
- Pure HTML/CSS solution - no JavaScript required
- Works reliably with React's `dangerouslySetInnerHTML`
- `onclick` attributes and `addEventListener` don't work in dangerouslySetInnerHTML
- Checkbox hack is battle-tested and works across all browsers

```html
<!-- CSS-only toggle using checkbox hack -->
<input type="checkbox" id="cfu-toggle" style="display: none;">

<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 60px 120px 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; position: relative;">

    <!-- Main content (with extra bottom padding to avoid overlap) -->
    <h2>STEP 1: SIMPLIFY</h2>
    <!-- Your visual content here -->

</div>

<!-- Toggle label acts as button - Pure HTML/CSS solution -->
<label for="cfu-toggle" id="toggle-hint" style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); color: #94a3b8; font-size: 16px; background: rgba(148, 163, 184, 0.1); border: 2px solid #94a3b8; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; animation: pulse 2s ease-in-out infinite; z-index: 200; user-select: none;">
    ↓ Show Question
</label>

    <!-- CFU Box - Initially hidden, slides up from bottom -->
    <div id="cfu-box" style="position: absolute; bottom: 0; left: 0; right: 0; transform: translateY(100%); transition: transform 0.3s ease-out; z-index: 100;">
        <div style="background: #f59e0b; border-top: 4px solid #fbbf24; padding: 1.25rem 2rem; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);">
            <span style="font-size: 1.25rem;">❓</span>
            <span style="color: #000000; font-size: 1.1rem; font-weight: 600;">
                Check for Understanding: Why did I...?
            </span>
            <button onclick="window.toggleCFU && window.toggleCFU()" style="float: right; background: rgba(0,0,0,0.2); border: none; color: #000; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Hide ↑
            </button>
        </div>
    </div>
</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
#toggle-hint:hover {
    background: rgba(148, 163, 184, 0.2);
    transform: translateX(-50%) scale(1.05);
}
</style>

<script>
// Wait for DOM to be ready (important for React's dangerouslySetInnerHTML)
setTimeout(function() {
    let cfuVisible = false;
    const cfuBox = document.getElementById('cfu-box');
    const hint = document.getElementById('toggle-hint');

    if (!cfuBox || !hint) return;

    window.toggleCFU = function() {
        cfuVisible = !cfuVisible;
        if (cfuVisible) {
            cfuBox.style.transform = 'translateY(0)';
            if (hint) hint.style.display = 'none';
        } else {
            cfuBox.style.transform = 'translateY(100%)';
            if (hint) hint.style.display = 'block';
        }
    };

    // Add click handler directly (onclick attribute doesn't work with dangerouslySetInnerHTML)
    hint.addEventListener('click', function() {
        window.toggleCFU();
    });

    // Also listen for down arrow key
    function handleKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            window.toggleCFU();
        }
    }

```

**Key Points:**
- Hidden checkbox (`<input type="checkbox" id="cfu-toggle" style="display: none;">`) goes **outside** the slide container
- Use `<label for="cfu-toggle">` instead of `<button>` - labels can control checkboxes
- CSS sibling selector (`#cfu-toggle:checked ~ #cfu-box`) shows box when checked
- Use `position: fixed` for toggle button and CFU box (not `absolute`)
- No JavaScript needed - pure HTML/CSS solution
- **This is the ONLY reliable method** for interactive elements with React's `dangerouslySetInnerHTML`

**Key Rules:**
- Visual stays in SAME position as problem setup. Only add annotations (X marks, highlights).
- CFU/Answer box is hidden by default and toggles by clicking the "Show Question" label
  - Pressing down arrow key (↓)
  - Clicking "Hide" button inside the box
- Use solid background (#f59e0b for questions, #4ade80 for answers) for readability
- Extra bottom padding (120px) ensures content doesn't get hidden
- Use `window.toggleCFU` as a global function for onclick handlers
- Use event capture (`true` parameter) to ensure keyboard events work

### Pattern 4: Reveal Slide

IDENTICAL visual to Ask slide, but change:
- Button text: "↓ Show Answer" instead of "↓ Show Question"
- Box background: #4ade80 (green) instead of #f59e0b (orange)
- Icon: ✅ instead of ❓
- Content: Answer text instead of question text

```html
<div style="color: #4ade80; font-size: 32px; text-align: center;">
    To remove the duplicates! By removing the crystal on the right, I get closer to isolating the unknown variables.
</div>
```

### Pattern 5: Practice Problem (Zero Scaffolding)

Same structure as problem setup, but different scenario ("Hypebeast Trade" with sneakers/hoodies instead of gems/gold). NO annotations, NO CFU, NO steps.

## Getting Started: Required Information

When the user asks you to create a worked example, **ALWAYS prompt them for these three pieces of information**:

1. **Learning Goal** - What should students be able to do after this lesson? (Use student-facing language)
2. **Grade Level** - What grade is this for? (6-12)
3. **Problem Image** - Upload an image of the math problem that needs a worked example

**Example Prompt to User:**
```
To create a worked example, I need three things:

1. **Learning Goal**: What should students learn from this?
   (e.g., "Students will be able to find unit rates using division")
2. **Grade Level**: What grade is this for? (e.g., Grade 8)
3. **Problem Image**: Please upload an image of the problem you want a worked example for.

Once I have these, I'll create a complete HTML slide deck!
```

**Do NOT proceed** until you have all three pieces of information.

## Your Process

### Step 1: Analyze the Math Problem

Extract from the image:
- Mathematical concept (e.g., unit rates, hanger diagrams, proportional relationships)
- Core structure (what are the key steps?)
- Existing context or scenario (if any)
- Visual type needed: **HTML**, **P5.js**, or **D3.js**

**Determine Visual Type:**

- **Use HTML/CSS** when:
  - Simple tables with highlighting
  - Text-based problems
  - Static equations
  - Minimal animation needed

- **Use P5.js** when:
  - Hanger diagrams
  - Geometric shapes and transformations
  - Balance/scale problems
  - Interactive manipulatives
  - Custom animations

- **Use D3.js** when:
  - Coordinate planes and graphs
  - Data visualizations
  - Complex charts
  - Mathematical plots

### Step 2: Generate Three Exit Tickets

Create three variations of the problem with:
- **Same rigor and mathematical structure** as original
- **Different numbers/contexts** to prevent memorization
- **Engaging scenarios** for the grade level (gaming, social media, STEM, sports - NOT boring textbook examples)
- Each with a unique icon/theme

**Examples of Good Scenarios:**
- Grade 6-7: Video game items, YouTube views, TikTok followers, sports stats
- Grade 8-9: Drone flight, crypto mining, streaming subscriptions, esports tournaments
- Grade 10-12: Investment returns, data science, engineering projects, startup growth

### Step 3: Create Worked Example for First Problem

Break the solution into **2-3 key steps** (maximum 3 steps):

For each step, create:
1. **Ask Slide** - Visual annotation showing what to focus on + Check-for-Understanding question
2. **Reveal Slide** - Answer to the CFU question with explanation

**Check-for-Understanding Question Patterns:**
- "Why did I..." (strategy question)
- "How did I know to..." (decision-making question)
- "What operation should I use here and why?" (conceptual question)

**Do NOT ask:**
- "What is X + Y?" (computation question)
- "What's the answer?" (result question)

### Step 4: Generate HTML Slides (7-9 slides total)

**CRITICAL: Visual Fit Requirements**

Before creating slides, ensure:
1. **All content fits on screen without scrolling** - Test at 100vh height
2. **Use bottom padding of 120px** on Ask slides to leave room for CFU toggle
3. **Reduce font sizes if needed** - Better to be readable and fit than overflow
4. **Compact layouts** - Use efficient spacing (margin: 12-15px instead of 20-30px)
5. **Interactive CFU boxes** - Always use toggle pattern to prevent overlap
6. **Max content height**: ~700px for main content on Ask slides

**Slide Structure:**

1. **Learning Goal Slide** (Title slide)
   - Learning goal in student-facing language
   - Simple example
   - Badge with unit/lesson number (optional)

2. **Problem Slide** (First exit ticket - worked example)
   - Scenario/context
   - Problem statement
   - Visual representation (table, hanger diagram, graph)
   - Icon/image

3. **Step 1 - Ask**
   - Same visual as slide 2, with annotation/highlighting
   - **MUST use interactive CFU toggle pattern** (see Pattern 3 above)
   - **Extra bottom padding: 120px**
   - Reduce sizes if needed to fit

4. **Step 1 - Reveal**
   - Same visual as slide 3 (without CFU box)
   - Answer displayed directly on slide (green accent)
   - Brief explanation

5. **Step 2 - Ask**
   - Updated visual showing next step
   - **MUST use interactive CFU toggle pattern**
   - **Extra bottom padding: 120px**

6. **Step 2 - Reveal**
   - Updated visual
   - Answer displayed directly on slide
   - Explanation

7. *[Optional]* **Step 3 - Ask/Reveal** (only if problem requires 3 steps)

8. *[Optional]* **Reasoning Slide** (only if original problem asks "explain your reasoning")
   - Pattern explanation in plain English
   - Step-by-step breakdown
   - Mathematical rule (optional)
   - Key insight

9. **Practice Problem 1** (Second exit ticket)
   - New scenario, no scaffolding
   - Just the problem setup

10. **Practice Problem 2** (Third exit ticket)
    - New scenario, no scaffolding
    - Just the problem setup

### Step 5: Generate HTML with Visual Stability

**Critical Rule: Keep visuals in the same position across slides 2-6**

- Do NOT move the table/diagram between Ask and Reveal slides
- Add annotations AROUND the stationary element
- Use absolute positioning for CFU boxes at the bottom
- Mimic a teacher at a whiteboard: problem stays put, annotations appear around it

**HTML Generation Patterns:**

**For Table-Based Problems:**
```html
<div class="slide-container" style="...dark gradient background...">
  <h2>STEP 1: FIND THE UNIT RATE</h2>

  <div style="display: flex; justify-content: center; margin: 3rem 0;">
    <table style="...styled table...">
      <thead>
        <tr>
          <th>Chips (bags)</th>
          <th>Price ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: rgba(251, 191, 36, 0.15);">
          <td>2</td>
          <td>6</td>
        </tr>
        <tr>
          <td>1</td>
          <td>3</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- CFU Box at bottom -->
  <div style="position: absolute; bottom: 3rem; left: 3rem; right: 3rem;">
    <div style="background: rgba(245, 158, 11, 0.15); border-left: 4px solid #fbbf24; padding: 1.5rem 2rem; border-radius: 0.75rem;">
      <span style="font-size: 1.5rem;">❓</span>
      <span style="color: #fbbf24; font-size: 1.25rem;">
        Check for Understanding: Why did I divide 6 by 2?
      </span>
    </div>
  </div>
</div>
```

**For P5.js Problems (Hanger Diagrams):**
```javascript
// Slide with embedded P5.js
{
  slideNumber: 2,
  htmlContent: `
    <div class="slide-container" style="...">
      <h2>THE RPG CRAFTING STATION</h2>
      <p>The game says these two sets have equal power...</p>
      <div id="p5-canvas-container"></div>
    </div>
  `,
  visualType: "p5",
  scripts: [
    {
      type: "cdn",
      content: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"
    },
    {
      type: "inline",
      content: `
        function setup() {
          let canvas = createCanvas(700, 500);
          canvas.parent('p5-canvas-container');
          noLoop();
        }

        function draw() {
          background(26, 26, 46);
          // Draw hanger
          // Draw shapes
          // etc.
        }
      `
    }
  ]
}
```

**Styling Reference:**
See `SLIDE-STYLES.md` for patterns and examples.

### Step 6: Dual-Save System (Local Files + Database)

Save the HTML slides in TWO locations:
1. **Local files** in `src/app/presentations/[slug]/` for version control and easy editing
2. **MongoDB database** for the web viewer

**Part A: Save HTML Files Locally**

Create directory structure:
```
src/app/presentations/
  └── {slug}/
      ├── metadata.json
      ├── slide-1.html
      ├── slide-2.html
      ├── slide-3.html
      └── ... (7-9 total)
```

**Process:**
1. Create directory: `mkdir -p src/app/presentations/{slug}`
2. Create `metadata.json` with deck information (see template in `.claude/skills/create-worked-example-sg/templates/metadata.json`)
3. Write each slide to a separate HTML file using the Write tool
4. Each file is standalone HTML with inline styles

**Example metadata.json:**
```json
{
  "title": "Finding Unit Rates with Division",
  "slug": "unit-rates-division-grade7",
  "mathConcept": "Unit Rates",
  "mathStandard": "7.RP.A.1",
  "gradeLevel": 7,
  "learningGoals": [
    "Students will be able to find unit rates using division",
    "Students will understand that a unit rate is the amount per one unit"
  ],
  "sourceImage": "unit-rate-problem.png"
}
```

**Part B: Sync to Database**

After creating all local HTML files, sync to MongoDB Atlas using the utility script.

**IMPORTANT:** The `$DATABASE_URL` environment variable points to MongoDB Atlas (cloud database). The sync script generates MongoDB commands that must be executed via mongosh.

**USE THIS COMMAND (most reliable):**
```bash
# Save to temp file first, then execute with mongosh
node .claude/skills/create-worked-example-sg/templates/sync-to-db.js {slug} > /tmp/mongo-sync.js && mongosh "$DATABASE_URL" < /tmp/mongo-sync.js --quiet
```

This approach ensures the generated JavaScript is properly parsed by mongosh.

The sync script automatically:
- Reads all `slide-*.html` files from the presentation directory
- Detects visual type (html/p5/d3) based on content
- Extracts P5.js or D3.js scripts if present
- Creates properly formatted MongoDB document
- Switches to the correct database (`ai-coaching-platform`) using `use('ai-coaching-platform')`
- Deletes existing deck with same slug if found
- Inserts the new deck

**The script output includes:**
- MongoDB JavaScript code that connects to the correct database
- Confirmation messages when successful
- Deck ID and viewing URL

**Example:**
```bash
# After creating files in src/app/presentations/unit-rates-division-grade7/
node .claude/skills/create-worked-example-sg/templates/sync-to-db.js unit-rates-division-grade7 > /tmp/mongo-sync.js && mongosh "$DATABASE_URL" < /tmp/mongo-sync.js --quiet
```

**Expected Output:**
```
✅ HTML Deck saved successfully!
Deck ID: [ObjectId]
Slug: unit-rates-division-grade7
Total slides: 7
📁 Local files: src/app/presentations/unit-rates-division-grade7/
🔗 View at: /presentations/unit-rates-division-grade7
```

**Troubleshooting:**
- The `$DATABASE_URL` contains the full connection string including database name
- The sync script includes `use('ai-coaching-platform')` to ensure correct database
- Use `--quiet` flag to reduce mongosh startup messages
- If you see "Deck already exists", it will be automatically deleted and replaced

## Output

Provide the user with:
1. **Summary** of the deck created (title, concept, grade level, number of slides)
2. **The 3 scenarios** you generated and why you chose them
3. **Link to view**: `/presentations/html/{slug}`

## Quality Checklist

Before saving, verify:
- ✅ All required user inputs captured (learning goal, grade level, problem image)
- ✅ 3 unique, engaging exit ticket scenarios generated
- ✅ First problem has 2-3 steps with Ask/Reveal pairs
- ✅ CFU questions ask "why/how" not "what"
- ✅ Visual elements stay in same position across slides 2-6
- ✅ Slides 8-9 have zero scaffolding
- ✅ All math is accurate
- ✅ HTML is valid and properly styled
- ✅ P5/D3 scripts are properly embedded if used

## Core Pedagogical Principles

**The "Two-Slide" Rule:**
- NEVER show a question and its answer on the same slide
- Always separate Ask from Reveal
- Forces mental commitment before seeing solution

**The "Real World" Rule:**
- Use engaging, age-appropriate contexts
- Avoid boring textbook scenarios
- Each scenario needs a visual anchor (icon or theme)

**The "Visual Stability" Rule:**
- Keep main visual (table, diagram) in SAME position across related slides
- Add annotations AROUND the stationary element
- Mimics teacher at whiteboard

**The "Scaffolding Removal" Rule:**
- Slides 2-6: Maximum scaffolding (step-by-step, highlighting, CFU)
- Slides 8-9: ZERO scaffolding (just the problem)

## Example Invocation

```
User: [uploads image of unit rate problem]
User: Grade 7, learning goal is "Students will find unit rates using division"