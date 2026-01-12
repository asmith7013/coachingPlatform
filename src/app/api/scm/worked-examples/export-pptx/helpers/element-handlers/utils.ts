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
 * Extract font-size from inline style, returning value in points
 * Supports px (converts to pt) and pt values
 */
export function extractFontSize(style: string | undefined, defaultSize: number = 12): number {
  if (!style) return defaultSize;

  // Match font-size with px or pt unit
  const match = style.match(/font-size:\s*(\d+(?:\.\d+)?)(px|pt)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    // Convert px to pt (1px ≈ 0.75pt, or 96dpi/72dpi)
    if (unit === 'px') {
      return Math.round(value * 0.75);
    }
    return Math.round(value);
  }

  return defaultSize;
}

/**
 * Extract font-family from inline style
 */
export function extractFontFamily(style: string | undefined): string | undefined {
  if (!style) return undefined;

  // Match font-family (handles both single font and font stack)
  const match = style.match(/font-family:\s*([^;]+)/i);
  if (match) {
    const family = match[1].trim();
    // Return first font in the stack, cleaned up
    const firstFont = family.split(',')[0].trim().replace(/['"]/g, '');
    // Map common fonts to PPTX-safe equivalents
    if (firstFont.toLowerCase() === 'georgia') return 'Georgia';
    if (firstFont.toLowerCase().includes('serif') && !firstFont.toLowerCase().includes('sans')) return 'Georgia';
    return 'Arial'; // Default to Arial for sans-serif and unknown fonts
  }

  return undefined;
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

/**
 * Determine if HTML content is "simple" enough to render natively in PPTX.
 * Simple content = text elements + simple tables (p, h3, h4, ul, ol, li, strong, span, table)
 * Complex content = SVG, images, canvas, or complex nested structures
 *
 * @returns true if content can be rendered natively, false if screenshot is needed
 */
export function isSimpleTextContent(html: string): boolean {
  const $ = cheerio.load(html);

  // Check for complex elements that require screenshot
  // Note: tables are now supported natively
  const complexElements = ['svg', 'img', 'canvas', 'video', 'iframe'];
  for (const tag of complexElements) {
    if ($(tag).length > 0) {
      return false;
    }
  }

  // Check for elements with absolute/fixed positioning (complex layout)
  let hasComplexPositioning = false;
  $('*').each((_, el) => {
    const style = $(el).attr('style') || '';
    if (style.includes('position: absolute') || style.includes('position:absolute') ||
        style.includes('position: fixed') || style.includes('position:fixed')) {
      hasComplexPositioning = true;
      return false; // break
    }
  });

  if (hasComplexPositioning) {
    return false;
  }

  // Check for MathJax or KaTeX elements
  if ($('.MathJax').length > 0 || $('.katex').length > 0) {
    return false;
  }

  // Check for nested divs with backgrounds (complex visual layout)
  // This catches styled card layouts like "Meaning 1" / "Meaning 2" boxes
  let hasNestedStyledDivs = false;
  $('div').each((_, outerDiv) => {
    const $outerDiv = $(outerDiv);
    const outerStyle = $outerDiv.attr('style') || '';
    const outerHasBg = outerStyle.includes('background');

    // Check if this div has nested divs with backgrounds
    $outerDiv.find('div').each((_, innerDiv) => {
      const innerStyle = $(innerDiv).attr('style') || '';
      if (innerStyle.includes('background') && outerHasBg) {
        hasNestedStyledDivs = true;
        return false; // break inner loop
      }
    });

    if (hasNestedStyledDivs) {
      return false; // break outer loop
    }
  });

  if (hasNestedStyledDivs) {
    return false;
  }

  // Content is simple - text elements and tables can be rendered natively
  return true;
}
