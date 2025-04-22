// Import everything as namespaces to avoid conflicts
import * as tokensModule from './tokens';
import * as variantsModule from './variants';
import * as tokenHelpersModule from './helpers/tokenHelpers';
import * as variantHelpersModule from './helpers/variantHelpers';
import * as sharedVariantsModule from './helpers/sharedVariants';

// Export namespaces to avoid conflicts
export const tokens = tokensModule;
export const variants = variantsModule;
export const tokenHelpers = tokenHelpersModule;
export const variantHelpers = variantHelpersModule;
export const sharedVariants = sharedVariantsModule;

// Re-export commonly used tokens directly
export const { 
  textSize, 
  heading, 
  weight, 
  paddingX, 
  paddingY 
} = tokensModule;

// Re-export types
export type {
  TextSize,
  HeadingLevel,
  FontWeight,
  PaddingSize,
  Gap,
} from './tokens'; 