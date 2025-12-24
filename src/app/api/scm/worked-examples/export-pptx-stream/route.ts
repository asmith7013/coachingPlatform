import { NextRequest } from 'next/server';
import { generatePptxFromSlides } from '../export-pptx/helpers';

interface ProgressEvent {
  type: 'progress' | 'complete' | 'error';
  message?: string;
  currentSlide?: number;
  totalSlides?: number;
  step?: string;
  data?: string; // base64 for complete
  filename?: string;
  error?: string;
}

/**
 * Streaming PPTX export endpoint with progress updates via SSE
 */
export async function POST(request: NextRequest) {
  try {
    const { slides, title, mathConcept } = await request.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return new Response(
        JSON.stringify({ type: 'error', error: 'No slides provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const encoder = new TextEncoder();
    const totalSlides = slides.length;

    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (event: ProgressEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          const result = await generatePptxFromSlides(slides, {
            title,
            mathConcept,
            onProgress: (current, total, message, step) => {
              sendProgress({
                type: 'progress',
                message,
                currentSlide: current,
                totalSlides: total,
                step,
              });
            },
          });

          // Send completion with file data
          sendProgress({
            type: 'complete',
            message: 'Export complete!',
            currentSlide: totalSlides,
            totalSlides,
            step: 'complete',
            data: result.pptxBase64,
            filename: result.filename,
          });

          controller.close();
        } catch (error) {
          console.error('PPTX generation error:', error);
          sendProgress({
            type: 'error',
            error: error instanceof Error ? error.message : 'Failed to generate PPTX',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('PPTX stream error:', error);
    return new Response(
      JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Failed to start export' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
