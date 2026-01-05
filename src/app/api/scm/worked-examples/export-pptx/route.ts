export const maxDuration = 120; // 2 minutes for Chromium + PPTX generation

import { NextRequest, NextResponse } from 'next/server';
import pptxgen from '@bapunhansdah/pptxgenjs';

import {
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  pxToInches,
  extractPptxElements,
  parseSlideHtml,
  addPptxElement,
  renderSvgToImage,
  renderSvgLayers,
  renderFullSlideToImage,
  RenderError,
} from './helpers';
import { handlePuppeteerError } from '@error/handlers/puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { slides, title, mathConcept } = await request.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    // Create presentation
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = title || 'Worked Example';
    pptx.author = 'AI Coaching Platform';
    pptx.subject = mathConcept || 'Math';
    pptx.company = 'AI Coaching Platform';

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      const slide = pptx.addSlide();
      const html = slideData.htmlContent || '';

      slide.background = { color: 'FFFFFF' };

      try {
        // Extract ALL elements with data-pptx-* attributes
        const pptxElements = extractPptxElements(html);

        // Separate CFU and answer boxes to add last (ensures they're on top in z-order)
        const regularElements = pptxElements.filter(
          el => el.regionType !== 'cfu-box' && el.regionType !== 'answer-box'
        );
        const overlayBoxes = pptxElements.filter(
          el => el.regionType === 'cfu-box' || el.regionType === 'answer-box'
        );

        // Render regular elements first (they'll be at the bottom of z-order)
        for (const el of regularElements) {
          if (el.regionType === 'svg-container') continue;
          addPptxElement(slide, el);
        }

        // Handle SVG content separately - must be rendered as image
        const hasSvg = /<svg[\s>]/i.test(html);
        if (hasSvg) {
          const parsed = parseSlideHtml(html);
          if (parsed.svgRegion) {
            const region = parsed.svgRegion;
            const imgX = pxToInches(region.x, 'w');
            const imgY = pxToInches(region.y, 'h');
            const imgW = pxToInches(region.width, 'w');
            const imgH = pxToInches(region.height, 'h');

            if (region.layers && region.layers.length > 1) {
              const layerImages = await renderSvgLayers(
                region.html,
                region.width,
                region.height,
                region.layers
              );
              for (const layer of layerImages) {
                const layerBase64 = layer.buffer.toString('base64');
                slide.addImage({
                  data: `data:image/png;base64,${layerBase64}`,
                  x: imgX,
                  y: imgY,
                  w: imgW,
                  h: imgH,
                });
              }
            } else {
              const svgBuffer = await renderSvgToImage(
                region.html,
                region.width,
                region.height
              );
              const svgBase64 = svgBuffer.toString('base64');
              slide.addImage({
                data: `data:image/png;base64,${svgBase64}`,
                x: imgX,
                y: imgY,
                w: imgW,
                h: imgH,
              });
            }
          }
        }

        // Add CFU and answer boxes LAST so they appear on top (highest z-order)
        for (const el of overlayBoxes) {
          addPptxElement(slide, el);
        }
      } catch (parseError) {
        console.error(`Error parsing slide ${i + 1}, falling back to full render:`, parseError);

        // Fallback: render entire slide as image
        try {
          const imageBuffer = await renderFullSlideToImage(html);
          const base64Image = imageBuffer.toString('base64');

          slide.addImage({
            data: `data:image/png;base64,${base64Image}`,
            x: 0,
            y: 0,
            w: SLIDE_WIDTH,
            h: SLIDE_HEIGHT,
          });
        } catch (renderError) {
          console.error(`Failed to render slide ${i + 1}:`, renderError);
          slide.addText(`[Slide ${i + 1} - Rendering failed]`, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 0.5,
            fontSize: 14,
            fontFace: 'Arial',
            color: 'FF0000',
            align: 'center',
          });
        }
      }

      // Add slide number in footer
      slide.addText(`${slideData.slideNumber || i + 1}`, {
        x: 9.3,
        y: 5.2,
        w: 0.5,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        color: '999999',
        align: 'right',
      });
    }

    // Generate PPTX as base64
    const pptxBase64 = await pptx.write({ outputType: 'base64' });

    // Return as downloadable file
    const buffer = Buffer.from(pptxBase64 as string, 'base64');
    const filename = `${(title || 'worked-example').replace(/[^a-zA-Z0-9-]/g, '-')}.pptx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PPTX generation error:', error);

    // Use handlePuppeteerError for rendering-related errors
    if (error instanceof RenderError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Check if it's a puppeteer-related error (even if not wrapped in RenderError)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('Chrome') ||
      errorMessage.includes('browser') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Target closed')
    ) {
      return NextResponse.json(
        { error: handlePuppeteerError(error, 'PPTX export') },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PPTX' },
      { status: 500 }
    );
  }
}
