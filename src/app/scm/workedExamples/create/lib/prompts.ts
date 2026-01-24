/**
 * Prompts module for the worked example creator.
 *
 * This module imports content from the colocated ai/ directory
 * and builds prompts for Claude API calls.
 *
 * All AI content (pedagogy rules, styling, templates) is now
 * colocated in ../ai/ for better organization.
 */

// Import shared content from the colocated ai/ directory
import {
  PEDAGOGY_RULES as SHARED_PEDAGOGY_RULES,
  STYLING_GUIDE as SHARED_STYLING_GUIDE,
  SLIDE_STRUCTURE as SHARED_SLIDE_STRUCTURE,
  // SVG snippets for graphs
  GRAPH_SNIPPET as SHARED_GRAPH_SNIPPET,
  ANNOTATION_SNIPPET as SHARED_ANNOTATION_SNIPPET,
  // Prompt instructions (Phase 1-3)
  ANALYZE_PROBLEM_INSTRUCTIONS as SHARED_ANALYZE_INSTRUCTIONS,
  ANALYZE_OUTPUT_SCHEMA as SHARED_OUTPUT_SCHEMA,
  GENERATE_SLIDES_INSTRUCTIONS as SHARED_GENERATE_INSTRUCTIONS,
  // Phase 3 additional instructions
  TECHNICAL_RULES as SHARED_TECHNICAL_RULES,
  SLIDE_PEDAGOGY_RULES as SHARED_SLIDE_PEDAGOGY_RULES,
  PRE_FLIGHT_CHECKLIST as SHARED_PRE_FLIGHT_CHECKLIST,
} from '../ai';

// Re-export shared content for backward compatibility
export const PEDAGOGY_RULES = SHARED_PEDAGOGY_RULES;
export const STYLING_GUIDE = SHARED_STYLING_GUIDE;

// New Phase 3 instructions (for generate slides prompt)
export const TECHNICAL_RULES = SHARED_TECHNICAL_RULES;
export const SLIDE_PEDAGOGY_RULES = SHARED_SLIDE_PEDAGOGY_RULES;
export const PRE_FLIGHT_CHECKLIST = SHARED_PRE_FLIGHT_CHECKLIST;
export const SLIDE_STRUCTURE = SHARED_SLIDE_STRUCTURE;
// SVG snippets for graphs
export const GRAPH_SNIPPET = SHARED_GRAPH_SNIPPET;
export const ANNOTATION_SNIPPET = SHARED_ANNOTATION_SNIPPET;

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

/**
 * System prompt for analyzing mastery check questions.
 */
export const ANALYZE_PROBLEM_SYSTEM_PROMPT = `You are an expert mathematics pedagogy specialist creating worked example slide decks.

Your task is to analyze a mastery check question image and produce a structured analysis.

${PEDAGOGY_RULES}

${SHARED_ANALYZE_INSTRUCTIONS}

---

${SHARED_OUTPUT_SCHEMA}

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

export const EDIT_SLIDES_SYSTEM_PROMPT = `You are an expert educational content creator editing PPTX-compatible HTML slides for math worked examples.

## PPTX Format Constraints

- **Dimensions**: Body MUST be exactly 960×540px (do NOT change this!)
- **Theme**: Light theme (white background, dark text)
- **Fonts**: Arial, Georgia only
- **Layout**: Use .row/.col classes (NOT inline display:flex)
- **No JavaScript**: There should be NO onclick handlers or toggles

${STYLING_GUIDE}

## Multi-Slide Editing Mode

You are editing MULTIPLE slides in a worked example deck. You will receive:
1. **Slides to Edit**: Slides marked "(EDIT THIS)" - apply changes to these
2. **Context Slides** (optional): Slides marked "(CONTEXT ONLY)" - use for reference but DO NOT edit
3. **Edit Instructions**: What changes to make

### Rules for Multi-Slide Editing

1. **Only Edit Designated Slides**: Only modify slides explicitly marked for editing
2. **Never Edit Context Slides**: Context slides are read-only reference material
3. **Consistency**: Apply similar changes consistently across all edited slides
4. **Preserve Structure**: Each slide must maintain its structural integrity
5. **Batch Changes**: If instructed to change something across slides (e.g., "change all mentions of X to Y"), apply to ALL edited slides

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

## Output Format

Return a JSON array of ONLY the edited slides:

\`\`\`json
[
  { "slideNumber": 3, "htmlContent": "<!DOCTYPE html>..." },
  { "slideNumber": 5, "htmlContent": "<!DOCTYPE html>..." }
]
\`\`\`

IMPORTANT:
- Include ONLY slides you were asked to edit
- Do NOT include context slides in your output
- Each htmlContent must be complete, valid HTML
- Order slides by slide number
`;

/**
 * System prompt for generating PPTX-compatible HTML slides.
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

${TECHNICAL_RULES}

${SLIDE_PEDAGOGY_RULES}

${PRE_FLIGHT_CHECKLIST}

${SHARED_GENERATE_INSTRUCTIONS}

---

## Slide Layout Guidelines (PPTX-Compatible)

### Teacher Instructions Slide (slide 1):
- Clean, informational layout for teachers
- Include: Big Idea, Learning Targets, Strategy overview
- Visually quiet design (not student-facing)

### Big Idea Slide (slide 2):
Use a gradient blue background (linear-gradient from #1e40af to #3b82f6), centered layout with:
- Grade/Unit/Lesson at top (white text, letter-spacing: 2px)
- "BIG IDEA" badge (rounded pill, white/semi-transparent background)
- Big Idea statement large and centered (36px white text)

### Two-Column Layout (for problem setup and steps):
- Left column: Visual representation (graph, table, diagram)
- Right column: Text content, problem statement, or step explanation
- Use .row and .col classes for layout

### Step Slide with Stacked CFU + Answer (for step slides 4-6):
Include BOTH boxes on the SAME slide at the SAME position:
- CFU box: data-pptx-region="cfu-box" at y=40, z-index: 100
- Answer box: data-pptx-region="answer-box" at y=40, z-index: 101 (overlays CFU)
- Both boxes use PPTX animation (appear sequentially on click)

### Practice Slide (zero scaffolding):
- Show practice problems without step-by-step guidance
- Include space for student work
- Clean layout with problem statement and visual if needed

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

**⚠️ CRITICAL: Each slide MUST start with \`<!DOCTYPE html>\` - NO OTHER TEXT BEFORE IT.**
- NO checkpoint annotations (like "SLIDE 3: Step 1 Question")
- NO comments about slide type or pairing
- NO metadata or protocol notes
- ONLY valid HTML from \`<!DOCTYPE html>\` to \`</html>\`

Each slide MUST:
- Start with \`<!DOCTYPE html>\` as the first 15 characters
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
  learningGoals: string[],
  additionalContext?: string
): string {
  // Build additional context section if provided
  const additionalContextSection = additionalContext?.trim()
    ? `

## Teacher's Additional Context
${additionalContext.trim()}

**Important:** Consider this context when:
- Choosing the strategy name and approach
- Creating practice problem contexts/themes
- Deciding what to emphasize in explanations`
    : '';

  return `Analyze this mastery check question image.

Context:
- Grade Level: ${gradeLevel}
- Unit: ${unitNumber ?? 'Not specified'}
- Lesson: ${lessonNumber ?? 'Not specified'} - ${lessonName || 'Not specified'}
- Learning Targets: ${learningGoals.length > 0 ? learningGoals.join('; ') : 'Not specified'}${additionalContextSection}

Instructions:
1. Solve the problem yourself step-by-step
2. Identify the mathematical structure and problem type
3. Define ONE clear strategy with 2-3 moves
4. Create 3 scenarios with DIFFERENT contexts (all different from the mastery check)
5. **CRITICAL: Generate diagramEvolution** - Create ASCII art showing how the visual develops step-by-step:
   - initialState: ASCII showing Problem Setup slide
   - keyElements: Array explaining each visual element
   - steps: One entry per strategy move (must match strategyDefinition.moves.length)
${additionalContext ? "6. Apply the teacher's additional context preferences when creating scenarios and choosing strategy" : ''}

**⚠️ REQUIRED FIELDS - Your response MUST include:**
- problemAnalysis.diagramEvolution (with initialState, keyElements, and steps array)
- strategyDefinition.moves (2-3 moves)
- scenarios (exactly 3 with different contexts)

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
    visualType: 'text-only' | 'html-table' | 'svg-visual';
    svgSubtype?: 'coordinate-graph' | 'diagram' | 'shape' | 'number-line' | 'other';
    graphPlan?: {
      equations: {
        label: string;
        equation: string;
        slope: number;
        yIntercept: number;
        color: string;
        startPoint?: { x: number; y: number };
        endPoint?: { x: number; y: number };
      }[];
      scale: {
        xMax: number;
        yMax: number;
        xAxisLabels: number[];
        yAxisLabels: number[];
      };
      keyPoints: {
        label: string;
        x: number;
        y: number;
        dataX: number;
        dataY: number;
      }[];
      annotations: {
        type: string;
        from?: number;
        to?: number;
        label: string;
        position?: string;
      }[];
    };
    // Step-by-step diagram evolution plan (approved by teacher)
    diagramEvolution?: {
      initialState: string;
      steps: {
        header: string;
        ascii: string;
        changes: string[];
      }[];
    };
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
    graphPlan?: {
      equations: {
        label: string;
        equation: string;
        slope: number;
        yIntercept: number;
        color: string;
        startPoint?: { x: number; y: number };
        endPoint?: { x: number; y: number };
      }[];
      scale: {
        xMax: number;
        yMax: number;
        xAxisLabels: number[];
        yAxisLabels: number[];
      };
      keyPoints: {
        label: string;
        x: number;
        y: number;
        dataX: number;
        dataY: number;
      }[];
      annotations: {
        type: string;
        from?: number;
        to?: number;
        label: string;
        position?: string;
      }[];
    };
    diagramEvolution?: {
      initialState: string;
      keyElements: { element: string; represents: string }[];
      steps: { header: string; ascii: string; changes: string[] }[];
    };
  }[]
): string {
  // Build graph plan section if visualType is svg-visual with coordinate-graph subtype
  // CRITICAL: Use Scenario 1's graphPlan (worked example) for slides, NOT mastery check's graphPlan
  let graphPlanSection = '';
  const workedExampleGraphPlan = scenarios[0]?.graphPlan;
  const graphPlanToUse = workedExampleGraphPlan || problemAnalysis.graphPlan;

  // CRITICAL: Use Scenario 1's diagramEvolution (worked example) for slides, NOT mastery check's
  const diagramEvolutionToUse = scenarios[0]?.diagramEvolution;

  if (
    problemAnalysis.visualType === 'svg-visual' &&
    problemAnalysis.svgSubtype === 'coordinate-graph' &&
    graphPlanToUse
  ) {
    const gp = graphPlanToUse;
    const xMax = gp.scale.xMax;
    const yMax = gp.scale.yMax;

    // Helper to convert data coordinates to pixel coordinates
    const toPixelX = (dataX: number) =>
      Math.round((40 + (dataX / xMax) * 220) * 100) / 100;
    const toPixelY = (dataY: number) =>
      Math.round((170 - (dataY / yMax) * 150) * 100) / 100;

    // Build explicit line drawing instructions with pre-calculated pixels
    const lineInstructions = gp.equations
      .map((e) => {
        const startPixelX = toPixelX(e.startPoint?.x ?? 0);
        const startPixelY = toPixelY(e.startPoint?.y ?? e.yIntercept);
        const endPixelX = toPixelX(e.endPoint?.x ?? xMax);
        const endPixelY = toPixelY(
          e.endPoint?.y ?? e.slope * xMax + e.yIntercept
        );

        return `### ${e.label}: ${e.equation} (${e.color})
**Data coordinates:**
- Start point: (${e.startPoint?.x ?? 0}, ${e.startPoint?.y ?? e.yIntercept})
- End point: (${e.endPoint?.x ?? xMax}, ${e.endPoint?.y ?? e.slope * xMax + e.yIntercept})

**PRE-CALCULATED PIXEL VALUES (use these EXACTLY):**
- x1="${startPixelX}" y1="${startPixelY}"
- x2="${endPixelX}" y2="${endPixelY}"

**SVG line element:**
\`\`\`html
<line x1="${startPixelX}" y1="${startPixelY}" x2="${endPixelX}" y2="${endPixelY}" stroke="${e.color}" stroke-width="3" marker-end="url(#line-arrow-${e.label.toLowerCase().replace(/\s+/g, '-')})"/>
\`\`\``;
      })
      .join('\n\n');

    graphPlanSection = `
## 📊 GRAPH PLAN (PRE-CALCULATED - USE THESE EXACT VALUES)

**Scale:**
- X_MAX: ${xMax}
- Y_MAX: ${yMax}
- X-axis labels: ${gp.scale.xAxisLabels.join(', ')}
- Y-axis labels: ${gp.scale.yAxisLabels.join(', ')}

**Pixel conversion formulas (for reference):**
- pixelX = 40 + (dataX / ${xMax}) * 220
- pixelY = 170 - (dataY / ${yMax}) * 150

---

## ⚠️ CRITICAL: LINE DRAWING INSTRUCTIONS

**Each line below has PRE-CALCULATED pixel coordinates. Use them EXACTLY as shown.**
**DO NOT recalculate these values. Copy the x1, y1, x2, y2 values directly into your SVG.**

${lineInstructions}

---

**Key Points (for data point circles/labels):**
${gp.keyPoints.map((p) => `- ${p.label}: data(${p.x}, ${p.y}) → pixel(${toPixelX(p.x)}, ${toPixelY(p.y)})`).join('\n')}

**Annotations:**
${gp.annotations.map((a) => `- Type: ${a.type}, Label: "${a.label}"${a.from !== undefined ? `, from y=${a.from} to y=${a.to}` : ''}`).join('\n')}
`;
  }

  return `**⚠️ OUTPUT ONLY HTML. NO INTRODUCTION. NO ANNOUNCEMENT. NO PREAMBLE.**
**Your response must begin IMMEDIATELY with \`<!DOCTYPE html>\` - the very first slide.**
**Do NOT say "I'll generate..." or "Here are the slides..." or ANY text before the HTML.**

---

Generate HTML slides for this worked example.

## Context
- Grade Level: ${gradeLevel}
- Unit ${unitNumber ?? ''} Lesson ${lessonNumber ?? ''}
- Learning Targets: ${learningGoals.join('; ')}

## Problem Analysis
- Type: ${problemAnalysis.problemType}
- Structure: ${problemAnalysis.mathematicalStructure}
- Visual Type: ${problemAnalysis.visualType}
- Solution Steps:
${problemAnalysis.solution.map((s) => `  ${s.step}. ${s.description} (${s.reasoning})`).join('\n')}
${graphPlanSection}${
    diagramEvolutionToUse
      ? `
## 📊 DIAGRAM EVOLUTION (Teacher-Approved - FOLLOW THIS EXACTLY)

**The teacher has approved this step-by-step visual progression. Your slides MUST follow this evolution.**

### INITIAL STATE (Problem Setup - Slide 3)
\`\`\`
${diagramEvolutionToUse.initialState}
\`\`\`

${diagramEvolutionToUse.steps
  .map(
    (step, i) => `### ${step.header} (Slide ${4 + i})
\`\`\`
${step.ascii}
\`\`\`
**Changes in this step:**
${step.changes.map((c) => `- ${c}`).join('\n')}
`
  )
  .join('\n')}

**IMPORTANT:** Each slide's visual must match the corresponding evolution step above.
`
      : ''
  }

## Strategy
- Name: ${strategyDefinition.name}
- Summary: ${strategyDefinition.oneSentenceSummary}
- Moves:
${strategyDefinition.moves.map((m, i) => `  ${i + 1}. ${m.verb}: ${m.description} -> ${m.result}`).join('\n')}
- Slide Headers: ${strategyDefinition.slideHeaders.join(', ')}
- CFU Templates: ${strategyDefinition.cfuQuestionTemplates.join('; ')}

## Scenarios
${scenarios
  .map((s, i) => {
    let scenarioText = `
### Scenario ${i + 1}: ${s.name} ${s.themeIcon}
Context: ${s.context}
Numbers: ${s.numbers}
Description: ${s.description}`;

    // Include graphPlan for practice problems (scenarios 2 and 3)
    if (s.graphPlan && i > 0) {
      const gp = s.graphPlan;
      const xMax = gp.scale.xMax;
      const yMax = gp.scale.yMax;
      const toPixelX = (dataX: number) =>
        Math.round((40 + (dataX / xMax) * 220) * 100) / 100;
      const toPixelY = (dataY: number) =>
        Math.round((170 - (dataY / yMax) * 150) * 100) / 100;

      scenarioText += `

**Graph Plan for Practice ${i}:**
- Scale: X_MAX=${xMax}, Y_MAX=${yMax}
- Equations:
${gp.equations.map((e) => `  - ${e.label}: ${e.equation} (start: ${e.startPoint?.x ?? 0},${e.startPoint?.y ?? e.yIntercept} → end: ${e.endPoint?.x ?? xMax},${e.endPoint?.y ?? e.slope * xMax + e.yIntercept})`).join('\n')}
- Key Points:
${gp.keyPoints.map((p) => `  - ${p.label}: data(${p.x}, ${p.y}) → pixel(${toPixelX(p.x)}, ${toPixelY(p.y)})`).join('\n')}`;
    }

    return scenarioText;
  })
  .join('\n')}

## Instructions - PPTX-Compatible Slides

Generate exactly **6 PPTX-compatible HTML slides** following this structure:

**All slides must be 960×540px, light theme (white background), Arial font, NO JavaScript.**

**CFU and Answer boxes are STACKED on the SAME slide** - both use PPTX animation (appear sequentially on click). CFU appears first, then Answer appears on second click.

**Intro (2 slides):**
1. **Teacher Instructions** - Big Idea + Learning Targets + Strategy overview (teacher-facing, visually quiet)
2. **Big Idea** - Grade/Unit/Lesson + Big Idea badge + statement (student-facing, gradient background)

**Problem + Steps (4 slides):**
3. **Problem Setup** - Scenario 1 introduction with visual (use two-column layout)
4. **Step 1 + CFU + Answer** - Show step 1, both CFU and Answer at y=40 (Answer overlays CFU on second click)
5. **Step 2 + CFU + Answer** - Show step 2 with step 1 complete, both CFU and Answer at y=40 (Answer overlays CFU)
6. **Step 3 + CFU + Answer** - Show final step with steps 1-2 complete, both CFU and Answer at y=40 (Answer overlays CFU)

**Note:** The printable worksheet (slide 7) is generated separately after these 6 slides.

## CFU/Answer Box PPTX Attributes (REQUIRED - SAME POSITION, ANSWER OVERLAYS CFU)

**Both CFU and Answer boxes go on the SAME slide at the SAME position (y=40):**
- CFU box: \`data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"\`
- Answer box: \`data-pptx-region="answer-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"\`
- Answer box has z-index: 101 (CFU has z-index: 100) so Answer visually overlays CFU when revealed

These attributes enable PPTX animation (appear on click).

## ⚠️ CRITICAL OUTPUT RULES

**Each slide's HTML MUST start with \`<!DOCTYPE html>\` as the VERY FIRST characters.**

DO NOT include:
- Checkpoint annotations like "SLIDE 3: Step 1 Question"
- Any text before \`<!DOCTYPE html>\`
- HTML comments with slide metadata

The slides you output should contain ONLY valid HTML starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.

**Slide type reference (6 SLIDES):**
| # | Type | Has CFU/Answer? | Action |
|---|------|-----------------|--------|
| 1 | Teacher Instructions | No | generate-new |
| 2 | Big Idea | No | generate-new |
| 3 | Problem Setup | No | generate-new |
| 4 | Step 1 + CFU + Answer | Both boxes stacked (animated) | generate-new |
| 5 | Step 2 + CFU + Answer | Both boxes stacked (animated) | generate-new |
| 6 | Step 3 + CFU + Answer | Both boxes stacked (animated) | generate-new |

(Slide 7 - Printable with practice problems - is generated separately)

Use ===SLIDE_SEPARATOR=== between each slide.
Each slide MUST have body with width: 960px; height: 540px.`;
}

// =============================================================================
// CONTEXT-AWARE GENERATION PROMPT BUILDERS
// =============================================================================

/**
 * Types for context-aware generation
 */
export type GenerationMode = 'full' | 'continue' | 'update';

export interface HtmlSlideInput {
  slideNumber: number;
  htmlContent: string;
}

export interface UpdateInstructions {
  slideNumbers: number[]; // Which slides to regenerate
  changes: string; // Description of changes to make
}

/**
 * Build user prompt for CONTINUE mode.
 * Resumes generation from where it was interrupted.
 */
export function buildContinuePrompt(
  existingSlides: HtmlSlideInput[],
  fullSlideCount: number,
  basePrompt: string
): string {
  const existingSlidesContext = existingSlides
    .map(
      (s, i) => `--- SLIDE ${i + 1} (ALREADY CREATED) ---\n${s.htmlContent}\n`
    )
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
