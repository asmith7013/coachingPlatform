// scripts/snorkl-csv-processor.ts
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs/promises';
import * as Papa from 'papaparse';
import { z } from 'zod';
import { type ActivityInfo } from './snorkl-comprehensive-scraper';
import {
  SnorklStudentResponseZodSchema,
  SnorklStudentDataZodSchema,
  SnorklActivityInputZodSchema,
  SnorklCsvRowZodSchema,
  type SnorklStudentResponse,
  type SnorklStudentData,
  type SnorklActivityInput,
  type SnorklCsvRow
} from '../src/lib/schema/zod-schema/313/storage';

interface CsvProcessingResult {
  activityId: string;
  activityTitle: string;
  csvData: SnorklStudentData[];
  success: boolean;
  error?: string;
  validationErrors?: string[];
}

interface ProcessingSession {
  totalActivities: number;
  successfulDownloads: number;
  failedDownloads: number;
  validationErrors: number;
  processedActivities: CsvProcessingResult[];
  errors: string[];
}

class SnorklCsvProcessor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private session: ProcessingSession = {
    totalActivities: 0,
    successfulDownloads: 0,
    failedDownloads: 0,
    validationErrors: 0,
    processedActivities: [],
    errors: []
  };

  async initialize(): Promise<void> {
    console.log('🚀 Initializing CSV processor...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 300
    });
    
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  async login(email: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔐 Logging in for CSV downloads...');
    
    await this.page.goto('https://teacher.snorkl.app/login');
    await this.page.click('text=Log in with Google');
    await this.page.waitForSelector('input[type="email"]');
    await this.page.fill('input[type="email"]', email);
    await this.page.click('#identifierNext');
    await this.page.waitForSelector('input[type="password"]');
    await this.page.fill('input[type="password"]', password);
    await this.page.click('#passwordNext');
    
    try {
      await this.page.waitForSelector('input[type="tel"]', { timeout: 5000 });
      console.log('🔒 Please complete 2FA...');
      await this.page.waitForURL('**/teacher.snorkl.app/**', { timeout: 120000 });
    } catch {
      await this.page.waitForURL('**/teacher.snorkl.app/**', { timeout: 30000 });
    }
    
    console.log('✅ Login successful!');
  }

  async downloadCsv(csvUrl: string): Promise<string | null> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log(`📥 Downloading CSV: ${csvUrl}`);
      
      const [download] = await Promise.all([
        this.page.waitForEvent('download'),
        this.page.goto(csvUrl)
      ]);
      
      const timestamp = Date.now();
      const filename = `snorkl-temp-${timestamp}.csv`;
      await download.saveAs(filename);
      
      console.log(`   ✅ Downloaded: ${filename}`);
      return filename;
      
    } catch (error) {
      console.log(`   ❌ Download failed: ${error}`);
      return null;
    }
  }

  private async parseCsvFile(filename: string): Promise<{ data: SnorklStudentData[]; errors: string[] }> {
    try {
      const csvContent = await fs.readFile(filename, 'utf-8');
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvContent, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<Record<string, string>>) => {
            try {
              const processedResult = this.processCsvDataWithValidation(results.data);
              resolve(processedResult);
            } catch (error) {
              reject(error);
            }
          },
          error: (error: Error) => {
            reject(error);
          }
        });
      });
      
    } catch (error) {
      throw new Error(`Error reading CSV file: ${error}`);
    }
  }

  private processCsvDataWithValidation(rawData: Record<string, string>[]): { data: SnorklStudentData[]; errors: string[] } {
    const processedStudents: SnorklStudentData[] = [];
    const validationErrors: string[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        // First, validate the raw CSV row structure
        const validatedCsvRow = this.validateCsvRow(row, i);
        if (!validatedCsvRow) {
          continue; // Skip invalid rows
        }
        
        // Process the validated row into student data
        const studentData = this.transformCsvRowToStudentData(validatedCsvRow, i);
        
        if (studentData) {
          // Validate the final student data against schema
          const validatedStudentData = SnorklStudentDataZodSchema.parse(studentData);
          processedStudents.push(validatedStudentData);
        }
        
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof z.ZodError 
          ? this.formatZodError(error) 
          : error}`;
        validationErrors.push(errorMsg);
        console.log(`   ⚠️ ${errorMsg}`);
      }
    }
    
    return { data: processedStudents, errors: validationErrors };
  }

  private validateCsvRow(row: Record<string, string>, rowIndex: number): SnorklCsvRow | null {
    try {
      // Validate basic CSV structure
      return SnorklCsvRowZodSchema.parse(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`   ⚠️ Row ${rowIndex + 1} failed CSV validation: ${this.formatZodError(error)}`);
      }
      return null;
    }
  }

  private transformCsvRowToStudentData(csvRow: SnorklCsvRow, rowIndex: number): SnorklStudentData | null {
    try {
      const firstName = csvRow['First Name']?.trim();
      const lastName = csvRow['Last Name']?.trim();
      
      if (!firstName || !lastName) {
        console.log(`   ⚠️ Row ${rowIndex + 1}: Missing name data`);
        return null;
      }
      
      // Extract response attempts with validation
      const responses = this.extractResponseAttempts(csvRow, rowIndex);
      
      // Create student data object
      const studentData: SnorklStudentData = {
        firstName,
        lastName,
        bestResponseCorrect: csvRow['Best Response Correct - Yes or No'],
        bestResponseExplanationScore: csvRow['Best Response Explanation Score (0-4)'],
        bestResponseDate: csvRow['Best Response Date'] || '',
        responses
      };
      
      return studentData;
      
    } catch (error) {
      console.log(`   ⚠️ Row ${rowIndex + 1}: Transform error - ${error}`);
      return null;
    }
  }

  private extractResponseAttempts(csvRow: SnorklCsvRow, rowIndex: number): SnorklStudentResponse[] {
    const responses: SnorklStudentResponse[] = [];
    let attemptNum = 1;
    
    // Extract all response attempts
    while (csvRow[`Attempt ${attemptNum} Correct` as keyof SnorklCsvRow]) {
      try {
        const correct = csvRow[`Attempt ${attemptNum} Correct` as keyof SnorklCsvRow] as string;
        const scoreStr = csvRow[`Attempt ${attemptNum} Explanation Score` as keyof SnorklCsvRow] as string;
        const date = csvRow[`Attempt ${attemptNum} Date` as keyof SnorklCsvRow] as string;
        
        if (correct && date) {
          const responseData: SnorklStudentResponse = {
            correct: correct === 'Yes' ? 'Yes' : 'No',
            explanationScore: parseInt(scoreStr) || 0,
            responseDate: date
          };
          
          // Validate individual response
          const validatedResponse = SnorklStudentResponseZodSchema.parse(responseData);
          responses.push(validatedResponse);
        }
      } catch (error) {
        console.log(`   ⚠️ Row ${rowIndex + 1}, Attempt ${attemptNum}: Invalid response data - ${error}`);
      }
      
      attemptNum++;
    }
    
    return responses;
  }

  private formatZodError(error: z.ZodError): string {
    return error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
  }

  async processActivity(activity: ActivityInfo): Promise<CsvProcessingResult> {
    const csvUrl = `https://api.snorkl.app/assigned-prompt-activity/${activity.activityId}/export-grades`;
    
    try {
      const filename = await this.downloadCsv(csvUrl);
      if (!filename) {
        throw new Error('Failed to download CSV');
      }
      
      const parseResult = await this.parseCsvFile(filename);
      await fs.unlink(filename);
      
      console.log(`   📊 Processed ${parseResult.data.length} students for ${activity.title}`);
      if (parseResult.errors.length > 0) {
        console.log(`   ⚠️ ${parseResult.errors.length} validation errors encountered`);
        this.session.validationErrors += parseResult.errors.length;
      }
      
      return {
        activityId: activity.activityId,
        activityTitle: activity.title,
        csvData: parseResult.data,
        success: true,
        validationErrors: parseResult.errors
      };
      
    } catch (error) {
      const errorMsg = `Failed to process ${activity.title}: ${error}`;
      console.log(`   ❌ ${errorMsg}`);
      
      return {
        activityId: activity.activityId,
        activityTitle: activity.title,
        csvData: [],
        success: false,
        error: errorMsg
      };
    }
  }

  async processAllActivities(activities: ActivityInfo[]): Promise<SnorklActivityInput[]> {
    console.log(`🎯 Processing ${activities.length} activities...`);
    this.session.totalActivities = activities.length;
    
    const completedActivities: SnorklActivityInput[] = [];
    
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      console.log(`\n📝 Processing ${i + 1}/${activities.length}: ${activity.title}`);
      
      const result = await this.processActivity(activity);
      this.session.processedActivities.push(result);
      
      if (result.success) {
        this.session.successfulDownloads++;
        
        try {
          // Create and validate the complete activity object
          const activityInput: SnorklActivityInput = {
            activityTitle: activity.title,
            section: activity.section,
            district: activity.district,
            teacher: activity.teacher,
            activityId: activity.activityId,
            csvUrl: `https://api.snorkl.app/assigned-prompt-activity/${activity.activityId}/export-grades`,
            data: result.csvData,
            owners: [] // To be assigned as needed
          };
          
          // Validate the complete activity against schema
          const validatedActivity = SnorklActivityInputZodSchema.parse(activityInput);
          completedActivities.push(validatedActivity);
          
        } catch (validationError) {
          console.log(`   ❌ Activity validation failed: ${validationError}`);
          this.session.errors.push(`Activity validation failed for ${activity.title}: ${validationError}`);
          this.session.failedDownloads++;
        }
        
      } else {
        this.session.failedDownloads++;
        this.session.errors.push(result.error || 'Unknown error');
      }
      
      await this.page?.waitForTimeout(1000);
    }
    
    return completedActivities;
  }

  async saveResults(activities: SnorklActivityInput[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `snorkl-processed-activities-${timestamp}.json`;
    
    const results = {
      session: this.session,
      activities,
      summary: {
        totalProcessed: activities.length,
        totalStudents: activities.reduce((sum, act) => sum + act.data.length, 0),
        validationErrors: this.session.validationErrors,
        successRate: this.session.totalActivities > 0 
          ? (this.session.successfulDownloads / this.session.totalActivities * 100).toFixed(2) 
          : '0'
      }
    };
    
    try {
      await fs.writeFile(filename, JSON.stringify(results, null, 2));
      console.log(`💾 Results saved to: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error saving results: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run(activities: ActivityInfo[], email: string, password: string): Promise<SnorklActivityInput[]> {
    try {
      await this.initialize();
      await this.login(email, password);
      
      const processedActivities = await this.processAllActivities(activities);
      await this.saveResults(processedActivities);
      
      console.log('\n📈 CSV PROCESSING COMPLETE!');
      console.log(`   📝 Total activities: ${this.session.totalActivities}`);
      console.log(`   ✅ Successful: ${this.session.successfulDownloads}`);
      console.log(`   ❌ Failed: ${this.session.failedDownloads}`);
      console.log(`   ⚠️ Validation errors: ${this.session.validationErrors}`);
      console.log(`   📊 Students processed: ${processedActivities.reduce((sum, act) => sum + act.data.length, 0)}`);
      console.log(`   📈 Success rate: ${this.session.totalActivities > 0 ? (this.session.successfulDownloads / this.session.totalActivities * 100).toFixed(2) : '0'}%`);
      
      if (this.session.errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        this.session.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      return processedActivities;
      
    } finally {
      await this.cleanup();
    }
  }
}

// Export types for use in other files
export { 
  SnorklCsvProcessor, 
  type CsvProcessingResult,
  type ProcessingSession
}; 