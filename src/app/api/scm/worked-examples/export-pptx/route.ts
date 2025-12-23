import { NextRequest, NextResponse } from 'next/server';
import pptxgen from 'pptxgenjs';
import puppeteer from 'puppeteer';

// Check if HTML contains SVG or complex visual content
function containsVisualContent(html: string): boolean {
  return /<svg[\s>]/i.test(html) || /data-svg-region/i.test(html) || /<canvas/i.test(html);
}

// Simple HTML to text extraction for text-only slides
function extractTextFromHtml(html: string): { title: string; body: string[] } {
  // Extract title from h1 tags (single line match)
  const titleMatch = html.match(/<h1[^>]*>([^<]*(?:<[^/h][^>]*>[^<]*)*)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

  // Extract paragraphs and list items
  const body: string[] = [];

  // Get paragraphs
  const pRegex = /<p[^>]*>([^<]*(?:<(?!\/p>)[^>]*>[^<]*)*)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(html)) !== null) {
    const text = pMatch[1].replace(/<[^>]*>/g, '').trim();
    if (text && text.length > 0) {
      body.push(text);
    }
  }

  // Get list items
  const liRegex = /<li[^>]*>([^<]*(?:<(?!\/li>)[^>]*>[^<]*)*)<\/li>/gi;
  let liMatch;
  while ((liMatch = liRegex.exec(html)) !== null) {
    const text = liMatch[1].replace(/<[^>]*>/g, '').trim();
    if (text && text.length > 0) {
      body.push('• ' + text);
    }
  }

  // Get h2/h3 headings
  const headingRegex = /<h[23][^>]*>([^<]*(?:<(?!\/h[23]>)[^>]*>[^<]*)*)<\/h[23]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    const text = headingMatch[1].replace(/<[^>]*>/g, '').trim();
    if (text && text.length > 0) {
      body.unshift(text);
    }
  }

  return { title, body };
}

// Render HTML slide to image using puppeteer
async function renderSlideToImage(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport to match PPTX slide dimensions (960x540 for 16:9)
    await page.setViewport({ width: 960, height: 540, deviceScaleFactor: 2 });

    // Wrap HTML in a full document if it doesn't have body
    const fullHtml = html.includes('<body') ? html : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 960px;
            height: 540px;
            overflow: hidden;
            font-family: Arial, sans-serif;
          }
          .row { display: flex; flex-direction: row; }
          .col { display: flex; flex-direction: column; }
          .fit { flex: 0 0 auto; }
          .fill-height { flex: 1 1 auto; }
          .fill-width { flex: 1 1 auto; }
          .center { display: flex; justify-content: center; align-items: center; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .gap-sm { gap: 8px; }
          .gap-md { gap: 12px; }
          .gap-lg { gap: 20px; }
          .bg-surface { background: #ffffff; }
          .bg-muted { background: #f5f5f5; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Wait a bit for any fonts/SVGs to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 960, height: 540 },
    });

    return screenshot as Buffer;
  } finally {
    await browser.close();
  }
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
      const hasVisuals = containsVisualContent(html);

      if (hasVisuals) {
        // For slides with SVGs/visuals, render as image
        try {
          const imageBuffer = await renderSlideToImage(html);
          const base64Image = imageBuffer.toString('base64');

          slide.addImage({
            data: `data:image/png;base64,${base64Image}`,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625, // 16:9 aspect ratio
          });
        } catch (renderError) {
          console.error(`Error rendering slide ${i + 1}:`, renderError);
          // Fallback to text extraction
          slide.background = { color: 'FFFFFF' };
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
      } else {
        // For text-only slides, extract and add content
        const { title: slideTitle, body } = extractTextFromHtml(html);

        slide.background = { color: 'FFFFFF' };

        if (slideTitle) {
          slide.addText(slideTitle, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.8,
            fontSize: 28,
            fontFace: 'Arial',
            bold: true,
            color: '1D1D1D',
          });
        }

        if (body.length > 0) {
          const yStart = slideTitle ? 1.2 : 0.5;
          const bodyText = body.join('\n');

          slide.addText(bodyText, {
            x: 0.5,
            y: yStart,
            w: 9,
            h: 4,
            fontSize: 14,
            fontFace: 'Arial',
            color: '1D1D1D',
            valign: 'top',
            breakLine: true,
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
