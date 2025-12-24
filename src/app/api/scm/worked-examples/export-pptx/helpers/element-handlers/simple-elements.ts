import pptxgen from 'pptxgenjs';
import * as cheerio from 'cheerio';
import { PptxElement } from '../types';
import { extractColor, extractBgColor, getTextContent } from './utils';

/**
 * Add a badge (rounded rect with text)
 */
export function addBadge(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const bgColor = el.bgColor || extractBgColor($('body').children().first().attr('style')) || '1791E8';
  const textColor = extractColor($('body').children().first().attr('style')) || 'FFFFFF';
  const text = $('body').text().trim();

  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: bgColor },
    rectRadius: 0.15,
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: textColor,
    align: 'center',
    valign: 'middle',
  });
}

/**
 * Add a title (large bold text)
 */
export function addTitle(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const $first = $('body').children().first();
  const color = extractColor($first.attr('style')) || '1791E8';

  slide.addText(text, {
    x, y, w, h,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color,
  });
}

/**
 * Add a subtitle (smaller text below title)
 */
export function addSubtitle(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const $first = $('body').children().first();
  const color = extractColor($first.attr('style')) || '1D1D1D';

  slide.addText(text, {
    x, y, w, h,
    fontSize: 14,
    fontFace: 'Arial',
    color,
  });
}

/**
 * Add a footnote (small right-aligned text)
 */
export function addFootnote(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const $first = $('body').children().first();
  const color = extractColor($first.attr('style')) || '666666';

  slide.addText(text, {
    x, y, w, h,
    fontSize: 9,
    fontFace: 'Arial',
    color,
    align: 'right',
  });
}

/**
 * Add a strategy badge (for strategy slides)
 */
export function addStrategyBadge(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const text = getTextContent(el.content);

  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: '1791E8' },
    rectRadius: 0.15,
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: 12, fontFace: 'Arial', bold: true, color: 'FFFFFF',
    align: 'center', valign: 'middle',
  });
}

/**
 * Add a strategy name (large centered text)
 */
export function addStrategyName(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const color = extractColor($('body').children().first().attr('style')) || '1D1D1D';

  slide.addText(text, {
    x, y, w, h,
    fontSize: 36, fontFace: 'Arial', bold: false, color,
    align: 'center', valign: 'middle',
  });
}

/**
 * Add a strategy summary (medium centered text)
 */
export function addStrategySummary(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const color = extractColor($('body').children().first().attr('style')) || '737373';

  slide.addText(text, {
    x, y, w, h,
    fontSize: 18, fontFace: 'Arial', color,
    align: 'center', valign: 'top',
  });
}

/**
 * Add visual area (right column, problem visual - skips SVG content)
 */
export function addVisualArea(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  // Skip if this region contains an SVG - it will be handled by the SVG renderer
  if (/<svg[\s>]/i.test(el.content)) {
    return;
  }

  const text = getTextContent(el.content);
  if (text && !text.includes('{{')) {
    const $ = cheerio.load(el.content);
    const color = extractColor($('body').children().first().attr('style')) || '1D1D1D';

    slide.addText(text, {
      x, y, w, h,
      fontSize: 12, fontFace: 'Arial', color,
      align: 'center', valign: 'middle',
    });
  }
}

/**
 * Add default text (fallback handler)
 */
export function addDefaultText(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const text = getTextContent(el.content);
  if (text && !text.includes('{{')) {
    const $ = cheerio.load(el.content);
    const color = extractColor($('body').children().first().attr('style')) || '1D1D1D';

    slide.addText(text, {
      x, y, w, h,
      fontSize: 12,
      fontFace: 'Arial',
      color,
      valign: 'top',
    });
  }
}
