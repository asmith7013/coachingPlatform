import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import type { Scenario } from '@/app/scm/workedExamples/create/lib/types';

interface GeneratePrintableInput {
  practiceScenarios: Scenario[];
  strategyName: string;
  problemType: string;
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  learningGoals: string[];
}

const GENERATE_PRINTABLE_SYSTEM_PROMPT = `You are an expert educational content creator generating a printable worksheet for math practice problems.

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

## Output Format

Return ONLY the complete HTML for the printable slide. Start with the slide-container div, NOT with <!DOCTYPE html>.
NO explanations, NO markdown code fences - just the HTML.
`;

function buildPrintablePrompt(
  scenarios: Scenario[],
  strategyName: string,
  problemType: string,
  gradeLevel: string,
  unitNumber: number | null,
  lessonNumber: number | null,
  learningGoals: string[]
): string {
  const scenarioDetails = scenarios.map((s, i) => {
    let details = `
Problem ${i + 1}: ${s.name}
- Context: ${s.context}
- Numbers: ${s.numbers}
- Description: ${s.description}`;

    if (s.graphPlan) {
      details += `
- Graph Plan:
  - Equations: ${s.graphPlan.equations.map(eq => eq.equation).join(', ')}
  - Scale: X: 0-${s.graphPlan.scale.xMax}, Y: 0-${s.graphPlan.scale.yMax}
  - Key Points: ${s.graphPlan.keyPoints.map(kp => `${kp.label} (${kp.x}, ${kp.y})`).join(', ')}`;
    }

    return details;
  }).join('\n');

  return `Generate a printable worksheet with these 2 practice problems:

## Lesson Info
- Grade Level: ${gradeLevel}
- Unit: ${unitNumber ?? 'N/A'}
- Lesson: ${lessonNumber ?? 'N/A'}
- Learning Goals: ${learningGoals.join('; ') || 'Apply the strategy independently'}
- Strategy: ${strategyName}
- Problem Type: ${problemType}

## Practice Problems
${scenarioDetails}

## Instructions
1. Create one print-page div for each problem (2 total)
2. Include the lesson header and learning goal on each page
3. Show the problem description and any relevant visuals (tables, graphs if graphPlan provided)
4. Include a "Your Task" section with the specific question
5. Include a "Show your work" box

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
      timeout: 60 * 1000, // 60 seconds for single slide
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
      system: GENERATE_PRINTABLE_SYSTEM_PROMPT,
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
