import * as cheerio from 'cheerio';

/**
 * Text run with formatting for pptxgenjs
 */
export interface TextRun {
  text: string;
  options: {
    bold?: boolean;
    color?: string;
    fontSize?: number;
    fontFace?: string;
  };
}

/**
 * Extract color from inline style, returning 6-char hex without #
 */
export function extractColor(style: string | undefined): string | undefined {
  if (!style) return undefined;
  const match = style.match(/color:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
  if (match) {
    let color = match[1].replace('#', '').toUpperCase();
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    return color;
  }
  return undefined;
}

/**
 * Extract background color from inline style (supports hex and rgba)
 */
export function extractBgColor(style: string | undefined): string | undefined {
  if (!style) return undefined;

  // Try hex format first
  const hexMatch = style.match(/background:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
  if (hexMatch) {
    let color = hexMatch[1].replace('#', '').toUpperCase();
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    return color;
  }

  // Try rgba format - convert to hex (ignoring alpha for PPTX)
  const rgbaMatch = style.match(/background:\s*rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const hex = ((r << 16) | (g << 8) | b).toString(16).toUpperCase().padStart(6, '0');
    return hex;
  }

  return undefined;
}

/**
 * Check if element has bold styling (from inline style only, not children)
 */
export function hasBoldStyle(style: string | undefined): boolean {
  return !!(style?.includes('font-weight: bold') || style?.includes('font-weight:bold'));
}

/**
 * Parse a paragraph element into text runs with proper formatting
 * Handles mixed inline styles like <strong>Think:</strong> rest of text
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTextRuns($: any, $el: any, defaultColor: string = '1D1D1D'): TextRun[] {
  const runs: TextRun[] = [];

  // Get the paragraph's own color if set
  const paragraphColor = extractColor($el.attr('style')) || defaultColor;
  const paragraphBold = hasBoldStyle($el.attr('style'));

  // Process child nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $el.contents().each((_: number, node: any) => {
    if (node.type === 'text') {
      // Plain text node
      const text = node.data || '';
      if (text.trim()) {
        runs.push({
          text,
          options: {
            bold: paragraphBold,
            color: paragraphColor,
          },
        });
      }
    } else if (node.type === 'tag') {
      const $node = $(node);
      const tagName = (node.name || '').toLowerCase();
      const nodeStyle = $node.attr('style');
      const nodeColor = extractColor(nodeStyle) || paragraphColor;
      const nodeBold = paragraphBold || tagName === 'strong' || tagName === 'b' || hasBoldStyle(nodeStyle);

      // Get text content of this element
      const text = $node.text();
      if (text.trim()) {
        runs.push({
          text,
          options: {
            bold: nodeBold,
            color: nodeColor,
          },
        });
      }
    }
  });

  return runs;
}

/**
 * Get text content using cheerio for proper parsing
 */
export function getTextContent(html: string): string {
  const $ = cheerio.load(html);
  return $('body').text().trim();
}
