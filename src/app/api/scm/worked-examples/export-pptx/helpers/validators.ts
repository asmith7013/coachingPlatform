import * as cheerio from 'cheerio';
import { HTML_WIDTH, HTML_HEIGHT } from './constants';

// Slide bounds
const SLIDE_BOUNDS = {
  width: HTML_WIDTH,   // 960
  height: HTML_HEIGHT, // 540
  contentStartY: 150,  // Below title zone
  margin: 20,          // Edge margins
};

export interface ElementBounds {
  regionType: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bottom: number;  // y + h
  right: number;   // x + w
}

export interface BoundsIssue {
  element: ElementBounds;
  issue: 'overflow-right' | 'overflow-bottom' | 'overflow-both' | 'overlap';
  message: string;
}

export interface SlideValidation {
  slideIndex: number;
  elements: ElementBounds[];
  issues: BoundsIssue[];
  valid: boolean;
}

/**
 * Extract element bounds from HTML slide
 */
function extractElementBounds(html: string): ElementBounds[] {
  const $ = cheerio.load(html);
  const elements: ElementBounds[] = [];

  $('[data-pptx-region]').each((_, el) => {
    const $el = $(el);
    const x = parseInt($el.attr('data-pptx-x') || '0', 10);
    const y = parseInt($el.attr('data-pptx-y') || '0', 10);
    const w = parseInt($el.attr('data-pptx-w') || '0', 10);
    const h = parseInt($el.attr('data-pptx-h') || '0', 10);
    const regionType = $el.attr('data-pptx-region') || 'unknown';

    elements.push({
      regionType,
      x, y, w, h,
      bottom: y + h,
      right: x + w,
    });
  });

  return elements;
}

/**
 * Validate that all declared element bounds fit within slide
 */
export function validateSlideBounds(html: string, slideIndex: number = 0): SlideValidation {
  const elements = extractElementBounds(html);
  const issues: BoundsIssue[] = [];

  for (const el of elements) {
    const overflowRight = el.right > SLIDE_BOUNDS.width - SLIDE_BOUNDS.margin;
    const overflowBottom = el.bottom > SLIDE_BOUNDS.height;

    if (overflowRight && overflowBottom) {
      issues.push({
        element: el,
        issue: 'overflow-both',
        message: `${el.regionType}: exceeds slide bounds (right: ${el.right}px > ${SLIDE_BOUNDS.width - SLIDE_BOUNDS.margin}px, bottom: ${el.bottom}px > ${SLIDE_BOUNDS.height}px)`,
      });
    } else if (overflowRight) {
      issues.push({
        element: el,
        issue: 'overflow-right',
        message: `${el.regionType}: exceeds right bound (${el.right}px > ${SLIDE_BOUNDS.width - SLIDE_BOUNDS.margin}px)`,
      });
    } else if (overflowBottom) {
      issues.push({
        element: el,
        issue: 'overflow-bottom',
        message: `${el.regionType}: exceeds bottom bound (${el.bottom}px > ${SLIDE_BOUNDS.height}px)`,
      });
    }
  }

  return {
    slideIndex,
    elements,
    issues,
    valid: issues.length === 0,
  };
}

/**
 * Validate stacked elements in same column don't overlap or overflow
 */
export function validateStackedElements(html: string, slideIndex: number = 0): SlideValidation {
  const elements = extractElementBounds(html);
  const issues: BoundsIssue[] = [];

  // Group elements by column (left: x < 400, right: x >= 400)
  const leftCol = elements.filter(e => e.x < 400 && e.regionType !== 'badge' && e.regionType !== 'title' && e.regionType !== 'subtitle' && e.regionType !== 'footnote');
  const rightCol = elements.filter(e => e.x >= 400 && e.regionType !== 'cfu-box' && e.regionType !== 'answer-box');

  // Check for overlapping elements in each column
  const checkOverlap = (col: ElementBounds[], colName: string) => {
    const sorted = [...col].sort((a, b) => a.y - b.y);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      // Check if current element's bottom overlaps with next element's top
      if (current.bottom > next.y) {
        issues.push({
          element: current,
          issue: 'overlap',
          message: `${colName}: ${current.regionType} (bottom: ${current.bottom}px) overlaps with ${next.regionType} (top: ${next.y}px)`,
        });
      }
    }

    // Check if last element exceeds slide bounds
    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      if (last.bottom > SLIDE_BOUNDS.height) {
        issues.push({
          element: last,
          issue: 'overflow-bottom',
          message: `${colName}: ${last.regionType} exceeds slide height (${last.bottom}px > ${SLIDE_BOUNDS.height}px)`,
        });
      }
    }
  };

  checkOverlap(leftCol, 'left-column');
  checkOverlap(rightCol, 'right-column');

  return {
    slideIndex,
    elements,
    issues,
    valid: issues.length === 0,
  };
}

/**
 * Validate entire deck - returns all issues across all slides
 */
export function validateDeckBounds(slides: Array<{ htmlContent: string }>): {
  valid: boolean;
  slideResults: SlideValidation[];
  summary: string;
} {
  const slideResults: SlideValidation[] = [];

  for (let i = 0; i < slides.length; i++) {
    const boundsCheck = validateSlideBounds(slides[i].htmlContent, i);
    const stackCheck = validateStackedElements(slides[i].htmlContent, i);

    // Merge issues from both checks
    const mergedIssues = [...boundsCheck.issues, ...stackCheck.issues];

    slideResults.push({
      slideIndex: i,
      elements: boundsCheck.elements,
      issues: mergedIssues,
      valid: mergedIssues.length === 0,
    });
  }

  const totalIssues = slideResults.reduce((sum, r) => sum + r.issues.length, 0);
  const invalidSlides = slideResults.filter(r => !r.valid).length;

  return {
    valid: totalIssues === 0,
    slideResults,
    summary: totalIssues === 0
      ? `All ${slides.length} slides pass bounds validation`
      : `${invalidSlides}/${slides.length} slides have bounds issues (${totalIssues} total issues)`,
  };
}
