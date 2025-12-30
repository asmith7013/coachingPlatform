import puppeteer, { Browser, Page } from 'puppeteer';
import { SvgLayer } from './types';
import { HTML_WIDTH, HTML_HEIGHT } from './constants';

/**
 * Browser session for rendering multiple slides efficiently
 * Keeps Chromium open for the entire export process
 */
export interface RenderSession {
  browser: Browser;
  page: Page;
  renderSvg: (svgHtml: string, width: number, height: number) => Promise<Buffer>;
  renderSvgLayers: (svgHtml: string, width: number, height: number, layers: string[]) => Promise<SvgLayer[]>;
  renderFullSlide: (html: string) => Promise<Buffer>;
  close: () => Promise<void>;
}

/**
 * Create a persistent render session for efficient multi-slide export
 * Call close() when done to properly clean up Chromium
 */
export async function createRenderSession(): Promise<RenderSession> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  return {
    browser,
    page,

    async renderSvg(svgHtml: string, width: number, height: number): Promise<Buffer> {
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

      // Use domcontentloaded - faster than networkidle0 for inline content
      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height },
        omitBackground: true,
      });

      return screenshot as Buffer;
    },

    async renderSvgLayers(svgHtml: string, width: number, height: number, layers: string[]): Promise<SvgLayer[]> {
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

      // Use domcontentloaded - faster than networkidle0 for inline content
      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Get SVG position for calculating relative bounds
      const svgRect = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        if (!svg) return null;
        const rect = svg.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });

      const results: SvgLayer[] = [];
      const PADDING = 10; // padding around cropped content (prevents cut-off)

      // Capture each layer separately with tight cropping
      for (const layerName of layers) {
        // Hide all layers except the current one
        await page.evaluate(
          (currentLayer: string, allLayers: string[]) => {
            allLayers.forEach((layer) => {
              const elements = document.querySelectorAll(
                `[data-pptx-layer="${layer}"]`
              );
              elements.forEach((el) => {
                (el as HTMLElement).style.visibility =
                  layer === currentLayer ? 'visible' : 'hidden';
              });
            });
          },
          layerName,
          layers
        );

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Get bounding box of visible elements in this layer
        const layerBounds = await page.evaluate((layer: string) => {
          const elements = document.querySelectorAll(`[data-pptx-layer="${layer}"]`);
          if (elements.length === 0) return null;

          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

          elements.forEach((el) => {
            // Get the bounding box of all children within the layer group
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              minX = Math.min(minX, rect.x);
              minY = Math.min(minY, rect.y);
              maxX = Math.max(maxX, rect.x + rect.width);
              maxY = Math.max(maxY, rect.y + rect.height);
            }

            // Also check child elements for more accurate bounds
            el.querySelectorAll('*').forEach((child) => {
              const childRect = child.getBoundingClientRect();
              if (childRect.width > 0 && childRect.height > 0) {
                minX = Math.min(minX, childRect.x);
                minY = Math.min(minY, childRect.y);
                maxX = Math.max(maxX, childRect.x + childRect.width);
                maxY = Math.max(maxY, childRect.y + childRect.height);
              }
            });
          });

          if (minX === Infinity) return null;
          return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }, layerName);

        if (layerBounds && layerBounds.width > 0 && layerBounds.height > 0) {
          // Apply padding and clamp to viewport
          const clipX = Math.max(0, Math.floor(layerBounds.x - PADDING));
          const clipY = Math.max(0, Math.floor(layerBounds.y - PADDING));
          const clipW = Math.min(width - clipX, Math.ceil(layerBounds.width + PADDING * 2));
          const clipH = Math.min(height - clipY, Math.ceil(layerBounds.height + PADDING * 2));

          const screenshot = await page.screenshot({
            type: 'png',
            clip: { x: clipX, y: clipY, width: clipW, height: clipH },
            omitBackground: true,
          });

          // Calculate bounds relative to SVG origin
          const relativeX = svgRect ? clipX - svgRect.x : clipX;
          const relativeY = svgRect ? clipY - svgRect.y : clipY;

          results.push({
            name: layerName,
            buffer: screenshot as Buffer,
            bounds: {
              x: Math.max(0, relativeX),
              y: Math.max(0, relativeY),
              width: clipW,
              height: clipH,
            },
          });
        } else {
          // Fallback: full screenshot if bounds detection fails
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
      }

      // Reset all layers to visible
      await page.evaluate((allLayers: string[]) => {
        allLayers.forEach((layer) => {
          const elements = document.querySelectorAll(
            `[data-pptx-layer="${layer}"]`
          );
          elements.forEach((el) => {
            (el as HTMLElement).style.visibility = 'visible';
          });
        });
      }, layers);

      return results;
    },

    async renderFullSlide(html: string): Promise<Buffer> {
      await page.setViewport({
        width: HTML_WIDTH,
        height: HTML_HEIGHT,
        deviceScaleFactor: 2,
      });

      const fullHtml = html.includes('<body')
        ? html
        : `
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

      // Use domcontentloaded - faster than networkidle0 for inline content
      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: HTML_WIDTH, height: HTML_HEIGHT },
      });

      return screenshot as Buffer;
    },

    async close(): Promise<void> {
      await browser.close();
    },
  };
}

// Legacy standalone functions for backward compatibility
// These launch/close browser for each call - use RenderSession for efficiency

/**
 * @deprecated Use createRenderSession() for multi-slide exports
 */
export async function renderSvgToImage(
  svgHtml: string,
  width: number,
  height: number
): Promise<Buffer> {
  const session = await createRenderSession();
  try {
    return await session.renderSvg(svgHtml, width, height);
  } finally {
    await session.close();
  }
}

/**
 * @deprecated Use createRenderSession() for multi-slide exports
 */
export async function renderSvgLayers(
  svgHtml: string,
  width: number,
  height: number,
  layers: string[]
): Promise<SvgLayer[]> {
  const session = await createRenderSession();
  try {
    return await session.renderSvgLayers(svgHtml, width, height, layers);
  } finally {
    await session.close();
  }
}

/**
 * @deprecated Use createRenderSession() for multi-slide exports
 */
export async function renderFullSlideToImage(html: string): Promise<Buffer> {
  const session = await createRenderSession();
  try {
    return await session.renderFullSlide(html);
  } finally {
    await session.close();
  }
}
