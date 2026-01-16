import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import { EDIT_SLIDE_SYSTEM_PROMPT } from '@/app/scm/workedExamples/create/lib/prompts';

interface EditSlideInput {
  currentHtml: string;
  editInstructions: string;
  images?: string[]; // Base64 data URLs
  slideNumber?: number;
  strategyName?: string;
}

// Helper to parse base64 data URL and extract media type and data
function parseDataUrl(dataUrl: string): { mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; data: string } | null {
  const match = dataUrl.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
  if (!match) return null;
  return {
    mediaType: match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    data: match[3],
  };
}

/**
 * API endpoint for AI-powered slide editing
 * Takes the current HTML and user instructions, returns edited HTML
 */
export async function POST(request: NextRequest) {
  try {
    const input: EditSlideInput = await request.json();

    const { currentHtml, editInstructions, images, slideNumber, strategyName } = input;

    const hasText = editInstructions?.trim();
    const hasImages = images && images.length > 0;

    if (!currentHtml || (!hasText && !hasImages)) {
      return NextResponse.json(
        { error: 'Missing required fields: currentHtml and either editInstructions or images' },
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
      timeout: 2 * 60 * 1000, // 2 minutes for single slide edit
    });

    // Build the user prompt text
    const instructionsText = hasText
      ? editInstructions
      : 'Please analyze the attached image(s) and apply any corrections or changes shown to the slide.';

    const userPromptText = `## Current Slide HTML${slideNumber ? ` (Slide ${slideNumber})` : ''}${strategyName ? `\nStrategy: ${strategyName}` : ''}

\`\`\`html
${currentHtml}
\`\`\`

## Edit Instructions

${instructionsText}

---

Apply the requested changes and return the complete edited HTML.`;

    // Build message content - can include images and text
    const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

    // Add images first if provided
    if (hasImages) {
      for (const dataUrl of images) {
        const parsed = parseDataUrl(dataUrl);
        if (parsed) {
          messageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: parsed.mediaType,
              data: parsed.data,
            },
          });
        }
      }
    }

    // Add text prompt
    messageContent.push({
      type: 'text',
      text: userPromptText,
    });

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.EDIT,
      max_tokens: 8000,
      system: EDIT_SLIDE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    // Extract the HTML from the response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    let editedHtml = textContent.text.trim();

    // Clean up any markdown code fences if present
    if (editedHtml.startsWith('```html')) {
      editedHtml = editedHtml.slice(7);
    } else if (editedHtml.startsWith('```')) {
      editedHtml = editedHtml.slice(3);
    }
    if (editedHtml.endsWith('```')) {
      editedHtml = editedHtml.slice(0, -3);
    }
    editedHtml = editedHtml.trim();

    return NextResponse.json({
      success: true,
      editedHtml,
    });
  } catch (error) {
    console.error('[edit-slide] Error:', error);
    return NextResponse.json(
      { error: handleAnthropicError(error, 'Edit slide') },
      { status: 500 }
    );
  }
}
