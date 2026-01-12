import puppeteerCore, { Browser, Page } from 'puppeteer-core';
import { SvgLayer } from './types';
import { HTML_WIDTH, HTML_HEIGHT } from './constants';
import { RenderError, handlePuppeteerError } from '@error/handlers/puppeteer';

// Re-export for convenience
export { RenderError } from '@error/handlers/puppeteer';

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
  renderTableRegion: (html: string, width: number, height: number) => Promise<Buffer>;
  renderPrintPage: (html: string, pageIndex: number) => Promise<Buffer | null>;
  countPrintPages: (html: string) => Promise<number>;
  close: () => Promise<void>;
}

/**
 * Get browser launch options for both local and serverless environments
 */
async function getBrowserLaunchOptions() {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  console.log('[renderers] getBrowserLaunchOptions called, isServerless:', !!isServerless);

  if (isServerless) {
    // Use @sparticuz/chromium for serverless (Vercel, AWS Lambda)
    try {
      console.log('[renderers] Importing @sparticuz/chromium-min...');
      const chromium = await import('@sparticuz/chromium-min');
      console.log('[renderers] chromium-min imported, getting executablePath...');
      const executablePath = await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'
      );
      console.log('[renderers] Serverless chromium path:', executablePath);
      console.log('[renderers] chromium.default.args:', chromium.default.args);
      return {
        args: chromium.default.args,
        executablePath,
        headless: true,
      };
    } catch (error) {
      console.error('[renderers] FAILED to load serverless chromium');
      console.error('[renderers] Error:', error);
      throw new RenderError(
        handlePuppeteerError(error, 'chromium initialization'),
        'CHROMIUM_DOWNLOAD_FAILED',
        error
      );
    }
  } else {
    // Local development - use system Chrome
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
      '/usr/bin/google-chrome', // Linux
      '/usr/bin/chromium-browser', // Linux alternative
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
    ];

    // Find the first existing Chrome path
    const fs = await import('fs');
    const executablePath = possiblePaths.find((p) => fs.existsSync(p));

    if (!executablePath) {
      throw new RenderError(
        'Chrome not found. Please install Google Chrome for local development.',
        'CHROME_NOT_FOUND'
      );
    }

    console.log('[renderers] Local Chrome path:', executablePath);
    return {
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    };
  }
}

/**
 * Create a persistent render session for efficient multi-slide export
 * Call close() when done to properly clean up Chromium
 */
export async function createRenderSession(): Promise<RenderSession> {
  console.log('[renderers] createRenderSession called');
  let browser: Browser;
  let page: Page;

  try {
    console.log('[renderers] Getting browser launch options...');
    const launchOptions = await getBrowserLaunchOptions();
    console.log('[renderers] Launch options obtained, launching browser...');
    browser = await puppeteerCore.launch(launchOptions);
    console.log('[renderers] Browser launched successfully');
  } catch (error) {
    // If already a RenderError, rethrow it
    if (error instanceof RenderError) {
      console.error('[renderers] RenderError during browser launch:', error.message);
      throw error;
    }
    console.error('[renderers] Failed to launch browser:', error);
    throw new RenderError(
      handlePuppeteerError(error, 'browser launch'),
      'CHROME_NOT_FOUND',
      error
    );
  }

  try {
    console.log('[renderers] Creating new page...');
    page = await browser.newPage();
    console.log('[renderers] New page created');
  } catch (error) {
    console.error('[renderers] Failed to create page:', error);
    await browser.close().catch(() => {});
    throw new RenderError(
      handlePuppeteerError(error, 'page creation'),
      'BROWSER_CRASHED',
      error
    );
  }

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

    /**
     * Render a table region (right-column containing table) as an image
     * Tables don't convert well to native PPTX, so render as PNG
     * Includes all CSS classes from slide templates for proper rendering
     */
    async renderTableRegion(html: string, width: number, height: number): Promise<Buffer> {
      await page.setViewport({ width, height, deviceScaleFactor: 2 });

      // Include template CSS classes used in slide HTML
      // IMPORTANT: Body should NOT override content styles - content has its own styling
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            /* Template CSS classes */
            .row { display: flex; flex-direction: row; }
            .col { display: flex; flex-direction: column; }
            .fit { flex: 0 0 auto; }
            .fill-width { flex: 1 1 auto; width: 100%; }
            .fill-height { flex: 1 1 auto; }
            .center { display: flex; align-items: center; justify-content: center; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .gap-sm { gap: 8px; }
            .gap-md { gap: 12px; }
            .gap-lg { gap: 20px; }
            .rounded { border-radius: 8px; }

            /* Body provides dimensions but doesn't override content styling */
            body {
              width: ${width}px;
              height: ${height}px;
              font-family: Arial, sans-serif;
              background: transparent;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }

            /* Wrapper fills the body and contains the content */
            .render-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }

            table {
              border-collapse: collapse;
            }
          </style>
        </head>
        <body><div class="render-wrapper">${html}</div></body>
        </html>
      `;

      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height },
      });

      return screenshot as Buffer;
    },

    /**
     * Count how many .print-page elements are in the HTML
     */
    async countPrintPages(html: string): Promise<number> {
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const count = await page.evaluate(() => {
        return document.querySelectorAll('.print-page').length;
      });
      return count;
    },

    /**
     * Render a specific print-page from a printable slide as a landscape screenshot
     * for PPTX export (960x540 aspect ratio)
     */
    async renderPrintPage(html: string, pageIndex: number): Promise<Buffer | null> {
      // Set viewport to capture the print page at a good resolution
      // Print pages are 8.5in x 11in (portrait), but we render them to fit 16:9 slides
      const pageWidth = 816; // 8.5 inches at 96 DPI
      const pageHeight = 1056; // 11 inches at 96 DPI

      await page.setViewport({
        width: pageWidth,
        height: pageHeight,
        deviceScaleFactor: 2,
      });

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Get the bounding rect of the specific print-page
      const bounds = await page.evaluate((idx: number) => {
        const pages = document.querySelectorAll('.print-page');
        const targetPage = pages[idx];
        if (!targetPage) return null;

        // Scroll to make sure the page is visible
        targetPage.scrollIntoView();

        const rect = targetPage.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }, pageIndex);

      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        return null;
      }

      // Capture the specific print-page
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: Math.max(0, bounds.x),
          y: Math.max(0, bounds.y),
          width: bounds.width,
          height: bounds.height,
        },
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
