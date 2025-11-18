"use server";

import { z } from "zod";
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import {
  type AssessmentScraperResponse,
  type AssessmentRow,
  type AssessmentScraperConfig
} from '@/lib/schema/zod-schema/313/assessment-scraper';
import { authenticateRoadmaps } from '../../shared/lib/roadmaps-auth';
import { parseAssessmentCSV } from '../lib/csv-parser';
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const ASSESSMENT_HISTORY_URL = 'https://roadmaps.teachtoone.org/assessment-history';

/**
 * Selectors for the assessment history page
 */
const SELECTORS = {
  CLASS_MULTISELECT: '#class',
  CLASS_TRIGGER: '#class .p-multiselect-trigger',
  CLASS_PANEL: '.p-multiselect-panel',
  CLASS_ITEMS: '.p-multiselect-items .p-multiselect-item',
  ROADMAP_DROPDOWN: '#roadmap',
  ROADMAP_TRIGGER: '#roadmap .p-dropdown-trigger',
  ROADMAP_PANEL: '.p-dropdown-panel',
  ROADMAP_ITEMS: '.p-dropdown-items .p-dropdown-item',
  STUDENT_GRADE_MULTISELECT: 'label:has-text("Student Grade") + div.p-multiselect',
  STUDENT_GRADE_TRIGGER: 'label:has-text("Student Grade") + div.p-multiselect .p-multiselect-trigger',
  SKILL_GRADE_MULTISELECT: 'label:has-text("Skill Grade") + div.p-multiselect',
  SKILL_GRADE_TRIGGER: 'label:has-text("Skill Grade") + div.p-multiselect .p-multiselect-trigger',
  EXPORT_BUTTON: 'button:has-text("Export Data Table")',
};

/**
 * Clear all selected classes
 * @deprecated No longer needed - we navigate fresh to page each time
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function clearClassSelections(page: Page): Promise<void> {
  console.log('🧹 Clearing class selections...');

  // Open the class dropdown
  await page.click(SELECTORS.CLASS_TRIGGER);
  await page.waitForSelector(SELECTORS.CLASS_PANEL, { timeout: 5000 });
  await page.waitForTimeout(500);

  // Find all checked items and uncheck them
  const items = await page.locator(SELECTORS.CLASS_ITEMS).all();

  for (const item of items) {
    const isChecked = await item.locator('.p-checkbox-checked').count() > 0;
    if (isChecked) {
      await item.click();
      await page.waitForTimeout(200);
    }
  }

  // Close the dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('  ✅ Class selections cleared');
}

/**
 * Select a class from the multiselect dropdown
 */
async function selectClass(page: Page, className: string): Promise<void> {
  console.log(`📋 Selecting class: ${className}`);

  // Click the trigger to open dropdown
  await page.click(SELECTORS.CLASS_TRIGGER);
  await page.waitForTimeout(1000);

  // Wait for items to be visible using a more specific selector
  await page.waitForSelector('.p-multiselect-items .p-multiselect-item', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(500);

  // Find and click the specific class - look for span text inside the li
  const items = await page.locator('.p-multiselect-items .p-multiselect-item').all();

  console.log(`  🔍 Found ${items.length} class items`);

  let found = false;
  for (const item of items) {
    // Get the text from the span element inside the li
    const spanText = await item.locator('span').textContent();
    console.log(`  🔍 Checking item with span text: "${spanText?.trim()}"`);

    if (spanText?.trim() === className) {
      await item.click();
      found = true;
      console.log(`  ✅ Class "${className}" selected`);
      break;
    }
  }

  if (!found) {
    console.error(`  ❌ Could not find class "${className}". Available classes logged above.`);
    throw new Error(`Could not find class: ${className}`);
  }

  // Click away to close the dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Select from a standard PrimeNG dropdown
 */
async function selectDropdownOption(
  page: Page,
  triggerSelector: string,
  optionText: string,
  label: string
): Promise<void> {
  console.log(`📋 Selecting ${label}: ${optionText}`);

  // Click the trigger to open dropdown
  await page.click(triggerSelector);
  await page.waitForSelector('.p-dropdown-panel', { timeout: 5000 });
  await page.waitForTimeout(500);

  // Find and click the specific option by text
  const optionSelector = `.p-dropdown-item:has-text("${optionText}")`;
  await page.click(optionSelector);
  console.log(`  ✅ ${label} "${optionText}" selected`);

  await page.waitForTimeout(500);
}

/**
 * Clear multiselect and select new option
 * @deprecated Currently not used - Student Grade and Skill Grade filters temporarily disabled
 */
async function _selectMultiselectOption(
  page: Page,
  triggerSelector: string,
  optionText: string,
  label: string
): Promise<void> {
  console.log(`📋 Selecting ${label}: ${optionText}`);

  // Click the trigger to open multiselect
  await page.click(triggerSelector);
  await page.waitForSelector('.p-multiselect-panel', { timeout: 5000 });
  await page.waitForTimeout(500);

  // First clear all selections
  const items = await page.locator('.p-multiselect-items .p-multiselect-item').all();

  for (const item of items) {
    const isChecked = await item.locator('.p-checkbox-checked').count() > 0;
    if (isChecked) {
      await item.click();
      await page.waitForTimeout(200);
    }
  }

  // Now select the target option - look for span text inside the li
  let found = false;
  for (const item of items) {
    const spanText = await item.locator('span').textContent();
    if (spanText?.trim() === optionText) {
      await item.click();
      found = true;
      console.log(`  ✅ ${label} "${optionText}" selected`);
      break;
    }
  }

  if (!found) {
    throw new Error(`Could not find ${label} option: ${optionText}`);
  }

  // Click away to close the multiselect
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Apply filters for a single configuration
 */
async function applyFilters(
  page: Page,
  config: AssessmentScraperConfig,
  delayBetweenActions: number
): Promise<void> {
  console.log('🎯 Applying filters...');

  // Navigate to assessment history page
  console.log(`🌐 Navigating to: ${ASSESSMENT_HISTORY_URL}`);
  await page.goto(ASSESSMENT_HISTORY_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(delayBetweenActions * 2); // Wait longer after page load

  // 1. Select classes (don't clear first - just select what we need)
  for (const className of config.filters.classes) {
    await selectClass(page, className);
    await page.waitForTimeout(delayBetweenActions);
  }

  // 2. Select roadmap
  await selectDropdownOption(page, SELECTORS.ROADMAP_TRIGGER, config.filters.roadmap, 'Roadmap');
  await page.waitForTimeout(delayBetweenActions);

  // 3. Select student grade (multiselect)
  // TEMPORARILY DISABLED - may be filtering out recent data
  // await selectMultiselectOption(page, SELECTORS.STUDENT_GRADE_TRIGGER, config.filters.studentGrade, 'Student Grade');
  // await page.waitForTimeout(delayBetweenActions);

  // 4. Select skill grade (multiselect)
  // TEMPORARILY DISABLED - may be filtering out recent data
  // await selectMultiselectOption(page, SELECTORS.SKILL_GRADE_TRIGGER, config.filters.skillGrade, 'Skill Grade');
  // await page.waitForTimeout(delayBetweenActions);

  console.log('✅ All filters applied (Student Grade and Skill Grade filters temporarily disabled)');

  // Wait for table to load with filtered data
  await page.waitForTimeout(2000);
}

/**
 * Export CSV and return parsed data
 */
async function exportAndParseCSV(
  page: Page,
  downloadPath: string
): Promise<AssessmentRow[]> {
  console.log('📥 Clicking Export Data Table button...');

  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await page.click(SELECTORS.EXPORT_BUTTON);

  const download = await downloadPromise;
  const downloadFilePath = path.join(downloadPath, download.suggestedFilename());
  await download.saveAs(downloadFilePath);

  console.log(`✅ CSV downloaded: ${downloadFilePath}`);

  // Read and parse the CSV
  console.log('📊 Parsing CSV data...');
  const csvContent = await fs.readFile(downloadFilePath, 'utf-8');
  const assessmentData = parseAssessmentCSV(csvContent);

  console.log(`✅ Parsed ${assessmentData.length} assessment rows`);

  // Delete the CSV file to free up space
  await fs.unlink(downloadFilePath);

  return assessmentData;
}

/**
 * Batch scrape multiple configurations with single login
 */
export async function scrapeAssessmentHistoryBatch(configs: AssessmentScraperConfig[]) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();
  let downloadPath: string | null = null;

  const results: AssessmentScraperResponse[] = [];
  const errors: string[] = [];

  try {
    if (configs.length === 0) {
      throw new Error('No configurations provided');
    }

    console.log(`🚀 Starting batch assessment scraping for ${configs.length} configuration(s)...`);

    // Create temporary download directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'assessment-export-batch-'));
    downloadPath = tempDir;
    console.log(`📁 Download directory: ${downloadPath}`);

    // Initialize browser
    // Run headless in production, non-headless in local development
    const isProduction = process.env.NODE_ENV === 'production';
    browser = await chromium.launch({
      headless: isProduction,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 1000 },
      acceptDownloads: true
    });

    page = await context.newPage();

    // Perform authentication ONCE
    console.log('🔐 Performing authentication...');
    const authResult = await authenticateRoadmaps(page, configs[0].credentials);

    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    console.log('✅ Authentication successful');

    // Process each configuration
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const configStartTime = new Date().toISOString();

      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 Configuration ${i + 1}/${configs.length}`);
        console.log(`   Classes: ${config.filters.classes.join(', ')}`);
        console.log(`   Roadmap: ${config.filters.roadmap}`);
        console.log(`   Student Grade: ${config.filters.studentGrade}`);
        console.log(`   Skill Grade: ${config.filters.skillGrade}`);
        console.log(`${'='.repeat(60)}\n`);

        // Apply filters
        await applyFilters(page, config, config.delayBetweenActions);

        // Export and parse CSV
        const assessmentData = await exportAndParseCSV(page, downloadPath);

        // Calculate statistics
        const uniqueStudents = new Set(assessmentData.map(row => row.name));
        const uniqueSkills = new Set(assessmentData.map(row => row.skillNumber));

        const configEndTime = new Date().toISOString();
        const duration = `${Math.round((new Date(configEndTime).getTime() - new Date(configStartTime).getTime()) / 1000)}s`;

        console.log('📊 Configuration Results:');
        console.log(`   📝 Total Rows: ${assessmentData.length}`);
        console.log(`   👥 Students: ${uniqueStudents.size}`);
        console.log(`   🎯 Skills: ${uniqueSkills.size}`);
        console.log(`   ⏱️ Duration: ${duration}`);

        results.push({
          success: true,
          totalRows: assessmentData.length,
          studentsProcessed: uniqueStudents.size,
          skillsProcessed: uniqueSkills.size,
          assessmentData,
          errors: [],
          startTime: configStartTime,
          endTime: configEndTime,
          duration
        });

      } catch (configError) {
        const errorMsg = `Configuration ${i + 1} failed: ${configError instanceof Error ? configError.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);

        results.push({
          success: false,
          totalRows: 0,
          studentsProcessed: 0,
          skillsProcessed: 0,
          assessmentData: [],
          errors: [errorMsg],
          startTime: configStartTime,
          endTime: new Date().toISOString(),
          duration: '0s'
        });
      }
    }

    const endTime = new Date().toISOString();
    const totalDuration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.log('\n' + '='.repeat(60));
    console.log('✅ Batch scraping complete');
    console.log(`   📊 Total configurations: ${configs.length}`);
    console.log(`   ✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${results.filter(r => !r.success).length}`);
    console.log(`   ⏱️ Total duration: ${totalDuration}`);
    console.log('='.repeat(60));

    return {
      success: true,
      data: {
        results,
        totalConfigs: configs.length,
        successfulConfigs: results.filter(r => r.success).length,
        failedConfigs: results.filter(r => !r.success).length,
        errors,
        startTime,
        endTime,
        duration: totalDuration
      }
    };

  } catch (error) {
    console.error('💥 Error in scrapeAssessmentHistoryBatch:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'scrapeAssessmentHistoryBatch')
    };
  } finally {
    // Clean up resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log('🧹 Browser resources cleaned up');

      // Clean up download directory
      if (downloadPath) {
        await fs.rm(downloadPath, { recursive: true, force: true });
        console.log('🧹 Temporary files cleaned up');
      }
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError);
    }
  }
}
