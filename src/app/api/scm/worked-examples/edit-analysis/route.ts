import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { handleAnthropicError } from "@error/handlers/anthropic";
import { MODEL_FOR_TASK } from "@/lib/api/integrations/claude/models";
import type {
  ProblemAnalysis,
  StrategyDefinition,
  Scenario,
} from "@/app/scm/workedExamples/create/lib/types";
import {
  buildMessageContent,
  extractTextContent,
  stripMarkdownFences,
} from "@/app/scm/workedExamples/create/lib/api-utils";

// Extend timeout for AI processing (5 minutes like other routes)
export const maxDuration = 300;

interface EditAnalysisInput {
  editInstructions: string;
  images?: string[]; // Base64 data URLs
  problemAnalysis: ProblemAnalysis;
  strategyDefinition: StrategyDefinition;
  scenarios: Scenario[];
}

const EDIT_ANALYSIS_SYSTEM_PROMPT = `You are an expert math education content editor. Your task is to edit a worked example analysis based on user instructions.

You will receive:
1. The current analysis (problem analysis, strategy definition, and scenarios)
2. Edit instructions from the user (may include text and/or images)

Your job is to modify the analysis according to the instructions while maintaining the overall structure and validity.

IMPORTANT RULES:
- Only modify what the user asks you to change
- Keep all unchanged fields exactly as they are
- Ensure the edited analysis remains internally consistent
- Maintain mathematical accuracy
- If the edit affects multiple parts (e.g., changing an answer should update solution steps), make all necessary related changes
- If images are provided, carefully analyze them to understand what changes the user wants

Return your response as valid JSON with this exact structure:
{
  "problemAnalysis": { ... },
  "strategyDefinition": { ... },
  "scenarios": [ ... ]
}

Return ONLY the JSON object, no markdown code blocks or other text.`;

function buildEditPrompt(
  editInstructions: string,
  problemAnalysis: ProblemAnalysis,
  strategyDefinition: StrategyDefinition,
  scenarios: Scenario[],
  hasImages = false,
): string {
  const instructionSection = editInstructions.trim()
    ? `## Edit Instructions\n${editInstructions}`
    : hasImages
      ? "## Edit Instructions\nPlease analyze the attached image(s) and apply any corrections or changes shown to the analysis below."
      : "";

  return `## Current Analysis

### Problem Analysis
${JSON.stringify(problemAnalysis, null, 2)}

### Strategy Definition
${JSON.stringify(strategyDefinition, null, 2)}

### Scenarios
${JSON.stringify(scenarios, null, 2)}

${instructionSection}

Please apply the edit instructions to the analysis and return the complete updated analysis as JSON.`;
}

export async function POST(request: NextRequest) {
  try {
    const input: EditAnalysisInput = await request.json();
    const {
      editInstructions,
      images,
      problemAnalysis,
      strategyDefinition,
      scenarios,
    } = input;

    const hasText = editInstructions?.trim();
    const hasImages = images && images.length > 0;

    // Need either text instructions or images
    if (!hasText && !hasImages) {
      return NextResponse.json(
        { error: "Edit instructions or images are required" },
        { status: 400 },
      );
    }

    if (!problemAnalysis || !strategyDefinition || !scenarios) {
      return NextResponse.json(
        { error: "Missing analysis data" },
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

    const anthropic = new Anthropic({ apiKey });

    // Build the text prompt
    const textPrompt = buildEditPrompt(
      editInstructions || "",
      problemAnalysis,
      strategyDefinition,
      scenarios,
      hasImages,
    );

    // Build message content with images and text
    const messageContent = buildMessageContent(images, textPrompt);

    console.log(
      "[edit-analysis] Processing edit request:",
      editInstructions?.substring(0, 100) || "(image-only)",
      `with ${images?.length || 0} images`,
    );

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.GENERATION,
      max_tokens: 16000,
      system: EDIT_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    // Extract text content
    const textContent = extractTextContent(response);
    if (!textContent) {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Strip markdown code blocks if present
      const jsonText = stripMarkdownFences(textContent, "json");
      parsedResponse = JSON.parse(jsonText);
    } catch {
      console.error(
        "[edit-analysis] Failed to parse AI response:",
        textContent.substring(0, 500),
      );
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 500 },
      );
    }

    // Validate response structure
    if (
      !parsedResponse.problemAnalysis ||
      !parsedResponse.strategyDefinition ||
      !parsedResponse.scenarios
    ) {
      return NextResponse.json(
        { error: "AI response missing required fields" },
        { status: 500 },
      );
    }

    console.log("[edit-analysis] Edit successful");

    return NextResponse.json({
      success: true,
      problemAnalysis: parsedResponse.problemAnalysis,
      strategyDefinition: parsedResponse.strategyDefinition,
      scenarios: parsedResponse.scenarios,
    });
  } catch (error) {
    console.error("[edit-analysis] Error:", error);
    return NextResponse.json(
      { error: handleAnthropicError(error, "Edit analysis") },
      { status: 500 },
    );
  }
}
