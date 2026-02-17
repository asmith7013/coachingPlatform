import { z } from "zod";
import { SLIDE_CONSTANTS } from "./slide-constants";

/**
 * Region and Layout Preset Schemas
 * Defines the 4-region slide structure and layout presets
 */

// Region positions (4 quadrants)
export const RegionPositionSchema = z.enum([
  "top-left", // Title zone (badge, title, subtitle)
  "top-right", // CFU/Answer overlay
  "bottom-left", // Left content column
  "bottom-right", // Right content column (usually visual)
]);
export type RegionPosition = z.infer<typeof RegionPositionSchema>;

// Layout preset names
export const LayoutPresetNameSchema = z.enum([
  "full-width", // Single content area (100% bottom)
  "two-column", // 40/60 split (text | visual)
  "two-column-with-cfu", // Two-column + CFU overlay
  "graph-heavy", // 30/70 split (narrow text | large graph)
  "with-cfu", // Full-width + CFU overlay
]);
export type LayoutPresetName = z.infer<typeof LayoutPresetNameSchema>;

// Row configuration (height and column ratios)
export const RowConfigSchema = z.object({
  height: z.number(),
  leftRatio: z.number().min(0).max(1),
  rightRatio: z.number().min(0).max(1),
});
export type RowConfig = z.infer<typeof RowConfigSchema>;

// Full layout preset definition
export const LayoutPresetSchema = z.object({
  name: LayoutPresetNameSchema,
  topRow: RowConfigSchema,
  bottomRow: RowConfigSchema,
});
export type LayoutPreset = z.infer<typeof LayoutPresetSchema>;

// Predefined layout presets
export const LAYOUT_PRESETS: Record<LayoutPresetName, LayoutPreset> = {
  // Full width content area
  "full-width": {
    name: "full-width",
    topRow: { height: 130, leftRatio: 1.0, rightRatio: 0 },
    bottomRow: { height: 360, leftRatio: 1.0, rightRatio: 0 },
  },
  // Two-column 40/60 split
  "two-column": {
    name: "two-column",
    topRow: { height: 130, leftRatio: 1.0, rightRatio: 0 },
    bottomRow: { height: 370, leftRatio: 0.4, rightRatio: 0.6 },
  },
  // Two-column with CFU overlay
  "two-column-with-cfu": {
    name: "two-column-with-cfu",
    topRow: { height: 130, leftRatio: 0.67, rightRatio: 0.33 },
    bottomRow: { height: 370, leftRatio: 0.4, rightRatio: 0.6 },
  },
  // Graph-heavy 35/65 split (narrower text, larger visual)
  "graph-heavy": {
    name: "graph-heavy",
    topRow: { height: 130, leftRatio: 1.0, rightRatio: 0 },
    bottomRow: { height: 370, leftRatio: 0.35, rightRatio: 0.65 },
  },
  // Full width with CFU overlay
  "with-cfu": {
    name: "with-cfu",
    topRow: { height: 130, leftRatio: 0.67, rightRatio: 0.33 },
    bottomRow: { height: 360, leftRatio: 1.0, rightRatio: 0 },
  },
};

/**
 * Calculate pixel bounds for a region based on layout preset
 */
export function calculateRegionBounds(
  preset: LayoutPresetName,
  region: RegionPosition,
): { x: number; y: number; w: number; h: number } {
  const layout = LAYOUT_PRESETS[preset];
  const { SLIDE_WIDTH, MARGIN_LEFT, MARGIN_RIGHT, GAP } = SLIDE_CONSTANTS;
  const contentWidth = SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  switch (region) {
    case "top-left":
      return {
        x: MARGIN_LEFT,
        y: SLIDE_CONSTANTS.MARGIN_TOP,
        w: Math.floor(contentWidth * layout.topRow.leftRatio - GAP / 2),
        h: layout.topRow.height,
      };
    case "top-right":
      if (layout.topRow.rightRatio === 0) {
        return { x: 0, y: 0, w: 0, h: 0 }; // No right region
      }
      return {
        x:
          MARGIN_LEFT +
          Math.floor(contentWidth * layout.topRow.leftRatio) +
          GAP / 2,
        y: SLIDE_CONSTANTS.MARGIN_TOP,
        w: Math.floor(contentWidth * layout.topRow.rightRatio - GAP / 2),
        h: layout.topRow.height,
      };
    case "bottom-left":
      return {
        x: MARGIN_LEFT,
        y: SLIDE_CONSTANTS.CONTENT_ZONE_TOP,
        w:
          layout.bottomRow.rightRatio === 0
            ? contentWidth
            : Math.floor(contentWidth * layout.bottomRow.leftRatio - GAP / 2),
        h: layout.bottomRow.height,
      };
    case "bottom-right":
      if (layout.bottomRow.rightRatio === 0) {
        return { x: 0, y: 0, w: 0, h: 0 }; // No right region
      }
      return {
        x:
          MARGIN_LEFT +
          Math.floor(contentWidth * layout.bottomRow.leftRatio) +
          GAP / 2,
        y: SLIDE_CONSTANTS.CONTENT_ZONE_TOP,
        w: Math.floor(contentWidth * layout.bottomRow.rightRatio - GAP / 2),
        h: layout.bottomRow.height,
      };
  }
}
