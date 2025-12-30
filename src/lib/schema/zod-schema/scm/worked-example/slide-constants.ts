/**
 * Explicit pixel dimensions for slide elements
 * Extracted from existing templates for consistency
 */
export const SLIDE_CONSTANTS = {
  // Slide dimensions (960x540 = 16:9 aspect ratio)
  SLIDE_WIDTH: 960,
  SLIDE_HEIGHT: 540,

  // Margins
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  MARGIN_TOP: 16,
  MARGIN_BOTTOM: 20,
  GAP: 20,

  // Title zone (badge + title on same line, y: 0-100)
  TITLE_ZONE_HEIGHT: 100,
  BADGE: { x: 20, y: 16, w: 100, h: 30 },      // Same line as title
  TITLE: { x: 130, y: 16, w: 810, h: 30 },     // Same line as badge
  SUBTITLE: { x: 20, y: 55, w: 920, h: 30 },   // Below badge+title row
  FOOTNOTE: { x: 700, y: 8, w: 240, h: 25 },

  // Content zone (y: 140-500 for full width, y: 140-510 for columns)
  CONTENT_ZONE_TOP: 140,
  CONTENT_ZONE_HEIGHT: 360,
  CONTENT_ZONE: { x: 20, y: 140, w: 920, h: 360 },

  // CFU/Answer overlay (top-right, absolute positioned)
  CFU_BOX: { x: 653, y: 40, w: 280, h: 115 },
  ANSWER_BOX: { x: 653, y: 40, w: 280, h: 115 },

  // Two-column layouts (from slide-two-column.html)
  // 40% / 60% split with 20px gap
  TWO_COLUMN_40_60: {
    left: { x: 20, y: 140, w: 368, h: 370 },
    right: { x: 408, y: 140, w: 532, h: 370 },
  },
  // 35% / 65% split (graph-heavy)
  TWO_COLUMN_35_65: {
    left: { x: 20, y: 140, w: 316, h: 370 },
    right: { x: 356, y: 140, w: 584, h: 370 },
  },
} as const;

// Derived types
export type SlideRegionBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};
