import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { load } from 'cheerio';
import { IMCredentials, IMLesson, CooldownParser, IM_CONSTANTS } from './types';
import { SimplifiedCooldownParser } from './cooldown-parser';

export class IMScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private credentials: IMCredentials | null = null; // Store credentials for in-page auth
  private cooldownParser = new SimplifiedCooldownParser();

  async initialize(debug = false): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: !debug, // Set to false when debug is true
      slowMo: debug ? 1000 : 0, // Slow down actions when debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Keep browser open longer when debugging
      ...(debug && { devtools: true })
    });
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      ignoreHTTPSErrors: true
    });
    
    this.page = await this.context.newPage();
    
    // Set reasonable timeouts
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
    
    if (debug) {
      // Add more logging when debugging
      this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      this.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    }
  }

  // Store credentials for per-page authentication
  setCredentials(credentials: IMCredentials): void {
    this.credentials = credentials;
    console.log('📝 Credentials stored for per-page authentication');
  }

  // Debug method to verify card detection
  private async debugCardDetection(): Promise<void> {
    if (!this.page) return;
    
    try {
      // Check all cards on the page
      const allCards = await this.page.locator('.im-c-card-heading__title').all();
      console.log('🔍 All cards found on page:');
      
      for (let i = 0; i < allCards.length; i++) {
        const cardTitle = await allCards[i].textContent();
        console.log(`   Card ${i + 1}: "${cardTitle}"`);
      }
      
      // Specifically check for cooldown card
      const cooldownCard = await this.page.locator('#cooldown .im-c-card-heading__title').first();
      if (await cooldownCard.count() > 0) {
        const cooldownTitle = await cooldownCard.textContent();
        console.log(`✅ Cooldown card confirmed: "${cooldownTitle}"`);
      } else {
        console.log('❌ Cooldown card not found');
      }
      
      // Check what's inside cooldown card
      const cooldownContent = await this.page.locator('#cooldown .im-c-highlight').all();
      console.log(`📦 Cooldown highlighted sections: ${cooldownContent.length}`);
      
    } catch (error) {
      console.error('Error in card detection debug:', error);
    }
  }

  // Capture screenshots of MathJax content and images ONLY from cooldown card
  private async captureContentScreenshots(url: string, lessonId: string, debug = false): Promise<string[]> {
    if (!this.page) return [];
    
    const screenshotPaths: string[] = [];
    const timestamp = Date.now();
    const screenshotDir = 'public/screenshots';
    
    try {
      // CRITICAL: First ensure we're only working within the cooldown card
      const cooldownCard = await this.page.locator('#cooldown').first();
      
      if (await cooldownCard.count() === 0) {
        console.log('❌ No cooldown card found, skipping screenshots');
        return screenshotPaths;
      }

      console.log('✅ Found cooldown card, capturing screenshots within it...');

      // Screenshot the entire cooldown card for context first
      const cooldownScreenshotName = `cooldown-full-${lessonId}-${timestamp}.png`;
      const cooldownScreenshotPath = `${screenshotDir}/${cooldownScreenshotName}`;
      await cooldownCard.screenshot({ path: cooldownScreenshotPath });
      screenshotPaths.push(cooldownScreenshotName);
      console.log('📸 Captured full cooldown card screenshot');

      // Screenshot Student Task Statement WITHIN the cooldown card only
      const taskSection = cooldownCard
        .locator('.im-c-highlight')
        .filter({ hasText: 'Student Task Statement' })
        .first();

      if (await taskSection.count() > 0) {
        // Screenshot the entire Student Task Statement section within cooldown
        const taskScreenshotName = `cooldown-task-statement-${lessonId}-${timestamp}.png`;
        const taskScreenshotPath = `${screenshotDir}/${taskScreenshotName}`;
        await taskSection.screenshot({ path: taskScreenshotPath });
        screenshotPaths.push(taskScreenshotName);
        console.log('📸 Captured Cooldown Student Task Statement screenshot');

        // Screenshot individual MathJax expressions within cooldown task statement
        const taskMathDivs = await taskSection.locator('[data-mathjax-div="process"]').all();
        for (let i = 0; i < taskMathDivs.length; i++) {
          const mathScreenshotName = `cooldown-task-math-${lessonId}-${i}-${timestamp}.png`;
          const mathScreenshotPath = `${screenshotDir}/${mathScreenshotName}`;
          await taskMathDivs[i].screenshot({ path: mathScreenshotPath });
          screenshotPaths.push(mathScreenshotName);
          console.log(`📸 Captured Cooldown Task MathJax ${i + 1}`);
        }
      } else {
        console.log('ℹ️ No Student Task Statement found within cooldown card');
      }

      // Screenshot Student Response WITHIN the cooldown card only
      const responseHeading = cooldownCard
        .locator('h3')
        .filter({ hasText: 'Student Response' })
        .first();

      if (await responseHeading.count() > 0) {
        // Get the content after the Student Response heading within cooldown
        const responseSection = responseHeading.locator('xpath=following-sibling::*').first();
        
        if (await responseSection.count() > 0) {
          const responseMathDivs = await responseSection.locator('[data-mathjax-div="process"]').all();
          for (let i = 0; i < responseMathDivs.length; i++) {
            const mathScreenshotName = `cooldown-response-math-${lessonId}-${i}-${timestamp}.png`;
            const mathScreenshotPath = `${screenshotDir}/${mathScreenshotName}`;
            await responseMathDivs[i].screenshot({ path: mathScreenshotPath });
            screenshotPaths.push(mathScreenshotName);
            console.log(`📸 Captured Cooldown Response MathJax ${i + 1}`);
          }
        }
      } else {
        console.log('ℹ️ No Student Response found within cooldown card');
      }

      // Screenshot any images within the cooldown card only
      const cooldownImages = await cooldownCard.locator('.im-c-figure img').all();
      for (let i = 0; i < cooldownImages.length; i++) {
        const imageScreenshotName = `cooldown-image-${lessonId}-${i}-${timestamp}.png`;
        const imageScreenshotPath = `${screenshotDir}/${imageScreenshotName}`;
        await cooldownImages[i].screenshot({ path: imageScreenshotPath });
        screenshotPaths.push(imageScreenshotName);
        console.log(`📸 Captured cooldown image ${i + 1}`);
      }

      if (debug) {
        console.log('📸 Cooldown screenshot capture complete:', screenshotPaths.length, 'files');
        screenshotPaths.forEach(path => console.log('   -', path));
      }

    } catch (error) {
      console.error('❌ Error capturing cooldown-scoped screenshots:', error);
    }

    return screenshotPaths;
  }

  // New method to handle in-page authentication
  private async authenticateOnPage(debug = false): Promise<boolean> {
    if (!this.page || !this.credentials) {
      return false;
    }

    try {
      if (debug) console.log('🔍 Looking for in-page login...');
      
      // Wait for the sign-in button in the cooldown section
      const signInButton = await this.page.waitForSelector(
        IM_CONSTANTS.SELECTORS.COOLDOWN_SIGNIN_BUTTON, 
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

      // Wait for the cooldown content to replace the sign-in message
      await this.page.waitForFunction(() => {
        const cooldownElement = document.querySelector('#cooldown');
        return cooldownElement && !cooldownElement.textContent?.includes('Sign in to access');
      }, { timeout: 15000 });

      if (debug) console.log('✅ Authentication successful - content loaded');
      return true;

    } catch (error) {
      console.error('❌ In-page authentication failed:', error);
      return false;
    }
  }

  async scrapeLessons(
    urls: string[], 
    delayBetweenRequests: number = IM_CONSTANTS.DEFAULT_DELAY, 
    debug = false,
    enableClaudeExport = false
  ): Promise<IMLesson[]> {
    if (!this.page || !this.credentials) {
      throw new Error('Scraper not initialized or credentials not set');
    }

    const results: IMLesson[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const lesson = await this.scrapeSingleLesson(url, debug, enableClaudeExport);
        results.push(lesson);
        
        // Add delay between requests (except for the last one)
        if (i < urls.length - 1) {
          await this.delay(delayBetweenRequests);
        }
        
      } catch (error) {
        console.error(`Failed to scrape lesson at ${url}:`, error);
        
        // Create error lesson entry
        const urlParts = this.parseUrlParts(url);
        results.push({
          url,
          grade: urlParts.grade,
          unit: urlParts.unit,
          section: urlParts.section,
          lesson: urlParts.lesson,
          scrapedAt: new Date().toISOString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  private async scrapeSingleLesson(url: string, debug = false, enableClaudeExport = false): Promise<IMLesson> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    if (debug) console.log('🌐 Navigating to:', url);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    
    // Authenticate on this specific page if needed
    const authSuccess = await this.authenticateOnPage(debug);
    if (!authSuccess) {
      const urlParts = this.parseUrlParts(url);
      return {
        url,
        grade: urlParts.grade,
        unit: urlParts.unit,
        section: urlParts.section,
        lesson: urlParts.lesson,
        scrapedAt: new Date().toISOString(),
        success: false,
        error: 'Failed to authenticate on page'
      };
    }

    // Wait a bit more for any dynamic content
    console.log('⏳ Waiting for content to stabilize...');
    await this.page.waitForTimeout(2000);

    // Debug: Check what cards are on the page
    await this.debugCardDetection();
    
    if (debug) {
      // Take a screenshot for debugging
      await this.page.screenshot({ 
        path: `debug-${Date.now()}.png`, 
        fullPage: true 
      });
      console.log('📸 Screenshot saved');
      
      // Check page state
      const pageTitle = await this.page.title();
      console.log('📄 Page title:', pageTitle);
      
      const url_actual = this.page.url();
      console.log('🔗 Actual URL:', url_actual);
      
      // Check for various selectors
      const selectors = [
        '#cooldown',
        '.cooldown', 
        '.im-c-card',
        '.im-c-card--lesson',
        '[data-unit]',
        'h2:has-text("Cool-down")',
        'text=Cool-down'
      ];
      
      for (const selector of selectors) {
        try {
          const element = await this.page.$(selector);
          console.log(`🎯 Selector "${selector}":`, !!element);
          if (element) {
            const text = await element.textContent();
            console.log(`   Content preview:`, text?.slice(0, 100));
          }
        } catch (e) {
          console.log(`❌ Selector "${selector}" failed:`, (e as Error).message);
        }
      }
    }

    // Get page content and extract cooldown
    const content = await this.page.content();
    const $ = load(content);
    
    if (debug) {
      console.log('📊 Cheerio analysis:');
      console.log('   Total elements:', $('*').length);
      console.log('   Has #cooldown:', $('#cooldown').length > 0);
      console.log('   Has .cooldown:', $('.cooldown').length > 0);
      console.log('   Has .im-c-card:', $('.im-c-card').length);
      console.log('   Cool-down text found:', $('*:contains("Cool-down")').length);
    }
    
    const urlParts = this.parseUrlParts(url);
    const lessonId = `${urlParts.grade}-${urlParts.unit}-${urlParts.section}-${urlParts.lesson}`;

    // Capture screenshots ONLY from cooldown card
    console.log('📸 Capturing cooldown-specific screenshots...');
    const screenshots = await this.captureContentScreenshots(url, lessonId, debug);
    
    let cooldown: CooldownParser | undefined;
    const cooldownContainer = $(IM_CONSTANTS.SELECTORS.COOLDOWN_CONTAINER);
    
    if (cooldownContainer.length > 0) {
      if (debug) console.log('✅ Found cooldown container, extracting content...');
      cooldown = await this.extractCooldownContent(
        cooldownContainer, 
        enableClaudeExport, 
        urlParts, 
        screenshots,
        url
      );
      
      // Add screenshot paths to cooldown data
      if (cooldown) {
        cooldown.screenshots = screenshots;
      }
      
      // Debug: Check if we actually got content
      const hasContent = cooldown.questionText || cooldown.acceptanceCriteria || 
                        (cooldown.canvas && cooldown.canvas.images.length > 0);
      if (debug) {
        console.log('📦 Content extracted:', hasContent ? 'Yes' : 'No');
        console.log('📸 Cooldown screenshots captured:', screenshots.length);
      } else {
        console.log('📦 Content extracted:', hasContent ? 'Yes' : 'No');
        console.log('📸 Cooldown screenshots captured:', screenshots.length);
      }
      
      if (!hasContent && debug) {
        console.log('⚠️ Warning: Cooldown found but no content extracted');
      }
    } else {
      if (debug) console.log('❌ No cooldown container found');
      
      // Try alternative extraction
      const alternativeContainer = $('.im-c-card').filter((_, elem) => {
        return $(elem).text().toLowerCase().includes('cool-down');
      });
      
      if (alternativeContainer.length > 0) {
        if (debug) console.log('🔄 Trying alternative container...');
        cooldown = await this.extractCooldownContent(
          alternativeContainer, 
          enableClaudeExport, 
          urlParts, 
          screenshots,
          url
        );
      }
    }
    
    return {
      url,
      grade: urlParts.grade,
      unit: urlParts.unit,
      section: urlParts.section,
      lesson: urlParts.lesson,
      cooldown,
      scrapedAt: new Date().toISOString(),
      success: true
    };
  }

  private async extractCooldownContent(
    cooldownContainer: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    enableClaudeExport: boolean = false,
    lessonMeta?: { grade: string; unit: string; section: string; lesson: string },
    screenshots?: string[],
    lessonUrl?: string
  ): Promise<CooldownParser> {
    // Use the enhanced parser with Claude export support
    const cooldownHtml = cooldownContainer.html() || '';
    return this.cooldownParser.parseCooldownSectionWithClaudeExport(
      cooldownHtml, 
      enableClaudeExport, 
      lessonMeta, 
      screenshots,
      lessonUrl
    );
  }

  // Old helper methods removed - now using SimplifiedCooldownParser

  private parseUrlParts(url: string): { grade: string; unit: string; section: string; lesson: string } {
    // Extract parts from URL pattern: https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1
    const urlMatch = url.match(/grade-(\d+)\/unit-(\d+)\/section-([a-c])\/lesson-(\d+)/);
    
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

/**
 * Generate IM lesson URLs with specific lesson selection per section
 */
export function generateIMUrls(
  grade: number,
  startUnit: number,
  endUnit: number,
  sectionLessons: Record<string, number[]> = {}
): string[] {
  const urls: string[] = [];
  
  for (let unit = startUnit; unit <= endUnit; unit++) {
    // Iterate through each section that has lessons selected
    Object.entries(sectionLessons).forEach(([section, lessonNumbers]) => {
      // Generate URLs only for the specifically selected lessons
      lessonNumbers.forEach(lessonNumber => {
        const url = `${IM_CONSTANTS.BASE_URL}/6-8/grade-${grade}/unit-${unit}/section-${section}/lesson-${lessonNumber}?a=teacher`;
        urls.push(url);
      });
    });
  }
  
  return urls;
}