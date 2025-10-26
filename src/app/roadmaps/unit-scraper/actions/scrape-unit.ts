"use server";

import { z } from "zod";
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import {
  UnitScrapingRequestSchema,
  UnitScrapingResponseSchema,
  type UnitScrapingResponse
} from '../lib/types';
import { authenticateRoadmaps } from '../../shared/lib/roadmaps-auth';
import { extractUnitData } from '../lib/unit-extractor';
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

/**
 * Server action to scrape a Teach to One Roadmaps unit page
 */
export async function scrapeRoadmapsUnit(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = UnitScrapingRequestSchema.parse(request);
    const { credentials, unitUrl, delayBetweenRequests } = validatedRequest;

    console.log('🚀 Starting Roadmaps unit scraping...');
    console.log(`📊 Unit URL: ${unitUrl}`);

    // Initialize browser
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // Perform authentication
    console.log('🔐 Performing authentication...');
    const authResult = await authenticateRoadmaps(page, credentials);

    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    console.log('✅ Authentication successful, navigating to unit page...');

    // Navigate to the unit page
    await page.goto(unitUrl, { waitUntil: 'networkidle' });
    console.log('✅ Unit page loaded');

    // Wait for the accordion to be present
    await page.waitForSelector('#pr_id_178', { timeout: 10000 });

    // Add delay before extraction
    if (delayBetweenRequests) {
      console.log(`⏳ Waiting ${delayBetweenRequests}ms before extraction...`);
      await page.waitForTimeout(delayBetweenRequests);
    }

    // Extract unit data
    const unitData = await extractUnitData(page, unitUrl);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.log('📊 Scraping Results:');
    console.log(`   ✅ Unit: ${unitData.unitTitle}`);
    console.log(`   ⏱️  Duration: ${duration}`);

    const response: UnitScrapingResponse = {
      success: true,
      unitData,
      startTime,
      endTime,
      duration
    };

    // Validate response structure
    const validatedResponse = UnitScrapingResponseSchema.parse(response);

    return {
      success: true,
      data: validatedResponse
    };

  } catch (error) {
    console.error('💥 Error in scrapeRoadmapsUnit:', error);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'scrapeRoadmapsUnit'),
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime,
        endTime,
        duration
      }
    };
  } finally {
    // Always clean up resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log('🧹 Browser resources cleaned up');
    } catch (cleanupError) {
      console.error('⚠️  Error during cleanup:', cleanupError);
    }
  }
}

/**
 * Debug version that keeps browser open
 */
export async function scrapeRoadmapsUnitDebug(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();

  try {
    const validatedRequest = UnitScrapingRequestSchema.parse(request);
    const { credentials, unitUrl } = validatedRequest;

    console.log('🚀 Starting DEBUG Roadmaps unit scraping...');

    // Initialize browser in DEBUG MODE (visible, stays open)
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // Perform authentication
    console.log('🔍 Debug mode: Performing authentication...');
    const authResult = await authenticateRoadmaps(page, credentials);
    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    console.log('✅ Debug authentication successful');

    // Navigate to unit page
    await page.goto(unitUrl, { waitUntil: 'networkidle' });
    console.log('✅ Unit page loaded in debug mode');

    // Wait for accordion
    await page.waitForSelector('#pr_id_178', { timeout: 10000 });

    // Extract data
    const unitData = await extractUnitData(page, unitUrl);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.log('📊 Debug Results:');
    console.log(`   ✅ Unit: ${unitData.unitTitle}`);
    console.log(`   ⏱️  Duration: ${duration}`);

    const response: UnitScrapingResponse = {
      success: true,
      unitData,
      startTime,
      endTime,
      duration
    };

    const validatedResponse = UnitScrapingResponseSchema.parse(response);

    console.log('🎯 Debug session complete. Browser window will stay open for inspection.');
    console.log('⚠️  Manually close the browser window when done debugging.');

    return {
      success: true,
      data: validatedResponse
    };

  } catch (error) {
    console.error('💥 Error in debug scraping:', error);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'scrapeRoadmapsUnitDebug'),
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime,
        endTime,
        duration
      }
    };
  } finally {
    // For debugging, don't automatically close
    console.log('⏸️  Browser staying open for inspection...');
    console.log('💡 Manually close the browser window when done debugging.');
  }
}
