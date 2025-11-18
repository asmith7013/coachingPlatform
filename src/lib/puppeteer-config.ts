/**
 * Browser Configuration for Local and Vercel Environments
 *
 * This module provides unified browser launching that works both locally
 * and on Vercel's serverless platform.
 *
 * Note: This project uses Playwright for web scraping. For Puppeteer usage,
 * see the commented section below.
 */

// ============================================================================
// PLAYWRIGHT CONFIGURATION (Currently Used)
// ============================================================================

import type { Browser as PlaywrightBrowser } from 'playwright';

/**
 * Gets a configured Playwright browser instance.
 * Playwright works well on Vercel without special configuration.
 */
export async function getPlaywrightBrowser(): Promise<PlaywrightBrowser> {
  const playwright = await import('playwright');

  return await playwright.chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

// ============================================================================
// PUPPETEER CONFIGURATION (For Reference / Future Use)
// ============================================================================

import type { Browser as PuppeteerBrowser, Page } from 'puppeteer';

/**
 * Gets a configured Puppeteer browser instance.
 * Automatically detects environment (local vs Vercel) and uses appropriate configuration.
 *
 * For Puppeteer on Vercel, you need:
 * - puppeteer-core (lightweight version)
 * - @sparticuz/chromium-min (minimal Chromium for serverless)
 */
export async function getPuppeteerBrowser(): Promise<PuppeteerBrowser> {
  const isVercel = !!process.env.VERCEL;

  if (isVercel) {
    // Vercel/Production environment - use puppeteer-core with minimal Chromium
    const puppeteerCore = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium-min');

    return await puppeteerCore.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      ),
      headless: chromium.default.headless,
    });
  } else {
    // Local development - use full puppeteer
    const puppeteer = await import('puppeteer');

    return await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
}

/**
 * Safely closes a browser instance with error handling
 */
export async function closePuppeteerBrowser(browser: PuppeteerBrowser | null): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

/**
 * Creates a new page with common configurations
 */
export async function createPuppeteerPage(browser: PuppeteerBrowser): Promise<Page> {
  const page = await browser.newPage();

  // Set reasonable defaults
  await page.setViewport({ width: 1920, height: 1080 });

  // Set a user agent to avoid detection
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  return page;
}

/**
 * Example usage with Puppeteer:
 *
 * ```typescript
 * import { getPuppeteerBrowser, createPuppeteerPage, closePuppeteerBrowser } from '@/lib/puppeteer-config';
 *
 * const browser = await getPuppeteerBrowser();
 * try {
 *   const page = await createPuppeteerPage(browser);
 *   await page.goto('https://example.com');
 *   // ... do your scraping
 * } finally {
 *   await closePuppeteerBrowser(browser);
 * }
 * ```
 *
 * Example usage with Playwright (current approach):
 *
 * ```typescript
 * import { getPlaywrightBrowser } from '@/lib/puppeteer-config';
 *
 * const browser = await getPlaywrightBrowser();
 * try {
 *   const context = await browser.newContext();
 *   const page = await context.newPage();
 *   await page.goto('https://example.com');
 *   // ... do your scraping
 * } finally {
 *   await browser.close();
 * }
 * ```
 */
