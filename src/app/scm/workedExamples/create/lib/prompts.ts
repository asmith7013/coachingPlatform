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
  CFU_TOGGLE_TEMPLATE as SHARED_CFU_TOGGLE_TEMPLATE,
  ANSWER_TOGGLE_TEMPLATE as SHARED_ANSWER_TOGGLE_TEMPLATE,
  PRINTABLE_TEMPLATE as SHARED_PRINTABLE_TEMPLATE,
  ANALYZE_PROBLEM_INSTRUCTIONS as SHARED_ANALYZE_INSTRUCTIONS,
  GENERATE_SLIDES_INSTRUCTIONS as SHARED_GENERATE_INSTRUCTIONS,
} from '@/skills/worked-example';

// Re-export shared content for backward compatibility
export const PEDAGOGY_RULES = SHARED_PEDAGOGY_RULES;
export const STYLING_GUIDE = SHARED_STYLING_GUIDE;
export const SLIDE_STRUCTURE = SHARED_SLIDE_STRUCTURE;
export const CFU_TOGGLE_TEMPLATE = SHARED_CFU_TOGGLE_TEMPLATE;
export const ANSWER_TOGGLE_TEMPLATE = SHARED_ANSWER_TOGGLE_TEMPLATE;
export const PRINTABLE_TEMPLATE = SHARED_PRINTABLE_TEMPLATE;

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
    "visualType": "html" | "p5" | "d3"
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

export const EDIT_SLIDE_SYSTEM_PROMPT = `You are an expert educational content creator editing HTML slides for math worked examples.

${STYLING_GUIDE}

## Your Task

You will receive:
1. The current HTML of a slide
2. User instructions for how to edit it

Apply the user's requested changes while preserving the slide's structure and formatting.

## Critical: Format Preservation Rules

### Rule 1: Never Change the Slide Structure
When updating content, preserve ALL structural elements:
- Keep the same \`style\` attributes on containers
- Keep the same class names (especially \`print-page\`, \`slide-container\`)
- Keep the same CSS \`<style>\` blocks intact
- Only modify the TEXT CONTENT within elements

### Rule 2: Preserve Interactive Elements
- Keep all toggle buttons and their JavaScript exactly as-is
- Keep all onclick handlers unchanged
- Keep button styling consistent

### Rule 3: Printable Slide Considerations
If editing a printable slide (contains \`print-page\` class), these elements MUST be preserved:
- \`overflow-y: auto\` on \`.slide-container\`
- \`width: 8.5in; height: 11in\` on \`.print-page\`
- \`flex-shrink: 0\` on \`.print-page\`
- The entire \`<style>\` block with \`@media print\` and \`@page\` rules
- \`page-break-after: always\` in the print styles

## Common Mistakes to Avoid

- ❌ Don't remove or modify @media print CSS rules
- ❌ Don't change container dimensions or padding
- ❌ Don't remove page-break-after from print styles
- ❌ Don't modify toggle button JavaScript
- ✅ DO only change the specific text/content requested
- ✅ DO preserve all structural HTML and CSS

## Output Format

Return ONLY the edited HTML. Do not include any explanation or markdown formatting.
The output should be complete, valid HTML that can be rendered in an iframe.
`;

/**
 * System prompt for generating HTML slides.
 * Uses shared instructions from SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/
 */
export const GENERATE_SLIDES_SYSTEM_PROMPT = `You are an expert educational content creator generating HTML slide decks for math worked examples.

${PEDAGOGY_RULES}

${STYLING_GUIDE}

${SLIDE_STRUCTURE}

${SHARED_GENERATE_INSTRUCTIONS}

---

## HTML Templates to Use

### CFU Toggle (for Ask slides - slides 3, 5, 7):
${CFU_TOGGLE_TEMPLATE}

### Answer Toggle (for Reveal slides - slides 4, 6, 8):
${ANSWER_TOGGLE_TEMPLATE}

### Printable Worksheet (FINAL SLIDE - MUST USE EXACT FORMAT):
${PRINTABLE_TEMPLATE}

---

## Output Format

Generate each slide as a complete HTML document. Separate slides with this delimiter:
===SLIDE_SEPARATOR===

Each slide should be valid HTML that can be rendered in an iframe.
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
- Learning Goals: ${learningGoals.length > 0 ? learningGoals.join('; ') : 'Not specified'}

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
    visualType: 'html' | 'p5' | 'd3';
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
- Learning Goals: ${learningGoals.join('; ')}

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

## Instructions

Generate 9-11 HTML slides following this structure:
1. Learning Goal slide (strategy name + summary)
2. Problem Setup (Scenario 1 - worked example)
3-6. Step-by-step with Ask/Reveal pairs (use CFU and Answer toggle templates)
7-8. Practice Problems (Scenarios 2 & 3 - NO scaffolding, dark theme)
9. **Printable Worksheet** - FINAL SLIDE MUST follow the exact printable template:
   - ALL practice problems in ONE slide with multiple print-page divs
   - White background (#ffffff), black text (#000000), Times New Roman font
   - Each print-page: 8.5in x 11in with 0.5in padding, flex-shrink: 0
   - Include @media print CSS and @page { size: letter portrait; margin: 0; }
   - Header with: Lesson title, Unit/Lesson, Name/Date fields
   - Learning Goal box on each page
   - NO strategy reminders or hints - only problem content

Use ===SLIDE_SEPARATOR=== between each slide.
Each slide should be complete, valid HTML.`;
}
