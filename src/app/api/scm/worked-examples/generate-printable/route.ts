import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import type { Scenario } from '@/app/scm/workedExamples/create/lib/types';
import { GRAPH_SNIPPET } from '@/skills/worked-example';

// Extend max execution time for this API route (5 minutes)
export const maxDuration = 300;

interface GeneratePrintableInput {
  practiceScenarios: Scenario[];
  strategyName: string;
  problemType: string;
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  learningGoals: string[];
}

// Build system prompt dynamically to include the GRAPH_SNIPPET
function buildSystemPrompt(): string {
  return `You are an expert educational content creator generating a printable worksheet for math practice problems.

## Task
Generate a single HTML printable worksheet with 2 practice problems. This is slide 9 (the final slide) of a worked example deck.

## CRITICAL Format Requirements

- **Dimensions**: The slide container should be 100vw x 100vh with overflow-y: auto
- **Each problem gets its own print-page div** (8.5in x 11in)
- **Theme**: White background (#ffffff), black text (#000000)
- **Font**: Times New Roman, Georgia, serif
- **NO JavaScript, NO onclick handlers**

## Structure

Each print-page div contains:
1. Header with lesson info (title, unit/lesson, name/date fields)
2. Learning Goal box
3. Problem content (scenario name, description, visuals if needed, task)
4. "Show your work" area

## Printable Template Structure

\`\`\`html
<div class="slide-container" style="width: 100vw; height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">
  <!-- Page 1: Problem 1 -->
  <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
    <!-- Header, Learning Goal, Problem Content -->
  </div>

  <!-- Page 2: Problem 2 -->
  <div class="print-page" style="width: 8.5in; height: 11in; margin: 20px auto 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
    <!-- Header, Learning Goal, Problem Content -->
  </div>
</div>

<style>
@media print {
  .slide-container { overflow: visible !important; height: auto !important; }
  .print-page { width: 8.5in !important; height: 11in !important; margin: 0 !important; padding: 0.5in !important; box-sizing: border-box !important; page-break-after: always; border: none !important; }
  .print-page:last-child { page-break-after: auto; }
}
@page { size: letter portrait; margin: 0; }
</style>
\`\`\`

## SVG GRAPH TEMPLATE (MANDATORY for coordinate-graph problems)

When a problem includes a graphPlan, you MUST use this exact SVG template as your starting point.
The template includes: arrowheads on axes, grid lines, tick marks, origin label.

**GRAPH SNIPPET TEMPLATE:**
${GRAPH_SNIPPET}

**CRITICAL SVG RULES:**
1. ALWAYS start from GRAPH_SNIPPET - never create coordinate planes from scratch
2. Use the PRE-CALCULATED pixel coordinates provided in the problem (do NOT recalculate)
3. SVG dimensions for printable: Use viewBox="0 0 300 200" with width="300" height="200"
4. Keep the SVG centered in a container with appropriate print margins
5. Lines should use the exact x1, y1, x2, y2 values provided

## Output Format

Return ONLY the complete HTML for the printable slide. Start with the slide-container div, NOT with <!DOCTYPE html>.
NO explanations, NO markdown code fences - just the HTML.
`;
}

function buildPrintablePrompt(
  scenarios: Scenario[],
  strategyName: string,
  problemType: string,
  gradeLevel: string,
  unitNumber: number | null,
  lessonNumber: number | null,
  learningGoals: string[]
): string {
  // Build detailed scenario info with pre-calculated pixel coordinates for graphs
  const scenarioDetails = scenarios.map((s, i) => {
    let details = `
## Problem ${i + 1}: ${s.name}
- Context: ${s.context}
- Numbers: ${s.numbers}
- Description: ${s.description}`;

    if (s.graphPlan) {
      const gp = s.graphPlan;
      const xMax = gp.scale.xMax;
      const yMax = gp.scale.yMax;

      // Helper to convert data coordinates to pixel coordinates
      // Using 300x200 SVG for printable (fits well on letter paper)
      const toPixelX = (dataX: number) => Math.round((40 + (dataX / xMax) * 220) * 100) / 100;
      const toPixelY = (dataY: number) => Math.round((170 - (dataY / yMax) * 150) * 100) / 100;

      // Build explicit line drawing instructions with pre-calculated pixels
      const lineInstructions = gp.equations.map(e => {
        const startPixelX = toPixelX(e.startPoint?.x ?? 0);
        const startPixelY = toPixelY(e.startPoint?.y ?? e.yIntercept);
        const endPixelX = toPixelX(e.endPoint?.x ?? xMax);
        const endPixelY = toPixelY(e.endPoint?.y ?? (e.slope * xMax + e.yIntercept));

        return `**${e.label}: ${e.equation} (${e.color})**
- Data: start (${e.startPoint?.x ?? 0}, ${e.startPoint?.y ?? e.yIntercept}) → end (${e.endPoint?.x ?? xMax}, ${e.endPoint?.y ?? (e.slope * xMax + e.yIntercept)})
- PRE-CALCULATED PIXELS: x1="${startPixelX}" y1="${startPixelY}" x2="${endPixelX}" y2="${endPixelY}"
- SVG: \`<line x1="${startPixelX}" y1="${startPixelY}" x2="${endPixelX}" y2="${endPixelY}" stroke="${e.color}" stroke-width="2"/>\``;
      }).join('\n\n');

      details += `

### 📊 GRAPH PLAN (PRE-CALCULATED - USE THESE EXACT VALUES)

**Scale:** X_MAX=${xMax}, Y_MAX=${yMax}
**Axis Labels:** X: ${gp.scale.xAxisLabels.join(', ')} | Y: ${gp.scale.yAxisLabels.join(', ')}

**Pixel conversion (for reference):**
- pixelX = 40 + (dataX / ${xMax}) * 220
- pixelY = 170 - (dataY / ${yMax}) * 150

**Lines to draw (USE THESE EXACT PIXEL VALUES):**

${lineInstructions}

**Key Points:**
${gp.keyPoints.map(p => `- ${p.label}: data(${p.x}, ${p.y}) → pixel(${toPixelX(p.x)}, ${toPixelY(p.y)})`).join('\n')}

**IMPORTANT:** The graph SVG should have a WHITE background (#ffffff or transparent) for printing.`;
    }

    return details;
  }).join('\n\n---\n');

  return `Generate a printable worksheet with these 2 practice problems:

## Lesson Info
- Grade Level: ${gradeLevel}
- Unit: ${unitNumber ?? 'N/A'}
- Lesson: ${lessonNumber ?? 'N/A'}
- Learning Goals: ${learningGoals.join('; ') || 'Apply the strategy independently'}
- Strategy: ${strategyName}
- Problem Type: ${problemType}

${scenarioDetails}

## Instructions
1. Create one print-page div for each problem (2 total)
2. Include the lesson header and learning goal on each page
3. Show the problem description and any relevant visuals (tables, graphs if graphPlan provided)
4. **For graphs: Use the PRE-CALCULATED pixel coordinates above - do NOT recalculate!**
5. **Graph background MUST be white (#ffffff) for printing**
6. Include a "Your Task" section with the specific question
7. Include a "Show your work" box

Output ONLY the HTML starting with <div class="slide-container">.`;
}

/**
 * API endpoint for generating the printable worksheet slide (slide 9)
 * This is a simple non-streaming endpoint since it's just one slide.
 */
export async function POST(request: NextRequest) {
  try {
    const input: GeneratePrintableInput = await request.json();

    const {
      practiceScenarios,
      strategyName,
      problemType,
      gradeLevel,
      unitNumber,
      lessonNumber,
      learningGoals,
    } = input;

    if (!practiceScenarios || practiceScenarios.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 practice scenarios for printable worksheet' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 5 * 60 * 1000, // 5 minutes for printable generation
    });

    const userPrompt = buildPrintablePrompt(
      practiceScenarios,
      strategyName,
      problemType,
      gradeLevel,
      unitNumber,
      lessonNumber,
      learningGoals
    );

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.GENERATION,
      max_tokens: 8000,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract HTML from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    let htmlContent = textContent.text.trim();

    // Clean markdown fences if present
    if (htmlContent.startsWith('```html')) {
      htmlContent = htmlContent.slice(7);
    } else if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.slice(3);
    }
    if (htmlContent.endsWith('```')) {
      htmlContent = htmlContent.slice(0, -3);
    }
    htmlContent = htmlContent.trim();

    // Wrap in full HTML document if it starts with div
    if (htmlContent.startsWith('<div')) {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice Problems</title>
</head>
<body style="margin: 0; padding: 0; width: 960px; height: 540px; overflow: hidden;">
${htmlContent}
</body>
</html>`;
    }

    return NextResponse.json({
      success: true,
      htmlContent,
    });
  } catch (error) {
    console.error('[generate-printable] Error:', error);
    return NextResponse.json(
      { error: handleAnthropicError(error, 'Generate printable') },
      { status: 500 }
    );
  }
}
