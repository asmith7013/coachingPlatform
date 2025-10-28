import { Page } from 'playwright';
import { SkillData, ROADMAPS_CONSTANTS } from './types';
import { put, list } from '@vercel/blob';

interface PracticeProblem {
  problemNumber: number;
  screenshotUrl: string;
  scrapedAt: string;
}

interface ImageWithContext {
  url: string;
  altText?: string;
  caption?: string;
  section?: string;
  orderInSection: number;
}

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

    // Extract image URLs (deprecated, kept for backwards compatibility)
    const images = await extractImages(page);

    // Extract images with context
    const imagesWithContext = await extractImagesWithContext(page);

    // Extract worked example video
    const videoUrl = await extractAndSaveWorkedExampleVideo(page, skillNumber);

    // Navigate to Practice Problems tab and screenshot
    const practiceProblems = await screenshotPracticeProblems(page, skillNumber);
    console.log(`🔍 [EXTRACTOR] Practice problems extracted: ${practiceProblems.length}`);
    if (practiceProblems.length > 0) {
      console.log(`🔍 [EXTRACTOR] First practice problem:`, JSON.stringify(practiceProblems[0], null, 2));
    }

    console.log(`✅ Successfully extracted skill data for: ${title}`);

    const skillData = {
      title,
      url,
      skillNumber,
      suggestedTargetSkills: [],
      essentialSkills: [],
      helpfulSkills: [],
      units: [],
      imLessons: [],
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
      images, // Deprecated: kept for backwards compatibility
      imagesWithContext,
      videoUrl,
      practiceProblems,
      scrapedAt: new Date().toISOString(),
      success: true,
      tags: []
    };

    console.log(`🔍 [EXTRACTOR] Returning skill data with ${skillData.practiceProblems.length} practice problems`);
    console.log(`🔍 [EXTRACTOR] Video URL: ${skillData.videoUrl || '(empty)'}`);
    console.log(`🔍 [EXTRACTOR] Images with context: ${skillData.imagesWithContext.length}`);

    return skillData;
    
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
 * Extract images with their surrounding context from specific sections
 */
async function extractImagesWithContext(page: Page): Promise<ImageWithContext[]> {
  const imagesWithContext: ImageWithContext[] = [];

  // Define sections to extract images from
  const sections = [
    { name: 'launch', headerText: 'Launch:' },
    { name: 'teacherStudentStrategies', headerText: 'Teacher/Student Strategies:' },
    { name: 'modelsAndManipulatives', headerText: 'Models and Manipulatives:' },
    { name: 'questionsToHelp', headerText: 'Questions to Help Students Get Unstuck:' },
    { name: 'discussionQuestions', headerText: 'Discussion Questions:' },
    { name: 'commonMisconceptions', headerText: 'Common Misconceptions:' },
    { name: 'additionalResources', headerText: 'Additional Resources:' },
  ];

  for (const section of sections) {
    try {
      // Find the h4 header for this section
      const header = page.locator(`h4:has-text("${section.headerText}")`);

      if (await header.count() > 0) {
        // Extract images and their context from this section
        const sectionImages = await page.evaluate(({ headerText, sectionName }) => {
          const headers = Array.from(document.querySelectorAll('h4'));
          const targetHeader = headers.find(h => h.textContent?.includes(headerText));

          if (!targetHeader) return [];

          const images: Array<{url: string; altText: string; caption: string; section: string; orderInSection: number}> = [];
          let currentElement = targetHeader.nextElementSibling;
          let orderInSection = 0;

          // Traverse elements until we hit another h4
          while (currentElement && currentElement.tagName !== 'H4') {
            // Find all images in this element and its children
            const imgElements = currentElement.querySelectorAll('img');

            imgElements.forEach((img: HTMLImageElement) => {
              const src = img.getAttribute('src');
              if (!src || src.startsWith('data:')) return;

              // Get caption from previous paragraph sibling
              let caption = '';
              const prevElement = img.parentElement?.previousElementSibling;
              if (prevElement && prevElement.tagName === 'P') {
                caption = prevElement.textContent?.trim() || '';
              }

              // If no previous sibling, try the text content of parent element before the image
              if (!caption && img.parentElement) {
                const parentText = img.parentElement.textContent || '';
                // Get text before the image in the parent
                caption = parentText.substring(0, 200).trim();
              }

              images.push({
                url: src,
                altText: img.getAttribute('alt') || '',
                caption: caption.substring(0, 500), // Limit caption length
                section: sectionName,
                orderInSection: orderInSection++
              });
            });

            currentElement = currentElement.nextElementSibling;
          }

          return images;
        }, { headerText: section.headerText, sectionName: section.name });

        // Convert relative URLs to absolute and add to results
        for (const img of sectionImages) {
          const absoluteUrl = img.url.startsWith('http')
            ? img.url
            : new URL(img.url, page.url()).href;

          imagesWithContext.push({
            url: absoluteUrl,
            altText: img.altText,
            caption: img.caption,
            section: img.section,
            orderInSection: img.orderInSection
          });
        }
      }
    } catch (error) {
      console.warn(`Could not extract images from section ${section.name}:`, error);
    }
  }

  console.log(`📸 Extracted ${imagesWithContext.length} images with context`);
  return imagesWithContext;
}

/**
 * Navigate to Practice Problems tab
 */
async function navigateToPracticeProblemsTab(page: Page): Promise<boolean> {
  try {
    console.log('📝 Navigating to Practice Problems tab...');

    // Find and click the "Practice Problems" tab
    const practiceTab = page.locator('span.p-tabview-title:text("Practice Problems")');
    const tabCount = await practiceTab.count();
    console.log(`🔍 [DEBUG] Found ${tabCount} Practice Problems tab(s)`);

    if (tabCount > 0) {
      await practiceTab.click();
      console.log('🔍 [DEBUG] Clicked Practice Problems tab, waiting for content...');

      // Wait for the practice problems container to appear
      try {
        await page.waitForSelector('#practiceProblems', { timeout: 5000 });
        console.log('🔍 [DEBUG] Practice problems container found');

        // Wait for practice problem divs to load
        await page.waitForSelector('div[id*="_practice_"]', { timeout: 5000 });
        console.log('🔍 [DEBUG] Practice problem divs loaded');
      } catch (e) {
        console.log('⚠️ [DEBUG] Timeout waiting for practice problems to load');
      }

      // Additional wait for dynamic content to fully render
      await page.waitForTimeout(3000);
      console.log('✅ Navigated to Practice Problems tab');

      // Debug: Check what's visible after clicking
      const visibleContent = await page.locator('[role="tabpanel"]:visible').count();
      console.log(`🔍 [DEBUG] Found ${visibleContent} visible tabpanel(s) after navigation`);

      return true;
    } else {
      console.log('ℹ️ No Practice Problems tab found');

      // Debug: Let's see what tabs ARE available
      const allTabs = await page.locator('span.p-tabview-title').evaluateAll((spans) =>
        spans.map(span => span.textContent).filter(text => text)
      );
      console.log('🔍 [DEBUG] Available tabs:', allTabs);

      return false;
    }
  } catch (error) {
    console.warn('Could not navigate to Practice Problems tab:', error);
    return false;
  }
}

/**
 * Extract and save worked example video to Vercel Blob
 */
async function extractAndSaveWorkedExampleVideo(
  page: Page,
  skillNumber: string
): Promise<string> {
  try {
    console.log('🎥 Extracting worked example video...');

    // Check if Additional Lessons & Resources accordion is expanded
    const additionalLessonsAccordion = page.locator(ROADMAPS_CONSTANTS.SELECTORS.ADDITIONAL_LESSONS_ACCORDION);

    if (await additionalLessonsAccordion.count() === 0) {
      console.log('ℹ️ Additional Lessons & Resources accordion not found');
      return '';
    }

    // Expand accordion if it's collapsed
    const isExpanded = await additionalLessonsAccordion.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      console.log('🔄 Expanding Additional Lessons & Resources accordion...');
      await additionalLessonsAccordion.click();
      await page.waitForTimeout(500);
    }

    // Find and click the Worked Example Video link
    const videoLink = page.locator(ROADMAPS_CONSTANTS.SELECTORS.WORKED_EXAMPLE_VIDEO_LINK);

    if (await videoLink.count() === 0) {
      console.log('ℹ️ Worked Example Video link not found');
      return '';
    }

    await videoLink.click();
    console.log('🔄 Clicked Worked Example Video link, waiting for dialog...');

    // Wait for video dialog to open
    await page.waitForSelector(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG, { timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for video element to load

    // Extract video source URL
    const videoSource = page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_SOURCE);

    if (await videoSource.count() === 0) {
      console.log('⚠️ Video source element not found in dialog');
      // Close dialog before returning
      await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE).click();
      return '';
    }

    const videoSrc = await videoSource.getAttribute('src');

    if (!videoSrc) {
      console.log('⚠️ Video source URL is empty');
      await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE).click();
      return '';
    }

    console.log(`📥 Downloading video from: ${videoSrc.substring(0, 100)}...`);

    // Download video using Playwright's context
    const response = await page.context().request.get(videoSrc);

    if (!response.ok()) {
      console.error(`❌ Failed to download video: ${response.status()} ${response.statusText()}`);
      await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE).click();
      return '';
    }

    const videoBuffer = await response.body();
    const videoSizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`📦 Downloaded video: ${videoSizeMB}MB`);

    // Check if video already exists in Vercel Blob
    const blobFileName = `roadmaps/skill-${skillNumber}/worked-example-video.mp4`;
    const prefix = `roadmaps/skill-${skillNumber}/`;

    try {
      const { blobs } = await list({ prefix });
      const existingVideo = blobs.find(blob => blob.pathname === blobFileName);

      if (existingVideo) {
        console.log(`♻️ Video already exists in Vercel Blob, reusing: ${existingVideo.url}`);
        // Close the video dialog
        await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE).click();
        await page.waitForTimeout(500);
        return existingVideo.url;
      }
    } catch (listError) {
      console.warn('⚠️ Could not check for existing video:', listError);
      // Continue to upload if list fails
    }

    // Upload to Vercel Blob
    console.log(`☁️ Uploading to Vercel Blob: ${blobFileName}...`);

    let blobUrl: string;
    try {
      const blob = await put(blobFileName, videoBuffer, {
        access: 'public',
        contentType: 'video/mp4',
      });
      blobUrl = blob.url;
      console.log(`✅ Video uploaded successfully: ${blobUrl}`);
    } catch (uploadError: unknown) {
      // If upload fails because blob already exists, try to get the existing URL
      const errorMessage = uploadError instanceof Error ? uploadError.message : '';
      if (errorMessage.includes('already exists')) {
        console.log(`♻️ Upload failed (blob exists), fetching existing video URL...`);
        try {
          const { blobs } = await list({ prefix });
          const existingVideo = blobs.find(blob => blob.pathname === blobFileName);
          if (existingVideo) {
            blobUrl = existingVideo.url;
            console.log(`✅ Using existing video: ${blobUrl}`);
          } else {
            throw new Error('Video exists but could not retrieve URL');
          }
        } catch (listError) {
          console.error('❌ Could not retrieve existing video URL:', listError);
          throw uploadError; // Re-throw original error
        }
      } else {
        throw uploadError; // Re-throw if it's a different error
      }
    }

    // Close the video dialog
    await page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE).click();
    await page.waitForTimeout(500);

    return blobUrl;

  } catch (error) {
    console.error('❌ Error extracting worked example video:', error);

    // Try to close dialog if it's still open
    try {
      const dialogClose = page.locator(ROADMAPS_CONSTANTS.SELECTORS.VIDEO_DIALOG_CLOSE);
      if (await dialogClose.count() > 0 && await dialogClose.isVisible()) {
        await dialogClose.click();
      }
    } catch {
      // Ignore errors when trying to close dialog
    }

    return '';
  }
}

/**
 * Screenshot practice problems and upload to Vercel Blob
 */
async function screenshotPracticeProblems(
  page: Page,
  skillNumber: string
): Promise<PracticeProblem[]> {
  const problems: PracticeProblem[] = [];

  try {
    // Navigate to Practice Problems tab
    const tabNavigated = await navigateToPracticeProblemsTab(page);
    if (!tabNavigated) {
      console.log('ℹ️ Skipping practice problems - tab not found');
      return problems;
    }

    console.log(`🔍 Looking for divs with id starting with "${skillNumber}_practice_"`);

    // Find all practice problem divs with pattern: {skillNumber}_practice_{number}
    const problemDivs = page.locator(`div[id^="${skillNumber}_practice_"]`);
    const count = await problemDivs.count();

    console.log(`📸 Found ${count} practice problems to screenshot`);

    if (count === 0) {
      // Debug: Let's see what divs ARE on the page
      console.log('🔍 [DEBUG] No problems found with expected pattern. Checking page content...');
      const allDivsWithIds = await page.locator('div[id*="practice"]').count();
      console.log(`🔍 [DEBUG] Found ${allDivsWithIds} divs with "practice" in their id`);

      // Get a sample of IDs to see the actual pattern
      const sampleIds = await page.locator('div[id*="practice"]').evaluateAll((divs) =>
        divs.slice(0, 5).map(div => div.id).filter(id => id)
      );
      console.log('🔍 [DEBUG] Sample practice div IDs:', sampleIds);

      console.log('ℹ️ No practice problems found for this skill');
      return problems;
    }

    for (let i = 0; i < count; i++) {
      try {
        const problemDiv = problemDivs.nth(i);
        const problemId = await problemDiv.getAttribute('id');

        if (!problemId) continue;

        // Extract problem number from ID (e.g., "102_practice_1" -> 1)
        const problemNumber = parseInt(problemId.split('_practice_')[1]);

        console.log(`📷 Screenshotting problem ${problemNumber}...`);

        // Take screenshot as buffer with high quality settings
        const screenshotBuffer = await problemDiv.screenshot({
          type: 'png',
          scale: 'device' // Use device scale factor for higher resolution
        });

        // Upload to Vercel Blob with timestamp to avoid conflicts
        const timestamp = Date.now();
        const blobFileName = `roadmaps/skill-${skillNumber}/practice-${problemNumber}-${timestamp}.png`;
        const blob = await put(blobFileName, screenshotBuffer, {
          access: 'public',
          contentType: 'image/png',
        });

        console.log(`✅ Uploaded problem ${problemNumber} to: ${blob.url}`);

        problems.push({
          problemNumber,
          screenshotUrl: blob.url,
          scrapedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`❌ Error screenshotting problem ${i + 1}:`, error);
      }
    }

    console.log(`✅ Successfully screenshot ${problems.length}/${count} practice problems`);
    return problems;

  } catch (error) {
    console.error('Error screenshotting practice problems:', error);
    return problems;
  }
}
