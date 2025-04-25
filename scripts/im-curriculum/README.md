# Illustrative Mathematics Curriculum Scraper

A tool to extract lesson links and download PDFs from the Illustrative Mathematics curriculum website.

## Overview

This scraper extracts:
1. All lesson links from IM curriculum unit pages
2. PDF resources from lesson pages
3. Organizes content by course, unit, and lesson

The implementation consists of three main components:
- `course-config.js` - Configuration data for all available courses and units
- `scraper.js` - Main script to extract lesson links
- `pdf-downloader.js` - Script to download PDFs from lesson pages

## Installation

This scraper requires additional dependencies not included in the main project. Run the following command to install them:

```bash
# Install required dependencies
npm install playwright axios yargs

# Install Playwright browsers
npx playwright install chromium
```

If you prefer to keep these dependencies separate from the main project, you can use:

```bash
# Install dependencies directly
npm install --no-save playwright axios yargs
```

## Usage

### Extract Lesson Links

```bash
# Extract lesson links from all configured courses
node scripts/im-curriculum/scraper.js

# Extract lesson links for a specific course
node scripts/im-curriculum/scraper.js --course algebra1

# Extract lesson links with verbose logging
node scripts/im-curriculum/scraper.js --verbose

# Show all options
node scripts/im-curriculum/scraper.js --help
```

### Download PDFs

```bash
# Download PDFs from all extracted courses
node scripts/im-curriculum/pdf-downloader.js

# Download PDFs from a specific course
node scripts/im-curriculum/pdf-downloader.js --course algebra1

# Download PDFs from a specific unit
node scripts/im-curriculum/pdf-downloader.js --course algebra1 --unit 316459

# Download PDFs from a specific lesson
node scripts/im-curriculum/pdf-downloader.js --course algebra1 --unit 316459 --lesson 35758

# Show all options
node scripts/im-curriculum/pdf-downloader.js --help
```

## Command Line Options

### Scraper Options

- `--course <courseId>` - Specific course to process
- `--unit <unitId>` - Specific unit to process
- `--delay <ms>` - Delay between requests in milliseconds (default: 1000ms)
- `--timeout <ms>` - Page load timeout in milliseconds (default: 30000ms)
- `--verbose` - Enable detailed logging
- `--output <dir>` - Output directory (default: ./im_curriculum)

### PDF Downloader Options

- `--course <courseId>` - Specific course to process
- `--unit <unitId>` - Specific unit to process
- `--lesson <lessonId>` - Specific lesson to process
- `--delay <ms>` - Delay between requests in milliseconds (default: 1000ms)
- `--timeout <ms>` - Page load timeout in milliseconds (default: 30000ms)
- `--verbose` - Enable detailed logging
- `--output <dir>` - Output directory (default: ./im_curriculum)
- `--maxRetries <count>` - Maximum number of retries for downloads (default: 3)

## Output Structure

```
im_curriculum/
├── algebra1/
│   ├── unit316459/
│   │   ├── unit-content.json
│   │   ├── lesson35758/
│   │   │   ├── lesson-files.json
│   │   │   └── [PDF files]
```

## Available Courses

The scraper supports the following courses:

- `algebra1` - Algebra 1
- `algebra2` - Algebra 2
- `geometry` - Geometry
- `grade8` - Grade 8
- `grade7` - Grade 7
- `grade6` - Grade 6

## Customization

You can add more courses or update existing ones by modifying the `course-config.js` file. Each course requires:

- `name` - Display name for the course
- `baseUrl` - URL to the course overview page
- `units` - Array of unit objects with id and name

## Troubleshooting

- **No PDFs Found**: Some lessons may not have downloadable PDFs. The script will create empty directories in these cases.
- **Download Errors**: The PDF downloader will retry failed downloads up to the configured maximum retries. Check the console output for error messages.
- **Performance Issues**: If the scraper is slow or encounters errors, try increasing the timeout and delay values. 