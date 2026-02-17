"use server";

import { z } from "zod";
import { IMCredentialsZodSchema } from "../lib/types";
import { IMScreenshotScraper } from "../lib/im-screenshot-scraper";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

/**
 * Schema for screenshot scraping request
 */
const ScreenshotScrapingRequestSchema = z.object({
  credentials: IMCredentialsZodSchema,
  lessonUrls: z.array(z.string().url()).min(1, "At least one URL is required"),
  delayBetweenRequests: z.number().min(0).default(2000),
});

/**
 * Schema for individual screenshot result
 */
const ScreenshotResultSchema = z.object({
  url: z.string(),
  success: z.boolean(),
  screenshotPath: z.string().optional(),
  error: z.string().optional(),
  scrapedAt: z.string(),
});

/**
 * Schema for screenshot scraping response
 */
const ScreenshotScrapingResponseSchema = z.object({
  success: z.boolean(),
  totalRequested: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  results: z.array(ScreenshotResultSchema),
  errors: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string(),
});

export type ScreenshotScrapingRequest = z.infer<
  typeof ScreenshotScrapingRequestSchema
>;
export type ScreenshotResult = z.infer<typeof ScreenshotResultSchema>;
export type ScreenshotScrapingResponse = z.infer<
  typeof ScreenshotScrapingResponseSchema
>;

/**
 * Server action to screenshot Student Task Statement sections from provided URLs
 */
export async function screenshotStudentTasks(request: unknown) {
  let scraper: IMScreenshotScraper | null = null;
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = ScreenshotScrapingRequestSchema.parse(request);
    const { credentials, lessonUrls, delayBetweenRequests } = validatedRequest;

    console.log(
      "📸 Starting screenshot scraping for Student Task Statements...",
    );
    console.log(`   URLs: ${lessonUrls.length}`);

    // Initialize scraper
    scraper = new IMScreenshotScraper();
    await scraper.initialize();
    scraper.setCredentials(credentials);
    console.log("✅ Screenshot scraper initialized");

    // Start screenshotting
    const results = await scraper.screenshotPages(
      lessonUrls,
      delayBetweenRequests,
    );

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    // Count successful and failed screenshots
    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    console.log("📊 Screenshot Results:");
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);

    const response: ScreenshotScrapingResponse = {
      success: true,
      totalRequested: lessonUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      results,
      errors: failed.map((result) => result.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration,
    };

    // Validate response structure
    const validatedResponse = ScreenshotScrapingResponseSchema.parse(response);

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.error("Error in screenshotStudentTasks:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "screenshotStudentTasks"),
    };
  } finally {
    // Always clean up the scraper
    if (scraper) {
      try {
        await scraper.close();
      } catch (closeError) {
        console.error("Error closing scraper:", closeError);
      }
    }
  }
}

/**
 * Debug version that runs with visible browser
 */
export async function screenshotStudentTasksDebug(request: unknown) {
  let scraper: IMScreenshotScraper | null = null;
  const startTime = new Date().toISOString();

  try {
    const validatedRequest = ScreenshotScrapingRequestSchema.parse(request);
    const { credentials, lessonUrls, delayBetweenRequests } = validatedRequest;

    console.log("🐛 Starting DEBUG screenshot scraping...");

    // Initialize scraper in DEBUG MODE
    scraper = new IMScreenshotScraper();
    await scraper.initialize(true);
    scraper.setCredentials(credentials);

    // Limit to first 2 URLs for debugging
    const debugUrls = lessonUrls.slice(0, 2);
    console.log("🔍 Testing URLs:", debugUrls);

    const results = await scraper.screenshotPages(
      debugUrls,
      delayBetweenRequests,
    );

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    console.log("📊 Debug Results:");
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);

    const response: ScreenshotScrapingResponse = {
      success: true,
      totalRequested: debugUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      results,
      errors: failed.map((result) => result.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration,
    };

    const validatedResponse = ScreenshotScrapingResponseSchema.parse(response);

    console.log("🎯 Debug session complete. Browser window will stay open.");

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    console.error("💥 Error in debug screenshot scraping:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "screenshotStudentTasksDebug"),
    };
  } finally {
    console.log("⏸️  Browser staying open for inspection...");
  }
}
