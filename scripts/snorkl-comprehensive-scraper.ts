// scripts/snorkl-comprehensive-scraper.ts
import { chromium, type Browser, type Page, type ElementHandle } from 'playwright';
import * as fs from 'fs/promises';

interface ClassInfo {
  name: string;
  id: string;
  url: string;
  district: string;
}

interface ActivityInfo {
  title: string;
  activityId: string;
  fullUrl: string;
  section: string;
  district: string;
  teacher: string;
  hasResponses: boolean;
  responseCount: number;
}

interface ScrapingResult {
  classes: ClassInfo[];
  activities: ActivityInfo[];
  totalActivities: number;
  errors: string[];
  csvUrls: string[];
}

class SnorklComprehensiveScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private activities: ActivityInfo[] = [];
  private errors: string[] = [];

  private readonly CLASSES: ClassInfo[] = [
    {
      name: "D9_SR1 (6th)",
      id: "5ba63daa-fc91-47bf-9687-9485973378a0",
      url: "https://teacher.snorkl.app/classes/5ba63daa-fc91-47bf-9687-9485973378a0",
      district: "D9"
    },
    {
      name: "D9_SR2 (6th and 7th)",
      id: "00cb2fd6-dd28-4a2d-bb69-360986791475", 
      url: "https://teacher.snorkl.app/classes/00cb2fd6-dd28-4a2d-bb69-360986791475",
      district: "D9"
    },
    {
      name: "D9_SR3 (6-8)",
      id: "d27e3973-ddad-4615-a0ca-6c5ac531c692",
      url: "https://teacher.snorkl.app/classes/d27e3973-ddad-4615-a0ca-6c5ac531c692", 
      district: "D9"
    },
    {
      name: "D11_6-SRF (6th)",
      id: "abc262c7-ac1e-4eef-b8d3-5a3764c1c440",
      url: "https://teacher.snorkl.app/classes/abc262c7-ac1e-4eef-b8d3-5a3764c1c440",
      district: "D11"
    },
    {
      name: "D11_6-SR6/M06 (6th)",
      id: "aed716b4-89ad-42bc-a4c5-549673b2678a",
      url: "https://teacher.snorkl.app/classes/aed716b4-89ad-42bc-a4c5-549673b2678a",
      district: "D11"
    }
  ];

  private readonly CSV_BASE_URL = 'https://api.snorkl.app/assigned-prompt-activity';

  async initialize(): Promise<void> {
    console.log('🚀 Initializing comprehensive scraper...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500,
      timeout: 60000
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    this.page = await context.newPage();
    
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
  }

  async login(email: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔐 Starting login process...');
    
    // Go to the login page
    await this.page.goto('https://teacher.snorkl.app/login');
    
    // Click "Log in with Google"
    await this.page.click('text=Log in with Google');
    
    // Wait for Google login page
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Enter email
    await this.page.fill('input[type="email"]', email);
    await this.page.click('#identifierNext, [id="identifierNext"]');
    
    // Wait for password field
    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    // Enter password
    await this.page.fill('input[type="password"]', password);
    await this.page.click('#passwordNext, [id="passwordNext"]');
    
    // Check if 2FA is required
    try {
      await this.page.waitForSelector(
        'input[type="tel"], input[aria-label*="code"], input[placeholder*="code"], div[data-error-code]',
        { timeout: 5000 }
      );
      
      console.log('🔒 2FA detected! Please complete 2FA manually in the browser...');
      console.log('⏰ Waiting for you to complete 2FA (up to 2 minutes)...');
      
      // Wait for successful redirect to Snorkl (indicating 2FA completion)
      await this.page.waitForURL('**/teacher.snorkl.app/**', { timeout: 120000 });
      
    } catch {
      // Maybe no 2FA required, check if we're already logged in
      try {
        await this.page.waitForURL('**/teacher.snorkl.app/**', { timeout: 30000 });
      } catch {
        throw new Error('Login failed - could not reach Snorkl dashboard. Please check credentials.');
      }
    }
    
    console.log('✅ Login successful!');
  }

  private async navigateWithRetry(url: string, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page?.goto(url);
        await this.page?.waitForSelector('tbody.divide-y-2 tr', { timeout: 10000 });
        return true;
      } catch (error) {
        console.log(`   🔄 Navigation attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          return false;
        }
        await this.page?.waitForTimeout(2000 * attempt);
      }
    }
    return false;
  }

  private parseResponseCount(responseText: string | null): { count: number; hasResponses: boolean } {
    if (!responseText) return { count: 0, hasResponses: false };
    
    const match = responseText.match(/(\d+) Responses?/);
    if (match) {
      const count = parseInt(match[1]);
      return { count, hasResponses: count > 0 };
    }
    
    return { count: 0, hasResponses: false };
  }

  private async extractTeacherName(): Promise<string> {
    try {
      // Look for teacher name in page content
      const teacherSelectors = [
        'text=Maureen Ferry',
        '[data-testid="teacher-name"]',
        '.teacher-name'
      ];

      for (const selector of teacherSelectors) {
        try {
          const element = await this.page?.$(selector);
          if (element) {
            const text = await element.textContent();
            if (text) return text.trim();
          }
        } catch {
          continue;
        }
      }

      return 'Maureen Ferry'; // Default based on screenshots
    } catch {
      return 'Unknown Teacher';
    }
  }

  private async extractActivityInfo(
    element: ElementHandle, 
    classInfo: ClassInfo, 
    teacher: string
  ): Promise<Partial<ActivityInfo> | null> {
    try {
      // Use precise selector for activity title
      const titleElement = await element.$('td[tabindex="0"] .min-w-0.truncate.text-sm.font-semibold.text-black');
      const title = await titleElement?.textContent();
      
      if (!title) {
        console.log('   ⚠️ Could not extract activity title');
        return null;
      }

      // Extract response count with precise selector
      const responseElement = await element.$('.mt-1.text-xs.font-normal.normal-case.text-medium-gray');
      const responseText = await responseElement?.textContent() || null;
      const { count: responseCount, hasResponses } = this.parseResponseCount(responseText);

      return {
        title: title.trim(),
        section: classInfo.name,
        district: classInfo.district,
        teacher,
        hasResponses,
        responseCount,
        activityId: '',
        fullUrl: ''
      };
      
    } catch (error) {
      console.log(`   ❌ Error extracting activity info: ${error}`);
      return null;
    }
  }

  private extractActivityIdFromUrl(url: string): string | null {
    const match = url.match(/\/prompt-activities\/([a-f0-9-]{36})/);
    return match ? match[1] : null;
  }

  async scrapeClass(classInfo: ClassInfo): Promise<ActivityInfo[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`\n📚 Scraping class: ${classInfo.name}`);
    const classActivities: ActivityInfo[] = [];

    try {
      const navigationSuccess = await this.navigateWithRetry(classInfo.url);
      if (!navigationSuccess) {
        throw new Error('Failed to navigate to class after retries');
      }
      
      const teacher = await this.extractTeacherName();
      await this.page.waitForTimeout(2000);
      
      // Use precise selector for activity rows
      const activityElements = await this.page.$$('tbody.divide-y-2 tr.group.hover\\:bg-row-gray-hover.cursor-pointer');
      console.log(`   Found ${activityElements.length} activities`);

      for (let i = 0; i < activityElements.length; i++) {
        try {
          console.log(`   📝 Processing activity ${i + 1}/${activityElements.length}`);
          
          const activityInfo = await this.extractActivityInfo(activityElements[i], classInfo, teacher);
          
          if (!activityInfo) {
            console.log(`   ⚠️ Could not extract info for activity ${i + 1}`);
            continue;
          }

          // Click on the specific title cell
          const titleCell = await activityElements[i].$('td[tabindex="0"]');
          if (titleCell) {
            await titleCell.click();
          } else {
            await activityElements[i].click();
          }
          
          await this.page.waitForLoadState('networkidle', { timeout: 10000 });
          const currentUrl = this.page.url();
          
          const activityId = this.extractActivityIdFromUrl(currentUrl);
          
          if (activityId) {
            const fullActivity: ActivityInfo = {
              ...activityInfo,
              activityId,
              fullUrl: currentUrl
            } as ActivityInfo;
            
            classActivities.push(fullActivity);
            console.log(`   ✅ Captured: ${fullActivity.title} (ID: ${activityId})`);
          } else {
            console.log(`   ❌ Could not extract activity ID from URL: ${currentUrl}`);
            this.errors.push(`Could not extract activity ID for ${activityInfo.title}`);
          }
          
          // Navigate back with retry
          const backSuccess = await this.navigateWithRetry(classInfo.url);
          if (!backSuccess) {
            console.log(`   ❌ Could not navigate back to class list`);
            break;
          }
          
          await this.page.waitForTimeout(1000);
          
          // Re-query elements as DOM has been refreshed
          const refreshedElements = await this.page.$$('tbody.divide-y-2 tr.group.hover\\:bg-row-gray-hover.cursor-pointer');
          activityElements.length = 0;
          activityElements.push(...refreshedElements);
          
        } catch (error) {
          console.log(`   ❌ Error processing activity ${i + 1}: ${error}`);
          this.errors.push(`Error processing activity ${i + 1} in ${classInfo.name}: ${error}`);
          
          try {
            await this.navigateWithRetry(classInfo.url);
          } catch (navError) {
            console.log(`   ❌ Could not navigate back to class: ${navError}`);
          }
        }
      }

    } catch (error) {
      console.log(`❌ Error scraping class ${classInfo.name}: ${error}`);
      this.errors.push(`Error scraping class ${classInfo.name}: ${error}`);
    }

    console.log(`   📊 Class ${classInfo.name}: ${classActivities.length} activities captured`);
    return classActivities;
  }

  async scrapeAllClasses(): Promise<ScrapingResult> {
    console.log(`🎯 Starting comprehensive scrape of ${this.CLASSES.length} classes`);
    
    for (const classInfo of this.CLASSES) {
      const classActivities = await this.scrapeClass(classInfo);
      this.activities.push(...classActivities);
      await this.page?.waitForTimeout(2000);
    }

    const csvUrls = this.activities
      .filter(activity => activity.activityId)
      .map(activity => `${this.CSV_BASE_URL}/${activity.activityId}/export-grades`);

    const result: ScrapingResult = {
      classes: this.CLASSES,
      activities: this.activities,
      totalActivities: this.activities.length,
      errors: this.errors,
      csvUrls
    };

    await this.saveResults(result);
    return result;
  }

  private async saveResults(result: ScrapingResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `snorkl-scrape-results-${timestamp}.json`;
    
    try {
      await fs.writeFile(filename, JSON.stringify(result, null, 2));
      console.log(`💾 Results saved to: ${filename}`);
      
      const csvFilename = `snorkl-csv-urls-${timestamp}.txt`;
      await fs.writeFile(csvFilename, result.csvUrls.join('\n'));
      console.log(`📊 CSV URLs saved to: ${csvFilename}`);
      
    } catch (error) {
      console.error(`❌ Error saving results: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      console.log('🧹 Cleaning up browser...');
      await this.browser.close();
    }
  }

  async run(email: string, password: string): Promise<ScrapingResult> {
    try {
      await this.initialize();
      await this.login(email, password);
      const result = await this.scrapeAllClasses();
      
      console.log('\n📈 SCRAPING COMPLETE!');
      console.log(`   📚 Classes processed: ${result.classes.length}`);
      console.log(`   📝 Activities found: ${result.totalActivities}`);
      console.log(`   📊 CSV URLs generated: ${result.csvUrls.length}`);
      console.log(`   ❌ Errors encountered: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      return result;
      
    } finally {
      console.log('\n🔍 Browser kept open for inspection. Press Ctrl+C to exit.');
      await new Promise(() => {});
    }
  }
}

async function main() {
  const scraper = new SnorklComprehensiveScraper();
  
  const credentials = {
    email: 'alex.smith@teachinglab.org',
    password: 'Cf3C&vZ6JH$nuVE#'
  };
  
  try {
    await scraper.run(credentials.email, credentials.password);
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    await scraper.cleanup();
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

export { SnorklComprehensiveScraper, type ActivityInfo, type ScrapingResult }; 