import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { handleAnthropicError } from "@error/handlers/anthropic";
import { MODEL_FOR_TASK } from "@/lib/api/integrations/claude/models";
import type { Scenario } from "@/app/scm/workedExamples/create/lib/types";
import {
  LESSON_SUMMARY_TEMPLATE,
  GRAPH_SNIPPET,
} from "@/app/scm/workedExamples/create/ai";
import {
  extractTextContent,
  stripMarkdownFences,
} from "@/app/scm/workedExamples/create/lib/api-utils";

// Extend max execution time (3 minutes - simpler than printable)
export const maxDuration = 180;

interface StrategyMove {
  verb: string;
  description: string;
  result: string;
}

interface GenerateLessonSummaryInput {
  strategyName: string;
  strategyMoves: StrategyMove[];
  oneSentenceSummary: string;
  bigIdea: string;
  problemType: string;
  visualType: string;
  svgSubtype?: string;
  workedExampleScenario: Scenario;
  learningGoals: string[];
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
}

function buildSystemPrompt(): string {
  return `You are generating a one-page printable lesson summary. This is a quick-reference card that students can glance at to remember the key idea from a math lesson.

## Lesson Summary Template
Use this structure (replace [PLACEHOLDERS] with actual content):

${LESSON_SUMMARY_TEMPLATE}

## Graph Template (only if visual type involves graphs)
Use this SVG coordinate plane as reference:

${GRAPH_SNIPPET}

## Design Principles
1. This is a REFERENCE CARD, not a textbook page - keep it scannable
2. The Big Idea should be the most prominent element on the page
3. Strategy steps should be a clean numbered list (verb + brief description)
4. ALWAYS include a visual reference - this helps students recall the concept
5. The "Remember" section should be 1-2 sentences max
6. Use large, clear typography for the main concept
7. Keep all content within the single 8.5in x 11in page

## Visual Reference Rules
- ALWAYS include a visual, even for text-only problems
- For coordinate graph lessons: include a small labeled graph showing the key concept
- For diagram lessons (tape, hanger, number line, etc.): include a simplified diagram
- For text/table lessons: include a compact worked example showing the strategy applied
- The visual should fit in about 40% of the page width
- Label the visual clearly with a brief caption
- SVG graphs should have max-height: 280px
- Use white background (#ffffff) for any graphs

## Output
Return ONLY the HTML starting with <div class="slide-container">. No explanations, no markdown fences.
`;
}

function buildLessonSummaryPrompt(input: GenerateLessonSummaryInput): string {
  const {
    strategyName,
    strategyMoves,
    oneSentenceSummary,
    bigIdea,
    problemType,
    visualType,
    svgSubtype,
    workedExampleScenario,
    learningGoals,
    gradeLevel,
    unitNumber,
    lessonNumber,
  } = input;

  const strategyStepsText =
    strategyMoves.length > 0
      ? strategyMoves
          .map(
            (m, i) => `${i + 1}. **${m.verb}**: ${m.description} → ${m.result}`,
          )
          .join("\n")
      : `1. Apply ${strategyName} to solve the problem`;

  let visualContext = `
## Visual Type: ${visualType}${svgSubtype ? ` (${svgSubtype})` : ""}
`;

  // Add graph plan details if available
  if (workedExampleScenario.graphPlan) {
    const gp = workedExampleScenario.graphPlan;
    const xMax = gp.scale.xMax;
    const yMax = gp.scale.yMax;

    const toPixelX = (dataX: number) =>
      Math.round((40 + (dataX / xMax) * 220) * 100) / 100;
    const toPixelY = (dataY: number) =>
      Math.round((170 - (dataY / yMax) * 150) * 100) / 100;

    const lineInstructions = gp.equations
      .map((e) => {
        const startPixelX = toPixelX(e.startPoint?.x ?? 0);
        const startPixelY = toPixelY(e.startPoint?.y ?? e.yIntercept);
        const endPixelX = toPixelX(e.endPoint?.x ?? xMax);
        const endPixelY = toPixelY(
          e.endPoint?.y ?? e.slope * xMax + e.yIntercept,
        );

        return `**${e.label}: ${e.equation} (${e.color})**
- PRE-CALCULATED PIXELS: x1="${startPixelX}" y1="${startPixelY}" x2="${endPixelX}" y2="${endPixelY}"`;
      })
      .join("\n\n");

    visualContext += `
### Graph Plan (PRE-CALCULATED - USE THESE EXACT VALUES)
**Scale:** X_MAX=${xMax}, Y_MAX=${yMax}
**Axis Labels:** X: ${gp.scale.xAxisLabels.join(", ")} | Y: ${gp.scale.yAxisLabels.join(", ")}

**Lines:**
${lineInstructions}

**Key Points:**
${gp.keyPoints.map((p) => `- ${p.label}: data(${p.x}, ${p.y}) → pixel(${toPixelX(p.x)}, ${toPixelY(p.y)})`).join("\n")}

Create a SMALL version of this graph (viewBox="0 0 280 200") as the visual reference.
Graph background MUST be white (#ffffff).
`;
  }

  // Add scenario context for non-graph visuals
  if (!workedExampleScenario.graphPlan) {
    visualContext += `
### Worked Example Context (use for visual reference)
- Scenario: ${workedExampleScenario.name}
- Context: ${workedExampleScenario.context}
- Numbers: ${workedExampleScenario.numbers}
- Description: ${workedExampleScenario.description}

Create a visual reference that shows the strategy applied to this example.
For text/equation problems, show a compact worked example with the key steps.
For diagram problems, show a simplified version of the diagram.
`;
  }

  return `Generate a one-page lesson summary for this math lesson:

## Lesson Info
- Grade Level: ${gradeLevel}
- Unit: ${unitNumber ?? "N/A"}
- Lesson: ${lessonNumber ?? "N/A"}
- Strategy: ${strategyName}
- Problem Type: ${problemType}

## Big Idea
${bigIdea}

## Strategy Summary
${oneSentenceSummary}

## Strategy Steps
${strategyStepsText}

## Learning Goals
${learningGoals.join("; ") || "Apply the strategy independently"}

${visualContext}

## Instructions
1. Create a single print-page div (one page, 8.5in x 11in)
2. Include the "LESSON SUMMARY" badge in the header
3. Make the Big Idea the most prominent element (large text, blue background box)
4. List the strategy steps as a clean numbered list
5. ALWAYS include a visual reference on the right side showing the concept
6. Add a "REMEMBER" box at the bottom with a 1-2 sentence key takeaway
7. Keep everything scannable - a student should grasp the key idea at a glance

Output ONLY the HTML starting with <div class="slide-container">.`;
}

/**
 * API endpoint for generating the lesson summary slide (slide 10)
 * This is a simple non-streaming endpoint since it's just one slide.
 */
export async function POST(request: NextRequest) {
  try {
    const input: GenerateLessonSummaryInput = await request.json();

    const { strategyName, bigIdea } = input;

    if (!strategyName || !bigIdea) {
      return NextResponse.json(
        { error: "Strategy name and Big Idea are required for lesson summary" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 3 * 60 * 1000, // 3 minutes
    });

    const userPrompt = buildLessonSummaryPrompt(input);

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.GENERATION,
      max_tokens: 6000,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: userPrompt }],
    });

    // Extract HTML from response
    const textContent = extractTextContent(response);
    if (!textContent) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    // Clean markdown fences if present
    let htmlContent = stripMarkdownFences(textContent, "html");

    // Wrap in full HTML document if it starts with div
    if (htmlContent.startsWith("<div")) {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson Summary</title>
</head>
<body style="margin: 0; padding: 0;">
${htmlContent}
</body>
</html>`;
    }

    return NextResponse.json({
      success: true,
      htmlContent,
    });
  } catch (error) {
    console.error("[generate-lesson-summary] Error:", error);
    return NextResponse.json(
      { error: handleAnthropicError(error, "Generate lesson summary") },
      { status: 500 },
    );
  }
}
