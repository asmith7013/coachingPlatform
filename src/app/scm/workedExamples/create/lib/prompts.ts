/**
 * Prompts module for the worked example creator.
 *
 * This module imports shared content from @/skills/worked-example
 * and re-exports it along with browser-specific prompt builders.
 *
 * SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/
 * To update pedagogy rules, styling, or templates:
 *   1. Edit files in .claude/skills/create-worked-example-sg/ (templates/ or reference/)
 *   2. Run: npm run sync-skill-content
 */

// Import shared content from the centralized skill module
// SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/
// Run `npm run sync-skill-content` after editing source files
import {
  PEDAGOGY_RULES as SHARED_PEDAGOGY_RULES,
  STYLING_GUIDE as SHARED_STYLING_GUIDE,
  SLIDE_STRUCTURE as SHARED_SLIDE_STRUCTURE,
  // PPTX-compatible templates (new)
  SLIDE_BASE_TEMPLATE as SHARED_SLIDE_BASE,
  SLIDE_WITH_CFU_TEMPLATE as SHARED_SLIDE_CFU,
  SLIDE_WITH_ANSWER_TEMPLATE as SHARED_SLIDE_ANSWER,
  SLIDE_TWO_COLUMN_TEMPLATE as SHARED_SLIDE_TWO_COLUMN,
  SLIDE_LEARNING_GOAL_TEMPLATE as SHARED_SLIDE_LEARNING_GOAL,
  SLIDE_PRACTICE_TEMPLATE as SHARED_SLIDE_PRACTICE,
  PRINTABLE_TEMPLATE as SHARED_PRINTABLE_TEMPLATE,
  // SVG snippets for graphs
  GRAPH_SNIPPET as SHARED_GRAPH_SNIPPET,
  ANNOTATION_SNIPPET as SHARED_ANNOTATION_SNIPPET,
  // Legacy templates (deprecated)
  CFU_TOGGLE_TEMPLATE as SHARED_CFU_TOGGLE_TEMPLATE,
  ANSWER_TOGGLE_TEMPLATE as SHARED_ANSWER_TOGGLE_TEMPLATE,
  // Prompt instructions
  ANALYZE_PROBLEM_INSTRUCTIONS as SHARED_ANALYZE_INSTRUCTIONS,
  GENERATE_SLIDES_INSTRUCTIONS as SHARED_GENERATE_INSTRUCTIONS,
} from '@/skills/worked-example';

// Re-export shared content for backward compatibility
export const PEDAGOGY_RULES = SHARED_PEDAGOGY_RULES;
export const STYLING_GUIDE = SHARED_STYLING_GUIDE;
export const SLIDE_STRUCTURE = SHARED_SLIDE_STRUCTURE;
// PPTX-compatible templates (new)
export const SLIDE_BASE_TEMPLATE = SHARED_SLIDE_BASE;
export const SLIDE_WITH_CFU_TEMPLATE = SHARED_SLIDE_CFU;
export const SLIDE_WITH_ANSWER_TEMPLATE = SHARED_SLIDE_ANSWER;
export const SLIDE_TWO_COLUMN_TEMPLATE = SHARED_SLIDE_TWO_COLUMN;
export const SLIDE_LEARNING_GOAL_TEMPLATE = SHARED_SLIDE_LEARNING_GOAL;
export const SLIDE_PRACTICE_TEMPLATE = SHARED_SLIDE_PRACTICE;
export const PRINTABLE_TEMPLATE = SHARED_PRINTABLE_TEMPLATE;
// SVG snippets for graphs
export const GRAPH_SNIPPET = SHARED_GRAPH_SNIPPET;
export const ANNOTATION_SNIPPET = SHARED_ANNOTATION_SNIPPET;
// Legacy templates (deprecated)
export const CFU_TOGGLE_TEMPLATE = SHARED_CFU_TOGGLE_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SHARED_ANSWER_TOGGLE_TEMPLATE;

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

/**
 * System prompt for analyzing mastery check questions.
 * Uses shared instructions from SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/
 */
export const ANALYZE_PROBLEM_SYSTEM_PROMPT = `You are an expert mathematics pedagogy specialist creating worked example slide decks.

Your task is to analyze a mastery check question image and produce a structured analysis.

${PEDAGOGY_RULES}

${SHARED_ANALYZE_INSTRUCTIONS}

---

## Output Format

You MUST return valid JSON matching this exact structure:

{
  "problemAnalysis": {
    "problemTranscription": "EXACT verbatim transcription of everything in the image - all text, numbers, diagrams described, tables, etc. Be thorough and precise.",
    "problemType": "specific type (e.g., 'solving two-step equations with variables on both sides')",
    "mathematicalStructure": "description of relationships",
    "solution": [
      { "step": 1, "description": "what you do", "reasoning": "why you do it" }
    ],
    "answer": "final answer",
    "keyChallenge": "what makes this hard for students",
    "commonMistakes": ["mistake 1", "mistake 2"],
    "requiredPriorKnowledge": ["prereq 1", "prereq 2"],
    "answerFormat": "how answer should be presented",
    "visualType": "HTML/CSS" | "HTML diagrams" | "SVG graphs"
  },
  "strategyDefinition": {
    "name": "Clear Strategy Name (e.g., 'Balance and Isolate')",
    "oneSentenceSummary": "To solve this, we [VERB] the [OBJECT] to find [GOAL]",
    "moves": [
      { "verb": "VERB1", "description": "what this step does", "result": "what it accomplishes" }
    ],
    "slideHeaders": ["STEP 1: VERB1", "STEP 2: VERB2"],
    "cfuQuestionTemplates": ["Why did I [VERB] first?", "How does [VERB]ing help?"]
  },
  "scenarios": [
    {
      "name": "Scenario name",
      "context": "Brief description of the engaging context",
      "themeIcon": "emoji representing the theme",
      "numbers": "the specific numbers used",
      "description": "Full problem description"
    }
  ]
}

Return ONLY valid JSON. Do not include any explanation or markdown formatting.
`;

export const EDIT_SLIDE_SYSTEM_PROMPT = `You are an expert educational content creator editing PPTX-compatible HTML slides for math worked examples.

## PPTX Format Constraints

- **Dimensions**: Body MUST be exactly 960×540px (do NOT change this!)
- **Theme**: Light theme (white background, dark text)
- **Fonts**: Arial, Georgia only
- **Layout**: Use .row/.col classes (NOT inline display:flex)
- **No JavaScript**: There should be NO onclick handlers or toggles

${STYLING_GUIDE}

## Your Task

You will receive:
1. The current HTML of a PPTX-compatible slide
2. User instructions for how to edit it

Apply the user's requested changes while preserving the slide's structure and formatting.

## Critical: Format Preservation Rules

### Rule 1: Never Change the Slide Structure
When updating content, preserve ALL structural elements:
- Keep body dimensions: width: 960px; height: 540px
- Keep the same \`style\` attributes on containers
- Keep the same class names (especially \`print-page\`, \`slide-container\`)
- Keep the same CSS \`<style>\` blocks intact
- Only modify the TEXT CONTENT within elements

### Rule 2: Keep PPTX Compatibility
- All text MUST be in proper tags: <p>, <h1-6>, <ul>, <ol>
- Use .row/.col classes for layout
- No JavaScript, no onclick handlers
- Light theme only

### Rule 3: Printable Slide Considerations
If editing a printable slide (contains \`print-page\` class), these elements MUST be preserved:
- \`overflow-y: auto\` on \`.slide-container\`
- \`width: 8.5in; height: 11in\` on \`.print-page\`
- \`flex-shrink: 0\` on \`.print-page\`
- The entire \`<style>\` block with \`@media print\` and \`@page\` rules
- \`page-break-after: always\` in the print styles

## Common Mistakes to Avoid

- ❌ Don't change body dimensions from 960×540px
- ❌ Don't remove or modify @media print CSS rules
- ❌ Don't change container dimensions or padding
- ❌ Don't add JavaScript or onclick handlers
- ✅ DO only change the specific text/content requested
- ✅ DO preserve all structural HTML and CSS

## Output Format

Return ONLY the edited HTML. Do not include any explanation or markdown formatting.
The output should be complete, valid HTML that can be rendered in an iframe.
`;

/**
 * System prompt for generating PPTX-compatible HTML slides.
 * Uses shared instructions from SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/
 *
 * PPTX FORMAT: 960×540px, light theme, Arial font, no JavaScript toggles
 */
export const GENERATE_SLIDES_SYSTEM_PROMPT = `You are an expert educational content creator generating PPTX-compatible HTML slide decks for math worked examples.

## CRITICAL: PPTX Constraints

- **Dimensions**: Every slide body MUST be exactly 960×540px
- **Theme**: Light theme (white background #ffffff, dark text #1d1d1d)
- **Fonts**: Arial, Georgia only (no custom fonts)
- **Layout**: Use .row/.col classes (NOT inline display:flex)
- **No JavaScript**: No onclick handlers, no toggles, no animations
- **Text in proper tags**: All text MUST be in <p>, <h1-6>, <ul>, <ol> (NOT bare text in divs!)

${PEDAGOGY_RULES}

${STYLING_GUIDE}

${SLIDE_STRUCTURE}

${SHARED_GENERATE_INSTRUCTIONS}

---

## HTML Templates to Use (PPTX-Compatible)

### Learning Goal Slide (slide 1):
${SLIDE_LEARNING_GOAL_TEMPLATE}

### Two-Column Layout (for problem setup and steps):
${SLIDE_TWO_COLUMN_TEMPLATE}

### CFU Slide (CFU box visible - for "Ask" slides):
${SLIDE_WITH_CFU_TEMPLATE}

### Answer Slide (Answer box visible - for "Reveal" slides):
${SLIDE_WITH_ANSWER_TEMPLATE}

### Practice Slide (zero scaffolding):
${SLIDE_PRACTICE_TEMPLATE}

### Printable Worksheet (FINAL SLIDE):
${PRINTABLE_TEMPLATE}

---

## SVG GRAPH TEMPLATES (MANDATORY for coordinate planes)

When the visual type is "SVG graphs", you MUST use these templates as your starting point.

### Graph Snippet (COPY THIS for all coordinate planes):
${GRAPH_SNIPPET}

### Annotation Snippet (for y-intercept labels, arrows, equations):
${ANNOTATION_SNIPPET}

**CRITICAL SVG RULES:**
1. ALWAYS start from GRAPH_SNIPPET - never create coordinate planes from scratch
2. The snippet includes: arrowheads on axes, grid lines, tick marks, single "0" at origin
3. Calculate ALL positions using: pixelX = 40 + (dataX/X_MAX)*220, pixelY = 170 - (dataY/Y_MAX)*150
4. Annotations use the SAME formula - this ensures labels align with the graph
5. Data lines extend to plot edges with arrow markers

---

## Output Format

Generate each slide as a complete HTML document. Separate slides with this delimiter:
===SLIDE_SEPARATOR===

Each slide MUST:
- Have body with width: 960px; height: 540px
- Use light theme (white background, dark text)
- Have all text in proper semantic tags (<p>, <h1-6>, <ul>, <ol>)
- Use .row/.col layout classes
- Have NO JavaScript or onclick handlers
`;

/**
 * Build the user prompt for analyze-problem action
 */
export function buildAnalyzePrompt(
  gradeLevel: string,
  unitNumber: number | null,
  lessonNumber: number | null,
  lessonName: string,
  learningGoals: string[]
): string {
  return `Analyze this mastery check question image.

Context:
- Grade Level: ${gradeLevel}
- Unit: ${unitNumber ?? 'Not specified'}
- Lesson: ${lessonNumber ?? 'Not specified'} - ${lessonName || 'Not specified'}
- Learning Targets: ${learningGoals.length > 0 ? learningGoals.join('; ') : 'Not specified'}

Instructions:
1. Solve the problem yourself step-by-step
2. Identify the mathematical structure and problem type
3. Define ONE clear strategy with 2-3 moves
4. Create 3 scenarios with DIFFERENT contexts (all different from the mastery check)

Return ONLY valid JSON matching the schema described in the system prompt.`;
}

/**
 * Build the user prompt for generate-slides action
 */
export function buildGenerateSlidesPrompt(
  gradeLevel: string,
  unitNumber: number | null,
  lessonNumber: number | null,
  learningGoals: string[],
  problemAnalysis: {
    problemType: string;
    mathematicalStructure: string;
    solution: { step: number; description: string; reasoning: string }[];
    visualType: 'HTML/CSS' | 'HTML diagrams' | 'SVG graphs';
  },
  strategyDefinition: {
    name: string;
    oneSentenceSummary: string;
    moves: { verb: string; description: string; result: string }[];
    slideHeaders: string[];
    cfuQuestionTemplates: string[];
  },
  scenarios: {
    name: string;
    context: string;
    themeIcon: string;
    numbers: string;
    description: string;
  }[]
): string {
  return `Generate HTML slides for this worked example.

## Context
- Grade Level: ${gradeLevel}
- Unit ${unitNumber ?? ''} Lesson ${lessonNumber ?? ''}
- Learning Targets: ${learningGoals.join('; ')}

## Problem Analysis
- Type: ${problemAnalysis.problemType}
- Structure: ${problemAnalysis.mathematicalStructure}
- Visual Type: ${problemAnalysis.visualType}
- Solution Steps:
${problemAnalysis.solution.map(s => `  ${s.step}. ${s.description} (${s.reasoning})`).join('\n')}

## Strategy
- Name: ${strategyDefinition.name}
- Summary: ${strategyDefinition.oneSentenceSummary}
- Moves:
${strategyDefinition.moves.map((m, i) => `  ${i + 1}. ${m.verb}: ${m.description} -> ${m.result}`).join('\n')}
- Slide Headers: ${strategyDefinition.slideHeaders.join(', ')}
- CFU Templates: ${strategyDefinition.cfuQuestionTemplates.join('; ')}

## Scenarios
${scenarios.map((s, i) => `
### Scenario ${i + 1}: ${s.name} ${s.themeIcon}
Context: ${s.context}
Numbers: ${s.numbers}
Description: ${s.description}
`).join('\n')}

## Instructions - PPTX-Compatible Slides

Generate exactly **15 PPTX-compatible HTML slides** following this structure:

**All slides must be 960×540px, light theme (white background), Arial font, NO JavaScript.**

**Intro (2 slides):**
1. **Learning Goal** - Strategy name + summary (use SLIDE_LEARNING_GOAL_TEMPLATE)
2. **Problem Setup** - Scenario 1 introduction with visual (use SLIDE_TWO_COLUMN_TEMPLATE)

**Step 1 (4 slides):**
3. **Step 1 Question** - Show problem, prompt for first step
4. **Step 1 + CFU** - COPY slide 3 exactly + add CFU box (paired slide)
5. **Step 1 Answer** - Show the answer to step 1
6. **Step 1 + Answer Box** - COPY slide 5 exactly + add Answer box (paired slide)

**Step 2 (4 slides):**
7. **Step 2 Question** - Show problem with step 1 complete, prompt for step 2
8. **Step 2 + CFU** - COPY slide 7 exactly + add CFU box (paired slide)
9. **Step 2 Answer** - Show the answer to step 2
10. **Step 2 + Answer Box** - COPY slide 9 exactly + add Answer box (paired slide)

**Step 3 (2 slides):**
11. **Step 3 Question** - Show problem with steps 1-2 complete, prompt for final step
12. **Step 3 + Answer** - COPY slide 11 exactly + add Answer box (paired slide)

**Practice (2 slides):**
13. **Practice 1** - Scenario 2, ZERO scaffolding (use SLIDE_PRACTICE_TEMPLATE)
14. **Practice 2** - Scenario 3, ZERO scaffolding (use SLIDE_PRACTICE_TEMPLATE)

**Printable (1 slide):**
15. **Printable Worksheet** - ALL practice problems in ONE slide with multiple print-page divs
   - White background, black text, Times New Roman font
   - Each print-page: 8.5in x 11in
   - Include @media print CSS
   - NO strategy reminders - only problem content

## 🔄 PER-SLIDE PROTOCOL (Follow for EVERY Slide)

**Before each slide, output a checkpoint comment:**

\`\`\`
<!-- ============================================ -->
<!-- SLIDE [N]: [Type Name] -->
<!-- Paired: [Yes/No] | Base: [Slide # or N/A] -->
<!-- Action: [generate-new | copy-and-add-cfu | copy-and-add-answer] -->
<!-- ============================================ -->
\`\`\`

**Slide type reference (ALL 15 SLIDES):**
| # | Type | Is Paired? | Action |
|---|------|------------|--------|
| 1 | Learning Goal | No | generate-new |
| 2 | Problem Setup | No | generate-new |
| 3 | Step 1 Question | No | generate-new |
| 4 | Step 1 + CFU | **YES** | copy-and-add-cfu (from slide 3) |
| 5 | Step 1 Answer | No | generate-new |
| 6 | Step 1 + Answer | **YES** | copy-and-add-answer (from slide 5) |
| 7 | Step 2 Question | No | generate-new |
| 8 | Step 2 + CFU | **YES** | copy-and-add-cfu (from slide 7) |
| 9 | Step 2 Answer | No | generate-new |
| 10 | Step 2 + Answer | **YES** | copy-and-add-answer (from slide 9) |
| 11 | Step 3 Question | No | generate-new |
| 12 | Step 3 + Answer | **YES** | copy-and-add-answer (from slide 11) |
| 13 | Practice 1 | No | generate-new |
| 14 | Practice 2 | No | generate-new |
| 15 | Printable | No | generate-new |

## ⚠️ CRITICAL: Paired Slide Consistency (NON-NEGOTIABLE)

**For paired slides (Action: copy-and-add-cfu or copy-and-add-answer):**

1. COPY the previous slide's entire HTML verbatim
2. FIND the end of the content zone
3. INSERT only the CFU or Answer box:

**CFU box:**
\`\`\`html
<div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 12px; border-left: 4px solid #f59e0b;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[CFU question using strategy verb]</p>
</div>
\`\`\`

**Answer box:**
\`\`\`html
<div style="background: #dcfce7; border-radius: 8px; padding: 16px; margin-top: 12px; border-left: 4px solid #22c55e;">
  <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
  <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Answer explanation]</p>
</div>
\`\`\`

**Why this matters:** When students advance slides, they should see ZERO visual changes except the new box. The test: diffing paired slides should show ONLY the added box.

Use ===SLIDE_SEPARATOR=== between each slide.
Each slide MUST have body with width: 960px; height: 540px.`;
}

// =============================================================================
// CONTEXT-AWARE GENERATION PROMPT BUILDERS
// =============================================================================

/**
 * Types for context-aware generation
 * SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 */
export type GenerationMode = 'full' | 'continue' | 'update';

export interface HtmlSlideInput {
  slideNumber: number;
  htmlContent: string;
}

export interface UpdateInstructions {
  slideNumbers: number[];  // Which slides to regenerate
  changes: string;         // Description of changes to make
}

/**
 * Build user prompt for CONTINUE mode.
 * Resumes generation from where it was interrupted.
 *
 * SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 * (See "Context-Aware Generation > Mode: Continue" section)
 */
export function buildContinuePrompt(
  existingSlides: HtmlSlideInput[],
  fullSlideCount: number,
  basePrompt: string
): string {
  const existingSlidesContext = existingSlides
    .map((s, i) => `--- SLIDE ${i + 1} (ALREADY CREATED) ---\n${s.htmlContent}\n`)
    .join('\n');

  return `You are CONTINUING slide generation for a worked example deck.

## EXISTING SLIDES (DO NOT REGENERATE THESE)
The following ${existingSlides.length} slides have already been created. You must continue from slide ${existingSlides.length + 1}.

${existingSlidesContext}

## YOUR TASK
Continue generating the REMAINING slides (starting from slide ${existingSlides.length + 1}) to complete the deck.
The full deck should have approximately ${fullSlideCount} slides total.

## CONTEXT FOR REMAINING SLIDES
${basePrompt}

IMPORTANT:
- Start with slide ${existingSlides.length + 1}
- Match the style and format of the existing slides
- Use ===SLIDE_SEPARATOR=== between each slide
- DO NOT regenerate slides 1-${existingSlides.length}`;
}

/**
 * Build user prompt for UPDATE mode.
 * Regenerates specific slides with targeted changes.
 *
 * SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
 * (See "Context-Aware Generation > Mode: Update" section)
 */
export function buildUpdatePrompt(
  existingSlides: HtmlSlideInput[],
  updateInstructions: UpdateInstructions,
  basePrompt: string
): string {
  const slidesToUpdate = updateInstructions.slideNumbers;
  const existingSlidesContext = existingSlides
    .map((s, i) => {
      const slideNum = i + 1;
      const needsUpdate = slidesToUpdate.includes(slideNum);
      return `--- SLIDE ${slideNum} ${needsUpdate ? '(NEEDS UPDATE)' : '(KEEP AS-IS)'} ---\n${s.htmlContent}\n`;
    })
    .join('\n');

  return `You are UPDATING specific slides in an existing worked example deck.

## EXISTING DECK
${existingSlidesContext}

## YOUR TASK
Regenerate ONLY slides ${slidesToUpdate.join(', ')} with the following changes:

${updateInstructions.changes}

## RULES
1. Output ONLY the updated slides (slides ${slidesToUpdate.join(', ')})
2. Maintain the same overall structure and style as the existing slides
3. Use ===SLIDE_SEPARATOR=== between each slide
4. Output slides in order (lowest number first)

## CONTEXT
${basePrompt}`;
}
