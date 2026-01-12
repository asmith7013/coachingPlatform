import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import { OPTIMIZE_FOR_EXPORT } from '@/skills/worked-example';

// Extend Vercel function timeout for streaming
export const maxDuration = 120; // 2 minutes

interface SlideData {
  slideNumber: number;
  htmlContent: string;
}

interface OptimizeSlidesInput {
  slides: SlideData[];
}

/**
 * System prompt for SVG-to-HTML optimization (single slide)
 */
const OPTIMIZE_SINGLE_SLIDE_PROMPT = `You are an expert at optimizing HTML slides for PowerPoint export.

${OPTIMIZE_FOR_EXPORT}

---

## API Output Format (REQUIRED)

Return ONLY the optimized HTML content. No JSON wrapper, no explanation, no code fences.
If no optimization is needed, return the original HTML unchanged.

Important:
- Return COMPLETE slide HTML
- Preserve all non-SVG content exactly
- Only convert simple SVGs (rect, text, line, circle) to HTML divs`;

/**
 * SSE endpoint for AI-powered slide optimization before export
 * Converts simple SVGs to HTML for better PPTX quality
 *
 * Events:
 * - start: { totalSlides, slidesToOptimize, message }
 * - analyzing: { slideNumber, message }
 * - optimizing: { slideNumber, message }
 * - slide: { slideNumber, wasOptimized, changes?, message }
 * - complete: { success, slides, optimizedCount, message }
 * - error: { message }
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Helper to send SSE events
  const sendEvent = (controller: ReadableStreamDefaultController, event: string, data: unknown) => {
    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  try {
    const input: OptimizeSlidesInput = await request.json();
    const { slides } = input;

    if (!slides || slides.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No slides provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Phase 1: Analyze which slides need optimization
          sendEvent(controller, 'start', {
            totalSlides: slides.length,
            phase: 'analyzing',
            message: 'Analyzing slides for optimization...',
          });

          // Check each slide for SVGs that might need optimization
          const slidesNeedingOptimization: SlideData[] = [];
          const slideOptimizationMap = new Map<number, boolean>();

          for (const slide of slides) {
            sendEvent(controller, 'analyzing', {
              slideNumber: slide.slideNumber,
              message: `Analyzing slide ${slide.slideNumber}...`,
            });

            // Check if slide has SVGs that could be optimized
            const hasSvg = slide.htmlContent.includes('<svg');
            const hasSimpleElements = slide.htmlContent.includes('<rect') || slide.htmlContent.includes('<text');
            const hasComplexPaths = /<path\s+[^>]*d="[^"]*[cCsS]/.test(slide.htmlContent); // Curved paths

            const needsOptimization = hasSvg && hasSimpleElements && !hasComplexPaths;
            slideOptimizationMap.set(slide.slideNumber, needsOptimization);

            if (needsOptimization) {
              slidesNeedingOptimization.push(slide);
            }

            // Small delay between analyses for visual feedback
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // If no slides need optimization, complete early
          if (slidesNeedingOptimization.length === 0) {
            sendEvent(controller, 'complete', {
              success: true,
              slides: slides.map(s => ({
                slideNumber: s.slideNumber,
                htmlContent: s.htmlContent,
                wasOptimized: false,
              })),
              optimizedCount: 0,
              message: 'No slides required optimization',
            });
            controller.close();
            return;
          }

          // Phase 2: Optimize slides that need it
          sendEvent(controller, 'start', {
            totalSlides: slides.length,
            slidesToOptimize: slidesNeedingOptimization.length,
            phase: 'optimizing',
            message: `Optimizing ${slidesNeedingOptimization.length} slide${slidesNeedingOptimization.length > 1 ? 's' : ''}...`,
          });

          const anthropic = new Anthropic({
            apiKey,
            timeout: 60 * 1000, // 1 minute per slide
          });

          const optimizedSlides = new Map<number, { htmlContent: string; wasOptimized: boolean; changes?: string }>();

          // Process each slide individually for streaming feedback
          for (const slide of slidesNeedingOptimization) {
            sendEvent(controller, 'optimizing', {
              slideNumber: slide.slideNumber,
              message: `Converting SVGs in slide ${slide.slideNumber}...`,
            });

            try {
              const response = await anthropic.messages.create({
                model: MODEL_FOR_TASK.EDIT,
                max_tokens: 8000,
                system: OPTIMIZE_SINGLE_SLIDE_PROMPT,
                messages: [
                  {
                    role: 'user',
                    content: `Optimize this slide by converting simple SVGs to HTML divs:\n\n${slide.htmlContent}`,
                  },
                ],
              });

              const textContent = response.content.find(c => c.type === 'text');
              if (textContent && textContent.type === 'text') {
                let optimizedHtml = textContent.text.trim();

                // Clean up markdown code fences if present
                if (optimizedHtml.startsWith('```html')) {
                  optimizedHtml = optimizedHtml.slice(7);
                } else if (optimizedHtml.startsWith('```')) {
                  optimizedHtml = optimizedHtml.slice(3);
                }
                if (optimizedHtml.endsWith('```')) {
                  optimizedHtml = optimizedHtml.slice(0, -3);
                }
                optimizedHtml = optimizedHtml.trim();

                // Check if content actually changed
                const wasOptimized = optimizedHtml !== slide.htmlContent;

                optimizedSlides.set(slide.slideNumber, {
                  htmlContent: optimizedHtml,
                  wasOptimized,
                  changes: wasOptimized ? 'Converted SVGs to HTML' : undefined,
                });

                sendEvent(controller, 'slide', {
                  slideNumber: slide.slideNumber,
                  wasOptimized,
                  changes: wasOptimized ? 'Converted SVGs to native elements' : undefined,
                  message: wasOptimized
                    ? `Slide ${slide.slideNumber}: Converted to native elements`
                    : `Slide ${slide.slideNumber}: No changes needed`,
                });
              } else {
                // No text response - keep original
                optimizedSlides.set(slide.slideNumber, {
                  htmlContent: slide.htmlContent,
                  wasOptimized: false,
                });

                sendEvent(controller, 'slide', {
                  slideNumber: slide.slideNumber,
                  wasOptimized: false,
                  message: `Slide ${slide.slideNumber}: Kept original`,
                });
              }
            } catch (slideError) {
              console.error(`[optimize-slides] Error optimizing slide ${slide.slideNumber}:`, slideError);
              // Keep original on error
              optimizedSlides.set(slide.slideNumber, {
                htmlContent: slide.htmlContent,
                wasOptimized: false,
              });

              sendEvent(controller, 'slide', {
                slideNumber: slide.slideNumber,
                wasOptimized: false,
                error: true,
                message: `Slide ${slide.slideNumber}: Kept original (error)`,
              });
            }
          }

          // Build final slides array
          const finalSlides = slides.map(originalSlide => {
            const optimized = optimizedSlides.get(originalSlide.slideNumber);
            if (optimized) {
              return {
                slideNumber: originalSlide.slideNumber,
                htmlContent: optimized.htmlContent,
                wasOptimized: optimized.wasOptimized,
                changes: optimized.changes,
              };
            }
            return {
              slideNumber: originalSlide.slideNumber,
              htmlContent: originalSlide.htmlContent,
              wasOptimized: false,
            };
          });

          const optimizedCount = finalSlides.filter(s => s.wasOptimized).length;

          // Phase 3: Complete
          sendEvent(controller, 'complete', {
            success: true,
            slides: finalSlides,
            optimizedCount,
            message: optimizedCount > 0
              ? `Optimized ${optimizedCount} slide${optimizedCount > 1 ? 's' : ''} for better export`
              : 'No slides required optimization',
          });

          controller.close();
        } catch (error) {
          console.error('[optimize-slides] Stream error:', error);
          sendEvent(controller, 'error', {
            message: handleAnthropicError(error, 'Optimize slides'),
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
    console.error('[optimize-slides] Request error:', error);
    return new Response(
      JSON.stringify({ error: handleAnthropicError(error, 'Optimize slides') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
