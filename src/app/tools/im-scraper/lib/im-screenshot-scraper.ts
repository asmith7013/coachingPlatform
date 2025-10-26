import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { IMCredentials, IM_CONSTANTS } from './types';

export interface ScreenshotResult {
  url: string;
  success: boolean;
  screenshotPath?: string;
  error?: string;
  scrapedAt: string;
}

export class IMScreenshotScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private credentials: IMCredentials | null = null;

  async initialize(debug = false): Promise<void> {
    this.browser = await chromium.launch({
      headless: !debug,
      slowMo: debug ? 1000 : 0,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...(debug && { devtools: true })
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 2,
      ignoreHTTPSErrors: true
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);

    if (debug) {
      this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      this.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    }
  }

  setCredentials(credentials: IMCredentials): void {
    this.credentials = credentials;
    console.log('📝 Credentials stored for per-page authentication');
  }

  // Remove interfering elements before screenshot
  private async removeInterferingElements(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('🗑️ Removing interfering elements...');

      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);

      const elementsToRemove = [
        '.userway_buttons_wrapper',
        '.userway_dark',
        '#userwayLstIcon',
        '#userwayAccessibilityIcon',
        '.uwaw-dictionary-tooltip',
        '.uw-sl',
        '.uw-sl__item',
        '#uw-skip-to-main',
        '#uw-enable-visibility',
        '#uw-open-accessibility',
        '[role="region"][aria-label*="Quick Accessibility"]',
        '[role="region"][aria-label*="Accessibility"]',
        '.im-c-header__bar',
        '.im-c-header__content',
        '.im-c-figure__modal-expand-button',
        '.im-c-touch-target[aria-label*="Expand"]',
        '.im-c-touch-target[aria-label*="expand"]',
        'button[aria-label*="Expand"]',
        'button[aria-label*="expand"]',
        '[class*="userway"]',
        '[id*="userway"]',
        '[class*="uw-"]',
        '[id*="uw-"]'
      ];

      let totalRemoved = 0;

      for (const selector of elementsToRemove) {
        try {
          const elements = this.page.locator(selector);
          const count = await elements.count();

          if (count > 0) {
            await elements.evaluateAll(elements => {
              elements.forEach(element => {
                if (element && element.parentNode) {
                  element.remove();
                }
              });
            });
            totalRemoved += count;
          }
        } catch (error) {
          // Ignore errors for elements that don't exist
        }
      }

      console.log(`🗑️ Removed ${totalRemoved} interfering elements`);
      await this.page.waitForTimeout(200);

    } catch (error) {
      console.error('❌ Error removing interfering elements:', error);
    }
  }

  // Authenticate on page using existing login flow
  private async authenticateOnPage(debug = false): Promise<boolean> {
    if (!this.page || !this.credentials) {
      return false;
    }

    try {
      if (debug) console.log('🔍 Looking for in-page login...');

      // Wait for the sign-in button in the problem-statement section
      const signInButton = await this.page.waitForSelector(
        'div[data-context="problem-statement"] a:has-text("Sign in")',
        { timeout: 5000 }
      ).catch(() => null);

      if (!signInButton) {
        if (debug) console.log('✅ No login required - content already accessible');
        return true;
      }

      if (debug) console.log('🔐 Found sign-in button, clicking...');
      await signInButton.click();

      // Wait for login modal/form to appear
      await this.page.waitForSelector(IM_CONSTANTS.SELECTORS.EMAIL_FIELD, { timeout: 10000 });
      if (debug) console.log('📋 Login form appeared');

      // Fill credentials
      await this.page.fill(IM_CONSTANTS.SELECTORS.EMAIL_FIELD, this.credentials.email);
      await this.page.fill(IM_CONSTANTS.SELECTORS.PASSWORD_FIELD, this.credentials.password);
      if (debug) console.log('✍️ Credentials entered');

      // Submit form
      await this.page.click(IM_CONSTANTS.SELECTORS.SUBMIT_BUTTON);
      if (debug) console.log('🚀 Form submitted');

      // Wait for the problem-statement content to load (no more sign-in message)
      await this.page.waitForFunction(() => {
        const problemStatement = document.querySelector('div[data-context="problem-statement"]');
        return problemStatement && !problemStatement.textContent?.includes('Sign in to access');
      }, { timeout: 15000 });

      if (debug) console.log('✅ Authentication successful - content loaded');
      return true;

    } catch (error) {
      console.error('❌ In-page authentication failed:', error);
      return false;
    }
  }

  // Screenshot the Student Task Statement div
  private async screenshotStudentTaskStatement(url: string, debug = false): Promise<string> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const timestamp = Date.now();
    const screenshotDir = 'public/screenshots';
    const urlParts = this.parseUrlParts(url);
    const lessonId = `${urlParts.grade}-${urlParts.unit}-${urlParts.section}-${urlParts.lesson}`;
    const screenshotName = `task-statement-${lessonId}-${timestamp}.png`;
    const screenshotPath = `${screenshotDir}/${screenshotName}`;

    try {
      // Find the problem-statement div
      const problemStatement = await this.page.locator('div[data-context="problem-statement"]').first();

      if (await problemStatement.count() === 0) {
        throw new Error('Problem statement div not found');
      }

      if (debug) console.log('✅ Found problem-statement div');

      // Remove interfering elements
      await this.removeInterferingElements();

      // Wait for MathJax to render
      await this.page.waitForTimeout(2000);

      // Add padding and take screenshot
      const originalStyles = await problemStatement.evaluate((el: HTMLElement) => ({
        padding: el.style.padding,
        backgroundColor: el.style.backgroundColor,
        boxSizing: el.style.boxSizing
      }));

      await problemStatement.evaluate((el: HTMLElement) => {
        el.style.padding = '20px';
        el.style.backgroundColor = '#ffffff';
        el.style.boxSizing = 'border-box';
      });

      await this.page.waitForTimeout(200);

      // Take screenshot
      await problemStatement.screenshot({
        path: screenshotPath,
        type: 'png'
      });

      // Restore original styles
      await problemStatement.evaluate((el: HTMLElement, styles: any) => {
        el.style.padding = styles.padding || '';
        el.style.backgroundColor = styles.backgroundColor || '';
        el.style.boxSizing = styles.boxSizing || '';
      }, originalStyles);

      console.log(`📸 Screenshot saved: ${screenshotName}`);
      return screenshotName;

    } catch (error) {
      console.error('❌ Error capturing screenshot:', error);
      throw error;
    }
  }

  // Screenshot a single page
  private async screenshotSinglePage(url: string, debug = false): Promise<ScreenshotResult> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      if (debug) console.log('🌐 Navigating to:', url);
      await this.page.goto(url, { waitUntil: 'networkidle' });

      // Authenticate on this specific page
      const authSuccess = await this.authenticateOnPage(debug);
      if (!authSuccess) {
        return {
          url,
          success: false,
          error: 'Failed to authenticate on page',
          scrapedAt: new Date().toISOString()
        };
      }

      // Wait for content to stabilize
      await this.page.waitForTimeout(2000);

      // Take screenshot
      const screenshotPath = await this.screenshotStudentTaskStatement(url, debug);

      return {
        url,
        success: true,
        screenshotPath,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Failed to screenshot page at ${url}:`, error);
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        scrapedAt: new Date().toISOString()
      };
    }
  }

  // Screenshot multiple pages
  async screenshotPages(
    urls: string[],
    delayBetweenRequests: number = 2000
  ): Promise<ScreenshotResult[]> {
    if (!this.page || !this.credentials) {
      throw new Error('Scraper not initialized or credentials not set');
    }

    const results: ScreenshotResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      const result = await this.screenshotSinglePage(url);
      results.push(result);

      // Add delay between requests (except for the last one)
      if (i < urls.length - 1) {
        await this.delay(delayBetweenRequests);
      }
    }

    return results;
  }

  private parseUrlParts(url: string): { grade: string; unit: string; section: string; lesson: string } {
    const urlMatch = url.match(/grade-(\d+)\/unit-(\d+)\/section-([a-z])\/lesson-(\d+)/);

    if (!urlMatch) {
      return { grade: 'unknown', unit: 'unknown', section: 'unknown', lesson: 'unknown' };
    }

    return {
      grade: urlMatch[1],
      unit: urlMatch[2],
      section: urlMatch[3],
      lesson: urlMatch[4]
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.credentials = null;
    }
  }
}
