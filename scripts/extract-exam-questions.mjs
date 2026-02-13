#!/usr/bin/env node

/**
 * Extract individual question screenshots from a NY Regents exam PDF.
 *
 * Prerequisites (macOS):
 *   brew install poppler imagemagick
 *
 * Usage:
 *   node scripts/extract-exam-questions.mjs <pdf-path> [output-dir]
 *
 * How it works:
 *   1. pdftohtml -xml  → extracts positioned text (question numbers are bold at left margin)
 *   2. pdftoppm        → renders full pages as high-res PNGs
 *   3. magick crop      → isolates each question by y-coordinate boundaries
 *
 * Note: Multi-page questions (e.g. Q35 "continued on next page") only capture the first page.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, renameSync, statSync } from 'fs';
import { join } from 'path';

const PDF_PATH = process.argv[2];
const OUTPUT_DIR = process.argv[3] || './exam-questions-output';
const DPI = 300;

if (!PDF_PATH) {
  console.error('Usage: node scripts/extract-exam-questions.mjs <pdf-path> [output-dir]');
  process.exit(1);
}

if (!existsSync(PDF_PATH)) {
  console.error(`File not found: ${PDF_PATH}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

// Step 1: Get XML with positioned text
const xmlStr = execSync(`pdftohtml -xml -stdout "${PDF_PATH}" 2>/dev/null`).toString();

// Step 2: Parse question positions using regex
// Question numbers in Regents exams are bold text near the left margin (left ~78)
const pageRegex = /<page number="(\d+)"[^>]*height="(\d+)"[^>]*width="(\d+)"[^>]*>([\s\S]*?)<\/page>/g;

const questions = [];
let pageMatch;
while ((pageMatch = pageRegex.exec(xmlStr)) !== null) {
  const pageNum = parseInt(pageMatch[1]);
  const pageHeight = parseInt(pageMatch[2]);
  const pageContent = pageMatch[4];

  const localTextRegex = /<text top="(\d+)" left="(\d+)"[^>]*><b>(\d{1,2})<\/b><\/text>/g;
  let textMatch;
  while ((textMatch = localTextRegex.exec(pageContent)) !== null) {
    const top = parseInt(textMatch[1]);
    const left = parseInt(textMatch[2]);
    const qNum = parseInt(textMatch[3]);

    // Question numbers are bold, near left margin (left ~60-120)
    if (qNum >= 1 && qNum <= 50 && left >= 60 && left <= 120) {
      questions.push({ pageNum, qNum, yTop: top, pageHeight });
    }
  }
}

// Deduplicate and sort
const seen = new Set();
const uniqueQuestions = questions.filter(q => {
  if (seen.has(q.qNum)) return false;
  seen.add(q.qNum);
  return true;
}).sort((a, b) => a.qNum - b.qNum);

console.log(`Found ${uniqueQuestions.length} questions:`);
for (const q of uniqueQuestions) {
  console.log(`  Q${q.qNum}: page ${q.pageNum}, y=${q.yTop}/${q.pageHeight}`);
}

// Step 3: Calculate crop regions
const cropRegions = uniqueQuestions.map((q, i) => {
  // Find next question on same page
  let yBottom = q.pageHeight - 50; // default: near page bottom (leaving footer)
  for (let j = i + 1; j < uniqueQuestions.length; j++) {
    if (uniqueQuestions[j].pageNum === q.pageNum) {
      yBottom = uniqueQuestions[j].yTop - 15; // 15px padding above next question
      break;
    }
  }
  const yStart = Math.max(0, q.yTop - 15);
  return { ...q, yStart, yBottom };
});

// Step 4: Render needed pages as PNGs
const pagesNeeded = [...new Set(cropRegions.map(cr => cr.pageNum))];
for (const p of pagesNeeded) {
  const pagePng = join(OUTPUT_DIR, `_fullpage_${String(p).padStart(2, '0')}.png`);
  if (!existsSync(pagePng)) {
    const prefix = join(OUTPUT_DIR, `_fullpage_${String(p).padStart(2, '0')}`);
    execSync(`pdftoppm -png -r ${DPI} -f ${p} -l ${p} "${PDF_PATH}" "${prefix}"`);
    const generated = `${prefix}-${String(p).padStart(2, '0')}.png`;
    if (existsSync(generated)) {
      renameSync(generated, pagePng);
    }
  }
}

// Step 5: Crop individual questions
console.log('\nCropping questions...');
for (const cr of cropRegions) {
  const pagePng = join(OUTPUT_DIR, `_fullpage_${String(cr.pageNum).padStart(2, '0')}.png`);
  if (!existsSync(pagePng)) {
    console.log(`  WARNING: Missing page image for Q${cr.qNum}`);
    continue;
  }

  // XML coordinates are 1.5x PDF points (1188 height for 792pt page)
  const xmlToPdfScale = 792.0 / 1188.0;
  const pdfToPixelScale = DPI / 72.0;
  const scale = xmlToPdfScale * pdfToPixelScale;

  const pixelTop = Math.floor(cr.yStart * scale);
  const pixelBottom = Math.floor(cr.yBottom * scale);
  const cropHeight = pixelBottom - pixelTop;

  // Get image width
  const imgWidth = execSync(`identify -format "%w" "${pagePng}"`).toString().trim();

  const outputPath = join(OUTPUT_DIR, `q${String(cr.qNum).padStart(2, '0')}.png`);
  execSync(`magick "${pagePng}" -crop ${imgWidth}x${cropHeight}+0+${pixelTop} +repage "${outputPath}"`);

  if (existsSync(outputPath)) {
    const size = statSync(outputPath).size;
    console.log(`  Q${cr.qNum}: ${outputPath} (${Math.round(size / 1024)}KB)`);
  } else {
    console.log(`  Q${cr.qNum}: FAILED`);
  }
}

console.log('\nDone!');
