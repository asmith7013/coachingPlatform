// scripts/snorkl-simple-scraper.ts
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs/promises';

interface Assignment {
  name: string;
  className: string;
  activityId?: string;
  url?: string;
}

interface ScrapingResult {
  assignments: Assignment[];
  totalFound: number;
  errors: string[];
}

class SimpleSnorklScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private assignments: Assignment[] = [];
  private errors: string[] = [];

  private readonly CLASSES = [
    {
      name: "D9_SR1 (6th)",
      id: "5ba63daa-fc91-47bf-9687-9485973378a0",
      url: "https://teacher.snorkl.app/classes/5ba63daa-fc91-47bf-9687-9485973378a0"
    },
    {
      name: "D9_SR2 (6th and 7th)",
      id: "00cb2fd6-dd28-4a2d-bb69-360986791475", 
      url: "https://teacher.snorkl.app/classes/00cb2fd6-dd28-4a2d-bb69-360986791475"
    },
    {
      name: "D9_SR3 (6-8)",
      id: "d27e3973-ddad-4615-a0ca-6c5ac531c692",
      url: "https://teacher.snorkl.app/classes/d27e3973-ddad-4615-a0ca-6c5ac531c692"
    },
    {
      name: "D11_6-SRF (6th)",
      id: "abc262c7-ac1e-4eef-b8d3-5a3764c1c440",
      url: "https://teacher.snorkl.app/classes/abc262c7-ac1e-4eef-b8d3-5a3764c1c440"
    },
    {
      name: "D11_6-SR6/M06 (6th)",
      id: "aed716b4-89ad-42bc-a4c5-549673b2678a",
      url: "https://teacher.snorkl.app/classes/aed716b4-89ad-42bc-a4c5-549673b2678a"
    }
  ];

  async initialize(): Promise<void> {
    console.log('🚀 Initializing simple scraper...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(30000);
  }

  async login(email: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔐 Logging in...');
    
    await this.page.goto('https://teacher.snorkl.app/login');
    await this.page.click('text=Log in with Google');
    
    await this.page.waitForSelector('input[type="email"]');
    await this.page.fill('input[type="email"]', email);
    await this.page.click('#identifierNext');
    
    await this.page.waitForSelector('input[type="password"]');
    await this.page.fill('input[type="password"]', password);
    await this.page.click('#passwordNext');
    
    // Handle 2FA if needed
    try {
      await this.page.waitForSelector('input[type="tel"], input[aria-label*="code"]', { timeout: 5000 });
      console.log('🔒 2FA detected! Complete manually and press Enter when done...');
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve(void 0));
      });
    } catch {
      // No 2FA needed
    }
    
    await this.page.waitForURL('**/teacher.snorkl.app/**');
    console.log('✅ Login successful!');
  }

  async scrapeClass(classInfo: typeof this.CLASSES[0]): Promise<Assignment[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`📚 Scraping class: ${classInfo.name}`);
    const classAssignments: Assignment[] = [];

    try {
      await this.page.goto(classInfo.url);
      await this.page.waitForSelector('tbody tr', { timeout: 10000 });

      // Extract assignment names from table rows
      const assignments = await this.page.$$eval('tbody tr', (rows) => {
        return rows.map(row => {
          const titleElement = row.querySelector('td .text-sm.font-semibold.text-black');
          const title = titleElement?.textContent?.trim() || '';
          
          if (title) {
            return { name: title };
          }
          return null;
        }).filter(Boolean);
      });

      for (const assignment of assignments) {
        if (assignment) {
          classAssignments.push({
            name: assignment.name,
            className: classInfo.name
          });
        }
      }

      console.log(`   📝 Found ${classAssignments.length} assignments`);
      
    } catch (error) {
      console.log(`❌ Error scraping class ${classInfo.name}: ${error}`);
      this.errors.push(`Error scraping ${classInfo.name}: ${error}`);
    }

    return classAssignments;
  }

  async scrapeAllClasses(): Promise<ScrapingResult> {
    console.log(`🎯 Starting scrape of ${this.CLASSES.length} classes`);
    
    for (const classInfo of this.CLASSES) {
      const classAssignments = await this.scrapeClass(classInfo);
      this.assignments.push(...classAssignments);
      await this.page?.waitForTimeout(2000); // Brief delay between classes
    }

    return {
      assignments: this.assignments,
      totalFound: this.assignments.length,
      errors: this.errors
    };
  }

  async saveToCSV(result: ScrapingResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `snorkl-assignments-${timestamp}.csv`;
    
    const csvHeader = 'Assignment Name,Class Name\n';
    const csvRows = result.assignments.map(assignment => 
      `"${assignment.name}","${assignment.className}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    await fs.writeFile(filename, csvContent);
    console.log(`💾 Results saved to: ${filename}`);
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run(email: string, password: string): Promise<ScrapingResult> {
    try {
      await this.initialize();
      await this.login(email, password);
      const result = await this.scrapeAllClasses();
      await this.saveToCSV(result);
      
      console.log('\n📈 SCRAPING COMPLETE!');
      console.log(`   📚 Classes processed: ${this.CLASSES.length}`);
      console.log(`   📝 Assignments found: ${result.totalFound}`);
      console.log(`   ❌ Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      return result;
      
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  const scraper = new SimpleSnorklScraper();
  
  // Use the credentials from the original script
  const credentials = {
    email: 'alex.smith@teachinglab.org',
    password: 'Cf3C&vZ6JH$nuVE#'
  };
  
  try {
    await scraper.run(credentials.email, credentials.password);
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { SimpleSnorklScraper, type Assignment, type ScrapingResult }; 