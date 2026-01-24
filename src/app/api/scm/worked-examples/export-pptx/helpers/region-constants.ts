/**
 * Region default positions, typography, and colors for PPTX slide layout.
 *
 * Reference: src/app/scm/workedExamples/create/ai/reference/region-defaults.md
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

// Typography (shared between HTML generation and PPTX export)
export const TYPOGRAPHY: Record<string, { size: number; bold: boolean; color: string }> = {
  'badge': { size: 13, bold: true, color: 'FFFFFF' },
  'title': { size: 28, bold: true, color: '1791E8' },
  'subtitle': { size: 16, bold: false, color: '1D1D1D' },
  'footnote': { size: 10, bold: false, color: '666666' },
  'body': { size: 14, bold: false, color: '1D1D1D' },
  'section-header': { size: 15, bold: true, color: '1D1D1D' },
  'supporting': { size: 13, bold: false, color: '737373' },
  'strategy-badge': { size: 12, bold: true, color: 'FFFFFF' },
  'strategy-name': { size: 36, bold: false, color: '1D1D1D' },
  'strategy-summary': { size: 18, bold: false, color: '737373' }
};

// Colors (shared between HTML generation and PPTX export)
export const COLORS: Record<string, string> = {
  'primary': '1791E8',
  'surface': 'FFFFFF',
  'foreground': '1D1D1D',
  'muted-bg': 'F5F5F5',
  'muted-text': '737373',
  'cfu-bg': 'FEF3C7',
  'cfu-border': 'F59E0B',
  'cfu-text': '92400E',
  'answer-bg': 'DCFCE7',
  'answer-border': '22C55E',
  'answer-text': '166534',
  'border': 'E5E7EB'
};

// Bounds validation helpers
export const MAX_RIGHT = SLIDE_WIDTH - MARGIN; // 940
export const MAX_BOTTOM = SLIDE_HEIGHT; // 540

export function isWithinBounds(x: number, y: number, w: number, h: number): boolean {
  return (x + w <= MAX_RIGHT) && (y + h <= MAX_BOTTOM);
}
