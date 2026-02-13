import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { put } from '@vercel/blob';
import { StateTestQuestion, ScraperConfig, SELECTORS } from './types';

export class StateTestScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.headless ? 0 : 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // Use a more standard viewport width - 1920 can cause layout issues
      // Keep height tall to minimize scrolling, and high DPI for crisp screenshots
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 4,
      ignoreHTTPSErrors: true,
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);

    console.log('✅ Browser initialized');
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('🔐 Starting login process...');

    // Navigate to login page
    await this.page.goto('https://www.problem-attic.com/login', {
      waitUntil: 'networkidle',
    });

    // Wait for email input
    await this.page.waitForSelector(SELECTORS.EMAIL_INPUT);
    console.log('📧 Filling email...');

    // Fill email
    await this.page.fill(SELECTORS.EMAIL_INPUT, this.config.email);

    // Click Next button - use more flexible selector
    console.log('🔘 Clicking Next button...');
    await this.page.click('input[type="submit"].btn-success, button[type="submit"]:has-text("Next")');
    console.log('⏳ Waiting for password field...');

    // Wait for password field (multi-step login)
    await this.page.waitForSelector(SELECTORS.PASSWORD_INPUT, { timeout: 10000 });

    // Fill password
    console.log('🔑 Filling password...');
    await this.page.fill(SELECTORS.PASSWORD_INPUT, this.config.password);

    // Submit login form - click any submit button
    console.log('🔘 Submitting login form...');
    await this.page.click('input[type="submit"].btn-success, button[type="submit"]');

    // Wait for redirect to account page
    await this.page.waitForURL('**/account/**', { timeout: 15000 });
    console.log('✅ Login successful');
  }

  async scrapePage(
    url: string,
    grade: string,
    examYear: string,
    examTitle: string
  ): Promise<StateTestQuestion[]> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log(`📄 Scraping page: ${url} (Grade ${grade})`);
    console.log(`📋 Exam: ${examTitle}, Year: ${examYear}`);

    // Navigate to target URL
    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Wait for questions to load
    await this.page.waitForSelector(SELECTORS.QUESTION_CONTAINER, { timeout: 15000 });
    console.log('✅ Page loaded, questions found');

    // Find all question containers
    const containers = this.page.locator(SELECTORS.QUESTION_CONTAINER);
    const count = await containers.count();
    console.log(`📊 Found ${count} questions`);

    const questions: StateTestQuestion[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const container = containers.nth(i);

        // Extract question ID from id attribute
        const id = await container.getAttribute('id');
        const questionId = id?.replace('problem-link-', '') || '';

        // Extract standard (needs trim - has leading whitespace)
        const standardEl = container.locator(SELECTORS.STANDARD_LABEL);
        const standard = (await standardEl.textContent())?.trim() || '';

        const img = container.locator(SELECTORS.QUESTION_IMAGE);

        console.log(`  📷 Question ${i + 1}/${count}: ${questionId} - ${standard}`);

        // Wait for image to fully load, then screenshot at high resolution
        // Using scale: 'device' means it uses deviceScaleFactor (4x)
        await img.scrollIntoViewIfNeeded();
        await this.page!.waitForTimeout(100); // Small delay for image to render
        const screenshotBuffer = await img.screenshot({ type: 'png', scale: 'device' });

        // Upload to Vercel Blob
        const blob = await put(
          `state-test-questions/${examYear}/grade-${grade}/${questionId}.png`,
          screenshotBuffer,
          { access: 'public', contentType: 'image/png', allowOverwrite: true }
        );

        console.log(`  ☁️ Uploaded: ${blob.url}`);

        questions.push({
          questionId,
          standard,
          examYear,
          examTitle,
          grade,
          screenshotUrl: blob.url,
          questionType: '', // Populated later from JSON data as responseType
          sourceUrl: url,
          scrapedAt: new Date().toISOString(),
          pageIndex: i + 1, // 1-based index
          questionNumber: i + 1, // Sequential order = question number
        });
      } catch (error) {
        console.error(`  ❌ Error processing question ${i + 1}:`);
        console.error(`     Error:`, error instanceof Error ? error.message : error);
        // Re-throw to stop scraping - we don't want partial data with missing questions
        throw new Error(`Failed to scrape question ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Scraped ${questions.length}/${count} questions`);
    return questions;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}
