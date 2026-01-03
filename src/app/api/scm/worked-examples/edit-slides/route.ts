import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import { EDIT_SLIDES_SYSTEM_PROMPT } from '@/app/scm/workedExamples/create/lib/prompts';

interface SlideInput {
  slideNumber: number;
  htmlContent: string;
}

interface EditSlidesInput {
  slidesToEdit: SlideInput[];
  contextSlides?: SlideInput[];
  editInstructions: string;
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

    const { slidesToEdit, contextSlides = [], editInstructions, strategyName } = input;

    if (!slidesToEdit || slidesToEdit.length === 0 || !editInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields: slidesToEdit (non-empty array) and editInstructions' },
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
      // Longer timeout for batch operations: 4 minutes
      timeout: 4 * 60 * 1000,
    });

    // Build the user prompt with slides organized by type
    const slidesToEditSection = slidesToEdit
      .map(s => `### Slide ${s.slideNumber} (EDIT THIS)\n\`\`\`html\n${s.htmlContent}\n\`\`\``)
      .join('\n\n');

    const contextSlidesSection = contextSlides.length > 0
      ? `## Context Slides (READ-ONLY - DO NOT EDIT)\n\n${contextSlides
          .map(s => `### Slide ${s.slideNumber} (CONTEXT ONLY)\n\`\`\`html\n${s.htmlContent}\n\`\`\``)
          .join('\n\n')}`
      : '';

    const userPrompt = `## Slides to Edit
${strategyName ? `\nStrategy: ${strategyName}\n` : ''}
${slidesToEditSection}

${contextSlidesSection}

## Edit Instructions

${editInstructions}

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
- Only include slides you were asked to edit (slides ${slidesToEdit.map(s => s.slideNumber).join(', ')})
- Do NOT include context slides in your response
- Each htmlContent must be complete, valid HTML
- Return slides in order by slide number`;

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.EDIT,
      max_tokens: 16000, // More tokens for multiple slides
      system: EDIT_SLIDES_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the JSON from the response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    let responseText = textContent.text.trim();

    // Extract JSON from response (may be wrapped in markdown code fence)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      responseText = jsonMatch[1].trim();
    }

    // Parse the JSON array
    let editedSlides: EditedSlide[];
    try {
      editedSlides = JSON.parse(responseText);

      if (!Array.isArray(editedSlides)) {
        throw new Error('Response is not an array');
      }

      // Validate each slide has required fields
      for (const slide of editedSlides) {
        if (typeof slide.slideNumber !== 'number' || typeof slide.htmlContent !== 'string') {
          throw new Error('Invalid slide format');
        }
      }
    } catch {
      console.error('[edit-slides] Failed to parse response:', responseText.slice(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON array' },
        { status: 500 }
      );
    }

    // Clean up HTML content (remove any residual markdown fences)
    editedSlides = editedSlides.map(slide => ({
      slideNumber: slide.slideNumber,
      htmlContent: slide.htmlContent
        .replace(/^```html\s*/i, '')
        .replace(/```\s*$/, '')
        .trim(),
    }));

    return NextResponse.json({
      success: true,
      editedSlides,
    });
  } catch (error) {
    console.error('[edit-slides] Error:', error);
    return NextResponse.json(
      { error: handleAnthropicError(error, 'Edit slides') },
      { status: 500 }
    );
  }
}
