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

import type { Browser as PlaywrightBrowser } from "playwright";

/**
 * Gets a configured Playwright browser instance.
 * Playwright works well on Vercel without special configuration.
 */
export async function getPlaywrightBrowser(): Promise<PlaywrightBrowser> {
  const playwright = await import("playwright");

  return await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

// ============================================================================
// PUPPETEER CONFIGURATION (For Reference / Future Use)
// ============================================================================

/*
 * PUPPETEER FUNCTIONS - Commented out until puppeteer is needed
 *
 * To use Puppeteer instead of Playwright:
 * 1. Install dependencies: npm install puppeteer puppeteer-core @sparticuz/chromium-min
 * 2. Uncomment the functions below
 * 3. Import and use getPuppeteerBrowser() instead of getPlaywrightBrowser()
 */

/*
import type { Browser as PuppeteerBrowser, Page } from 'puppeteer-core';

export async function getPuppeteerBrowser(): Promise<PuppeteerBrowser> {
  const isVercel = !!process.env.VERCEL;

  if (isVercel) {
    const puppeteerCore = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium-min');

    return await puppeteerCore.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'
      ),
      headless: true,
    });
  } else {
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

export async function closePuppeteerBrowser(browser: PuppeteerBrowser | null): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

export async function createPuppeteerPage(browser: PuppeteerBrowser): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  return page;
}
*/

/**
 * EXAMPLE USAGE
 *
 * Playwright (current approach):
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
 *
 * Puppeteer (when uncommented above):
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
 */
