import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import { EDIT_SLIDE_SYSTEM_PROMPT } from '@/app/scm/workedExamples/create/lib/prompts';

interface EditSlideInput {
  currentHtml: string;
  editInstructions: string;
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

    const { currentHtml, editInstructions, slideNumber, strategyName } = input;

    if (!currentHtml || !editInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields: currentHtml and editInstructions' },
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

    // Build the user prompt
    const userPrompt = `## Current Slide HTML${slideNumber ? ` (Slide ${slideNumber})` : ''}${strategyName ? `\nStrategy: ${strategyName}` : ''}

\`\`\`html
${currentHtml}
\`\`\`

## Edit Instructions

${editInstructions}

---

Apply the requested changes and return the complete edited HTML.`;

    const response = await anthropic.messages.create({
      model: MODEL_FOR_TASK.EDIT,
      max_tokens: 8000,
      system: EDIT_SLIDE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
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
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
