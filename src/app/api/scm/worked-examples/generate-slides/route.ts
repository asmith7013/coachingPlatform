import { NextRequest } from 'next/server';

// Extend Vercel function timeout for long Claude API streaming
// Streaming keeps connection alive, but Vercel still has a max execution time
export const maxDuration = 300; // 5 minutes

import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { currentUser } from '@clerk/nextjs/server';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import { sendEmail } from '@/lib/email/email-service';
import {
  GENERATE_SLIDES_SYSTEM_PROMPT,
  buildGenerateSlidesPrompt,
  buildContinuePrompt,
  buildUpdatePrompt,
  type GenerationMode,
  type UpdateInstructions,
} from '@/app/scm/workedExamples/create/lib/prompts';
import type { ProblemAnalysis, StrategyDefinition, Scenario } from '@/app/scm/workedExamples/create/lib/types';
import type { HtmlSlide } from '@zod-schema/scm/worked-example';

interface GenerateSlidesInput {
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  learningGoals: string[];
  problemAnalysis: ProblemAnalysis;
  strategyDefinition: StrategyDefinition;
  scenarios: Scenario[];
  testMode?: boolean; // Generate only 1 slide for testing
  // Context-aware generation
  mode?: GenerationMode;           // 'full' (default), 'continue', or 'update'
  existingSlides?: HtmlSlide[];    // Slides already generated
  updateInstructions?: UpdateInstructions; // For 'update' mode
  // For email notification
  slug?: string; // URL slug for the worked example
}

const SLIDE_SEPARATOR = '===SLIDE_SEPARATOR===';

/**
 * Send email notification when slides are complete
 */
async function sendSlideCompletionEmail(
  userEmail: string,
  slideCount: number,
  gradeLevel: string,
  unitNumber: number | null,
  lessonNumber: number | null,
  problemType: string,
  slug: string | undefined
): Promise<void> {
  try {
    const subject = `Your Worked Example Slides Are Ready! (${slideCount} slides)`;

    let body = `Great news! Your worked example slide generation is complete.\n\n`;

    body += `DETAILS:\n`;
    body += `  Grade Level: ${gradeLevel}\n`;
    if (unitNumber !== null) {
      body += `  Unit: ${unitNumber}\n`;
    }
    if (lessonNumber !== null) {
      body += `  Lesson: ${lessonNumber}\n`;
    }
    body += `  Problem Type: ${problemType}\n`;
    body += `  Slides Generated: ${slideCount}\n`;
    if (slug) {
      body += `  Slug: ${slug}\n`;
    }
    body += `\n`;

    body += `Your slides are ready for review in the creation wizard.\n\n`;

    body += `Completed at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`;

    // Build URL with draft (using slug) and step params
    const baseUrl = 'https://www.solvescoaching.com/scm/workedExamples/create';
    const params = new URLSearchParams();
    if (slug) {
      params.set('draft', slug);
    }
    params.set('step', '3'); // Go directly to slide review step
    const viewUrl = `${baseUrl}?${params.toString()}`;
    body += `\nView your slides: ${viewUrl}`;

    await sendEmail({
      to: userEmail,
      subject,
      body
    });

    console.log('[generate-slides] Completion email sent to:', userEmail);
  } catch (error) {
    // Don't fail the request if email fails - just log it
    console.error('[generate-slides] Failed to send completion email:', error);
  }
}

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
      mode = 'full',
      existingSlides = [],
      updateInstructions,
      slug,
    } = input;

    // Get user email for completion notification
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    // Estimate total slides for PPTX format (dynamic based on strategy moves):
    // 3 intro slides (Teacher Instructions, Big Idea, Problem Setup)
    // N step slides (one per strategy move, determined by misconception count)
    // 2 practice problem preview slides (for whiteboard work)
    // Printable and Lesson Summary slides are generated separately
    const numMoves = strategyDefinition?.moves?.length ?? 3;
    const fullSlideCount = 3 + numMoves + 2;

    // Calculate estimated slides based on mode
    let estimatedSlideCount: number;
    if (testMode) {
      estimatedSlideCount = 1;
    } else if (mode === 'continue') {
      // Only generating remaining slides
      estimatedSlideCount = Math.max(1, fullSlideCount - existingSlides.length);
    } else if (mode === 'update') {
      // Only regenerating specified slides
      estimatedSlideCount = updateInstructions?.slideNumbers.length || 1;
    } else {
      estimatedSlideCount = fullSlideCount;
    }

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
      timeout: 5 * 60 * 1000, // 5 minutes - matches Vercel maxDuration
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
    } else if (mode === 'continue' && existingSlides.length > 0) {
      // Continue mode: Generate remaining slides after existing ones
      // Uses prompt builder from SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
      systemPrompt = GENERATE_SLIDES_SYSTEM_PROMPT;
      const basePrompt = buildGenerateSlidesPrompt(gradeLevel, unitNumber, lessonNumber, learningGoals, problemAnalysis, strategyDefinition, scenarios);
      userPrompt = buildContinuePrompt(existingSlides, fullSlideCount, basePrompt);

    } else if (mode === 'update' && updateInstructions && existingSlides.length > 0) {
      // Update mode: Regenerate specific slides with changes
      // Uses prompt builder from SOURCE OF TRUTH: .claude/skills/create-worked-example-sg/prompts/generate-slides.md
      systemPrompt = GENERATE_SLIDES_SYSTEM_PROMPT;
      const basePrompt = buildGenerateSlidesPrompt(gradeLevel, unitNumber, lessonNumber, learningGoals, problemAnalysis, strategyDefinition, scenarios);
      userPrompt = buildUpdatePrompt(existingSlides, updateInstructions, basePrompt);

    } else {
      // Full mode: Generate all slides from scratch
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
          // Note: Each HTML slide with inline styles can be 1500-2500 tokens
          // 16 slides × 2000 tokens = 32000 tokens minimum needed
          // Using 64000 to ensure all slides complete
          const claudeStream = await anthropic.messages.create({
            model: MODEL_FOR_TASK.GENERATION,
            max_tokens: testMode ? 2000 : 64000,
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
          let stopReason: string | null = null;
          let inputTokens = 0;
          let outputTokens = 0;

          for await (const event of claudeStream) {
            // Capture usage and stop reason from message events
            if (event.type === 'message_delta') {
              stopReason = event.delta.stop_reason || null;
            }
            if (event.type === 'message_start' && event.message.usage) {
              inputTokens = event.message.usage.input_tokens;
            }
            if (event.type === 'message_delta' && event.usage) {
              outputTokens = event.usage.output_tokens;
            }

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

                  // Build slide object for incremental saving
                  const slideObj = {
                    slideNumber: completedSlides.length,
                    slideType: extractSlideType(completedSlide),
                    htmlContent: completedSlide,
                    visualType: detectVisualType(completedSlide),
                    scripts: extractScripts(completedSlide),
                  };

                  // Send progress event with slide content
                  sendEvent(controller, 'slide', {
                    slideNumber: completedSlides.length,
                    estimatedTotal: estimatedSlideCount,
                    message: `Slide ${completedSlides.length} of ~${estimatedSlideCount} complete`,
                    slide: slideObj, // Include the actual slide for incremental saving
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

            // Build slide object for incremental saving
            const slideObj = {
              slideNumber: completedSlides.length,
              slideType: extractSlideType(remainingSlide),
              htmlContent: remainingSlide,
              visualType: detectVisualType(remainingSlide),
              scripts: extractScripts(remainingSlide),
            };

            sendEvent(controller, 'slide', {
              slideNumber: completedSlides.length,
              estimatedTotal: estimatedSlideCount,
              message: `Slide ${completedSlides.length} of ~${estimatedSlideCount} complete`,
              slide: slideObj, // Include the actual slide for incremental saving
            });
          }

          // If no slides were found via separator, try fallback parsing
          if (completedSlides.length === 0) {
            completedSlides = parseSlidesFromText(fullText);
          }

          // Log generation stats for debugging
          console.log('[generate-slides] Complete:', {
            stopReason,
            inputTokens,
            outputTokens,
            slidesGenerated: completedSlides.length,
            estimatedSlideCount,
            fullTextLength: fullText.length,
          });

          // Warn if we hit token limit
          if (stopReason === 'max_tokens') {
            console.warn('[generate-slides] Hit max_tokens limit! Only generated', completedSlides.length, 'of', estimatedSlideCount, 'slides');
          }

          // Convert to HtmlSlide format
          const slides = completedSlides.map((html, index) => ({
            slideNumber: index + 1,
            slideType: extractSlideType(html),
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

          // Send email notification to user (fire and forget - don't block stream)
          if (userEmail && slides.length > 0 && !testMode) {
            sendSlideCompletionEmail(
              userEmail,
              slides.length,
              gradeLevel,
              unitNumber,
              lessonNumber,
              problemAnalysis.problemType,
              slug
            );
          }

          controller.close();
        } catch (error) {
          console.error('[generate-slides] Stream error:', error);
          sendEvent(controller, 'error', {
            message: handleAnthropicError(error, 'Generate slides'),
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
      JSON.stringify({ error: handleAnthropicError(error, 'Generate slides') }),
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
const VALID_SLIDE_TYPES = new Set([
  'teacher-instructions', 'big-idea', 'problem-setup', 'step',
  'practice-preview', 'printable-worksheet', 'lesson-summary',
]);

/**
 * Extract slide type from data-slide-type attribute on <body>
 */
function extractSlideType(html: string): string | undefined {
  const match = html.match(/data-slide-type=["']([^"']+)["']/);
  if (match && VALID_SLIDE_TYPES.has(match[1])) {
    return match[1];
  }
  return undefined;
}

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
