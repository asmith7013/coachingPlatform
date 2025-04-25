import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
// import * as yargs from 'yargs/yargs';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { COURSES } from './course-config.js';

// Define interface for lesson information
interface Lesson {
  title: string;
  url: string;
}

// Define interface for section information
interface Section {
  title: string;
  url: string;
  lessons?: Lesson[];
}

// Define interface for section info being built
interface SectionInfo {
  id: string;
  number: number;
  title: string;
  url: string;
  lessons: {
    id: string;
    number: number;
    title: string;
    url: string;
  }[];
}

// Define interface for unit configuration
interface UnitConfig {
  id: string;
  name: string;
}

// Define interface for course information
interface CourseToProcess {
  id: string;
  title: string;
  units: UnitConfig[];
  isMiddleSchool?: boolean; // Flag to indicate if this is a middle school course
}

// Define interface for unit information
interface UnitInfo {
  id: string;
  number: number;
  title: string;
  url: string;
  original_id: string;
  lessons?: {
    id: string;
    number: number;
    title: string;
    url: string;
  }[];
  sections?: SectionInfo[];
}

// Define interface for course information
interface CourseInfo {
  id: string;
  title: string;
  isMiddleSchool?: boolean;
  units: UnitInfo[];
}

// Define COURSES interface
interface CourseConfig {
  [key: string]: {
    name: string;
    baseUrl: string;
    units: UnitConfig[];
    isMiddleSchool?: boolean;
  };
}

// Parse command line arguments
const argv = yargs.default(hideBin(process.argv))
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for scraped data',
    default: './im-curriculum'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Enable verbose logging',
    default: false
  })
  .option('course', {
    type: 'string',
    description: 'Specific course to scrape (by ID)',
  })
  .option('headless', {
    type: 'boolean',
    description: 'Run browser in headless mode',
    default: true
  })
  .option('delay', {
    type: 'number',
    description: 'Delay between requests in milliseconds',
    default: 1000
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// Logger function
const log = (message: string, isVerbose = false) => {
  if (!isVerbose || (isVerbose && argv.verbose)) {
    console.log(message);
  }
};

// Ensure output directory exists
const ensureOutputDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Extract sections from unit page (for middle school grades)
const extractSections = async (page: Page, unitUrl: string, unitName: string): Promise<Section[]> => {
  log(`Navigating to unit URL to extract sections: ${unitUrl}`, true);
  
  try {
    // Navigate with a longer timeout
    await page.goto(unitUrl, { waitUntil: 'networkidle', timeout: 60000 });
    
    // For middle school courses, we need to navigate the dropdowns first
    const isMiddleSchool = unitName.match(/Grade\s+\d+/) !== null;
    if (isMiddleSchool) {
      log(`Detected middle school course, navigating dropdowns...`, true);
      const dropdownSuccess = await navigateMiddleSchoolDropdowns(page, unitName);
      
      if (!dropdownSuccess) {
        log(`Failed to navigate dropdowns for middle school course`, true);
        // Continue anyway as we might still find sections
      }
    }
    
    // Take a screenshot for debugging
    const screenshotPath = path.join(argv.output, `debug-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: screenshotPath });
    log(`Saved debug screenshot to ${screenshotPath}`, true);
    
    // Try multiple approaches to find sections
    
    // 1. Check if there's a second dropdown we need to click
    const secondDropdownButton = await page.$('button[data-toggle^="crumb-select-"]:nth-of-type(2)');
    if (secondDropdownButton) {
      log(`Found second dropdown button, clicking...`, true);
      await secondDropdownButton.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot of the open second dropdown
      const dropdown2Path = path.join(argv.output, `dropdown2-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
      await page.screenshot({ path: dropdown2Path });
    }
    
    // 2. Try to find sections in the page with deduplication logic
    log(`Looking for section links in all available places...`, true);
    const sectionLinks = await page.$$eval('ul[id^="crumb-select-"] li a, a[href*="/wikis/"]', (elements) => {
      // First, remove duplicates by URL
      const uniqueUrlMap = new Map();
      
      elements
        .filter(el => {
          const text = el.textContent?.trim() || '';
          // Pattern should match "8.1 Section A:", "8.1 Section B:", etc.
          return /\d+\.\d+\s+Section\s+[A-Z]:/i.test(text);
        })
        .forEach(el => {
          const url = (el as HTMLAnchorElement).href;
          const text = el.textContent?.trim() || 'Untitled Section';
          
          // If we haven't seen this URL before, or if the current text is shorter,
          // update the map (prefer shorter titles which are likely the main section titles)
          if (!uniqueUrlMap.has(url) || 
              (uniqueUrlMap.get(url).title.length > text.length)) {
            uniqueUrlMap.set(url, {
              title: text,
              url: url
            });
          }
        });
      
      // Convert the map values back to an array
      return Array.from(uniqueUrlMap.values());
    });
    
    log(`Found ${sectionLinks.length} unique sections in unit ${unitName}`, true);
    
    // 3. If no sections found, try a more general approach
    if (sectionLinks.length === 0) {
      log(`No sections found with specific pattern, trying a more general approach...`, true);
      
      // Log what's visible on the page for debugging
      const visibleText = await page.$$eval('a, button, h1, h2, h3, h4, h5', elements => 
        elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim() || '',
          href: el.tagName === 'A' ? (el as HTMLAnchorElement).href : ''
        }))
      );
      
      log(`Visible elements on page: ${JSON.stringify(visibleText.slice(0, 20))}`, true);
      
      // Try a broader pattern for sections
      const alternativeSections = await page.$$eval('a[href*="/wikis/"]', (elements) => {
        const uniqueUrlMap = new Map();
        
        elements
          .filter(el => {
            const text = el.textContent?.trim() || '';
            // Wider pattern that might catch "Section" in different formats
            return /Section\s+[A-Z]/i.test(text);
          })
          .forEach(el => {
            const url = (el as HTMLAnchorElement).href;
            const text = el.textContent?.trim() || 'Untitled Section';
            
            if (!uniqueUrlMap.has(url) || 
                (uniqueUrlMap.get(url).title.length > text.length)) {
              uniqueUrlMap.set(url, {
                title: text,
                url: url
              });
            }
          });
        
        return Array.from(uniqueUrlMap.values());
      });
      
      log(`Found ${alternativeSections.length} unique alternative sections`, true);
      
      if (alternativeSections.length > 0) {
        return alternativeSections;
      }
      
      // Last resort: look for any links that might be sections based on URL pattern
      const dataAttributeSections = await page.$$eval('a[data-test*="Wiki"]', (elements) => {
        const uniqueUrlMap = new Map();
        
        elements
          .filter(el => {
            // Check if URL contains section-like pattern or if text contains Section
            const url = (el as HTMLAnchorElement).href;
            const text = el.textContent?.trim() || '';
            return url.includes('section') || /section/i.test(text);
          })
          .forEach(el => {
            const url = (el as HTMLAnchorElement).href;
            const text = el.textContent?.trim() || 'Untitled Section';
            
            if (!uniqueUrlMap.has(url) || 
                (uniqueUrlMap.get(url).title.length > text.length)) {
              uniqueUrlMap.set(url, {
                title: text,
                url: url
              });
            }
          });
        
        return Array.from(uniqueUrlMap.values());
      });
      
      log(`Found ${dataAttributeSections.length} unique sections by data attributes`, true);
      
      if (dataAttributeSections.length > 0) {
        return dataAttributeSections;
      }
    }
    
    return sectionLinks;
  } catch (error) {
    log(`Error extracting section links: ${(error as Error).message}`, true);
    // Save a screenshot on error
    const errorScreenshotPath = path.join(argv.output, `error-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: errorScreenshotPath });
    log(`Saved error screenshot to ${errorScreenshotPath}`, true);
    return []; // Return empty array on error
  }
};

// Extract lesson links from section or unit page
const extractLessonLinks = async (page: Page, url: string, name: string): Promise<Lesson[]> => {
  log(`Navigating to URL to extract lessons: ${url}`, true);
  
  try {
    // Navigate with a longer timeout
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for the page to fully load
    await page.waitForTimeout(2000);
    
    // Take a screenshot for debugging
    const screenshotPath = path.join(argv.output, `debug-lessons-${name.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: screenshotPath });
    log(`Saved debug lesson screenshot to ${screenshotPath}`, true);
    
    // Check if there's a "Select content" dropdown that needs to be clicked
    const contentDropdown = await page.$('button:has-text("Select content")');
    if (contentDropdown) {
      log(`Found "Select content" dropdown, clicking...`, true);
      await contentDropdown.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot after clicking
      const contentDropdownPath = path.join(argv.output, `content-dropdown-${name.replace(/[^a-z0-9]/gi, '_')}.png`);
      await page.screenshot({ path: contentDropdownPath });
    }
    
    // Now look for lesson links in the dropdown or on the page
    const lessonLinks = await page.$$eval('ul[id^="crumb-select-"] li a, .dropdown-pane.is-open li a', (elements) => {
      return elements
        .filter(el => {
          const text = el.textContent?.trim() || '';
          // Improved pattern to catch various lesson formats
          const lessonPatterns = [
            /^Lesson\s+\d+\s*:/i,      // Standard "Lesson X:" format
            /Lesson\s+\d+\s*[:-]/i,     // Lesson with number and colon or dash
            /^Lesson\s+\d+\s+[A-Za-z]/i // Lesson with number followed by text
          ];
          return lessonPatterns.some(pattern => pattern.test(text));
        })
        .map(el => ({
          title: el.textContent?.trim() || 'Untitled Lesson',
          url: (el as HTMLAnchorElement).href
        }));
    });
    
    log(`Found ${lessonLinks.length} lessons for ${name}`, true);
    
    // If no lessons found, try alternative approaches
    if (lessonLinks.length === 0) {
      // Log all available links for debugging
      const allLinks = await page.$$eval('a', links => 
        links.map(link => ({
          text: link.textContent?.trim() || '',
          href: link.href,
          isLesson: link.href.includes('/lesson_plans/')
        }))
      );
      
      log(`Available links on page: ${JSON.stringify(allLinks.filter(l => l.isLesson).slice(0, 10))}`, true);
      
      // Try a different approach to find lessons
      const alternativeLessons = await page.$$eval('a[href*="/lesson_plans/"]', (elements) => {
        return elements
          .filter(el => {
            const text = el.textContent?.trim() || '';
            return /Lesson\s+\d+/i.test(text) || text.startsWith('Lesson');
          })
          .map(el => ({
            title: el.textContent?.trim() || 'Untitled Lesson',
            url: (el as HTMLAnchorElement).href
          }));
      });
      
      log(`Found ${alternativeLessons.length} alternative lessons`, true);
      return alternativeLessons;
    }
    
    return lessonLinks;
  } catch (error) {
    log(`Error extracting lesson links: ${(error as Error).message}`, true);
    // Save a screenshot on error
    const errorScreenshotPath = path.join(argv.output, `error-lessons-${name.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: errorScreenshotPath });
    log(`Saved error screenshot to ${errorScreenshotPath}`, true);
    return []; // Return empty array on error
  }
};

// Helper function to navigate middle school dropdown menus
async function navigateMiddleSchoolDropdowns(page: Page, unitName: string): Promise<boolean> {
  try {
    log(`Navigating middle school dropdowns for unit: ${unitName}`, true);
    
    // Wait for page to load
    await page.waitForSelector('button[data-toggle^="crumb-select-"]', { timeout: 10000 });
    
    // Take a screenshot before interaction
    const beforeScreenshotPath = path.join(argv.output, `before-dropdown-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: beforeScreenshotPath });
    
    // First, find and click the first dropdown (which should contain "Teach" option)
    log(`Finding first dropdown button...`, true);
    const firstDropdownButton = await page.$('button[data-toggle^="crumb-select-"]:first-of-type');
    
    if (!firstDropdownButton) {
      log(`Could not find first dropdown button`, true);
      return false;
    }
    
    // Click to open the first dropdown
    log(`Clicking first dropdown button...`, true);
    await firstDropdownButton.click();
    await page.waitForTimeout(1000); // Wait for dropdown to appear
    
    // Take a screenshot of the open dropdown
    const dropdown1Path = path.join(argv.output, `dropdown1-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: dropdown1Path });
    
    // Look for the "Teach" option in the dropdown
    // Pattern will vary by grade level, e.g., "8.1 Teach", "6.3 Teach", etc.
    const unitNumberMatch = unitName.match(/(\d+\.\d+)|(\d+)/); // Match "8.1" or just "8"
    const unitPrefix = unitNumberMatch ? unitNumberMatch[0] : "";
    
    log(`Looking for "${unitPrefix} Teach" option...`, true);
    const teachOption = await page.$(`ul[id^="crumb-select-"] li a:has-text("${unitPrefix} Teach")`);
    
    if (!teachOption) {
      log(`Could not find "${unitPrefix} Teach" option in dropdown`, true);
      // Try a more general approach
      const allTeachOptions = await page.$$eval('ul[id^="crumb-select-"] li a', (elements) => {
        return elements
          .filter(el => el.textContent?.includes('Teach'))
          .map(el => ({
            text: el.textContent?.trim() || '',
            href: (el as HTMLAnchorElement).href
          }));
      });
      
      log(`Found ${allTeachOptions.length} potential "Teach" options: ${JSON.stringify(allTeachOptions)}`, true);
      
      if (allTeachOptions.length === 0) return false;
      
      // Click the first "Teach" option
      await page.click(`ul[id^="crumb-select-"] li a:has-text("Teach")`);
    } else {
      log(`Found "${unitPrefix} Teach" option, clicking...`, true);
      await teachOption.click();
    }
    
    // Wait for the page to update
    await page.waitForTimeout(2000);
    
    // Take a screenshot after clicking "Teach"
    const afterTeachPath = path.join(argv.output, `after-teach-${unitName.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: afterTeachPath });
    
    log(`Successfully navigated to "Teach" view for unit ${unitName}`, true);
    return true;
  } catch (error) {
    log(`Error navigating middle school dropdowns: ${(error as Error).message}`, true);
    return false;
  }
}

// Process a single course
const processCourse = async (browser: Browser, course: CourseToProcess) => {
  log(`Processing course: ${course.title} (${course.id})`, true);
  
  // Create output directory for the course
  const courseDir = path.join(argv.output, course.id);
  ensureOutputDir(courseDir);
  
  // Create course info file
  const courseInfo: CourseInfo = {
    id: course.id,
    title: course.title,
    isMiddleSchool: course.isMiddleSchool,
    units: []
  };
  
  // Create a new page
  const page = await browser.newPage();
  
  try {
    // Process each unit directly from the configuration
    for (let i = 0; i < course.units.length; i++) {
      try {
        const configUnit = course.units[i];
        const unitNumber = i + 1;
        const unitId = `unit-${unitNumber}`;
        const unitUrl = `https://doe1nyc.ilclassroom.com/wikis/${configUnit.id}`;
        
        log(`Processing unit ${unitNumber}: ${configUnit.name}`);
        log(`Unit URL: ${unitUrl}`, true);
        
        // Create unit directory
        const unitDir = path.join(courseDir, unitId);
        ensureOutputDir(unitDir);
        
        // Initialize unit info structure differently based on course type
        const unitInfo: UnitInfo = {
          id: unitId,
          number: unitNumber,
          title: configUnit.name,
          url: unitUrl,
          original_id: configUnit.id
        };
        
        // Add appropriate property based on course type
        if (course.isMiddleSchool) {
          unitInfo.sections = [];
        } else {
          unitInfo.lessons = [];
        }
        
        if (course.isMiddleSchool) {
          // For middle school, first get sections, then get lessons within each section
          const sections = await extractSections(page, unitUrl, configUnit.name);
          
          // Save sections data for debugging
          fs.writeFileSync(
            path.join(unitDir, 'sections-found.json'),
            JSON.stringify(sections, null, 2)
          );
          
          log(`Found ${sections.length} sections for unit ${unitNumber}`);
          
          // Process each section
          for (let j = 0; j < sections.length; j++) {
            try {
              const section = sections[j];
              const sectionNumber = j + 1;
              const sectionId = `section-${sectionNumber}`;
              
              log(`Processing section ${sectionNumber}: ${section.title}`);
              
              // Create section directory
              const sectionDir = path.join(unitDir, sectionId);
              ensureOutputDir(sectionDir);
              
              // Get lessons for this section
              const lessons = await extractLessonLinks(page, section.url, section.title);
              log(`Found ${lessons.length} lessons for section ${sectionNumber}`);
              
              // Save raw lessons data for debugging
              fs.writeFileSync(
                path.join(sectionDir, 'lessons-found.json'),
                JSON.stringify(lessons, null, 2)
              );
              
              const sectionInfo: SectionInfo = {
                id: sectionId,
                number: sectionNumber,
                title: section.title,
                url: section.url,
                lessons: []
              };
              
              // Process each lesson in the section
              for (let k = 0; k < lessons.length; k++) {
                try {
                  const lesson = lessons[k];
                  const lessonNumber = k + 1;
                  const lessonId = `lesson-${lessonNumber}`;
                  
                  // Extract the actual lesson number from the title if possible
                  let actualLessonNumber = lessonNumber;
                  const lessonNumberMatch = lesson.title.match(/^Lesson\s+(\d+)/i);
                  if (lessonNumberMatch && lessonNumberMatch[1]) {
                    actualLessonNumber = parseInt(lessonNumberMatch[1]);
                  }
                  
                  log(`- Processing lesson ${lessonNumber}/${lessons.length}: ${lesson.title} (original number: ${actualLessonNumber})`);
                  
                  // Create lesson directory
                  const lessonDir = path.join(sectionDir, lessonId);
                  ensureOutputDir(lessonDir);
                  
                  // Add lesson info
                  sectionInfo.lessons.push({
                    id: lessonId,
                    number: lessonNumber,
                    title: lesson.title,
                    url: lesson.url
                  });
                  
                  // Save individual lesson info
                  fs.writeFileSync(
                    path.join(lessonDir, 'info.json'),
                    JSON.stringify({
                      id: lessonId,
                      number: lessonNumber,
                      originalNumber: actualLessonNumber,
                      title: lesson.title,
                      url: lesson.url,
                      sectionId: sectionId,
                      sectionTitle: section.title
                    }, null, 2)
                  );
                  
                  // Add delay between requests
                  await new Promise(resolve => setTimeout(resolve, argv.delay));
                } catch (lessonError) {
                  log(`Error processing lesson: ${(lessonError as Error).message}`);
                  // Continue with next lesson
                }
              }
              
              // Add section info to unit
              unitInfo.sections!.push(sectionInfo);
              
              // Save section info
              fs.writeFileSync(
                path.join(sectionDir, 'info.json'),
                JSON.stringify(sectionInfo, null, 2)
              );
              
              // Add a delay between sections
              await new Promise(resolve => setTimeout(resolve, argv.delay));
            } catch (sectionError) {
              log(`Error processing section: ${(sectionError as Error).message}`);
              // Continue with next section
            }
          }
        } else {
          // For high school, directly get lessons from the unit
          const lessons = await extractLessonLinks(page, unitUrl, configUnit.name);
          log(`Found ${lessons.length} valid lessons for unit ${unitNumber}`);
          
          // Save raw lessons data for debugging
          fs.writeFileSync(
            path.join(unitDir, 'lessons-found.json'),
            JSON.stringify(lessons, null, 2)
          );
          
          // Process each lesson
          log(`Beginning to process ${lessons.length} lessons for unit ${unitNumber}`);
          for (let j = 0; j < lessons.length; j++) {
            try {
              const lesson = lessons[j];
              const lessonNumber = j + 1;
              const lessonId = `lesson-${lessonNumber}`;
              
              // Extract the actual lesson number from the title if possible
              let actualLessonNumber = lessonNumber;
              const lessonNumberMatch = lesson.title.match(/^Lesson\s+(\d+)/i);
              if (lessonNumberMatch && lessonNumberMatch[1]) {
                actualLessonNumber = parseInt(lessonNumberMatch[1]);
              }
              
              log(`- Processing lesson ${lessonNumber}/${lessons.length}: ${lesson.title} (original number: ${actualLessonNumber})`);
              
              // Create lesson directory
              const lessonDir = path.join(unitDir, lessonId);
              ensureOutputDir(lessonDir);
              
              // Add lesson info
              unitInfo.lessons!.push({
                id: lessonId,
                number: lessonNumber,
                title: lesson.title,
                url: lesson.url
              });
              
              // Save individual lesson info
              fs.writeFileSync(
                path.join(lessonDir, 'info.json'),
                JSON.stringify({
                  id: lessonId,
                  number: lessonNumber,
                  originalNumber: actualLessonNumber,
                  title: lesson.title,
                  url: lesson.url
                }, null, 2)
              );
              
              // Add delay between requests
              await new Promise(resolve => setTimeout(resolve, argv.delay));
              
              // Save progress after each lesson
              if ((j + 1) % 5 === 0) {
                fs.writeFileSync(
                  path.join(unitDir, 'progress.json'),
                  JSON.stringify({
                    processed: j + 1,
                    total: lessons.length,
                    timestamp: new Date().toISOString()
                  }, null, 2)
                );
              }
            } catch (lessonError) {
              log(`Error processing lesson: ${(lessonError as Error).message}`);
              // Continue with next lesson
            }
          }
        }
        
        // Add unit info to course
        courseInfo.units.push(unitInfo);
        
        // Save unit info
        fs.writeFileSync(
          path.join(unitDir, 'info.json'),
          JSON.stringify(unitInfo, null, 2)
        );
        
        // Add a delay between units
        log(`Completed unit ${unitNumber}, waiting before next unit...`);
        await new Promise(resolve => setTimeout(resolve, argv.delay * 2));
      } catch (unitError) {
        log(`Error processing unit: ${(unitError as Error).message}`);
        // Continue with next unit
      }
    }
    
    // Save course info
    fs.writeFileSync(
      path.join(courseDir, 'info.json'),
      JSON.stringify(courseInfo, null, 2)
    );
    
    log(`Course ${course.id} processed successfully`);
  } catch (error) {
    console.error(`Error processing course ${course.id}: ${(error as Error).message}`);
  } finally {
    await page.close();
  }
};

// Main function
const main = async () => {
  // Ensure output directory exists
  ensureOutputDir(argv.output);
  
  // Determine what to process
  let coursesToProcess: CourseToProcess[] = [];
  
  if (argv.course) {
    // Check if course exists
    const typedCourses = COURSES as CourseConfig;
    if (!typedCourses[argv.course]) {
      console.error(`Course not found with ID: ${argv.course}`);
      console.error(`Available courses: ${Object.keys(typedCourses).join(', ')}`);
      process.exit(1);
    }
    
    // Use course-specific configuration
    coursesToProcess = [
      {
        id: argv.course,
        title: typedCourses[argv.course].name,
        units: typedCourses[argv.course].units,
        isMiddleSchool: typedCourses[argv.course].isMiddleSchool
      }
    ];
  } else {
    // Process all courses with their units
    const typedCourses = COURSES as CourseConfig;
    coursesToProcess = Object.entries(typedCourses)
    .filter(([_, course]) => course.isMiddleSchool)  ////🚨🚨🚨🚨🚨 run this for middle school courses only
    .map(([id, course]) => ({
      id,
      title: course.name,
      units: course.units,
      isMiddleSchool: course.isMiddleSchool
    }));
  }
  
  // Launch browser
  log('Launching browser...');
  const browser = await chromium.launch({
    headless: argv.headless
  });
  
  try {
    for (const course of coursesToProcess) {
      await processCourse(browser, course);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
  
  log('Scraping completed!');
};

// Run the main function
main().catch(error => {
  console.error(`Fatal error: ${(error as Error).message}`);
  process.exit(1);
}); 