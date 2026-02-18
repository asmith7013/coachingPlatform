// Component size variants (combines text size and padding)
export const componentSize = {
  xs: "text-xs px-1 py-0.5",
  sm: "text-sm px-2 py-1",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
  xl: "text-xl px-8 py-4",
};

// Gap variants
export const gap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

// Directional padding
export const paddingX = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
};

export const paddingY = {
  none: "py-0",
  xs: "py-0.5",
  sm: "py-1",
  md: "py-2",
  lg: "py-3",
  xl: "py-4",
  "2xl": "py-6",
};

// Margin tokens (currently missing)
export const margin = {
  none: "m-0",
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
  "2xl": "m-12",
};

export const marginX = {
  none: "mx-0",
  xs: "mx-1",
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6",
  xl: "mx-8",
  "2xl": "mx-12",
  auto: "mx-auto", // Common centering pattern
};

export const marginY = {
  none: "my-0",
  xs: "my-1",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
  "2xl": "my-12",
  auto: "my-auto", // Vertical centering
};

// Spacing between children (for stack layouts)
export const spaceBetween = {
  x: {
    none: "space-x-0",
    xs: "space-x-1",
    sm: "space-x-2",
    md: "space-x-4",
    lg: "space-x-6",
    xl: "space-x-8",
  },
  y: {
    none: "space-y-0",
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  },
};

// Stack spacing (legacy - consider using spaceBetween.y instead)
export const stack = {
  none: "space-y-0",
  xs: "space-y-1",
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
  xl: "space-y-8",
  "2xl": "space-y-12",
};

export type ComponentSize = keyof typeof componentSize;
export type Gap = keyof typeof gap;
export type PaddingSize = keyof typeof paddingX;
export type MarginSize = keyof typeof margin;
export type MarginXSize = keyof typeof marginX;
export type MarginYSize = keyof typeof marginY;
export type SpaceBetweenSize = keyof typeof spaceBetween.x; // Same for x and y
export type Stack = keyof typeof stack;
