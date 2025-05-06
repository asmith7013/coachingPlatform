// src/lib/ui/tokens/types.ts

/**
 * Token Types
 * 
 * This file contains all type definitions for the design token system.
 * It serves as a single source of truth for token types across the application.
 */

// =========================================
// Typography Token Types
// =========================================

/**
 * Text size tokens
 */
export type TextSizeToken = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

/**
 * Heading level tokens
 */
export type HeadingLevelToken = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Font weight tokens
 */
export type FontWeightToken = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text color tokens
 */
export type TextColorToken = 
  | 'default' 
  | 'muted' 
  | 'accent'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'surface'
  | 'background'
  | 'border'
  | 'white'
  | 'black';

// =========================================
// Spacing and Layout Token Types
// =========================================

/**
 * Padding size tokens
 */
export type PaddingToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; 

/**
 * Margin size tokens
 */
export type MarginToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Gap size tokens
 */
export type GapToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Stack spacing tokens
 */
export type StackToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Component size tokens
 */
  export type ComponentSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Grid column tokens
 */
export type GridColsToken = 1 | 2 | 3 | 4 | 6 | 12;

/**
 * Flex direction tokens
 */
export type FlexDirectionToken = 'row' | 'col' | 'row-reverse' | 'col-reverse';

/**
 * Flex justify tokens
 */
export type FlexJustifyToken = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/**
 * Flex align tokens
 */
export type FlexAlignToken = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

/**
 * Alignment tokens
 */
export type AlignmentToken = 'start' | 'center' | 'end' | 'between';

// =========================================
// Shape Token Types
// =========================================

/**
 * Border radius tokens
 */
export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * Shadow tokens
 */
export type ShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Border width tokens
 */
export type BorderWidthToken = 'none' | 'sm' | 'md' | 'lg';

/**
 * Border style tokens
 */
export type BorderStyleToken = 'solid' | 'dashed' | 'dotted';

/**
 * Border position tokens
 */
export type BorderPositionToken = 'top' | 'right' | 'bottom' | 'left' | 'all';

// =========================================
// Color Token Types
// =========================================

/**
 * Semantic color map keys
 */
export type SemanticColorToken = 
  | 'primary'
  | 'secondary'
  | 'surface'
  | 'background'
  | 'text'
  | 'subtleText'
  | 'muted'
  | 'border'
  | 'success'
  | 'danger'
  | 'lavender';

/**
 * Tailwind color keys
 */
export type TailwindColorToken = 
  | 'gunmetal'
  | 'paynes-gray'
  | 'silver'
  | 'white'
  | 'red-violet'
  | 'lavender-blush'
  | 'lavender-pink'
  | 'seasalt'
  | 'raspberry'
  | 'green-success'
  | 'lavender';

/**
 * Color shade options (using Tailwind's convention)
 */
export type ColorShadeToken = 
  | 'DEFAULT'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

/**
 * Background color tokens
 */
export type BackgroundColorToken = 
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'surface'
  | 'subtle'
  | 'white';

/**
 * Border color tokens
 */
export type BorderColorToken = 
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'surface';

/**
 * Ring color tokens
 */
export type RingColorToken = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success';

/**
 * Hover text color tokens
 */
export type HoverTextColorToken = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success';

/**
 * Hover background color tokens
 */
export type HoverBackgroundColorToken = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success';

// =========================================
// Composite Token Types
// =========================================

/**
 * Combined component token props
 */
export interface TokenProps {
  textSize?: TextSizeToken;
  textColor?: TextColorToken;
  padding?: PaddingToken;
  margin?: MarginToken;
  gap?: GapToken;
  radius?: RadiusToken;
  shadow?: ShadowToken;
  backgroundColor?: BackgroundColorToken;
  borderColor?: BorderColorToken; 
  borderWidth?: BorderWidthToken;
  borderStyle?: BorderStyleToken;
}

/**
 * All color token categories
 */
export interface ColorTokens {
  text: TextColorToken;
  background: BackgroundColorToken;
  border: BorderColorToken;
  ring: RingColorToken;
  hoverText: HoverTextColorToken;
  hoverBackground: HoverBackgroundColorToken;
}

/**
 * Layout variant types for responsive patterns
 */
export interface LayoutTokens {
  stack: StackToken;
  direction: FlexDirectionToken;
  align: FlexAlignToken;
  justify: FlexJustifyToken;
  columns: GridColsToken;
  gap: GapToken;
}