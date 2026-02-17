import * as cheerio from "cheerio";
import { PptxElement, ParsedSlide } from "./types";
import { REGION_DEFAULTS } from "./region-constants";

// Re-export for backward compatibility
export { REGION_DEFAULTS } from "./region-constants";

/**
 * Extract ALL elements with data-pptx-* attributes from HTML
 * Uses cheerio for proper HTML parsing to handle nested tags correctly
 */
export function extractPptxElements(html: string): PptxElement[] {
  const elements: PptxElement[] = [];
  const $ = cheerio.load(html);

  // Find all elements with data-pptx-region attribute
  $("[data-pptx-region]").each((_, el) => {
    const $el = $(el);

    const regionType = $el.attr("data-pptx-region");
    const x = $el.attr("data-pptx-x");
    const y = $el.attr("data-pptx-y");
    const w = $el.attr("data-pptx-w");
    const h = $el.attr("data-pptx-h");

    // Skip if missing required attributes
    if (!regionType || !x || !y || !w || !h) {
      return;
    }

    // Get the full inner HTML content (properly handles nested tags)
    const content = $el.html() || "";

    // Extract style for background/border colors
    const style = $el.attr("style") || "";
    let bgColor: string | undefined;
    let borderColor: string | undefined;

    if (style) {
      const bgMatch = style.match(/background:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
      if (bgMatch) {
        bgColor = bgMatch[1].replace("#", "").toUpperCase();
      }
      const borderMatch = style.match(
        /border-left:\s*\d+px\s+solid\s+(#[a-f0-9]{6})/i,
      );
      if (borderMatch) {
        borderColor = borderMatch[1].replace("#", "").toUpperCase();
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

// =============================================================================
// STRUCTURE-BASED PARSING - Fallback for slides without data-pptx-* attributes
// =============================================================================

/**
 * Extract color from inline style (text color)
 * @deprecated Use extractBgFromStyle for backgrounds - kept for future use
 */
function _extractColorFromStyle(style: string | undefined): string | undefined {
  if (!style) return undefined;
  const match = style.match(/(?:^|[^-])color:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
  if (match) {
    let color = match[1].replace("#", "").toUpperCase();
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    return color;
  }
  return undefined;
}

/**
 * Extract background color from inline style
 */
function extractBgFromStyle(style: string | undefined): string | undefined {
  if (!style) return undefined;
  const match = style.match(/background:\s*(#[a-f0-9]{6}|#[a-f0-9]{3})/i);
  if (match) {
    let color = match[1].replace("#", "").toUpperCase();
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    return color;
  }
  return undefined;
}

/**
 * Extract elements from HTML structure when data-pptx-* attributes are missing
 * Uses heuristics to identify regions by their visual characteristics
 */
export function extractElementsFromStructure(html: string): PptxElement[] {
  const elements: PptxElement[] = [];
  const $ = cheerio.load(html);

  // Track what we've found to avoid duplicates
  const foundRegions = new Set<string>();

  // ==========================================================================
  // 1. TITLE ZONE - Look for badge, title, subtitle in first container
  // ==========================================================================

  // Find badge: div with blue background (#1791e8) containing uppercase text
  $("div").each((_, el) => {
    const $el = $(el);
    const style = $el.attr("style") || "";
    const bgColor = extractBgFromStyle(style);

    // Badge: blue background, contains short uppercase text
    if (bgColor === "1791E8" && !foundRegions.has("badge")) {
      const text = $el.text().trim();
      if (text.length < 50 && text === text.toUpperCase()) {
        foundRegions.add("badge");
        elements.push({
          regionType: "badge",
          ...REGION_DEFAULTS.badge,
          content: $el.html() || "",
          bgColor,
        });
      }
    }
  });

  // Find title: h1 element with primary color
  const $h1 = $("h1").first();
  if ($h1.length > 0 && !foundRegions.has("title")) {
    foundRegions.add("title");
    elements.push({
      regionType: "title",
      ...REGION_DEFAULTS.title,
      content: $h1.html() || "",
    });
  }

  // Find subtitle: first p element after title (in title zone area)
  // Look for p elements that appear to be subtitles (not in content boxes)
  $("body > div")
    .first()
    .find("> p, > div > p")
    .each((i, el) => {
      if (i === 0 && !foundRegions.has("subtitle")) {
        const $el = $(el);
        const text = $el.text().trim();
        // Subtitle should be meaningful text, not just a label
        if (text.length > 10 && text.length < 200) {
          foundRegions.add("subtitle");
          elements.push({
            regionType: "subtitle",
            ...REGION_DEFAULTS.subtitle,
            content: $el.html() || "",
          });
        }
      }
    });

  // ==========================================================================
  // 2. CONTENT ZONE - Detect layout and extract columns
  // ==========================================================================

  // Detect two-column layout by looking for row containers with two children
  const $contentRows = $("body > div.row, body > div > div.row").filter(
    (_, el) => {
      const $el = $(el);
      const children = $el.children('div.col, div[style*="width"]');
      return children.length >= 2;
    },
  );

  if ($contentRows.length > 0) {
    // Two-column layout detected
    const $row = $contentRows.first();
    const $columns = $row.children('div.col, div[style*="width"]');

    // Left column (first column without SVG)
    $columns.each((i, col) => {
      const $col = $(col);
      const hasSvg = $col.find("svg").length > 0;

      if (!hasSvg && !foundRegions.has("left-column")) {
        foundRegions.add("left-column");
        elements.push({
          regionType: "left-column",
          ...REGION_DEFAULTS["left-column"],
          content: $col.html() || "",
        });
      }
    });
  } else {
    // Full-width layout - look for content container
    const $contentDiv = $("body > div")
      .filter((_, el) => {
        const $el = $(el);
        // Content div: has padding, contains p/ul/div elements, not title zone
        const hasPadding = ($el.attr("style") || "").includes("padding");
        const hasContent = $el.find("p, ul, ol, div").length > 0;
        const isNotTitleZone = !$el.find("h1").length;
        return hasPadding && hasContent && isNotTitleZone;
      })
      .first();

    if ($contentDiv.length > 0 && !foundRegions.has("content")) {
      foundRegions.add("content");
      elements.push({
        regionType: "content",
        ...REGION_DEFAULTS.content,
        content: $contentDiv.html() || "",
      });
    }
  }

  // ==========================================================================
  // 3. CFU/ANSWER BOXES - Already handled by data-pptx-region, but add fallback
  // ==========================================================================

  // Look for CFU-style boxes (yellow background with border-left)
  if (!foundRegions.has("cfu-box")) {
    $("div").each((_, el) => {
      const $el = $(el);
      const style = $el.attr("style") || "";
      const bgColor = extractBgFromStyle(style);
      const hasBorderLeft = style.includes("border-left");
      const text = $el.text().toLowerCase();

      // CFU: yellow background, left border, contains "check" or "understanding"
      if (
        bgColor === "FEF3C7" &&
        hasBorderLeft &&
        (text.includes("check") ||
          text.includes("understanding") ||
          text.includes("think"))
      ) {
        // Only add if it's positioned absolutely (overlay)
        if (
          style.includes("position: absolute") ||
          style.includes("position:absolute")
        ) {
          foundRegions.add("cfu-box");
          elements.push({
            regionType: "cfu-box",
            ...REGION_DEFAULTS["cfu-box"],
            content: $el.html() || "",
            bgColor,
            borderColor: "F59E0B",
          });
        }
      }

      // Answer: green background, left border
      if (bgColor === "DCFCE7" && hasBorderLeft && text.includes("answer")) {
        if (
          style.includes("position: absolute") ||
          style.includes("position:absolute")
        ) {
          foundRegions.add("answer-box");
          elements.push({
            regionType: "answer-box",
            ...REGION_DEFAULTS["answer-box"],
            content: $el.html() || "",
            bgColor,
            borderColor: "22C55E",
          });
        }
      }
    });
  }

  return elements;
}

/**
 * Merge explicit data-pptx-* elements with structure-based fallback
 * Prefers explicit attributes when available
 */
export function extractAllPptxElements(html: string): PptxElement[] {
  // First, get elements with explicit data-pptx-* attributes
  const explicitElements = extractPptxElements(html);
  const explicitRegions = new Set(explicitElements.map((e) => e.regionType));

  // Then, get elements from structure (fallback)
  const structureElements = extractElementsFromStructure(html);

  // Merge: use explicit elements, add structure elements only if not already found
  const mergedElements = [...explicitElements];
  for (const el of structureElements) {
    if (!explicitRegions.has(el.regionType)) {
      mergedElements.push(el);
    }
  }

  return mergedElements;
}

/**
 * Parse HTML slide structure to extract SVG region and other components
 * Used primarily for SVG positioning which still needs image rendering
 */
export function parseSlideHtml(html: string): ParsedSlide {
  const result: ParsedSlide = { bodyContent: [] };
  const $ = cheerio.load(html);

  // Find SVG elements
  const $svg = $("svg").first();
  if ($svg.length === 0) {
    return result;
  }

  // Get the full SVG HTML
  const svgHtml = $.html($svg);

  // Extract layer names from data-pptx-layer attributes
  const layers: string[] = [];
  $svg.find("[data-pptx-layer]").each((_, el) => {
    const layerName = $(el).attr("data-pptx-layer");
    if (layerName && !layers.includes(layerName)) {
      layers.push(layerName);
    }
  });

  // Try to find the containing element with pptx position data
  // First check for svg-container region
  const $svgContainer = $('[data-pptx-region="svg-container"]');
  if ($svgContainer.length > 0) {
    const x = $svgContainer.attr("data-pptx-x");
    const y = $svgContainer.attr("data-pptx-y");
    const w = $svgContainer.attr("data-pptx-w");
    const h = $svgContainer.attr("data-pptx-h");

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
  if ($rightColumn.length > 0 && $rightColumn.find("svg").length > 0) {
    const x = $rightColumn.attr("data-pptx-x");
    const y = $rightColumn.attr("data-pptx-y");
    const w = $rightColumn.attr("data-pptx-w");
    const h = $rightColumn.attr("data-pptx-h");

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
    const x = $legacyContainer.attr("data-region-x");
    const y = $legacyContainer.attr("data-region-y");
    const width = $legacyContainer.attr("data-region-width");
    const height = $legacyContainer.attr("data-region-height");

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
