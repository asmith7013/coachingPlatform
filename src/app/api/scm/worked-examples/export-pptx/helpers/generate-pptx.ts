import pptxgen from 'pptxgenjs';
import {
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  pxToInches,
} from './constants';
import { extractPptxElements, parseSlideHtml } from './parsers';
import { addPptxElement } from './element-handlers';
import { createRenderSession, RenderSession } from './renderers';

export interface SlideData {
  htmlContent: string;
  slideNumber?: number;
}

export interface GeneratePptxOptions {
  title?: string;
  mathConcept?: string;
  slug?: string;
  onProgress?: (current: number, total: number, message: string, step: string) => void;
}

export interface GeneratePptxResult {
  pptxBase64: string;
  filename: string;
}

/**
 * Generate a PPTX presentation from slide HTML content
 * Shared logic used by both streaming and Google Slides export routes
 */
export async function generatePptxFromSlides(
  slides: SlideData[],
  options: GeneratePptxOptions = {}
): Promise<GeneratePptxResult> {
  const { title, mathConcept, slug, onProgress } = options;
  const totalSlides = slides.length;

  // Create a single browser session for all slides (efficient)
  const renderSession = await createRenderSession();

  try {
    onProgress?.(0, totalSlides, 'Initializing PowerPoint export...', 'init');

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

      onProgress?.(i + 1, totalSlides, `Processing slide ${i + 1} of ${totalSlides}...`, 'processing');

      await processSlide(slide, html, i, totalSlides, renderSession, onProgress);

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

      // Add practice problems link on slide 15
      if (i === 14 && slug) {
        const practiceUrl = `https://solvescoaching.com/scm/workedExamples?view=${slug}&slide=15`;
        slide.addText('Practice Problems', {
          x: 0.3,
          y: 5.1,
          w: 2,
          h: 0.3,
          fontSize: 11,
          fontFace: 'Arial',
          color: '1791e8',
          underline: { style: 'sng' },
          hyperlink: { url: practiceUrl },
        });
      }
    }

    // Generate PPTX
    onProgress?.(totalSlides, totalSlides, 'Building PowerPoint file...', 'building');

    const pptxBase64 = await pptx.write({ outputType: 'base64' });
    const filename = `${(title || 'worked-example').replace(/[^a-zA-Z0-9-]/g, '-')}.pptx`;

    return {
      pptxBase64: pptxBase64 as string,
      filename,
    };
  } finally {
    // Always close browser session to clean up Chromium
    await renderSession.close();
  }
}

/**
 * Process a single slide - extract elements and render SVGs
 */
async function processSlide(
  slide: pptxgen.Slide,
  html: string,
  slideIndex: number,
  totalSlides: number,
  renderSession: RenderSession,
  onProgress?: (current: number, total: number, message: string, step: string) => void
): Promise<void> {
  try {
    // Extract ALL elements with data-pptx-* attributes
    const pptxElements = extractPptxElements(html);

    // Render each element as native PPTX shapes/text
    for (const el of pptxElements) {
      if (el.regionType === 'svg-container') continue;
      addPptxElement(slide, el);
    }

    // Handle SVG content separately - must be rendered as image
    const hasSvg = /<svg[\s>]/i.test(html);
    if (hasSvg) {
      onProgress?.(slideIndex + 1, totalSlides, `Rendering graphics for slide ${slideIndex + 1}...`, 'rendering-svg');

      const parsed = parseSlideHtml(html);
      if (parsed.svgRegion) {
        const region = parsed.svgRegion;
        const imgX = pxToInches(region.x, 'w');
        const imgY = pxToInches(region.y, 'h');
        const imgW = pxToInches(region.width, 'w');
        const imgH = pxToInches(region.height, 'h');

        if (region.layers && region.layers.length > 1) {
          const layerImages = await renderSession.renderSvgLayers(
            region.html,
            region.width,
            region.height,
            region.layers
          );
          for (const layer of layerImages) {
            const layerBase64 = layer.buffer.toString('base64');

            // Use tight bounds if available, otherwise use full SVG region
            if (layer.bounds) {
              // Position relative to SVG region origin + layer offset
              const layerX = pxToInches(region.x + layer.bounds.x, 'w');
              const layerY = pxToInches(region.y + layer.bounds.y, 'h');
              const layerW = pxToInches(layer.bounds.width, 'w');
              const layerH = pxToInches(layer.bounds.height, 'h');

              slide.addImage({
                data: `data:image/png;base64,${layerBase64}`,
                x: layerX,
                y: layerY,
                w: layerW,
                h: layerH,
              });
            } else {
              // Fallback: use full SVG region position
              slide.addImage({
                data: `data:image/png;base64,${layerBase64}`,
                x: imgX,
                y: imgY,
                w: imgW,
                h: imgH,
              });
            }
          }
        } else {
          const svgBuffer = await renderSession.renderSvg(
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
  } catch (parseError) {
    console.error(`Error parsing slide ${slideIndex + 1}, falling back to full render:`, parseError);

    onProgress?.(slideIndex + 1, totalSlides, `Fallback: rendering full slide ${slideIndex + 1}...`, 'fallback-render');

    // Fallback: render entire slide as image
    try {
      const imageBuffer = await renderSession.renderFullSlide(html);
      const base64Image = imageBuffer.toString('base64');

      slide.addImage({
        data: `data:image/png;base64,${base64Image}`,
        x: 0,
        y: 0,
        w: SLIDE_WIDTH,
        h: SLIDE_HEIGHT,
      });
    } catch (renderError) {
      console.error(`Failed to render slide ${slideIndex + 1}:`, renderError);
      slide.addText(`[Slide ${slideIndex + 1} - Rendering failed]`, {
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
}
