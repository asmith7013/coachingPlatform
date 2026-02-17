// Text size scale
export const textSize = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

// Heading styles
export const heading = {
  h1: "text-4xl md:text-5xl leading-tight",
  h2: "text-3xl md:text-4xl leading-tight",
  h3: "text-2xl md:text-3xl leading-snug",
  h4: "text-xl md:text-2xl leading-snug",
  h5: "text-lg md:text-xl leading-normal",
  h6: "text-base md:text-lg leading-normal",
};

// Font weights
export const weight = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

// Text colors
export const color = {
  default: "text-gray-900",
  muted: "text-gray-600",
  accent: "text-indigo-600",
  danger: "text-red-600",
  white: "text-white",
};

export type TextSize = keyof typeof textSize;
export type HeadingLevel = keyof typeof heading;
export type FontWeight = keyof typeof weight;
export type TextColor = keyof typeof color;

// Export typography object for backward compatibility
export const typography = {
  heading,
  textSize,
  weight,
  color,
};
