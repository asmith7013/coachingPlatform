import * as cheerio from 'cheerio';
import { PptxElement, ParsedSlide } from './types';

/**
 * Extract ALL elements with data-pptx-* attributes from HTML
 * Uses cheerio for proper HTML parsing to handle nested tags correctly
 */
export function extractPptxElements(html: string): PptxElement[] {
  const elements: PptxElement[] = [];
  const $ = cheerio.load(html);

  // Find all elements with data-pptx-region attribute
  $('[data-pptx-region]').each((_, el) => {
    const $el = $(el);

    const regionType = $el.attr('data-pptx-region');
    const x = $el.attr('data-pptx-x');
    const y = $el.attr('data-pptx-y');
    const w = $el.attr('data-pptx-w');
    const h = $el.attr('data-pptx-h');

    // Skip if missing required attributes
    if (!regionType || !x || !y || !w || !h) {
      return;
    }

    // Get the full inner HTML content (properly handles nested tags)
    const content = $el.html() || '';

    // Extract style for background/border colors
    const style = $el.attr('style') || '';
    let bgColor: string | undefined;
    let borderColor: string | undefined;

    if (style) {
      const bgMatch = style.match(/background:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
      if (bgMatch) {
        bgColor = bgMatch[1].replace('#', '').toUpperCase();
      }
      const borderMatch = style.match(/border-left:\s*\d+px\s+solid\s+(#[a-f0-9]{6})/i);
      if (borderMatch) {
        borderColor = borderMatch[1].replace('#', '').toUpperCase();
      }
    }

    elements.push({
      regionType,
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      w: parseInt(w, 10),
      h: parseInt(h, 10),
      content,
      bgColor,
      borderColor,
    });
  });

  return elements;
}

/**
 * Parse HTML slide structure to extract SVG region and other components
 * Used primarily for SVG positioning which still needs image rendering
 */
export function parseSlideHtml(html: string): ParsedSlide {
  const result: ParsedSlide = { bodyContent: [] };
  const $ = cheerio.load(html);

  // Find SVG elements
  const $svg = $('svg').first();
  if ($svg.length === 0) {
    return result;
  }

  // Get the full SVG HTML
  const svgHtml = $.html($svg);

  // Extract layer names from data-pptx-layer attributes
  const layers: string[] = [];
  $svg.find('[data-pptx-layer]').each((_, el) => {
    const layerName = $(el).attr('data-pptx-layer');
    if (layerName && !layers.includes(layerName)) {
      layers.push(layerName);
    }
  });

  // Try to find the containing element with pptx position data
  // First check for svg-container region
  const $svgContainer = $('[data-pptx-region="svg-container"]');
  if ($svgContainer.length > 0) {
    const x = $svgContainer.attr('data-pptx-x');
    const y = $svgContainer.attr('data-pptx-y');
    const w = $svgContainer.attr('data-pptx-w');
    const h = $svgContainer.attr('data-pptx-h');

    if (x && y && w && h) {
      result.svgRegion = {
        html: svgHtml,
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        width: parseInt(w, 10),
        height: parseInt(h, 10),
        layers: layers.length > 0 ? layers : undefined,
      };
      return result;
    }
  }

  // Check for right-column containing SVG (common in two-column layouts)
  const $rightColumn = $('[data-pptx-region="right-column"]');
  if ($rightColumn.length > 0 && $rightColumn.find('svg').length > 0) {
    const x = $rightColumn.attr('data-pptx-x');
    const y = $rightColumn.attr('data-pptx-y');
    const w = $rightColumn.attr('data-pptx-w');
    const h = $rightColumn.attr('data-pptx-h');

    if (x && y && w && h) {
      result.svgRegion = {
        html: svgHtml,
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        width: parseInt(w, 10),
        height: parseInt(h, 10),
        layers: layers.length > 0 ? layers : undefined,
      };
      return result;
    }
  }

  // Fallback: check for legacy format
  const $legacyContainer = $('[data-svg-region="true"]');
  if ($legacyContainer.length > 0) {
    const x = $legacyContainer.attr('data-region-x');
    const y = $legacyContainer.attr('data-region-y');
    const width = $legacyContainer.attr('data-region-width');
    const height = $legacyContainer.attr('data-region-height');

    if (x && y && width && height) {
      result.svgRegion = {
        html: svgHtml,
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        layers: layers.length > 0 ? layers : undefined,
      };
      return result;
    }
  }

  // Final fallback: estimate based on layout
  const isTwoColumn =
    $('[data-pptx-region="left-column"]').length > 0 ||
    $('[data-pptx-region="right-column"]').length > 0;

  if (isTwoColumn) {
    result.svgRegion = {
      html: svgHtml,
      x: 408,
      y: 130,
      width: 532,
      height: 370,
      layers: layers.length > 0 ? layers : undefined,
    };
  } else {
    result.svgRegion = {
      html: svgHtml,
      x: 180,
      y: 120,
      width: 600,
      height: 360,
      layers: layers.length > 0 ? layers : undefined,
    };
  }

  return result;
}
