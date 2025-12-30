/**
 * Region default positions for PPTX slide layout.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/reference/region-defaults.md
 * To update: Edit the markdown file, then run:
 *   npm run sync-skill-content
 */

// Slide dimensions
export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;
export const MARGIN = 20;

// Region default positions (pixels)
export const REGION_DEFAULTS: Record<string, { x: number; y: number; w: number; h: number }> = {
  'badge': { x: 20, y: 16, w: 100, h: 30 },
  'title': { x: 130, y: 16, w: 810, h: 30 },
  'subtitle': { x: 20, y: 55, w: 920, h: 30 },
  'footnote': { x: 700, y: 8, w: 240, h: 25 },
  'content': { x: 20, y: 150, w: 920, h: 350 },
  'left-column': { x: 20, y: 150, w: 368, h: 360 },
  'right-column': { x: 408, y: 150, w: 532, h: 360 },
  'svg-container': { x: 408, y: 150, w: 532, h: 360 },
  'cfu-box': { x: 653, y: 40, w: 280, h: 115 },
  'answer-box': { x: 653, y: 40, w: 280, h: 115 }
};

// Bounds validation helpers
export const MAX_RIGHT = SLIDE_WIDTH - MARGIN; // 940
export const MAX_BOTTOM = SLIDE_HEIGHT; // 540

export function isWithinBounds(x: number, y: number, w: number, h: number): boolean {
  return (x + w <= MAX_RIGHT) && (y + h <= MAX_BOTTOM);
}
