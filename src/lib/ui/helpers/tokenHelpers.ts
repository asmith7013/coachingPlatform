/**
 * Token Helper Utilities
 * 
 * This file provides helper functions and utilities for working with design tokens.
 * It centralizes token access and provides utility functions for common use cases.
 */

import { color, textSize, weight, heading } from './tokens/typography';
import { textColors } from './tokens/text';
import { radii, shadows } from './tokens/shape';
import { paddingX, paddingY, gap, stack } from './tokens/spacing';
import { semanticColorMap, tailwindColors } from './tokens/colors';

// Common text style helpers
export const textStyles = {
  // Text colors
  default: textColors.default,
  muted: textColors.muted,
  accent: textColors.accent,
  danger: textColors.danger,
  
  // Heading helpers
  h1: heading.h1,
  h2: heading.h2,
  h3: heading.h3,
  h4: heading.h4,
  h5: heading.h5,
  h6: heading.h6,
  
  // Combined text styles
  bodySmall: `${textSize.sm} ${color.muted}`,
  bodyNormal: `${textSize.base} ${color.default}`,
  bodyLarge: `${textSize.lg} ${color.default}`,
  
  // Weight helpers
  normal: weight.normal,
  medium: weight.medium,
  semibold: weight.semibold,
  bold: weight.bold,
};

// Spacing helpers
export const spacingUtils = {
  // Padding
  paddingNone: 'p-0',
  paddingSm: `${paddingX.sm} ${paddingY.sm}`,
  paddingMd: `${paddingX.md} ${paddingY.md}`,
  paddingLg: `${paddingX.lg} ${paddingY.lg}`,
  
  // Gap
  gapNone: gap.none,
  gapSm: gap.sm,
  gapMd: gap.md,
  gapLg: gap.lg,
  
  // Stack
  stackNone: stack.none,
  stackSm: stack.sm,
  stackMd: stack.md,
  stackLg: stack.lg,
};

// Shape helpers
export const shapeUtils = {
  roundedNone: radii.none,
  roundedSm: radii.sm,
  roundedMd: radii.md,
  roundedLg: radii.lg,
  roundedXl: radii.xl,
  roundedFull: radii.full,
  
  shadowNone: shadows.none,
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
};

// Color utilities
export const colorUtils = {
  primary: semanticColorMap.primary,
  secondary: semanticColorMap.secondary,
  surface: semanticColorMap.surface,
  background: semanticColorMap.background,
  text: semanticColorMap.text,
  muted: semanticColorMap.muted,
  
  // Common color combinations
  primaryBgWithWhiteText: 'bg-primary text-white',
  secondaryBgWithWhiteText: 'bg-secondary text-white',
  surfaceBgWithTextColor: 'bg-surface text-text',
};

/**
 * Utility function to detect hardcoded Tailwind classes
 * Can be used during development to identify token drift
 */
export function detectHardcodedClasses(className: string): string[] {
  // Common patterns to detect
  const patterns = [
    /text-gray-\d+/,
    /bg-gray-\d+/,
    /border-gray-\d+/,
    /text-blue-\d+/,
    /bg-blue-\d+/,
    /border-blue-\d+/,
    /text-red-\d+/,
    /bg-red-\d+/,
    /border-red-\d+/,
    /p-\d+/,
    /px-\d+/,
    /py-\d+/,
    /shadow$/,
    /shadow-\w+/,
    /rounded$/,
    /rounded-\w+/,
  ];
  
  const foundPatterns: string[] = [];
  
  patterns.forEach(pattern => {
    const matches = className.match(pattern);
    if (matches) {
      foundPatterns.push(matches[0]);
    }
  });
  
  return foundPatterns;
}

// Export all tokens directly for convenience
export { color, textSize, weight, heading, textColors, radii, shadows, paddingX, paddingY, gap, stack, semanticColorMap, tailwindColors };