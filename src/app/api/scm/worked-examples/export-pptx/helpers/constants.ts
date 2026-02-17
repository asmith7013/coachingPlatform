// PPTX dimensions in inches (16:9)
export const SLIDE_WIDTH = 10;
export const SLIDE_HEIGHT = 5.625;

// HTML slide dimensions in pixels
export const HTML_WIDTH = 960;
export const HTML_HEIGHT = 540;

// Convert pixels to inches based on dimension
export const pxToInches = (px: number, dimension: "w" | "h"): number => {
  return dimension === "w"
    ? (px / HTML_WIDTH) * SLIDE_WIDTH
    : (px / HTML_HEIGHT) * SLIDE_HEIGHT;
};
