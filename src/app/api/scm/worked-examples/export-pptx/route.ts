import { NextRequest, NextResponse } from 'next/server';
import pptxgen from 'pptxgenjs';
import puppeteer from 'puppeteer';

// PPTX dimensions in inches (16:9)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625;

// HTML slide dimensions in pixels
const HTML_WIDTH = 960;
const HTML_HEIGHT = 540;

// Convert pixels to inches
const pxToInches = (px: number, dimension: 'w' | 'h') => {
  return dimension === 'w' ? (px / HTML_WIDTH) * SLIDE_WIDTH : (px / HTML_HEIGHT) * SLIDE_HEIGHT;
};

interface SvgLayer {
  name: string;
  buffer: Buffer;
}

interface ParsedSlide {
  title?: string;
  subtitle?: string;
  stepBadge?: string;
  svgRegion?: {
    html: string;
    x: number;
    y: number;
    width: number;
    height: number;
    layers?: string[]; // Layer names from data-pptx-layer attributes
  };
  cfuBox?: { text: string };
  answerBox?: { text: string };
  bodyContent: string[];
  footnote?: string;
}

/**
 * Parse HTML slide structure to extract components
 */
function parseSlideHtml(html: string): ParsedSlide {
  const result: ParsedSlide = { bodyContent: [] };

  // Extract title from h1
  const titleMatch = html.match(/<h1[^>]*>([^<]*(?:<[^/h][^>]*>[^<]*)*)<\/h1>/i);
  if (titleMatch) {
    result.title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // Extract step badge (div with STEP text)
  const stepBadgeMatch = html.match(/STEP\s*\d+[^<]*/i);
  if (stepBadgeMatch) {
    result.stepBadge = stepBadgeMatch[0].trim();
  }

  // Extract subtitle (usually first p after h1 or instruction text)
  const subtitleMatch = html.match(/<p[^>]*style="[^"]*margin-top:\s*8px[^"]*"[^>]*>([^<]+)<\/p>/i);
  if (subtitleMatch) {
    result.subtitle = subtitleMatch[1].trim();
  }

  // Check for SVG content and extract region coordinates from data attributes
  const svgMatch = html.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    // Extract layer names from data-pptx-layer attributes
    const layerMatches = svgMatch[0].matchAll(/data-pptx-layer="([^"]+)"/g);
    const layers: string[] = [];
    for (const match of layerMatches) {
      if (!layers.includes(match[1])) {
        layers.push(match[1]);
      }
    }

    // Try to find data-pptx-region container with position attributes (new format)
    // Template format: data-pptx-region="svg-container" data-pptx-x="356" data-pptx-y="130" data-pptx-w="584" data-pptx-h="392"
    const pptxRegionMatch = html.match(/data-pptx-region="svg-container"[^>]*data-pptx-x="(\d+)"[^>]*data-pptx-y="(\d+)"[^>]*data-pptx-w="(\d+)"[^>]*data-pptx-h="(\d+)"/i);

    // Also check legacy format
    const legacyRegionMatch = html.match(/data-svg-region="true"[^>]*data-region-x="(\d+)"[^>]*data-region-y="(\d+)"[^>]*data-region-width="(\d+)"[^>]*data-region-height="(\d+)"/i);

    const regionMatch = pptxRegionMatch || legacyRegionMatch;

    if (regionMatch) {
      // Use exact coordinates from template data attributes
      result.svgRegion = {
        html: svgMatch[0],
        x: parseInt(regionMatch[1], 10),
        y: parseInt(regionMatch[2], 10),
        width: parseInt(regionMatch[3], 10),
        height: parseInt(regionMatch[4], 10),
        layers: layers.length > 0 ? layers : undefined,
      };
    } else {
      // Check for two-column layout (SVG typically on right side)
      const isTwoColumn = html.includes('width: 60%') || html.includes('width: 65%') || html.includes('data-visual-region');

      if (isTwoColumn) {
        // Two-column layout: SVG on right side (60% width starting at ~38% of slide)
        result.svgRegion = {
          html: svgMatch[0],
          x: 368,  // ~38% of 960px
          y: 90,   // Below title zone
          width: 560, // ~58% of 960px
          height: 380, // Content zone height
          layers: layers.length > 0 ? layers : undefined,
        };
      } else {
        // Single-column or unknown layout: center the SVG
        result.svgRegion = {
          html: svgMatch[0],
          x: 180,  // Centered with padding
          y: 120,  // Below title
          width: 600,
          height: 360,
          layers: layers.length > 0 ? layers : undefined,
        };
      }
    }
  }

  // Extract CFU box content
  const cfuMatch = html.match(/CHECK FOR UNDERSTANDING<\/p>\s*<p[^>]*>([^<]+)<\/p>/i);
  if (cfuMatch) {
    result.cfuBox = { text: cfuMatch[1].trim() };
  }

  // Extract Answer box content
  const answerMatch = html.match(/ANSWER<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/i);
  if (answerMatch) {
    result.answerBox = { text: answerMatch[1].replace(/<[^>]*>/g, '').trim() };
  }

  // Extract footnote (top right label)
  const footnoteMatch = html.match(/style="[^"]*position:\s*absolute[^"]*top:\s*8px[^"]*right:\s*20px[^"]*"[^>]*>([^<]+)<\/p>/i);
  if (footnoteMatch) {
    result.footnote = footnoteMatch[1].trim();
  }

  // Extract other body paragraphs
  const pRegex = /<p[^>]*>([^<]*(?:<(?!\/p>)[^>]*>[^<]*)*)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(html)) !== null) {
    const text = pMatch[1].replace(/<[^>]*>/g, '').trim();
    // Skip if it's already captured as title, subtitle, CFU, answer, or footnote
    if (text && text.length > 0 &&
        text !== result.title &&
        text !== result.subtitle &&
        text !== result.cfuBox?.text &&
        text !== result.answerBox?.text &&
        text !== result.footnote &&
        !text.includes('CHECK FOR UNDERSTANDING') &&
        !text.includes('ANSWER') &&
        !text.startsWith('STEP')) {
      result.bodyContent.push(text);
    }
  }

  return result;
}

/**
 * Render just the SVG portion to an image
 */
async function renderSvgToImage(svgHtml: string, width: number, height: number): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${width}px;
            height: ${height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
          }
          svg {
            max-width: 100%;
            max-height: 100%;
          }
        </style>
      </head>
      <body>${svgHtml}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 100));

    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width, height },
      omitBackground: true,
    });

    return screenshot as Buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Render SVG layers as separate transparent PNGs
 * Each layer is captured by hiding all other layers
 * All layers share the same dimensions for perfect alignment
 */
async function renderSvgLayers(
  svgHtml: string,
  width: number,
  height: number,
  layers: string[]
): Promise<SvgLayer[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results: SvgLayer[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${width}px;
            height: ${height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
          }
          svg {
            max-width: 100%;
            max-height: 100%;
          }
        </style>
      </head>
      <body>${svgHtml}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture each layer separately
    for (const layerName of layers) {
      // Hide all layers except the current one
      await page.evaluate((currentLayer: string, allLayers: string[]) => {
        allLayers.forEach(layer => {
          const elements = document.querySelectorAll(`[data-pptx-layer="${layer}"]`);
          elements.forEach(el => {
            (el as HTMLElement).style.visibility = layer === currentLayer ? 'visible' : 'hidden';
          });
        });
      }, layerName, layers);

      // Small delay for visibility changes to take effect
      await new Promise(resolve => setTimeout(resolve, 50));

      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height },
        omitBackground: true,
      });

      results.push({
        name: layerName,
        buffer: screenshot as Buffer,
      });
    }

    // Reset all layers to visible
    await page.evaluate((allLayers: string[]) => {
      allLayers.forEach(layer => {
        const elements = document.querySelectorAll(`[data-pptx-layer="${layer}"]`);
        elements.forEach(el => {
          (el as HTMLElement).style.visibility = 'visible';
        });
      });
    }, layers);

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Render the entire slide as fallback
 */
async function renderFullSlideToImage(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: HTML_WIDTH, height: HTML_HEIGHT, deviceScaleFactor: 2 });

    const fullHtml = html.includes('<body') ? html : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${HTML_WIDTH}px;
            height: ${HTML_HEIGHT}px;
            overflow: hidden;
            font-family: Arial, sans-serif;
          }
          .row { display: flex; flex-direction: row; }
          .col { display: flex; flex-direction: column; }
          .fit { flex: 0 0 auto; }
          .fill-height { flex: 1 1 auto; }
          .fill-width { flex: 1 1 auto; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 100));

    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: HTML_WIDTH, height: HTML_HEIGHT },
    });

    return screenshot as Buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Add a colored box (CFU or Answer) to the slide
 */
function addInfoBox(
  slide: pptxgen.Slide,
  type: 'cfu' | 'answer',
  text: string
) {
  const bgColor = type === 'cfu' ? 'FEF3C7' : 'DCFCE7';
  const borderColor = type === 'cfu' ? 'F59E0B' : '22C55E';
  const labelColor = type === 'cfu' ? '92400E' : '166534';
  const label = type === 'cfu' ? 'CHECK FOR UNDERSTANDING' : 'ANSWER';

  // Position in top-right corner (matching HTML absolute positioning)
  const boxX = 6.8; // Right side
  const boxY = 0.4;
  const boxW = 2.9;

  // Add background shape (no line - use fill only)
  slide.addShape('rect', {
    x: boxX,
    y: boxY,
    w: boxW,
    h: 1.2,
    fill: { color: bgColor },
  });

  // Add left border accent
  slide.addShape('rect', {
    x: boxX,
    y: boxY,
    w: 0.05,
    h: 1.2,
    fill: { color: borderColor },
  });

  // Add label
  slide.addText(label, {
    x: boxX + 0.15,
    y: boxY + 0.1,
    w: boxW - 0.3,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: labelColor,
  });

  // Add content text
  slide.addText(text, {
    x: boxX + 0.15,
    y: boxY + 0.35,
    w: boxW - 0.3,
    h: 0.8,
    fontSize: 11,
    fontFace: 'Arial',
    color: '1D1D1D',
    valign: 'top',
  });
}

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

      // Parse the slide structure
      const parsed = parseSlideHtml(html);
      const hasSvg = /<svg[\s>]/i.test(html);

      try {
        // Add step badge if present (top left corner)
        if (parsed.stepBadge) {
          slide.addShape('roundRect', {
            x: 0.2,
            y: 0.15,
            w: 1.8,
            h: 0.35,
            fill: { color: '1791E8' },
            rectRadius: 0.15,
          });
          slide.addText(parsed.stepBadge, {
            x: 0.2,
            y: 0.15,
            w: 1.8,
            h: 0.35,
            fontSize: 12,
            fontFace: 'Arial',
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle',
          });
        }

        // Add title
        if (parsed.title) {
          slide.addText(parsed.title, {
            x: parsed.stepBadge ? 2.1 : 0.2,
            y: 0.15,
            w: parsed.stepBadge ? 7.5 : 9.5,
            h: 0.5,
            fontSize: 24,
            fontFace: 'Arial',
            bold: true,
            color: '1791E8',
          });
        }

        // Add subtitle/instruction
        if (parsed.subtitle) {
          slide.addText(parsed.subtitle, {
            x: 0.2,
            y: 0.7,
            w: 9.5,
            h: 0.4,
            fontSize: 14,
            fontFace: 'Arial',
            color: '1D1D1D',
          });
        }

        // Add footnote (top right)
        if (parsed.footnote) {
          slide.addText(parsed.footnote, {
            x: 7.5,
            y: 0.08,
            w: 2.3,
            h: 0.25,
            fontSize: 9,
            fontFace: 'Arial',
            color: '666666',
            align: 'right',
          });
        }

        // Handle SVG content - render as image and position using template coordinates
        if (hasSvg && parsed.svgRegion) {
          const region = parsed.svgRegion;

          // Convert position/dimensions to inches (used for all images)
          const imgX = pxToInches(region.x, 'w');
          const imgY = pxToInches(region.y, 'h');
          const imgW = pxToInches(region.width, 'w');
          const imgH = pxToInches(region.height, 'h');

          // Check if SVG has multiple layers for separate export
          if (region.layers && region.layers.length > 1) {
            // Multi-layer capture: each layer becomes a separate transparent PNG
            // All layers placed at same position for perfect alignment
            const layerImages = await renderSvgLayers(
              region.html,
              region.width,
              region.height,
              region.layers
            );

            // Add each layer as a separate image (in order: base-graph, data, annotation)
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
            // Single-layer fallback: render entire SVG as one image
            const svgBuffer = await renderSvgToImage(region.html, region.width, region.height);
            const svgBase64 = svgBuffer.toString('base64');

            slide.addImage({
              data: `data:image/png;base64,${svgBase64}`,
              x: imgX,
              y: imgY,
              w: imgW,
              h: imgH,
            });
          }

          // Determine if this is a two-column layout (SVG on right = body on left)
          // Check if SVG CENTER is on the right half of the slide
          const svgCenterX = region.x + region.width / 2;
          const svgOnRight = svgCenterX > HTML_WIDTH / 2;

          if (parsed.bodyContent.length > 0) {
            const bodyText = parsed.bodyContent.join('\n\n');

            if (svgOnRight) {
              // Body content on left side of SVG
              const leftWidth = Math.max(0.5, pxToInches(region.x - 40, 'w'));
              slide.addText(bodyText, {
                x: 0.2,
                y: pxToInches(region.y, 'h'),
                w: leftWidth,
                h: Math.max(0.5, pxToInches(region.height, 'h')),
                fontSize: 13,
                fontFace: 'Arial',
                color: '1D1D1D',
                valign: 'top',
              });
            } else {
              // Body content on right side or below SVG
              const rightX = pxToInches(region.x + region.width + 20, 'w');
              const rightWidth = Math.max(0.5, SLIDE_WIDTH - rightX - 0.2);
              if (rightWidth > 0.5) {
                slide.addText(bodyText, {
                  x: rightX,
                  y: pxToInches(region.y, 'h'),
                  w: rightWidth,
                  h: Math.max(0.5, pxToInches(region.height, 'h')),
                  fontSize: 13,
                  fontFace: 'Arial',
                  color: '1D1D1D',
                  valign: 'top',
                });
              }
            }
          }
        } else {
          // No SVG - add body content in main area
          if (parsed.bodyContent.length > 0) {
            const bodyText = parsed.bodyContent.join('\n\n');
            slide.addText(bodyText, {
              x: 0.3,
              y: 1.1,
              w: 9.4,
              h: 4,
              fontSize: 14,
              fontFace: 'Arial',
              color: '1D1D1D',
              valign: 'top',
            });
          }
        }

        // Add CFU box if present
        if (parsed.cfuBox) {
          addInfoBox(slide, 'cfu', parsed.cfuBox.text);
        }

        // Add Answer box if present
        if (parsed.answerBox) {
          addInfoBox(slide, 'answer', parsed.answerBox.text);
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PPTX' },
      { status: 500 }
    );
  }
}
