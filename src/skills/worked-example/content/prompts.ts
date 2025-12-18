/**
 * Shared prompt instructions for worked example creation.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/prompts/
 * To update: Edit the markdown files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * These prompts are used by both:
 * - CLI skill: .claude/skills/create-worked-example-sg/ (reads directly)
 * - Browser creator: src/app/scm/workedExamples/create/ (imports from here)
 */

/**
 * Analyze Problem Instructions
 * Step-by-step guide for analyzing a mastery check question.
 *
 * Source: .claude/skills/create-worked-example-sg/prompts/analyze-problem.md
 */
export const ANALYZE_PROBLEM_INSTRUCTIONS = `
# Analyze Problem Prompt

This prompt is used when analyzing a mastery check question image.
Both CLI and browser contexts use this same instruction set.

---

## CRITICAL: Understanding the Input

**The problem image is the MASTERY CHECK QUESTION** - the actual question students will answer on their exit ticket or assessment.

**Your job is to create a worked example that:**
1. Teaches the SAME mathematical skill
2. Uses the SAME strategy and steps
3. Uses DIFFERENT context and numbers than the mastery check

**Why different context?** Students should learn the strategy from the worked example, then apply it independently to the mastery check. If we use the same numbers/context, students can just copy the answer without learning.

---

## CRITICAL: Transcription First

**BEFORE doing any analysis, you MUST first transcribe EXACTLY what you see in the image.**

This includes:
- All text (problem statement, questions, instructions)
- All numbers and mathematical expressions
- Any diagrams, tables, or visual elements (describe them precisely)
- Answer choices if present
- Any labels, headers, or context provided

**Why this matters:** If the transcription is wrong, the entire analysis will be wrong. Take extra care to read ALL text, numbers, and visual elements accurately.

---

## Step-by-Step Instructions

### STEP 1: Solve the Problem Yourself
- Work through the mastery check step-by-step
- Write out your complete solution
- Identify the final answer

### STEP 2: Identify Mathematical Structure
Be SPECIFIC, not vague:
- ✅ "solving two-step equations with variables on both sides"
- ❌ "algebra"

Ask yourself:
- What mathematical relationships are present?
- What prior knowledge does this assume?
- What format is the answer expected in?

### STEP 3: Identify What Makes This Challenging
- Where might students make mistakes?
- What's the key insight needed?
- What misconceptions does this address?

### STEP 4: Define ONE Clear Strategy
**This is critical. The strategy thread runs through ALL slides.**

**4a: Name the Strategy**
Give it a clear, memorable name:
- "Balance and Isolate"
- "Find the Unit Rate"
- "Plot and Connect"

**4b: State it in One Sentence**
Student-facing explanation:
- "To solve this, we [VERB] the [OBJECT] to find [GOAL]"

**4c: Identify 2-3 Moves (maximum 3)**
Each move: [Action verb] → [What it accomplishes]

**4d: Define Consistent Language**
These step verbs MUST:
- Be the EXACT same throughout all slides
- Appear on every slide header ("STEP 1: [VERB]")
- Be referenced in CFU questions

### STEP 5: Create Three Scenarios
**ALL must use DIFFERENT contexts from the mastery check:**

| Scenario | Purpose | Context Rule |
|----------|---------|--------------|
| 1 | Worked Example (full scaffolding) | DIFFERENT from mastery check |
| 2 | Practice (NO scaffolding) | DIFFERENT from mastery check AND Scenario 1 |
| 3 | Practice (NO scaffolding) | DIFFERENT from ALL above |

**DO:**
- Match context to grade level interests (gaming, social media, sports, STEM)
- Keep mathematical difficulty identical
- Give each scenario a visual anchor (icon/theme)

**DO NOT:**
- Use the same context as the mastery check
- Use the same numbers as the mastery check
- Change the problem type between scenarios

### STEP 6: Determine Visual Type
- **HTML/CSS**: Tables, text problems, static equations
- **P5.js**: Hanger diagrams, geometric shapes, balance problems
- **D3.js**: Coordinate planes, graphs, data visualizations

---

## Completion Checklist (Verify Before Responding)

- [ ] problemTranscription contains EXACT verbatim text from image (all text, numbers, diagrams)
- [ ] Problem was FULLY solved step-by-step
- [ ] Problem type is SPECIFIC (not vague like "algebra")
- [ ] ONE clear strategy is named with 2-3 moves maximum
- [ ] Strategy has a one-sentence student-facing summary
- [ ] All step names use consistent verbs
- [ ] CFU question templates reference strategy verbs
- [ ] ALL 3 scenarios use DIFFERENT contexts from the mastery check
- [ ] All scenarios use the SAME mathematical structure and strategy
`;

/**
 * Generate Slides Instructions
 * Step-by-step guide for creating HTML slides.
 *
 * Source: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 */
export const GENERATE_SLIDES_INSTRUCTIONS = `
# Generate Slides Prompt

This prompt is used when generating HTML slides from the analysis.
Both CLI and browser contexts use this same instruction set.

---

## Step-by-Step Slide Generation Process

**You MUST follow this exact sequence when generating slides.**

### STEP 1: Review Your Inputs
Before generating ANY slides, verify you have:
- [ ] Problem analysis with step-by-step solution
- [ ] Strategy name and one-sentence summary
- [ ] Strategy moves (2-3 verbs that appear in slide headers)
- [ ] CFU question templates referencing strategy verbs
- [ ] Three scenarios with DIFFERENT contexts

### STEP 2: Plan the Slide Structure
Create slides in this EXACT order:

| # | Type | Template | Content |
|---|------|----------|---------|
| 1 | Learning Goal | Dark theme | Strategy name + one-sentence summary |
| 2 | Problem Setup | Dark theme | Scenario 1 introduction + visual |
| 3 | Step 1 ASK | CFU Toggle | Visual + CFU question about strategy |
| 4 | Step 1 REVEAL | Answer Toggle | Visual + step completed + explanation |
| 5 | Step 2 ASK | CFU Toggle | Updated visual + CFU question |
| 6 | Step 2 REVEAL | Answer Toggle | Updated visual + step completed |
| 7-8 | (Optional Steps) | Toggle templates | If strategy has 3 moves |
| 9 | Practice 1 | Dark theme, NO scaffold | Scenario 2 - problem setup ONLY |
| 10 | Practice 2 | Dark theme, NO scaffold | Scenario 3 - problem setup ONLY |
| 11 | Printable | WHITE theme | ALL practice problems in ONE slide |

### STEP 3: Apply Critical Rules

**Rule 1: Visual Stability (NON-NEGOTIABLE)**
- Keep main visual (table/diagram) in the SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

**Rule 2: Two-Slide Rule (NON-NEGOTIABLE)**
- NEVER show a question and its answer on the same slide
- ASK slide → mental commitment → REVEAL slide

**Rule 3: Scaffolding Removal (NON-NEGOTIABLE)**
- Slides 2-6: Maximum scaffolding (step headers, CFU, highlighting)
- Practice slides 9-10: ZERO scaffolding (just problem setup, dark theme)
- Students must apply strategy independently

**Rule 4: CFU Questions Reference Strategy**
- ✅ "Why did I [VERB] first?" (strategy question)
- ✅ "How did I know to [VERB] here?" (decision-making question)
- ❌ "What is 6 ÷ 2?" (computation question)
- ❌ "What's the answer?" (result question)

**Rule 5: Consistent Step Names**
- Use EXACT verbs from strategyDefinition.moves throughout
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these exact verbs

---

## CRITICAL: Printable Worksheet Rules

The FINAL slide MUST follow these rules EXACTLY:

**Structure:**
1. ALL practice problems go in ONE slide file with multiple \`print-page\` divs
2. Each \`print-page\` div = one printed page (8.5in x 11in with 0.5in padding)
3. NEVER create separate slides for each practice problem

**Styling (DIFFERENT from dark theme slides):**
4. Use white background (#ffffff) and black text (#000000)
5. Use Times New Roman font for printability
6. Include \`overflow-y: auto\` on slide-container
7. Include \`flex-shrink: 0\` on each print-page div

**Content:**
8. Include ONLY: Header (lesson title, unit/lesson, name/date), Learning Goal box, Problem content
9. DO NOT add: Strategy reminders, hints, scaffolding - students apply strategy independently

**CSS (REQUIRED):**
10. MUST include \`@media print\` styles
11. MUST include \`@page { size: letter portrait; margin: 0; }\`
12. MUST include \`page-break-after: always\` on each print-page

---

## Completion Checklist (Verify Before Finishing)

- [ ] Learning Goal slide uses strategy name and one-sentence summary
- [ ] Visual stays in SAME position across slides 2-6
- [ ] All step headers use EXACT verbs from strategy moves
- [ ] CFU questions reference strategy verbs (not computation)
- [ ] Practice slides (9-10) have ZERO scaffolding
- [ ] Printable slide uses WHITE background, black text, Times New Roman
- [ ] Printable slide has ALL practice problems in ONE file with print-page divs
- [ ] Printable slide includes @media print CSS with page-break rules
`;
