import { Page } from 'playwright';
import { SkillData, ROADMAPS_CONSTANTS } from './types';

/**
 * Extract skill data from a Teach to One Roadmaps skill page
 */
export async function extractSkillData(page: Page, url: string): Promise<SkillData> {
  try {
    console.log(`📖 Extracting skill data from: ${url}`);
    
    // Extract skill number from URL
    const extractSkillNumber = (url: string): string => {
      const match = url.match(/\/skill\/(\d+)/);
      return match ? match[1] : 'unknown';
    };
    
    const skillNumber = extractSkillNumber(url);
    console.log(`🔢 Skill Number: ${skillNumber}`);
    
    // Navigate to the skill page
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for main content to load
    await page.waitForSelector('.nc_page-header', { timeout: 10000 });
    
    // Extract title
    const title = await extractTitle(page);
    console.log(`📝 Title: ${title}`);
    
    // Expand any collapsed accordion sections to access hidden content
    await expandAccordions(page);
    
    // Extract fieldset content
    const description = await extractFieldsetContent(page, 'Description');
    const skillChallengeCriteria = await extractFieldsetContent(page, 'Skill Challenge Criteria');
    const essentialQuestion = await extractFieldsetContent(page, 'Essential Question');
    const standards = await extractStandardsContent(page);
    
    // Extract section-based content from the primer area
    const launch = await extractSectionContent(page, 'Launch:');
    const teacherStudentStrategies = await extractSectionContent(page, 'Teacher/Student Strategies:');
    const modelsAndManipulatives = await extractSectionContent(page, 'Models and Manipulatives:');
    const questionsToHelp = await extractSectionContent(page, 'Questions to Help Students Get Unstuck:');
    const discussionQuestions = await extractSectionContent(page, 'Discussion Questions:');
    const commonMisconceptions = await extractSectionContent(page, 'Common Misconceptions:');
    const additionalResources = await extractSectionContent(page, 'Additional Resources:');
    
    // Extract vocabulary from expanded accordion
    const vocabulary = await extractVocabulary(page);
    
    // Extract image URLs
    const images = await extractImages(page);
    
    // Extract video URL
    const videoUrl = await extractWorkedExampleVideo(page);
    
    console.log(`✅ Successfully extracted skill data for: ${title}`);
    
    return {
      title,
      url,
      skillNumber,
      suggestedTargetSkills: [],
      essentialSkills: [],
      helpfulSkills: [],
      description,
      skillChallengeCriteria,
      essentialQuestion,
      launch,
      teacherStudentStrategies,
      modelsAndManipulatives,
      questionsToHelp,
      discussionQuestions,
      commonMisconceptions,
      additionalResources,
      standards,
      vocabulary,
      images,
      videoUrl: videoUrl as string,
      scrapedAt: new Date().toISOString(),
      success: true,
      tags: []
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown extraction error';
    console.error(`❌ Error extracting skill data from ${url}:`, errorMessage);
    
    return {
      title: '',
      url,
      skillNumber: 'unknown',
      suggestedTargetSkills: [],
      essentialSkills: [],
      helpfulSkills: [],
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
      videoUrl: '',
      scrapedAt: new Date().toISOString(),
      success: false,
      error: errorMessage,
      tags: []
    };
  }
}

/**
 * Extract the page title
 */
async function extractTitle(page: Page): Promise<string> {
  try {
    const titleElement = page.locator(ROADMAPS_CONSTANTS.SELECTORS.PAGE_TITLE);
    const title = await titleElement.textContent();
    return title?.trim() || 'Untitled Skill';
  } catch (error) {
    console.warn('Could not extract title:', error);
    return 'Untitled Skill';
  }
}

/**
 * Expand all collapsed accordion sections
 */
async function expandAccordions(page: Page): Promise<void> {
  try {
    console.log('🔄 Expanding accordion sections...');
    
    const collapsedAccordions = page.locator(ROADMAPS_CONSTANTS.SELECTORS.COLLAPSED_ACCORDION);
    const count = await collapsedAccordions.count();
    
    for (let i = 0; i < count; i++) {
      try {
        const accordion = collapsedAccordions.nth(i);
        if (await accordion.isVisible()) {
          await accordion.click();
          // Wait a moment for content to expand
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.warn(`Could not expand accordion ${i}:`, error);
      }
    }
    
    console.log(`✅ Expanded ${count} accordion sections`);
  } catch (error) {
    console.warn('Error expanding accordions:', error);
  }
}

/**
 * Extract content from a fieldset by legend text
 */
async function extractFieldsetContent(page: Page, legendText: string): Promise<string> {
  try {
    // Look for fieldset with matching legend text
    const fieldset = page.locator(`fieldset:has(legend:has-text("${legendText}"))`);
    
    if (await fieldset.count() > 0) {
      const content = fieldset.locator('.p-fieldset-content');
      const text = await content.textContent();
      return text?.trim() || '';
    }
    
    return '';
  } catch (error) {
    console.warn(`Could not extract fieldset content for ${legendText}:`, error);
    return '';
  }
}

/**
 * Extract standards content from the standards accordion
 */
async function extractStandardsContent(page: Page): Promise<string> {
  try {
    // Look for standards fieldset (contains "CC." in legend)
    const standardsFieldset = page.locator('fieldset:has(legend:has-text("CC."))');
    
    if (await standardsFieldset.count() > 0) {
      const content = standardsFieldset.locator('.p-fieldset-content');
      const text = await content.textContent();
      return text?.trim() || '';
    }
    
    return '';
  } catch (error) {
    console.warn('Could not extract standards content:', error);
    return '';
  }
}

/**
 * Extract content from a section based on h4 header text
 */
async function extractSectionContent(page: Page, headerText: string): Promise<string> {
  try {
    // Find the h4 element with the matching text
    const header = page.locator(`h4:has-text("${headerText}")`);
    
    if (await header.count() > 0) {
      // Use JavaScript to get content between headers
      const content = await page.evaluate((headerText) => {
        const headers = Array.from(document.querySelectorAll('h4'));
        const targetHeader = headers.find(h => h.textContent?.includes(headerText));
        
        if (!targetHeader) return '';
        
        let content = '';
        let currentElement = targetHeader.nextElementSibling;
        
        while (currentElement && currentElement.tagName !== 'H4') {
          if (currentElement.textContent) {
            content += currentElement.textContent + '\n';
          }
          currentElement = currentElement.nextElementSibling;
        }
        
        return content.trim();
      }, headerText);
      
      return content || '';
    }
    
    return '';
  } catch (error) {
    console.warn(`Could not extract section content for ${headerText}:`, error);
    return '';
  }
}

/**
 * Extract vocabulary terms from the vocabulary accordion
 */
async function extractVocabulary(page: Page): Promise<string[]> {
  try {
    // Look for vocabulary accordion content
    const vocabularyAccordion = page.locator('[aria-controls*="content"]:has-text("Vocabulary")');
    
    if (await vocabularyAccordion.count() > 0) {
      // Get the associated content area
      const contentId = await vocabularyAccordion.getAttribute('aria-controls');
      if (contentId) {
        const contentArea = page.locator(`#${contentId}`);
        const text = await contentArea.textContent();
        
        if (text) {
          // Split by common delimiters and clean up
          return text
            .split(/[,\n\r\t•·]/)
            .map(term => term.trim())
            .filter(term => term.length > 0 && !term.includes('Resource Available'));
        }
      }
    }
    
    return [];
  } catch (error) {
    console.warn('Could not extract vocabulary:', error);
    return [];
  }
}

/**
 * Extract all image URLs from the page
 */
async function extractImages(page: Page): Promise<string[]> {
  try {
    const images = page.locator(ROADMAPS_CONSTANTS.SELECTORS.ALL_IMAGES);
    const count = await images.count();
    const imageUrls: string[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const src = await images.nth(i).getAttribute('src');
        if (src && !src.startsWith('data:') && !imageUrls.includes(src)) {
          // Convert relative URLs to absolute
          const absoluteUrl = src.startsWith('http') ? src : new URL(src, page.url()).href;
          imageUrls.push(absoluteUrl);
        }
      } catch (error) {
        console.warn(`Could not extract image ${i}:`, error);
      }
    }
    
  console.log(`📸 Extracted ${imageUrls.length} images`);
  return imageUrls;
} catch (error) {
  console.warn('Could not extract images:', error);
  return [];
}
}

/**
 * Extract worked example video URL from Additional Lessons & Resources accordion
 */
async function extractWorkedExampleVideo(page: Page): Promise<string | null> {
  try {
    console.log('🎥 Looking for worked example video...');
    
    // First, ensure the "Additional Lessons & Resources" accordion is expanded
    const additionalResourcesHeader = await page.locator(ROADMAPS_CONSTANTS.SELECTORS.ADDITIONAL_RESOURCES_ACCORDION).first();
    if (await additionalResourcesHeader.count() > 0) {
      // Check if it's already expanded
      const accordion = additionalResourcesHeader.locator('xpath=../../../..');
      const isExpanded = await accordion.getAttribute('aria-expanded');
      
      if (isExpanded !== 'true') {
        console.log('📂 Expanding Additional Lessons & Resources accordion...');
        await additionalResourcesHeader.click();
        await page.waitForTimeout(1000); // Wait for expansion
      }
    }
    
    // Look for "Worked Example Video" clickable span
    const workedExampleLink = page.locator(ROADMAPS_CONSTANTS.SELECTORS.WORKED_EXAMPLE_LINK);
    
    if (await workedExampleLink.count() > 0) {
      console.log('🎬 Found Worked Example Video link, clicking...');
      await workedExampleLink.click();
      
      // Wait for dialog/modal to open
      await page.waitForSelector(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG, { timeout: 5000 });
      console.log('📺 Video dialog opened');
      
      // Extract video source URL from the video element
      const videoElement = await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_SOURCE).first();
      if (await videoElement.count() > 0) {
        const videoUrl = await videoElement.getAttribute('src');
        console.log(`✅ Video URL extracted: ${videoUrl}`);
        
        // Close the dialog by clicking outside or finding close button
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        return videoUrl;
      } else {
        console.log('❌ No video source found in dialog');
        await page.keyboard.press('Escape'); // Close dialog
        return null;
      }
    } else {
      console.log('ℹ️ No Worked Example Video found');
      return null;
    }
    
  } catch (error) {
    console.error('Error extracting video:', error);
    return null;
  }
}
