import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { handleAnthropicError } from "@error/handlers/anthropic";
import { MODEL_FOR_TASK } from "@/lib/api/integrations/claude/models";
import { EDIT_SLIDES_SYSTEM_PROMPT } from "@/app/scm/workedExamples/create/lib/prompts";
import {
  buildMessageContent,
  extractTextContent,
  stripMarkdownFences,
} from "@/app/scm/workedExamples/create/lib/api-utils";

// Extend timeout for AI processing (5 minutes)
export const maxDuration = 300;

interface SlideInput {
  slideNumber: number;
  htmlContent: string;
}

interface EditSlidesInput {
  slidesToEdit: SlideInput[];
  contextSlides?: SlideInput[];
  editInstructions: string;
  images?: string[]; // Base64 data URLs
  strategyName?: string;
}

interface EditedSlide {
  slideNumber: number;
  htmlContent: string;
}

/**
 * API endpoint for AI-powered batch slide editing
 * Takes multiple slides (some for editing, some for context) and returns edited versions
 */
export async function POST(request: NextRequest) {
  try {
    const input: EditSlidesInput = await request.json();

    const {
      slidesToEdit,
      contextSlides = [],
      editInstructions,
      images,
      strategyName,
    } = input;

    const hasText = editInstructions?.trim();
    const hasImages = images && images.length > 0;

    if (!slidesToEdit || slidesToEdit.length === 0) {
      return NextResponse.json(
        {
          error:
            "Please select at least one slide to edit. Click a slide thumbnail to select it for editing.",
        },
        { status: 400 },
      );
    }

    if (!hasText && !hasImages) {
      return NextResponse.json(
        {
          error:
            "Please provide edit instructions or attach an image showing the changes you want.",
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
      // Longer timeout for batch operations: 4 minutes
      timeout: 4 * 60 * 1000,
    });

    // Build the user prompt with slides organized by type
    const slidesToEditSection = slidesToEdit
      .map(
        (s) =>
          `### Slide ${s.slideNumber} (EDIT THIS)\n\`\`\`html\n${s.htmlContent}\n\`\`\``,
      )
      .join("\n\n");

    const contextSlidesSection =
      contextSlides.length > 0
        ? `## Context Slides (READ-ONLY - DO NOT EDIT)\n\n${contextSlides
            .map(
              (s) =>
                `### Slide ${s.slideNumber} (CONTEXT ONLY)\n\`\`\`html\n${s.htmlContent}\n\`\`\``,
            )
            .join("\n\n")}`
        : "";

    const instructionsText = hasText
      ? editInstructions
      : "Please analyze the attached image(s) and apply any corrections or changes shown to the slides.";

    const userPromptText = `## Slides to Edit
${strategyName ? `\nStrategy: ${strategyName}\n` : ""}
${slidesToEditSection}

${contextSlidesSection}

## Edit Instructions

${instructionsText}

---

Apply the requested changes to the slides marked for editing.
Return a JSON array of the edited slides in this exact format:

\`\`\`json
[
  { "slideNumber": 3, "htmlContent": "<!DOCTYPE html>..." },
  { "slideNumber": 5, "htmlContent": "<!DOCTYPE html>..." }
]
\`\`\`

IMPORTANT:
- Only include slides you were asked to edit (slides ${slidesToEdit.map((s) => s.slideNumber).join(", ")})
- Do NOT include context slides in your response
- Each htmlContent must be complete, valid HTML
- Return slides in order by slide number`;

    // Build message content with images and text
    const messageContent = buildMessageContent(images, userPromptText);

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.EDIT,
      max_tokens: 32000, // More tokens for multiple slides with large HTML content
      system: EDIT_SLIDES_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    // Extract the JSON from the response
    const textContent = extractTextContent(response);
    if (!textContent) {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    // Extract JSON from response (may be wrapped in markdown code fence)
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    const responseText = jsonMatch ? jsonMatch[1].trim() : textContent.trim();

    // Parse the JSON array
    let editedSlides: EditedSlide[];
    try {
      editedSlides = JSON.parse(responseText);

      if (!Array.isArray(editedSlides)) {
        throw new Error("Response is not an array");
      }

      // Validate each slide has required fields
      for (const slide of editedSlides) {
        if (
          typeof slide.slideNumber !== "number" ||
          typeof slide.htmlContent !== "string"
        ) {
          throw new Error("Invalid slide format");
        }
      }
    } catch {
      console.error(
        "[edit-slides] Failed to parse response:",
        responseText.slice(0, 500),
      );
      return NextResponse.json(
        {
          error:
            "The AI response could not be processed. Please try again with clearer edit instructions.",
        },
        { status: 500 },
      );
    }

    // Clean up HTML content (remove any residual markdown fences)
    editedSlides = editedSlides.map((slide) => ({
      slideNumber: slide.slideNumber,
      htmlContent: stripMarkdownFences(slide.htmlContent, "html"),
    }));

    return NextResponse.json({
      success: true,
      editedSlides,
    });
  } catch (error) {
    console.error("[edit-slides] Error:", error);
    return NextResponse.json(
      { error: handleAnthropicError(error, "Edit slides") },
      { status: 500 },
    );
  }
}
