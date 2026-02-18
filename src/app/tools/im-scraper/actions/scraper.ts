"use server";

import { z } from "zod";
import {
  IMCredentialsZodSchema,
  IMScrapingRequestZodSchema,
  IMUrlGenerationZodSchema,
  IMScrapingResponseZodSchema,
  type IMScrapingResponse,
} from "../lib/types";
import {
  IMScraper,
  generateIMUrls as generateUrlsUtil,
} from "../lib/im-scraper";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

/**
 * Server action to scrape IM cooldowns from provided URLs
 * Follows the schools action pattern with proper error handling
 */
export async function scrapeIMCooldowns(request: unknown) {
  let scraper: IMScraper | null = null;
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = IMScrapingRequestZodSchema.parse(request);
    const {
      credentials,
      lessonUrls,
      delayBetweenRequests,
      enableClaudeExport,
    } = validatedRequest;

    console.log("🚀 Starting scraping with per-page authentication...");

    // Initialize scraper
    scraper = new IMScraper();
    await scraper.initialize();

    // REMOVED: No initial authentication step
    // Set credentials for per-page use
    scraper.setCredentials(credentials);
    console.log("✅ Scraper initialized, credentials stored for per-page auth");

    // Start scraping immediately (authentication happens per-page)
    const lessons = await scraper.scrapeLessons(
      lessonUrls,
      delayBetweenRequests,
      false,
      enableClaudeExport,
    );

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    // Count successful and failed scrapes
    const successful = lessons.filter((lesson) => lesson.success);
    const failed = lessons.filter((lesson) => !lesson.success);

    console.log("📊 Scraping Results:");
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);

    const response: IMScrapingResponse = {
      success: true,
      totalRequested: lessonUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      lessons,
      errors: failed.map((lesson) => lesson.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration,
    };

    // Validate response structure
    const validatedResponse = IMScrapingResponseZodSchema.parse(response);

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.error("Error in scrapeIMCooldowns:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "scrapeIMCooldowns"),
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
 * Server action to generate IM lesson URLs based on grade and unit range
 * Follows the schools action pattern with proper validation
 */
export async function generateIMUrls(params: unknown) {
  try {
    // Validate parameters
    const validated = IMUrlGenerationZodSchema.parse(params);
    const { grade, startUnit, endUnit, sectionLessons, delayBetweenRequests } =
      validated;

    // Use the updated utility function
    const urls = generateUrlsUtil(grade, startUnit, endUnit, sectionLessons);

    return {
      success: true,
      data: {
        urls,
        totalUrls: urls.length,
        parameters: {
          grade,
          startUnit,
          endUnit,
          sectionLessons,
          delayBetweenRequests,
        },
      },
    };
  } catch (error) {
    console.error("Error in generateIMUrls:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "generateIMUrls"),
    };
  }
}

/**
 * Server action to validate IM credentials without performing full scraping
 * Useful for testing authentication before starting a large scraping job
 */
export async function validateIMCredentials(credentials: unknown) {
  let scraper: IMScraper | null = null;

  try {
    // Validate credentials
    const validatedCredentials = IMCredentialsZodSchema.parse(credentials);

    console.log("🧪 Testing credentials with per-page authentication...");

    // Test credentials by trying to access a single lesson
    scraper = new IMScraper();
    await scraper.initialize();
    scraper.setCredentials(validatedCredentials);

    // Test with a known lesson that has cooldown content
    const testUrl =
      "https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1?a=teacher";
    console.log("🎯 Testing URL:", testUrl);

    const lessons = await scraper.scrapeLessons([testUrl]);
    const testResult = lessons[0];

    // Check if per-page authentication worked
    const isValid =
      testResult.success && !testResult.error?.includes("authenticate");

    console.log("📊 Validation Result:");
    console.log(`   ✅ Success: ${testResult.success}`);
    console.log(`   📄 Has Content: ${!!testResult.cooldown}`);
    console.log(`   ❌ Error: ${testResult.error || "None"}`);

    return {
      success: true,
      data: {
        authenticated: isValid,
        message: isValid
          ? "Credentials are valid - per-page authentication successful"
          : `Credential validation failed: ${testResult.error || "Unable to access content"}`,
      },
    };
  } catch (error) {
    console.error("Error in validateIMCredentials:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "validateIMCredentials"),
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
 * Debug version of scraper that runs with visible browser
 * Use this to troubleshoot content extraction issues
 */
export async function scrapeIMCooldownsDebug(request: unknown) {
  let scraper: IMScraper | null = null;
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = IMScrapingRequestZodSchema.parse(request);
    const {
      credentials,
      lessonUrls,
      delayBetweenRequests,
      enableClaudeExport,
    } = validatedRequest;

    console.log("🚀 Starting DEBUG scraping with per-page authentication...");
    console.log("📝 URLs to test:", lessonUrls.length);

    // Initialize scraper in DEBUG MODE
    scraper = new IMScraper();
    await scraper.initialize(true); // <-- Enable debug mode

    // REMOVED: No initial authentication
    // Store credentials for per-page auth
    scraper.setCredentials(credentials);
    console.log("✅ Debug scraper initialized, ready for per-page auth");

    // Limit to first 2 URLs for debugging
    const debugUrls = lessonUrls.slice(0, 2);
    console.log("🔍 Testing URLs:", debugUrls);

    // Start scraping (authentication happens per-page)
    const lessons = await scraper.scrapeLessons(
      debugUrls,
      delayBetweenRequests,
      true,
      enableClaudeExport,
    );

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    // Count successful and failed scrapes
    const successful = lessons.filter((lesson) => lesson.success);
    const failed = lessons.filter((lesson) => !lesson.success);

    console.log("📊 Debug Results:");
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏱️ Duration: ${duration}`);

    const response: IMScrapingResponse = {
      success: true,
      totalRequested: debugUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      lessons,
      errors: failed.map((lesson) => lesson.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration,
    };

    // Validate response structure
    const validatedResponse = IMScrapingResponseZodSchema.parse(response);

    console.log(
      "🎯 Debug session complete. Check browser window and console logs.",
    );
    console.log("⚠️  Browser window will stay open for inspection.");

    return {
      success: true,
      data: validatedResponse,
    };
  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.error("💥 Error in debug scraping:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "scrapeIMCooldownsDebug"),
    };
  } finally {
    // For debugging, don't automatically close the browser
    console.log("⏸️  Browser staying open for inspection...");
    console.log("💡 Manually close the browser window when done debugging.");

    // Uncomment this line when you're done debugging:
    // if (scraper) {
    //   try {
    //     await scraper.close();
    //   } catch (closeError) {
    //     console.error('Error closing scraper:', closeError);
    //   }
    // }
  }
}

/**
 * Server action to test scraping a single URL
 * Useful for testing before running bulk operations
 */
export async function testSingleURL(request: unknown) {
  let scraper: IMScraper | null = null;

  try {
    // Validate that we have credentials and a single URL
    const testSchema = z.object({
      credentials: IMCredentialsZodSchema,
      url: z.string().url(),
    });

    const { credentials, url } = testSchema.parse(request);

    // Initialize scraper
    scraper = new IMScraper();
    await scraper.initialize();

    // Set credentials
    scraper.setCredentials(credentials);

    // Scrape single lesson
    const lessons = await scraper.scrapeLessons([url]);
    const lesson = lessons[0];

    return {
      success: true,
      data: {
        lesson,
        hasContent: Boolean(lesson.cooldown),
        contentSections: lesson.cooldown
          ? Object.keys(lesson.cooldown).length
          : 0,
      },
    };
  } catch (error) {
    console.error("Error in testSingleURL:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, "testSingleURL"),
    };
  } finally {
    if (scraper) {
      try {
        await scraper.close();
      } catch (closeError) {
        console.error("Error closing scraper:", closeError);
      }
    }
  }
}
