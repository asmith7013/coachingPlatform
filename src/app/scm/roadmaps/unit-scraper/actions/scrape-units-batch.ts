"use server";

import { z } from "zod";
import { chromium, Browser, BrowserContext, Page } from "playwright";
import {
  UnitScrapingRequestSchema,
  UnitScrapingResponseSchema,
  type UnitScrapingResponse,
  type UnitData,
} from "../lib/types";
import { authenticateRoadmaps } from "../../shared/lib/roadmaps-auth";
import { extractUnitData } from "../lib/unit-extractor";
import {
  navigateToUnitsPage,
  selectRoadmap,
  getAvailableUnits,
  selectUnit,
} from "../lib/dropdown-navigator";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

/**
 * Server action to scrape all units for a specific roadmap
 */
export async function scrapeRoadmapUnits(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = UnitScrapingRequestSchema.parse(request);
    const { credentials, roadmap, delayBetweenRequests, delayBetweenUnits } =
      validatedRequest;

    console.log("🚀 Starting Roadmaps batch unit scraping...");
    console.log(`📊 Roadmap: ${roadmap}`);

    // Initialize browser
    browser = await chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    page = await context.newPage();

    // Perform authentication
    console.log("🔐 Performing authentication...");
    const authResult = await authenticateRoadmaps(page, credentials);

    if (!authResult.success) {
      throw new Error(authResult.error || "Authentication failed");
    }

    console.log("✅ Authentication successful");

    // Navigate to units page
    await navigateToUnitsPage(page);

    // Wait before interacting with dropdowns
    if (delayBetweenRequests) {
      await page.waitForTimeout(delayBetweenRequests);
    }

    // Select the roadmap
    await selectRoadmap(page, roadmap);

    // Wait for unit dropdown to populate
    await page.waitForTimeout(1000);

    // Get list of all available units
    const unitNames = await getAvailableUnits(page);
    console.log(`\n📚 Found ${unitNames.length} units to scrape:`);
    unitNames.forEach((name, i) => console.log(`   ${i + 1}. ${name}`));

    // Scrape each unit
    const units: UnitData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < unitNames.length; i++) {
      const unitName = unitNames[i];
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(
        `📖 Processing unit ${i + 1}/${unitNames.length}: ${unitName}`,
      );
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      try {
        // Select the unit
        await selectUnit(page, unitName);

        // Wait for content to stabilize
        if (delayBetweenRequests) {
          await page.waitForTimeout(delayBetweenRequests);
        }

        // Extract unit data (pass the unit name from dropdown which includes the number)
        const currentUrl = page.url();
        const unitData = await extractUnitData(page, currentUrl, unitName);

        units.push(unitData);

        console.log(`✅ Successfully scraped: ${unitData.unitTitle}`);
        console.log(`   Target Skills: ${unitData.targetSkills.length}`);
        console.log(
          `   Support Skills: ${unitData.additionalSupportSkills.length}`,
        );
        console.log(`   Extension Skills: ${unitData.extensionSkills.length}`);
      } catch (unitError) {
        const errorMsg = `Failed to scrape unit "${unitName}": ${unitError instanceof Error ? unitError.message : "Unknown error"}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);

        // Add failed unit placeholder
        units.push({
          unitTitle: unitName,
          url: page.url(),
          targetCount: 0,
          supportCount: 0,
          extensionCount: 0,
          targetSkills: [],
          additionalSupportSkills: [],
          extensionSkills: [],
          scrapedAt: new Date().toISOString(),
          success: false,
          error:
            unitError instanceof Error ? unitError.message : "Unknown error",
        });
      }

      // Wait between units (except after the last one)
      if (i < unitNames.length - 1 && delayBetweenUnits) {
        console.log(`⏳ Waiting ${delayBetweenUnits}ms before next unit...`);
        await page.waitForTimeout(delayBetweenUnits);
      }
    }

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    const successfulUnits = units.filter((u) => u.success);
    const failedUnits = units.filter((u) => !u.success);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Batch Scraping Results:");
    console.log(`   Roadmap: ${roadmap}`);
    console.log(`   ✅ Successful: ${successfulUnits.length}`);
    console.log(`   ❌ Failed: ${failedUnits.length}`);
    console.log(`   ⏱️  Duration: ${duration}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const response: UnitScrapingResponse = {
      success: true,
      roadmap,
      totalUnits: unitNames.length,
      successfulUnits: successfulUnits.length,
      failedUnits: failedUnits.length,
      units,
      errors,
      startTime,
      endTime,
      duration,
    };

    // Validate response structure
    const validatedResponse = UnitScrapingResponseSchema.parse(response);

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    console.error("💥 Error in scrapeRoadmapUnits:", error);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "scrapeRoadmapUnits"),
      data: {
        success: false,
        roadmap: "",
        totalUnits: 0,
        successfulUnits: 0,
        failedUnits: 0,
        units: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
        startTime,
        endTime,
        duration,
      },
    };
  } finally {
    // Always clean up resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log("🧹 Browser resources cleaned up");
    } catch (cleanupError) {
      console.error("⚠️  Error during cleanup:", cleanupError);
    }
  }
}

/**
 * Debug version that keeps browser open
 */
export async function scrapeRoadmapUnitsDebug(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();

  try {
    const validatedRequest = UnitScrapingRequestSchema.parse(request);
    const { credentials, roadmap, delayBetweenRequests } = validatedRequest;

    console.log("🚀 Starting DEBUG Roadmaps batch unit scraping...");
    console.log(`📊 Roadmap: ${roadmap}`);
    console.log("⚠️  Debug mode: Will scrape only first 2 units");

    // Initialize browser in DEBUG MODE (visible, stays open)
    browser = await chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    page = await context.newPage();

    // Perform authentication
    console.log("🔍 Debug mode: Performing authentication...");
    const authResult = await authenticateRoadmaps(page, credentials);
    if (!authResult.success) {
      throw new Error(authResult.error || "Authentication failed");
    }

    console.log("✅ Debug authentication successful");

    // Navigate to units page
    await navigateToUnitsPage(page);

    if (delayBetweenRequests) {
      await page.waitForTimeout(delayBetweenRequests);
    }

    // Select the roadmap
    await selectRoadmap(page, roadmap);
    await page.waitForTimeout(1000);

    // Get list of units
    const unitNames = await getAvailableUnits(page);
    console.log(
      `\n📚 Found ${unitNames.length} units (will scrape first 2 for debug)`,
    );

    // Limit to first 2 units for debugging
    const debugUnits = unitNames.slice(0, 2);
    const units: UnitData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < debugUnits.length; i++) {
      const unitName = debugUnits[i];
      console.log(`\n🔍 Debug: Processing unit ${i + 1}/2: ${unitName}`);

      try {
        await selectUnit(page, unitName);
        if (delayBetweenRequests) {
          await page.waitForTimeout(delayBetweenRequests);
        }

        const currentUrl = page.url();
        const unitData = await extractUnitData(page, currentUrl, unitName);
        units.push(unitData);

        console.log(`✅ Successfully scraped: ${unitData.unitTitle}`);
        console.log(
          `   📝 Unit has ${unitData.targetSkills.length} target skills with nested prerequisites`,
        );
      } catch (unitError) {
        const errorMsg = `Failed to scrape unit "${unitName}": ${unitError instanceof Error ? unitError.message : "Unknown error"}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }

      // Longer delay for debug observation
      if (i < debugUnits.length - 1) {
        await page.waitForTimeout(3000);
      }
    }

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    const response: UnitScrapingResponse = {
      success: true,
      roadmap,
      totalUnits: debugUnits.length,
      successfulUnits: units.filter((u) => u.success).length,
      failedUnits: units.filter((u) => !u.success).length,
      units,
      errors,
      startTime,
      endTime,
      duration,
    };

    const validatedResponse = UnitScrapingResponseSchema.parse(response);

    console.log(
      "\n🎯 Debug session complete. Browser window will stay open for inspection.",
    );
    console.log("⚠️  Manually close the browser window when done debugging.");

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    console.error("💥 Error in debug scraping:", error);

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "scrapeRoadmapUnitsDebug"),
      data: {
        success: false,
        roadmap: "",
        totalUnits: 0,
        successfulUnits: 0,
        failedUnits: 0,
        units: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
        startTime,
        endTime,
        duration,
      },
    };
  } finally {
    // For debugging, don't automatically close
    console.log("⏸️  Browser staying open for inspection...");
    console.log("💡 Manually close the browser window when done debugging.");
  }
}
