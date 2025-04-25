import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { COURSES } from './course-config.js';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Path to the scraped data directory',
    default: './im-curriculum'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for downloaded PDFs',
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
    description: 'Specific course to download PDFs for (by ID)',
  })
  .option('unit', {
    type: 'string',
    description: 'Specific unit to download PDFs for (by ID)',
  })
  .option('lesson', {
    type: 'string',
    description: 'Specific lesson to download PDFs for (by ID)',
  })
  .option('headless', {
    type: 'boolean',
    description: 'Run browser in headless mode',
    default: true
  })
  .option('delay', {
    type: 'number',
    description: 'Delay between downloads in milliseconds',
    default: 2000
  })
  .option('maxRetries', {
    type: 'number',
    description: 'Maximum number of retries for downloads',
    default: 3
  })
  .help()
  .alias('help', 'h')
  .argv;

// Logger function
const log = (message, isVerbose = false) => {
  if (!isVerbose || (isVerbose && argv.verbose)) {
    console.log(message);
  }
};

// Ensure output directory exists
const ensureOutputDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Extract PDF links from lesson page
const extractPdfLinks = async (page, lessonUrl) => {
  await page.goto(lessonUrl, { waitUntil: 'domcontentloaded' });
  
  // Wait for the lesson content to load
  await page.waitForSelector('.curriculum-lesson');
  
  // Find all PDF links in the lesson
  return await page.evaluate(() => {
    const pdfLinks = [];
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.toLowerCase().endsWith('.pdf')) {
        // Get closest heading or text to use as title
        let title = '';
        let currentElement = link;
        
        // Look for a parent heading
        while (currentElement && !title) {
          const heading = currentElement.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) {
            title = heading.textContent.trim();
          }
          currentElement = currentElement.parentElement;
        }
        
        // If no heading found, use link text or "Untitled PDF"
        if (!title) {
          title = link.textContent.trim() || path.basename(href);
        }
        
        pdfLinks.push({
          title: title,
          url: href,
          filename: path.basename(href)
        });
      }
    });
    
    return pdfLinks;
  });
};

// Download a single PDF file
const downloadPdf = async (page, pdfInfo, outputDir, retryCount = 0) => {
  try {
    // Create a clean filename from title
    const cleanTitle = pdfInfo.title
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
    
    // Use clean title + original filename to avoid conflicts
    const filename = `${cleanTitle}-${pdfInfo.filename}`;
    const outputPath = path.join(outputDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      log(`PDF already exists: ${filename}`, true);
      return { success: true, path: outputPath };
    }
    
    log(`Downloading PDF: ${pdfInfo.title}`, true);
    
    // Download the PDF file
    const pdfResponse = await page.goto(pdfInfo.url);
    
    if (!pdfResponse.ok()) {
      throw new Error(`Failed to download PDF, status code: ${pdfResponse.status()}`);
    }
    
    // Save the PDF file
    const buffer = await pdfResponse.body();
    fs.writeFileSync(outputPath, buffer);
    
    log(`PDF downloaded: ${filename}`);
    return { success: true, path: outputPath };
  } catch (error) {
    log(`Error downloading PDF: ${error.message}`, true);
    
    // Retry download if not reached max retries
    if (retryCount < argv.maxRetries) {
      log(`Retrying download (${retryCount + 1}/${argv.maxRetries})...`, true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      return downloadPdf(page, pdfInfo, outputDir, retryCount + 1);
    }
    
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Process a single lesson
const processLesson = async (page, lessonInfo, outputDir) => {
  log(`Processing lesson: ${lessonInfo.title}`);
  
  // Create lesson output directory
  const lessonDir = path.join(outputDir, 'pdfs');
  ensureOutputDir(lessonDir);
  
  // Extract PDF links from lesson page
  const pdfLinks = await extractPdfLinks(page, lessonInfo.url);
  log(`Found ${pdfLinks.length} PDFs in lesson ${lessonInfo.title}`);
  
  // Download each PDF
  const results = [];
  for (const pdfInfo of pdfLinks) {
    const result = await downloadPdf(page, pdfInfo, lessonDir);
    results.push({
      ...pdfInfo,
      success: result.success,
      path: result.success ? result.path : null,
      error: result.error
    });
    
    // Add delay between downloads
    await new Promise(resolve => setTimeout(resolve, argv.delay));
  }
  
  // Save download results
  const resultsPath = path.join(outputDir, 'pdf_downloads.json');
  fs.writeFileSync(
    resultsPath,
    JSON.stringify({
      lesson: lessonInfo,
      pdfs: results,
      timestamp: new Date().toISOString()
    }, null, 2)
  );
  
  return results;
};

// Load course info
const loadCourseInfo = (courseId) => {
  const courseInfoPath = path.join(argv.input, courseId, 'info.json');
  if (!fs.existsSync(courseInfoPath)) {
    throw new Error(`Course info not found: ${courseInfoPath}`);
  }
  
  return JSON.parse(fs.readFileSync(courseInfoPath, 'utf8'));
};

// Load all courses
const loadAllCourses = () => {
  const courses = [];
  const coursesDirs = fs.readdirSync(argv.input, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const courseDir of coursesDirs) {
    const infoPath = path.join(argv.input, courseDir, 'info.json');
    if (fs.existsSync(infoPath)) {
      try {
        const courseInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        courses.push(courseInfo);
      } catch (error) {
        log(`Error loading course info for ${courseDir}: ${error.message}`, true);
      }
    }
  }
  
  return courses;
};

// Main function
const main = async () => {
  // Ensure output directory exists
  ensureOutputDir(argv.output);
  
  // Launch browser
  log('Launching browser...');
  const browser = await chromium.launch({
    headless: argv.headless
  });
  
  try {
    const page = await browser.newPage();
    
    if (argv.course && argv.unit && argv.lesson) {
      // Process specific lesson
      if (!COURSES[argv.course]) {
        throw new Error(`Course not found with ID: ${argv.course}`);
      }
      
      const courseInfo = loadCourseInfo(argv.course);
      const unit = courseInfo.units.find(u => u.id === argv.unit);
      
      if (!unit) {
        throw new Error(`Unit not found with ID: ${argv.unit}`);
      }
      
      const lesson = unit.lessons.find(l => l.id === argv.lesson);
      
      if (!lesson) {
        throw new Error(`Lesson not found with ID: ${argv.lesson}`);
      }
      
      const lessonDir = path.join(argv.output, argv.course, argv.unit, argv.lesson);
      await processLesson(page, lesson, lessonDir);
    } else if (argv.course && argv.unit) {
      // Process all lessons in a unit
      if (!COURSES[argv.course]) {
        throw new Error(`Course not found with ID: ${argv.course}`);
      }
      
      const courseInfo = loadCourseInfo(argv.course);
      const unit = courseInfo.units.find(u => u.id === argv.unit);
      
      if (!unit) {
        throw new Error(`Unit not found with ID: ${argv.unit}`);
      }
      
      for (const lesson of unit.lessons) {
        const lessonDir = path.join(argv.output, argv.course, argv.unit, lesson.id);
        await processLesson(page, lesson, lessonDir);
      }
    } else if (argv.course) {
      // Process all units in a course
      if (!COURSES[argv.course]) {
        throw new Error(`Course not found with ID: ${argv.course}`);
      }
      
      const courseInfo = loadCourseInfo(argv.course);
      
      for (const unit of courseInfo.units) {
        for (const lesson of unit.lessons) {
          const lessonDir = path.join(argv.output, argv.course, unit.id, lesson.id);
          await processLesson(page, lesson, lessonDir);
        }
      }
    } else {
      // Process all courses that exist in the input directory
      const courses = loadAllCourses();
      log(`Found ${courses.length} courses`);
      
      for (const course of courses) {
        for (const unit of course.units) {
          for (const lesson of unit.lessons) {
            const lessonDir = path.join(argv.output, course.id, unit.id, lesson.id);
            await processLesson(page, lesson, lessonDir);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  log('PDF download completed!');
};

// Run the main function
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
}); 