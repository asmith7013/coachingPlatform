import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  GENERATE_SLIDES_SYSTEM_PROMPT,
  buildGenerateSlidesPrompt,
} from '@/app/scm/workedExamples/create/lib/prompts';
import type { ProblemAnalysis, StrategyDefinition, Scenario } from '@/app/scm/workedExamples/create/lib/types';

interface GenerateSlidesInput {
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  learningGoals: string[];
  problemAnalysis: ProblemAnalysis;
  strategyDefinition: StrategyDefinition;
  scenarios: Scenario[];
  testMode?: boolean; // Generate only 1 slide for testing
}

const SLIDE_SEPARATOR = '===SLIDE_SEPARATOR===';

/**
 * SSE endpoint for streaming slide generation
 * Returns real-time progress as slides are generated
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Helper to send SSE events
  const sendEvent = (controller: ReadableStreamDefaultController, event: string, data: unknown) => {
    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  try {
    const input: GenerateSlidesInput = await request.json();

    const {
      gradeLevel,
      unitNumber,
      lessonNumber,
      learningGoals,
      problemAnalysis,
      strategyDefinition,
      scenarios,
      testMode = false,
    } = input;

    // Estimate total slides based on scenarios (or 1 for test mode)
    const estimatedSlideCount = testMode ? 1 : scenarios.length * 3 + 2;

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 10 * 60 * 1000, // 10 minutes
    });

    // Build prompt - use simplified test prompt for test mode
    let userPrompt: string;
    let systemPrompt: string;

    if (testMode) {
      // Simplified test prompt - just generate 1 basic slide
      systemPrompt = `You are a math education content creator. Generate a single HTML slide for a worked example.
Output ONLY the HTML content for the slide. Use this separator between slides: ===SLIDE_SEPARATOR===
Even for a single slide, end with the separator.`;

      userPrompt = `Create ONE simple HTML slide for a Grade ${gradeLevel} math worked example.

Topic: ${problemAnalysis.problemType}
Strategy: ${strategyDefinition.name}
Scenario: ${scenarios[0]?.name || 'Example Problem'}

The slide should:
1. Have a title
2. Show a simple problem setup
3. Include basic styling (centered, readable font)

Keep it simple - this is just a test. Output the HTML then ===SLIDE_SEPARATOR===`;
    } else {
      systemPrompt = GENERATE_SLIDES_SYSTEM_PROMPT;
      userPrompt = buildGenerateSlidesPrompt(
        gradeLevel,
        unitNumber,
        lessonNumber,
        learningGoals,
        problemAnalysis,
        strategyDefinition,
        scenarios
      );
    }

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event
          sendEvent(controller, 'start', {
            estimatedSlideCount,
            message: 'Starting slide generation...',
          });

          // Start Claude streaming
          const claudeStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: testMode ? 2000 : 32000,
            stream: true,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt,
              },
            ],
          });

          let fullText = '';
          let completedSlides: string[] = [];
          let currentSlideBuffer = '';

          // Process the stream
          for await (const event of claudeStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = event.delta.text;
              fullText += chunk;
              currentSlideBuffer += chunk;

              // Check for completed slides
              while (currentSlideBuffer.includes(SLIDE_SEPARATOR)) {
                const separatorIndex = currentSlideBuffer.indexOf(SLIDE_SEPARATOR);
                const completedSlide = currentSlideBuffer.substring(0, separatorIndex).trim();

                if (completedSlide && completedSlide.includes('<')) {
                  completedSlides.push(completedSlide);

                  // Send progress event
                  sendEvent(controller, 'slide', {
                    slideNumber: completedSlides.length,
                    estimatedTotal: estimatedSlideCount,
                    message: `Slide ${completedSlides.length} of ~${estimatedSlideCount} complete`,
                  });
                }

                // Continue with remaining buffer
                currentSlideBuffer = currentSlideBuffer.substring(separatorIndex + SLIDE_SEPARATOR.length);
              }
            }
          }

          // Handle any remaining content as the last slide
          const remainingSlide = currentSlideBuffer.trim();
          if (remainingSlide && remainingSlide.includes('<')) {
            completedSlides.push(remainingSlide);
            sendEvent(controller, 'slide', {
              slideNumber: completedSlides.length,
              estimatedTotal: estimatedSlideCount,
              message: `Slide ${completedSlides.length} of ~${estimatedSlideCount} complete`,
            });
          }

          // If no slides were found via separator, try fallback parsing
          if (completedSlides.length === 0) {
            completedSlides = parseSlidesFromText(fullText);
          }

          // Convert to HtmlSlide format
          const slides = completedSlides.map((html, index) => ({
            slideNumber: index + 1,
            htmlContent: html,
            visualType: detectVisualType(html),
            scripts: extractScripts(html),
          }));

          // Send completion event with all slides
          sendEvent(controller, 'complete', {
            success: true,
            slideCount: slides.length,
            slides,
          });

          controller.close();
        } catch (error) {
          console.error('[generate-slides] Stream error:', error);
          sendEvent(controller, 'error', {
            message: error instanceof Error ? error.message : 'An error occurred during generation',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[generate-slides] Request error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Request failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Fallback: Parse slides from text if separators weren't found
 */
function parseSlidesFromText(text: string): string[] {
  // Try to split by HTML document patterns
  const htmlBlocks: string[] = [];
  const regex = /<div[^>]*class="slide-container"[^>]*>[\s\S]*?(?=<div[^>]*class="slide-container"|$)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    htmlBlocks.push(match[0].trim());
  }

  if (htmlBlocks.length > 0) {
    return htmlBlocks;
  }

  // Last resort: return the whole text as one slide
  if (text.includes('<')) {
    return [text.trim()];
  }

  return [];
}

/**
 * Detect visual type from HTML content
 */
function detectVisualType(html: string): 'html' | 'p5' | 'd3' {
  const lower = html.toLowerCase();

  if (lower.includes('p5.js') || lower.includes('createcanvas') || lower.includes('p5cdn')) {
    return 'p5';
  }

  if (lower.includes('d3.js') || lower.includes('d3.select') || lower.includes('d3cdn')) {
    return 'd3';
  }

  return 'html';
}

/**
 * Extract script references from HTML
 */
function extractScripts(html: string): { type: 'cdn' | 'inline'; content: string }[] | undefined {
  const scripts: { type: 'cdn' | 'inline'; content: string }[] = [];

  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1];
    const content = match[2].trim();

    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      scripts.push({ type: 'cdn', content: srcMatch[1] });
    } else if (content) {
      scripts.push({ type: 'inline', content });
    }
  }

  return scripts.length > 0 ? scripts : undefined;
}
