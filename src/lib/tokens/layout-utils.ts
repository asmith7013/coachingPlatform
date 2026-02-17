// src/lib/tokens/layout-utils.ts

// Centering utilities (very common pattern)
export const center = {
  x: "mx-auto", // Horizontal centering
  y: "my-auto", // Vertical centering
  both: "m-auto", // Both directions
};

// Flex utilities (common in components)
export const flex = {
  grow: "flex-1", // Flex grow
  shrink: "shrink-0", // Prevent shrinking
  minWidth: "w-0", // Min width for flex-1 patterns
  none: "flex-none", // No flex
};

// Position utilities
export const position = {
  static: "static",
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
  sticky: "sticky",
};

// Common positioning offsets
export const inset = {
  auto: "inset-auto",
  full: "inset-0",
  x: {
    auto: "inset-x-auto",
    full: "inset-x-0",
  },
  y: {
    auto: "inset-y-auto",
    full: "inset-y-0",
  },
};

// Type exports
export type CenterToken = keyof typeof center;
export type FlexToken = keyof typeof flex;
export type PositionToken = keyof typeof position;
