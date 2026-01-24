import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { handleAnthropicError } from "@error/handlers/anthropic";
import { MODEL_FOR_TASK } from "@/lib/api/integrations/claude/models";
import { EDIT_SLIDE_SYSTEM_PROMPT } from "@/app/scm/workedExamples/create/lib/prompts";
import {
  buildMessageContent,
  extractTextContent,
  stripMarkdownFences,
} from "@/app/scm/workedExamples/create/lib/api-utils";

interface EditSlideInput {
  currentHtml: string;
  editInstructions: string;
  images?: string[]; // Base64 data URLs
  slideNumber?: number;
  strategyName?: string;
}

/**
 * API endpoint for AI-powered slide editing
 * Takes the current HTML and user instructions, returns edited HTML
 */
export async function POST(request: NextRequest) {
  try {
    const input: EditSlideInput = await request.json();

    const { currentHtml, editInstructions, images, slideNumber, strategyName } =
      input;

    const hasText = editInstructions?.trim();
    const hasImages = images && images.length > 0;

    if (!currentHtml || (!hasText && !hasImages)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: currentHtml and either editInstructions or images",
        },
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
      timeout: 2 * 60 * 1000, // 2 minutes for single slide edit
    });

    // Build the user prompt text
    const instructionsText = hasText
      ? editInstructions
      : "Please analyze the attached image(s) and apply any corrections or changes shown to the slide.";

    const userPromptText = `## Current Slide HTML${slideNumber ? ` (Slide ${slideNumber})` : ""}${strategyName ? `\nStrategy: ${strategyName}` : ""}

\`\`\`html
${currentHtml}
\`\`\`

## Edit Instructions

${instructionsText}

---

Apply the requested changes and return the complete edited HTML.`;

    // Build message content with images and text
    const messageContent = buildMessageContent(images, userPromptText);

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.EDIT,
      max_tokens: 8000,
      system: EDIT_SLIDE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    // Extract the HTML from the response
    const textContent = extractTextContent(response);
    if (!textContent) {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    // Clean up any markdown code fences if present
    const editedHtml = stripMarkdownFences(textContent, "html");

    return NextResponse.json({
      success: true,
      editedHtml,
    });
  } catch (error) {
    console.error("[edit-slide] Error:", error);
    return NextResponse.json(
      { error: handleAnthropicError(error, "Edit slide") },
      { status: 500 },
    );
  }
}
