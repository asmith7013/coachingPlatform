import pptxgen from '@bapunhansdah/pptxgenjs';
import * as cheerio from 'cheerio';
import { PptxElement } from '../types';
import { extractColor, extractBgColor, getTextContent } from './utils';
import { TYPOGRAPHY, COLORS } from '../region-constants';

/**
 * Add a badge (rounded rect with text)
 */
export function addBadge(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const bgColor = el.bgColor || extractBgColor($('body').children().first().attr('style')) || COLORS['primary'];
  const textColor = extractColor($('body').children().first().attr('style')) || TYPOGRAPHY['badge'].color;
  const text = $('body').text().trim();

  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: bgColor },
    rectRadius: 0.15,
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['badge'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['badge'].bold,
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
  const color = extractColor($first.attr('style')) || TYPOGRAPHY['title'].color;

  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['title'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['title'].bold,
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
  const color = extractColor($first.attr('style')) || TYPOGRAPHY['subtitle'].color;

  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['subtitle'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['subtitle'].bold,
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
  const color = extractColor($first.attr('style')) || TYPOGRAPHY['footnote'].color;

  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['footnote'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['footnote'].bold,
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
    fill: { color: COLORS['primary'] },
    rectRadius: 0.15,
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['strategy-badge'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['strategy-badge'].bold,
    color: TYPOGRAPHY['strategy-badge'].color,
    align: 'center',
    valign: 'middle',
  });
}

/**
 * Add a strategy name (large centered text)
 */
export function addStrategyName(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const color = extractColor($('body').children().first().attr('style')) || TYPOGRAPHY['strategy-name'].color;

  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['strategy-name'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['strategy-name'].bold,
    color,
    align: 'center',
    valign: 'middle',
  });
}

/**
 * Add a strategy summary (medium centered text)
 */
export function addStrategySummary(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const $ = cheerio.load(el.content);
  const text = $('body').text().trim();
  const color = extractColor($('body').children().first().attr('style')) || TYPOGRAPHY['strategy-summary'].color;

  slide.addText(text, {
    x, y, w, h,
    fontSize: TYPOGRAPHY['strategy-summary'].size,
    fontFace: 'Arial',
    bold: TYPOGRAPHY['strategy-summary'].bold,
    color,
    align: 'center',
    valign: 'top',
  });
}

/**
 * Add visual area (right column, problem visual)
 * Always skips - these regions are rendered as images in processSlide for pixel-perfect export
 */
export function addVisualArea(_slide: pptxgen.Slide, _el: PptxElement, _x: number, _y: number, _w: number, _h: number): void {
  // All right-column/problem-visual regions are rendered as images in processSlide
  // This ensures styled content (tables, equations, boxes) exports correctly
  return;
}

/**
 * Add default text (fallback handler)
 */
export function addDefaultText(slide: pptxgen.Slide, el: PptxElement, x: number, y: number, w: number, h: number): void {
  const text = getTextContent(el.content);
  if (text && !text.includes('{{')) {
    const $ = cheerio.load(el.content);
    const color = extractColor($('body').children().first().attr('style')) || TYPOGRAPHY['body'].color;

    slide.addText(text, {
      x, y, w, h,
      fontSize: TYPOGRAPHY['body'].size,
      fontFace: 'Arial',
      bold: TYPOGRAPHY['body'].bold,
      color,
      valign: 'top',
    });
  }
}
