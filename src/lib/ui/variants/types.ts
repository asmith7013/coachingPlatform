/**
 * Centralized Token Types
 * 
 * This file defines TypeScript types for all token systems to ensure
 * consistent typing across the application.
 */

import { textSize, weight, heading } from '@/lib/ui/tokens/typography';
import { textColors, alignments } from '@/lib/ui/tokens/text';
import { radii, shadows } from '@/lib/ui/tokens/shape';
import { paddingX, paddingY, gap, stack, componentSize } from '@/lib/ui/tokens/spacing';
import { semanticColorMap, tailwindColors } from '@/lib/ui/tokens/colors';

// Typography types
export type TextSize = keyof typeof textSize;
export type Weight = keyof typeof weight;
export type HeadingLevel = keyof typeof heading;

// Text and color types
export type TextColor = keyof typeof textColors;
export type Alignment = keyof typeof alignments;
export type SemanticColor = keyof typeof semanticColorMap;
export type TailwindColor = keyof typeof tailwindColors;

// Shape types
export type Radius = keyof typeof radii;
export type Shadow = keyof typeof shadows;

// Spacing types
export type PaddingX = keyof typeof paddingX;
export type PaddingY = keyof typeof paddingY;
export type Gap = keyof typeof gap;
export type Stack = keyof typeof stack;
export type ComponentSize = keyof typeof componentSize;

// Common padding combinations
export type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// For use with component variants that take different size combinations
export interface SizeProps {
  textSize?: TextSize;
  padding?: PaddingSize;
}

// For use with typography components
export interface TypographyProps {
  textSize?: TextSize;
  weight?: Weight; 
  color?: TextColor;
}

// For shape-related properties
export interface ShapeProps {
  radius?: Radius;
  shadow?: Shadow;
}

// For layout-related properties
export interface LayoutProps {
  gap?: Gap;
  padding?: PaddingSize;
  alignment?: Alignment;
}

/**
 * Helper function to enforce that a value is a valid token of a particular type
 * Use this for runtime validation of token values
 */
export function isValidToken<T extends string>(value: string, tokenType: Record<string, unknown>): value is T {
  return value in tokenType;
}

/**
 * Example usage:
 * 
 * // In a component that needs to validate props:
 * function validateProps(props: { textSize?: string }) {
 *   if (props.textSize && !isValidToken<TextSize>(props.textSize, textSize)) {
 *     console.warn(`Invalid textSize: ${props.textSize}`);
 *   }
 * }
 */ 