import pptxgen from '@bapunhansdah/pptxgenjs';
import * as cheerio from 'cheerio';
import { PptxElement } from '../types';
import { pxToInches } from '../constants';
import { extractColor, extractBgColor, parseTextRuns } from './utils';

/**
 * Add a content box (rounded rect with text content)
 */
export function addContentBox(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const boxBg = el.bgColor || extractBgColor($('body').children().first().attr('style')) || 'F5F5F5';

  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: boxBg },
    rectRadius: 0.08,
  });

  // Extract all text with colors and mixed formatting
  let currentY = y + 0.1;
  const lineHeight = 0.25;

  $('body').find('p, h3, h4').each((_, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    const tagName = elem.type === 'tag' ? elem.name : '';
    const isHeader = tagName === 'h3' || tagName === 'h4';
    const fontSize = tagName === 'h3' ? 14 : tagName === 'h4' ? 13 : 12;

    if (text) {
      // Parse text runs for mixed formatting
      const runs = parseTextRuns($, $elem, '1D1D1D');

      if (runs.length > 0 && !isHeader) {
        // Use text runs for mixed formatting in paragraphs
        slide.addText(
          runs.map((run) => ({
            text: run.text,
            options: {
              bold: run.options.bold,
              color: run.options.color,
              fontSize,
              fontFace: 'Arial',
            },
          })),
          {
            x: x + 0.15, y: currentY, w: w - 0.3, h: lineHeight,
            valign: 'top',
          }
        );
      } else {
        // Headers are all bold
        const color = extractColor($elem.attr('style')) || '1D1D1D';
        slide.addText(text, {
          x: x + 0.15, y: currentY, w: w - 0.3, h: lineHeight,
          fontSize, fontFace: 'Arial', bold: isHeader, color, valign: 'top',
        });
      }
      currentY += lineHeight;
    }
  });
}

/**
 * Add a learning goal box (special formatting)
 */
export function addLearningGoalBox(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);

  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: 'F5F5F5' },
    rectRadius: 0.1,
  });

  slide.addText('LEARNING GOAL', {
    x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.25,
    fontSize: 10, fontFace: 'Arial', bold: true, color: '737373',
  });

  // Get goal text, excluding the "Learning Goal" label
  let goalText = '';
  $('body').find('p').each((_, p) => {
    const text = $(p).text().trim();
    if (!text.toLowerCase().includes('learning goal')) {
      goalText += text + ' ';
    }
  });
  goalText = goalText.trim();

  if (goalText) {
    slide.addText(goalText, {
      x: x + 0.2, y: y + 0.4, w: w - 0.4, h: h - 0.55,
      fontSize: 14, fontFace: 'Arial', color: '1D1D1D', valign: 'top',
    });
  }
}

/**
 * Add a styled box like CFU or Answer (background + border accent + label + content)
 * All elements animate together: first gets 'onClick', rest get 'withPrevious'
 */
export function addStyledBox(
  slide: pptxgen.Slide,
  el: PptxElement,
  bgColor: string,
  borderColor: string,
  labelColor: string,
  label: string
): void {
  const x = pxToInches(el.x, 'w');
  const y = pxToInches(el.y, 'h');
  const w = pxToInches(el.w, 'w');
  const h = pxToInches(el.h, 'h');

  const $ = cheerio.load(el.content);

  // Animation helper - first element triggers on click, rest appear with it
  let isFirstElement = true;
  const getAnimation = () => {
    const trigger = isFirstElement ? 'onClick' : 'withPrevious';
    isFirstElement = false;
    return {
      type: 'appear' as const,
      trigger: trigger as 'onClick' | 'withPrevious',
    };
  };

  // Background
  slide.addShape('rect', {
    x, y, w, h,
    fill: { color: bgColor },
    animation: getAnimation(),
  });

  // Left border accent
  slide.addShape('rect', {
    x, y, w: 0.05, h,
    fill: { color: borderColor },
    animation: getAnimation(),
  });

  // Label
  slide.addText(label, {
    x: x + 0.15,
    y: y + 0.1,
    w: w - 0.3,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: labelColor,
    animation: getAnimation(),
  });

  // Content - get all paragraphs except the label
  let currentY = y + 0.35;
  const lineHeight = 0.22;

  $('body').find('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text().trim();

    // Skip if this is the label text
    if (text.toUpperCase() === label || text.toUpperCase().includes(label)) {
      return;
    }

    if (text) {
      // Parse text runs for mixed formatting (e.g., "Think:" bold, rest normal)
      const runs = parseTextRuns($, $p, '1D1D1D');

      if (runs.length > 0) {
        // Use text runs for mixed formatting
        slide.addText(
          runs.map((run) => ({
            text: run.text,
            options: {
              bold: run.options.bold,
              color: run.options.color,
              fontSize: 11,
              fontFace: 'Arial',
            },
          })),
          {
            x: x + 0.15,
            y: currentY,
            w: w - 0.3,
            h: lineHeight,
            valign: 'top',
            animation: getAnimation(),
          }
        );
      } else {
        // Fallback: plain text
        slide.addText(text, {
          x: x + 0.15,
          y: currentY,
          w: w - 0.3,
          h: lineHeight,
          fontSize: 11,
          fontFace: 'Arial',
          color: '1D1D1D',
          valign: 'top',
          animation: getAnimation(),
        });
      }
      currentY += lineHeight;
    }
  });
}
