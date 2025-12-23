# Pedagogical Framework for Worked Example Slide Decks

This document explains the research-based framework behind the slide structure.

## PPTX Format: Static Slides

**IMPORTANT**: Slides are designed for PPTX export (PowerPoint/Google Slides).
- No JavaScript toggles or animations
- "Reveal" happens by advancing to the next slide
- Each Ask/Answer pair becomes TWO slides (not one with a toggle)
- Total slide count: **14-16 slides** (not 7-9)

## Core Principles

### 1. Cognitive Load Theory
Breaking complex problems into micro-steps prevents cognitive overload. Students can focus on one decision point at a time.

### 2. Active Prediction Pedagogy
Separating questions from answers forces mental commitment before revealing solutions. This active engagement improves retention. In PPTX format, this means advancing to the next slide to see the answer.

### 3. Transfer of Learning
Independent practice (practice slides) tests whether students can apply logic to new contexts without scaffolding.

## Slide Structure (14-16 Slides)

### Slide 1: Learning Goal
**Purpose**: Introduce the strategy with student-friendly language
**Content**:
- Strategy name (prominent, centered)
- One-sentence summary ("To solve this, we [VERB] the [OBJECT] to find [GOAL]")
- Learning goal box
- No computation yet

### Slide 2: Problem Setup (Scenario 1)
**Purpose**: Provide context and show complete problem
**Content**:
- Engaging scenario with theme icon
- Problem statement
- Visual representation (graph, table, diagram)
- No solution yet

### Slides 3-8 (or 3-10): Step-by-Step with CFU

**Each step becomes 2 slides:**

**Step N - ASK Slide** (e.g., Slide 3):
- Step badge: "STEP 1"
- Title: The action question (e.g., "IDENTIFY the slope and y-intercept")
- Visual with current state
- CFU box visible at bottom (question about strategy)
- Answer NOT shown yet

**Step N - ANSWER Slide** (e.g., Slide 4):
- Same step badge and title
- Same visual with result highlighted/annotated
- Answer box visible (explains the "why")
- Teacher advances to this slide after students predict

**Number of Steps**: 2-3 maximum (4-6 step slides total)

### Slides 9-12 (Optional): Additional Steps
If the strategy has 3 moves, add more Ask/Answer pairs following the same pattern.

### Slides 13-14: Independent Practice
**Purpose**: Test transfer without scaffolding
**Content**:
- Practice badge (different from step badges)
- New scenarios (Scenario 2 and 3)
- Same mathematical structure as Scenario 1
- ZERO step-by-step guidance
- Just problem setup and "Your Task" instruction

### Slide 15-16: Printable Worksheet (Final Slide)
**Purpose**: Provide take-home practice
**Content**:
- ALL practice problems in ONE slide with multiple print-page divs
- White background, black text (for printing)
- Times New Roman font
- 8.5in × 11in page format
- @media print CSS
- NO strategy reminders - students apply independently

## The Four Rules

### Rule 1: The "Two-Slide" Rule
**Never show question and answer together**

Why: Forces students to mentally commit to a strategy before seeing if they're correct. Passive reading becomes active prediction.

PPTX Implementation:
- ASK slide: Shows CFU question, no answer
- ANSWER slide: Shows the answer after teacher advances
- Teacher can pause, discuss, then reveal

### Rule 2: The "Visual Stability" Rule
**Keep main visual in same position across slides 2-8**

Why: Reduces cognitive load from visual searching. Mimics teacher at whiteboard who keeps problem visible while adding annotations.

Implementation:
- Fix position of graph/table on slide 2
- Slides 3-8 maintain that exact position
- Add highlights, arrows, annotations AROUND the stationary element
- Never reposition the core visual between slides

### Rule 3: The "Real World" Rule
**Use engaging, age-appropriate contexts**

Why: Increases motivation and helps students see relevance.

Do:
- Gaming scenarios (RPG items, esports, gaming earnings)
- Social media (views, followers, subscribers)
- STEM contexts (drones, coding, data science)
- Sports and fitness (training plans, game stats)

Don't:
- Generic "Person A and Person B"
- Boring textbook scenarios
- Abstract variables until reasoning slide

### Rule 4: The "Scaffolding Removal" Rule
**Maximum support → Zero support**

Why: Tests true understanding vs. pattern matching.

- Slides 2-8: Full scaffolding (step badges, CFU questions, highlighting)
- Slides 13-14: No scaffolding (just the raw problem + "Your Task")

## Step Naming and Strategy Thread

**CRITICAL**: The strategy must be consistent throughout ALL slides.

### Strategy Definition
Before generating slides, define:
1. **Strategy Name**: Clear, memorable (e.g., "Plot and Connect", "Balance and Isolate")
2. **One-Sentence Summary**: "To solve this, we [VERB] the [OBJECT] to find [GOAL]"
3. **2-3 Moves**: Each move is a verb + what it accomplishes

### Step Headers Use Strategy Verbs
If your moves are IDENTIFY, PLOT, CONNECT:
- Slide 3-4: "STEP 1: IDENTIFY"
- Slide 5-6: "STEP 2: PLOT"
- Slide 7-8: "STEP 3: CONNECT"

### CFU Questions Reference Strategy
- ✅ "Why did I IDENTIFY the slope first?"
- ✅ "How does PLOTTING the y-intercept help me?"
- ❌ "What is 2 times 3?" (computation, not strategy)

## Check-for-Understanding (CFU) Question Patterns

### Good CFU Questions (Strategy-focused)
- "Why did I [VERB] first?"
- "How did I know to [VERB] here?"
- "What would happen if I skipped [VERB]?"
- "How does [VERB]ing help me find the answer?"

### Bad CFU Questions (Computation-focused)
- "What is 6 ÷ 2?" ❌
- "What's the answer?" ❌
- "How many are left?" ❌

**The difference**: Good questions ask about decision-making and strategy. Bad questions just ask for calculations.

## Visual Annotation Guidelines

### Graph/SVG Constraints (PPTX-Compatible)
- Use viewBox for consistent scaling
- Fixed container dimensions (560×360px typical)
- Explicit width/height on SVG element
- Center in container using layout classes

### Highlighting Techniques
- **Border/outline**: Circle or box around element
- **Background color**: Shade the relevant area
- **Arrows**: Point to specific parts (with small labels)
- **Color coding**: Consistent colors for slope/intercept/points

### Coordinate Mapping (CRITICAL for Graph Alignment)
- Calculate pixels per unit consistently
- Formula: `pixelX = marginLeft + (x - xMin) * pixelsPerUnit`
- Keep margins consistent across all graph slides
- Points MUST land exactly on grid intersections

## Context Variety Across Scenarios

All three scenarios must have:
- **Different surface details** (different contexts, numbers)
- **Same deep structure** (same mathematical concept and strategy)
- **Same difficulty level** (don't make practice easier)

Example for Graphing Linear Equations:
1. Scenario 1 (Worked): Gaming earnings ($50 base + $15/stream)
2. Scenario 2 (Practice): Drone altitude (100ft start + 25ft/min)
3. Scenario 3 (Practice): Savings growth ($200 start + $75/week)

All three use y = mx + b, but with completely different contexts.

## Visual Type Selection

### SVG Graphics (Recommended for PPTX)
- Coordinate planes and graphs
- Geometric shapes
- Tables with highlighting
- Custom diagrams

### When to Use HTML Tables
- Data comparisons
- Proportional relationships
- Simple numerical displays

### Avoid for PPTX
- JavaScript animations
- Interactive elements
- Canvas-based graphics (use SVG instead)

## Why This Framework Works

**Research Support:**
- Cognitive Load Theory (Sweller, 1988)
- Worked Example Effect (Atkinson et al., 2000)
- Self-Explanation Prompts (Chi et al., 1989)
- Transfer of Learning (Bransford & Schwartz, 1999)

**Practical Benefits:**
- Breaks overwhelming problems into digestible steps
- Forces active thinking vs. passive reading
- Builds conceptual understanding alongside procedural fluency
- Tests true learning through transfer problems
- Works in both web preview AND PowerPoint export

---

**Remember**: Total slide count is 14-16 (each toggle becomes a slide pair). The principles are fixed: separate Ask from Answer (via slide advancement), maintain visual stability, use engaging contexts, remove scaffolding in practice slides.
