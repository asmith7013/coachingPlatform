"use server";

import { z } from "zod";
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import {
  RoadmapsScrapingRequestZodSchema,
  RoadmapsScrapingResponseZodSchema,
  type RoadmapsScrapingResponse,
  type SkillData
} from '../lib/types';
import { authenticateRoadmaps } from '../lib/roadmaps-auth';
import { extractSkillData } from '../lib/skill-extractor';
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { updateRoadmapsSkillContent } from "@actions/313/roadmaps-skills";

/**
 * Server action to scrape Teach to One Roadmaps skills from provided URLs
 * Follows the exact pattern from IM scraper with proper error handling
 */
export async function scrapeRoadmapsSkills(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();
  
  try {
    // Validate request data
    const validatedRequest = RoadmapsScrapingRequestZodSchema.parse(request);
    const { credentials, skillUrls, delayBetweenRequests } = validatedRequest;
    
    console.log('🚀 Starting Roadmaps skill scraping...');
    console.log(`📊 Total URLs to scrape: ${skillUrls.length}`);
    
    // Initialize browser
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Perform authentication first (this will navigate to login page internally)
    console.log('🔐 Performing authentication...');
    const authResult = await authenticateRoadmaps(page, credentials);
    
    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }
    
    console.log('✅ Authentication successful, ready to scrape skills');
    
    // Start scraping skills
    const skills: SkillData[] = [];
    
    for (let i = 0; i < skillUrls.length; i++) {
      const url = skillUrls[i];
      console.log(`📖 Processing skill ${i + 1}/${skillUrls.length}: ${url}`);
      
      try {
        const skillData = await extractSkillData(page, url);
        console.log(`🔍 [SCRAPER] Received skill data with ${skillData.practiceProblems?.length || 0} practice problems`);
        skills.push(skillData);

        if (skillData.success) {
          console.log(`✅ Successfully scraped: ${skillData.title}`);

          // Immediately save to MongoDB
          console.log(`💾 Saving skill ${skillData.skillNumber} to database...`);
          const saveResult = await updateRoadmapsSkillContent(skillData as Parameters<typeof updateRoadmapsSkillContent>[0]);

          if (saveResult.success) {
            console.log(`✅ Skill ${skillData.skillNumber} saved to database`);
          } else {
            console.error(`❌ Failed to save skill ${skillData.skillNumber}: ${saveResult.error}`);
          }
        } else {
          console.log(`❌ Failed to scrape: ${url} - ${skillData.error}`);
        }

        // Add delay between requests to be respectful
        if (i < skillUrls.length - 1) {
          console.log(`⏳ Waiting ${delayBetweenRequests}ms before next request...`);
          await page.waitForTimeout(delayBetweenRequests);
        }

      } catch (skillError) {
        console.error(`💥 Error processing skill ${url}:`, skillError);

        // Add failed skill to results
        skills.push({
          title: '',
          url,
          skillNumber: '',
          suggestedTargetSkills: [],
          essentialSkills: [],
          helpfulSkills: [],
          units: [],
          imLessons: [],
          description: '',
          skillChallengeCriteria: '',
          essentialQuestion: '',
          launch: '',
          teacherStudentStrategies: '',
          modelsAndManipulatives: '',
          questionsToHelp: '',
          discussionQuestions: '',
          commonMisconceptions: '',
          additionalResources: '',
          standards: '',
          vocabulary: [],
          images: [],
          imagesWithContext: [],
          videoUrl: '',
          practiceProblems: [],
          scrapedAt: new Date().toISOString(),
          success: false,
          error: skillError instanceof Error ? skillError.message : 'Unknown error',
          tags: []
        });
      }
    }

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;
    
    // Count successful and failed scrapes
    const successful = skills.filter(skill => skill.success);
    const failed = skills.filter(skill => !skill.success);
    
    console.log('📊 Scraping Results:');
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏱️ Duration: ${duration}`);
    
    const totalPracticeProblems = skills.reduce((sum, skill) => sum + (skill.practiceProblems?.length || 0), 0);
    console.log(`🔍 [SCRAPER] Total practice problems across all skills: ${totalPracticeProblems}`);

    const response: RoadmapsScrapingResponse = {
      success: true,
      totalRequested: skillUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      skills,
      errors: failed.map(skill => skill.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration
    };

    console.log(`🔍 [SCRAPER] Response contains ${response.skills.length} skills`);
    response.skills.forEach((skill, idx) => {
      console.log(`🔍 [SCRAPER] Skill ${idx + 1}: ${skill.skillNumber} - ${skill.practiceProblems?.length || 0} practice problems`);
    });

    // Validate response structure
    const validatedResponse = RoadmapsScrapingResponseZodSchema.parse(response);
    console.log(`🔍 [SCRAPER] After validation: ${validatedResponse.skills.length} skills, first has ${validatedResponse.skills[0]?.practiceProblems?.length || 0} practice problems`);

    return {
      success: true,
      data: validatedResponse
    };
    
  } catch (error) {
    
    console.error('💥 Error in scrapeRoadmapsSkills:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, 'scrapeRoadmapsSkills')
    };
  } finally {
    // Always clean up resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log('🧹 Browser resources cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError);
    }
  }
}

/**
 * Server action to validate Roadmaps credentials
 */
export async function validateRoadmapsCredentials(credentials: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  
  try {
    // Validate credentials
    const validatedCredentials = RoadmapsScrapingRequestZodSchema.shape.credentials.parse(credentials);
    
    console.log('🧪 Testing Roadmaps credentials...');
    
    // Initialize browser
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Perform authentication first (this will navigate to login page internally)
    console.log('🔐 Authenticating with Roadmaps...');
    const authResult = await authenticateRoadmaps(page, validatedCredentials);
    
    if (authResult.success) {
      // Test navigation to a skill page after successful authentication
      const testUrl = 'https://roadmaps.teachtoone.org/skill/660';
      console.log('🎯 Testing navigation to skill page:', testUrl);
      await page.goto(testUrl, { waitUntil: 'networkidle' });
      console.log('✅ Successfully navigated to skill page after authentication');
    }
    
    console.log('📊 Validation Result:');
    console.log(`   ✅ Success: ${authResult.success}`);
    console.log(`   ❌ Error: ${authResult.error || 'None'}`);
    
    return {
      success: true,
      data: {
        authenticated: authResult.success,
        message: authResult.success 
          ? "Credentials are valid - authentication successful"
          : `Credential validation failed: ${authResult.error || 'Unable to authenticate'}`
      }
    };
    
  } catch (error) {
    console.error('💥 Error in validateRoadmapsCredentials:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, 'validateRoadmapsCredentials')
    };
  } finally {
    // Always clean up resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError);
    }
  }
}

/**
 * Debug version of scraper that runs with visible browser
 */
export async function scrapeRoadmapsSkillsDebug(request: unknown) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = new Date().toISOString();
  
  try {
    // Validate request data
    const validatedRequest = RoadmapsScrapingRequestZodSchema.parse(request);
    const { credentials, skillUrls, delayBetweenRequests } = validatedRequest;
    
    console.log('🚀 Starting DEBUG Roadmaps skill scraping...');
    console.log('📝 URLs to test:', Math.min(skillUrls.length, 2));
    
    // Initialize browser in DEBUG MODE (visible)
    browser = await chromium.launch({ 
      headless: false, // <-- Debug mode: visible browser
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Limit to first 2 URLs for debugging
    const debugUrls = skillUrls.slice(0, 2);
    console.log('🔍 Testing URLs:', debugUrls);
    
    // Perform authentication first in debug mode
    console.log('🔍 Debug mode: Performing authentication...');
    const authResult = await authenticateRoadmaps(page, credentials);
    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }
    
    console.log('✅ Debug authentication successful');
    
    // Process debug URLs
    const skills: SkillData[] = [];
    
    for (let i = 0; i < debugUrls.length; i++) {
      const url = debugUrls[i];
      console.log(`🔍 Debug processing ${i + 1}/${debugUrls.length}: ${url}`);
      
      try {
        const skillData = await extractSkillData(page, url);
        skills.push(skillData);
        
        // Add longer delay for debugging observation
        if (i < debugUrls.length - 1) {
          await page.waitForTimeout(Math.max(delayBetweenRequests, 3000));
        }
        
      } catch (skillError) {
        console.error(`💥 Debug error processing skill ${url}:`, skillError);
        skills.push({
          title: '',
          url,
          skillNumber: '',
          suggestedTargetSkills: [],
          essentialSkills: [],
          helpfulSkills: [],
          units: [],
          imLessons: [],
          description: '',
          skillChallengeCriteria: '',
          essentialQuestion: '',
          launch: '',
          teacherStudentStrategies: '',
          modelsAndManipulatives: '',
          questionsToHelp: '',
          discussionQuestions: '',
          commonMisconceptions: '',
          additionalResources: '',
          standards: '',
          vocabulary: [],
          images: [],
          imagesWithContext: [],
          videoUrl: '',
          practiceProblems: [],
          scrapedAt: new Date().toISOString(),
          success: false,
          error: skillError instanceof Error ? skillError.message : 'Unknown error',
          tags: []
        });
      }
    }

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;
    
    const successful = skills.filter(skill => skill.success);
    const failed = skills.filter(skill => !skill.success);
    
    console.log('📊 Debug Results:');
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏱️ Duration: ${duration}`);
    
    const response: RoadmapsScrapingResponse = {
      success: true,
      totalRequested: debugUrls.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      skills,
      errors: failed.map(skill => skill.error).filter(Boolean) as string[],
      startTime,
      endTime,
      duration
    };
    
    const validatedResponse = RoadmapsScrapingResponseZodSchema.parse(response);
    
    console.log('🎯 Debug session complete. Check browser window and console logs.');
    console.log('⚠️  Browser window will stay open for inspection.');
    
    return {
      success: true,
      data: validatedResponse
    };
    
  } catch (error) {
    
    console.error('💥 Error in debug scraping:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, 'scrapeRoadmapsSkillsDebug')
    };
  } finally {
    // For debugging, don't automatically close the browser
    console.log('⏸️  Browser staying open for inspection...');
    console.log('💡 Manually close the browser window when done debugging.');
  }
}
