"use server";

import { z } from "zod";
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import {
  AssessmentScraperConfigZod,
  AssessmentScraperResponseZod,
  type AssessmentScraperResponse
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
 * Selectors for the assessment history page based on the HTML
 */
const SELECTORS = {
  // Multiselect for classes
  CLASS_MULTISELECT: '#class',
  CLASS_TRIGGER: '#class .p-multiselect-trigger',
  CLASS_PANEL: '.p-multiselect-panel',
  CLASS_ITEMS: '.p-multiselect-items .p-multiselect-item',

  // Dropdown for roadmap
  ROADMAP_DROPDOWN: '#roadmap',
  ROADMAP_TRIGGER: '#roadmap .p-dropdown-trigger',
  ROADMAP_PANEL: '.p-dropdown-panel',
  ROADMAP_ITEMS: '.p-dropdown-items .p-dropdown-item',

  // Multiselect for student grade (has wrong id="site", use label-based selector)
  STUDENT_GRADE_MULTISELECT: 'label:has-text("Student Grade") + div.p-multiselect',
  STUDENT_GRADE_TRIGGER: 'label:has-text("Student Grade") + div.p-multiselect .p-multiselect-trigger',

  // Multiselect for skill grade (also has wrong id="site")
  SKILL_GRADE_MULTISELECT: 'label:has-text("Skill Grade") + div.p-multiselect',
  SKILL_GRADE_TRIGGER: 'label:has-text("Skill Grade") + div.p-multiselect .p-multiselect-trigger',

  // Export button
  EXPORT_BUTTON: 'button:has-text("Export Data Table")',
};

/**
 * Select a class from the multiselect dropdown
 */
async function selectClass(page: Page, className: string): Promise<void> {
  console.log(`📋 Selecting class: ${className}`);

  // Click the trigger to open dropdown
  await page.click(SELECTORS.CLASS_TRIGGER);
  await page.waitForSelector(SELECTORS.CLASS_PANEL, { timeout: 5000 });
  await page.waitForTimeout(500);

  // Find and click the specific class - look for span text inside the li
  const items = await page.locator(SELECTORS.CLASS_ITEMS).all();
  let found = false;

  for (const item of items) {
    // Get the text from the span element inside the li
    const spanText = await item.locator('span').textContent();
    if (spanText?.trim() === className) {
      await item.click();
      found = true;
      console.log(`  ✅ Class "${className}" selected`);
      break;
    }
  }

  if (!found) {
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
 * Select from a multiselect (similar to selectClass but generic)
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

  // Find and click the specific option - look for span text inside the li
  const items = await page.locator('.p-multiselect-items .p-multiselect-item').all();
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
 * Server action to scrape assessment history and export CSV
 */
export async function scrapeAssessmentHistory(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();
  let downloadPath: string | null = null;

  try {
    // Validate request data
    const validatedRequest = AssessmentScraperConfigZod.parse(request);
    const { credentials, filters, delayBetweenActions } = validatedRequest;

    console.log('🚀 Starting Assessment History scraping...');
    console.log(`📊 Filters:`, filters);

    // Create temporary download directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'assessment-export-'));
    downloadPath = tempDir;
    console.log(`📁 Download directory: ${downloadPath}`);

    // Initialize browser
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 1000 },
      acceptDownloads: true
    });

    page = await context.newPage();

    // Perform authentication
    console.log('🔐 Performing authentication...');
    const authResult = await authenticateRoadmaps(page, credentials);

    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    console.log('✅ Authentication successful');

    // Navigate to assessment history page
    console.log(`🌐 Navigating to: ${ASSESSMENT_HISTORY_URL}`);
    await page.goto(ASSESSMENT_HISTORY_URL, { waitUntil: 'networkidle' });
    console.log('✅ Assessment history page loaded');

    await page.waitForTimeout(delayBetweenActions);

    // Apply filters
    console.log('🎯 Applying filters...');

    // 1. Select classes
    for (const className of filters.classes) {
      await selectClass(page, className);
      await page.waitForTimeout(delayBetweenActions);
    }

    // 2. Select roadmap
    await selectDropdownOption(page, SELECTORS.ROADMAP_TRIGGER, filters.roadmap, 'Roadmap');
    await page.waitForTimeout(delayBetweenActions);

    // 3. Select student grade (multiselect)
    // TEMPORARILY DISABLED - may be filtering out recent data
    // await selectMultiselectOption(page, SELECTORS.STUDENT_GRADE_TRIGGER, filters.studentGrade, 'Student Grade');
    // await page.waitForTimeout(delayBetweenActions);

    // 4. Select skill grade (multiselect)
    // TEMPORARILY DISABLED - may be filtering out recent data
    // await selectMultiselectOption(page, SELECTORS.SKILL_GRADE_TRIGGER, filters.skillGrade, 'Skill Grade');
    // await page.waitForTimeout(delayBetweenActions);

    console.log('✅ All filters applied (Student Grade and Skill Grade filters temporarily disabled)');

    // Wait for table to load with filtered data
    await page.waitForTimeout(2000);

    // Click export button and wait for download
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

    // Calculate statistics
    const uniqueStudents = new Set(assessmentData.map(row => row.name));
    const uniqueSkills = new Set(assessmentData.map(row => row.skillNumber));

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.log('📊 Scraping Results:');
    console.log(`   📝 Total Rows: ${assessmentData.length}`);
    console.log(`   👥 Students: ${uniqueStudents.size}`);
    console.log(`   🎯 Skills: ${uniqueSkills.size}`);
    console.log(`   ⏱️ Duration: ${duration}`);

    const response: AssessmentScraperResponse = {
      success: true,
      totalRows: assessmentData.length,
      studentsProcessed: uniqueStudents.size,
      skillsProcessed: uniqueSkills.size,
      assessmentData,
      errors: [],
      startTime,
      endTime,
      duration
    };

    // Validate response structure
    const validatedResponse = AssessmentScraperResponseZod.parse(response);

    return {
      success: true,
      data: validatedResponse
    };

  } catch (error) {
    console.error('💥 Error in scrapeAssessmentHistory:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'scrapeAssessmentHistory')
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
