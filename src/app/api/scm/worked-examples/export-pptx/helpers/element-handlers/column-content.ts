import pptxgen from '@bapunhansdah/pptxgenjs';
import * as cheerio from 'cheerio';
import { PptxElement } from '../types';
import { pxToInches } from '../constants';
import { TextRun, extractColor, extractBgColor, hasBoldStyle, parseTextRuns } from './utils';

/**
 * Estimate how many lines a text will need when wrapped to a given width.
 * Uses character count approximation based on font size and width.
 *
 * @param text - The text content
 * @param widthInches - Available width in inches
 * @param fontSize - Font size in points
 * @returns Estimated number of lines (minimum 1)
 */
function estimateLines(text: string, widthInches: number, fontSize: number): number {
  if (!text || text.length === 0) return 1;

  // Approximate characters per inch based on font size
  // Arial at 12pt is roughly 10-12 chars per inch; smaller fonts fit more
  const charsPerInch = 120 / fontSize;
  const charsPerLine = Math.floor(widthInches * charsPerInch);

  // Ensure we don't divide by zero
  if (charsPerLine <= 0) return 1;

  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

/**
 * Add column content (left-column, content) as native elements
 * Uses cheerio for proper HTML parsing and extracts inline colors
 */
export function addColumnContent(slide: pptxgen.Slide, el: PptxElement): void {
  const baseX = pxToInches(el.x, 'w');
  let currentY = pxToInches(el.y, 'h');
  const colWidth = pxToInches(el.w, 'w');
  const lineHeight = 0.28;
  const padding = 0.1;

  const $ = cheerio.load(el.content);

  // Process direct children in order
  $('body').children().each((_, child) => {
    const $child = $(child);
    const tagName = child.type === 'tag' ? child.name.toLowerCase() : '';

    // Handle h3 headers
    if (tagName === 'h3') {
      const text = $child.text().trim();
      const color = extractColor($child.attr('style')) || '1D1D1D';
      if (text) {
        slide.addText(text, {
          x: baseX, y: currentY, w: colWidth, h: 0.35,
          fontSize: 14, fontFace: 'Arial', bold: true, color,
        });
        currentY += 0.4;
      }
    }

    // Handle bullet lists
    else if (tagName === 'ul') {
      $child.find('li').each((_, li) => {
        const $li = $(li);
        const text = $li.text().trim();
        const color = extractColor($li.attr('style')) || '1D1D1D';
        if (text) {
          const bulletText = `• ${text}`;
          const itemLines = estimateLines(bulletText, colWidth, 12);
          const itemHeight = itemLines * lineHeight;
          slide.addText(bulletText, {
            x: baseX, y: currentY, w: colWidth, h: itemHeight,
            fontSize: 12, fontFace: 'Arial', color, valign: 'top',
          });
          currentY += itemHeight;
        }
      });
      currentY += 0.1;
    }

    // Handle divs with background (content boxes)
    else if (tagName === 'div') {
      const bgColor = extractBgColor($child.attr('style'));

      if (bgColor) {
        // This is a styled box - render with background
        const innerTexts: Array<{ text: string; color: string; bold: boolean; fontSize: number; align: 'left' | 'center'; textRuns?: TextRun[]; bgColor?: string }> = [];

        // Get h3 if present
        const $h3 = $child.find('h3').first();
        if ($h3.length) {
          innerTexts.push({
            text: $h3.text().trim(),
            color: extractColor($h3.attr('style')) || '1D1D1D',
            bold: true,
            fontSize: 13,
            align: 'left',
          });
        }

        // Process all content in order: p, ul/li elements
        $child.children().each((_, childEl) => {
          if (childEl.type !== 'tag') return;
          const childTag = childEl.name.toLowerCase();
          const $childEl = $(childEl);

          if (childTag === 'p') {
            const text = $childEl.text().trim();
            const color = extractColor($childEl.attr('style')) || '1D1D1D';
            const style = $childEl.attr('style') || '';
            const isCentered = style.includes('text-align: center') || style.includes('text-align:center');
            // Check if entire paragraph is bold (via style or if it's all wrapped in strong)
            const isBold = hasBoldStyle(style) || ($childEl.find('strong').length > 0 && $childEl.find('strong').text().trim() === text);
            const isEquation = /^y\s*=/.test(text) || /^\d+x/.test(text);

            if (text) {
              innerTexts.push({
                text,
                color,
                bold: isBold || isEquation,
                fontSize: isEquation ? 14 : 11,
                align: isCentered || isEquation ? 'center' : 'left',
              });
            }
          } else if (childTag === 'ul') {
            // Handle list items inside styled divs with mixed formatting
            $childEl.find('li').each((_, li) => {
              const $li = $(li);
              const text = $li.text().trim();
              const liBgColor = extractBgColor($li.attr('style'));

              if (text) {
                // Parse text runs for mixed bold/color formatting
                const runs = parseTextRuns($, $li, '1D1D1D');

                if (runs.length > 0) {
                  // Add bullet prefix to first run
                  runs[0].text = `• ${runs[0].text}`;
                  innerTexts.push({
                    text: '', // Will use textRuns instead
                    color: '1D1D1D',
                    bold: false,
                    fontSize: 11,
                    align: 'left',
                    textRuns: runs,
                    bgColor: liBgColor, // Include background if present
                  });
                } else {
                  // Fallback: simple text
                  const color = extractColor($li.attr('style')) || '1D1D1D';
                  innerTexts.push({
                    text: `• ${text}`,
                    color,
                    bold: false,
                    fontSize: 11,
                    align: 'left',
                    bgColor: liBgColor, // Include background if present
                  });
                }
              }
            });
          }
        });

        // Calculate box height based on estimated wrapped lines for each text item
        const textWidth = colWidth - padding * 2;
        const totalLines = innerTexts.reduce((sum, item) => {
          const text = item.textRuns
            ? item.textRuns.map(r => r.text).join('')
            : item.text;
          return sum + estimateLines(text, textWidth, item.fontSize);
        }, 0);
        const boxHeight = Math.max(0.5, totalLines * lineHeight + 0.25);

        // Draw background box
        slide.addShape('roundRect', {
          x: baseX, y: currentY, w: colWidth, h: boxHeight,
          fill: { color: bgColor }, rectRadius: 0.08,
        });

        // Add text elements with proper height allocation
        let textY = currentY + padding;
        for (const item of innerTexts) {
          const text = item.textRuns
            ? item.textRuns.map(r => r.text).join('')
            : item.text;
          const itemLines = estimateLines(text, textWidth, item.fontSize);
          const itemHeight = itemLines * lineHeight;

          // Draw item background if present (e.g., highlighted list items)
          if (item.bgColor) {
            slide.addShape('roundRect', {
              x: baseX + padding - 0.02,
              y: textY - 0.02,
              w: colWidth - padding * 2 + 0.04,
              h: itemHeight + 0.04,
              fill: { color: item.bgColor },
              rectRadius: 0.04,
            });
          }

          if (item.textRuns && item.textRuns.length > 0) {
            // Render with mixed formatting using text runs
            slide.addText(
              item.textRuns.map((run) => ({
                text: run.text,
                options: {
                  bold: run.options.bold,
                  color: run.options.color,
                  fontSize: item.fontSize,
                  fontFace: 'Arial',
                },
              })),
              {
                x: baseX + padding, y: textY, w: textWidth, h: itemHeight,
                valign: 'top',
              }
            );
          } else {
            // Simple text
            slide.addText(item.text, {
              x: baseX + padding, y: textY, w: textWidth, h: itemHeight,
              fontSize: item.fontSize, fontFace: 'Arial', bold: item.bold,
              color: item.color, align: item.align,
            });
          }
          textY += itemHeight;
        }
        currentY += boxHeight + 0.12;
      } else {
        // Plain div - process its children recursively
        $child.children().each((_, innerChild) => {
          const $inner = $(innerChild);
          const innerTag = innerChild.type === 'tag' ? innerChild.name.toLowerCase() : '';

          if (innerTag === 'p') {
            const text = $inner.text().trim();
            const color = extractColor($inner.attr('style')) || '1D1D1D';
            if (text && text.length > 2) {
              const itemLines = estimateLines(text, colWidth, 12);
              const itemHeight = itemLines * lineHeight;
              slide.addText(text, {
                x: baseX, y: currentY, w: colWidth, h: itemHeight,
                fontSize: 12, fontFace: 'Arial', color,
              });
              currentY += itemHeight;
            }
          }
        });
      }
    }

    // Handle standalone paragraphs
    else if (tagName === 'p') {
      const text = $child.text().trim();
      const color = extractColor($child.attr('style')) || '1D1D1D';
      if (text && text.length > 2) {
        const itemLines = estimateLines(text, colWidth, 12);
        const itemHeight = itemLines * lineHeight;
        slide.addText(text, {
          x: baseX, y: currentY, w: colWidth, h: itemHeight,
          fontSize: 12, fontFace: 'Arial', color,
        });
        currentY += itemHeight;
      }
    }
  });
}
